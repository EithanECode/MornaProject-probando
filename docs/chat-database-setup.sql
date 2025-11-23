-- ============================================
-- PITAEXPRESS - CHAT SYSTEM DATABASE SETUP
-- ============================================
-- Este script crea las tablas necesarias para el sistema de chat
-- entre Admin y usuarios China con soporte para:
-- - Mensajes de texto
-- - Archivos adjuntos
-- - Typing indicators
-- - Mensajes no leídos
-- - Realtime updates

-- ============================================
-- 1. TABLA: chat_messages
-- ============================================
-- Almacena todos los mensajes del chat

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'china')),
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_role TEXT NOT NULL CHECK (receiver_role IN ('admin', 'china')),
  message TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(receiver_id, read) WHERE read = FALSE;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_messages_updated_at();

-- ============================================
-- 2. TABLA: chat_typing_status
-- ============================================
-- Almacena el estado de "escribiendo..." en tiempo real

CREATE TABLE IF NOT EXISTS chat_typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  typing_to_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, typing_to_id)
);

-- Índice para queries rápidas
CREATE INDEX IF NOT EXISTS idx_chat_typing_user ON chat_typing_status(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_typing_to ON chat_typing_status(typing_to_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_chat_typing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_typing_updated_at
  BEFORE UPDATE ON chat_typing_status
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_typing_updated_at();

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en ambas tablas
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing_status ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES para chat_messages
-- ============================================

-- Policy: Los usuarios pueden ver mensajes donde sean sender o receiver
CREATE POLICY "Users can view their own messages"
  ON chat_messages
  FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Policy: Los usuarios pueden insertar mensajes donde sean el sender
CREATE POLICY "Users can send messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
  );

-- Policy: Los usuarios pueden actualizar mensajes donde sean el receiver (para marcar como leído)
CREATE POLICY "Users can update received messages"
  ON chat_messages
  FOR UPDATE
  USING (
    auth.uid() = receiver_id
  )
  WITH CHECK (
    auth.uid() = receiver_id
  );

-- Policy: Los usuarios pueden eliminar sus propios mensajes enviados
CREATE POLICY "Users can delete their sent messages"
  ON chat_messages
  FOR DELETE
  USING (
    auth.uid() = sender_id
  );

-- ============================================
-- POLICIES para chat_typing_status
-- ============================================

-- Policy: Los usuarios pueden ver el estado de typing dirigido a ellos
CREATE POLICY "Users can view typing status directed to them"
  ON chat_typing_status
  FOR SELECT
  USING (
    auth.uid() = typing_to_id OR auth.uid() = user_id
  );

-- Policy: Los usuarios pueden insertar su propio estado de typing
CREATE POLICY "Users can insert their typing status"
  ON chat_typing_status
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Los usuarios pueden actualizar su propio estado de typing
CREATE POLICY "Users can update their typing status"
  ON chat_typing_status
  FOR UPDATE
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Los usuarios pueden eliminar su propio estado de typing
CREATE POLICY "Users can delete their typing status"
  ON chat_typing_status
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- ============================================
-- 4. FUNCIÓN HELPER: Obtener conversaciones del Admin
-- ============================================
-- Esta función retorna todas las conversaciones del admin con usuarios China
-- incluyendo el último mensaje y el contador de mensajes no leídos

CREATE OR REPLACE FUNCTION get_admin_conversations(admin_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT,
  last_file_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH china_users AS (
    -- Obtener todos los usuarios con rol 'china' que han chateado con el admin
    SELECT DISTINCT
      CASE
        WHEN cm.sender_id = admin_user_id THEN cm.receiver_id
        ELSE cm.sender_id
      END as china_user_id
    FROM chat_messages cm
    WHERE cm.sender_id = admin_user_id OR cm.receiver_id = admin_user_id
  ),
  last_messages AS (
    -- Obtener el último mensaje de cada conversación
    SELECT DISTINCT ON (
      CASE
        WHEN cm.sender_id = admin_user_id THEN cm.receiver_id
        ELSE cm.sender_id
      END
    )
      CASE
        WHEN cm.sender_id = admin_user_id THEN cm.receiver_id
        ELSE cm.sender_id
      END as china_user_id,
      cm.message,
      cm.created_at,
      cm.file_url
    FROM chat_messages cm
    WHERE cm.sender_id = admin_user_id OR cm.receiver_id = admin_user_id
    ORDER BY
      CASE
        WHEN cm.sender_id = admin_user_id THEN cm.receiver_id
        ELSE cm.sender_id
      END,
      cm.created_at DESC
  ),
  unread_counts AS (
    -- Contar mensajes no leídos por conversación
    SELECT
      cm.sender_id as china_user_id,
      COUNT(*) as unread
    FROM chat_messages cm
    WHERE cm.receiver_id = admin_user_id
      AND cm.read = FALSE
    GROUP BY cm.sender_id
  )
  SELECT
    cu.china_user_id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', au.email) as user_name,
    lm.message,
    lm.created_at,
    COALESCE(uc.unread, 0),
    lm.file_url
  FROM china_users cu
  LEFT JOIN auth.users au ON au.id = cu.china_user_id
  LEFT JOIN last_messages lm ON lm.china_user_id = cu.china_user_id
  LEFT JOIN unread_counts uc ON uc.china_user_id = cu.china_user_id
  ORDER BY lm.created_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. FUNCIÓN HELPER: Obtener contador de mensajes no leídos
-- ============================================

CREATE OR REPLACE FUNCTION get_unread_messages_count(for_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO unread_count
  FROM chat_messages
  WHERE receiver_id = for_user_id
    AND read = FALSE;
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. STORAGE BUCKET para archivos del chat
-- ============================================
-- NOTA: Este comando debe ejecutarse desde el dashboard de Supabase
-- o usando el cliente de JavaScript, no desde SQL.
-- 
-- Instrucciones:
-- 1. Ir a Storage en el dashboard de Supabase
-- 2. Crear un nuevo bucket llamado 'chat-files'
-- 3. Configurarlo como público
-- 4. Establecer las siguientes políticas:
--    - INSERT: Usuarios autenticados pueden subir archivos
--    - SELECT: Todos pueden ver archivos (público)
--    - UPDATE: Solo el owner puede actualizar
--    - DELETE: Solo el owner puede eliminar

-- ============================================
-- SETUP COMPLETO
-- ============================================
-- Para verificar que todo se creó correctamente, ejecuta:
-- 
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('chat_messages', 'chat_typing_status');
--
-- Deberías ver ambas tablas listadas.


-- Admin