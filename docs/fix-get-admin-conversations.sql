-- ============================================
-- CORRECCIÓN: Función get_admin_conversations
-- ============================================
-- Esta función corrige el problema de tipos de datos

-- Primero, eliminar la función existente si existe
DROP FUNCTION IF EXISTS get_admin_conversations(UUID);

-- Crear la función corregida
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
    -- Obtener todos los usuarios China que han chateado con el admin
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
    CAST(au.email AS TEXT),  -- Convertir varchar a text
    COALESCE(CAST(au.raw_user_meta_data->>'name' AS TEXT), CAST(au.email AS TEXT)) as user_name,
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
