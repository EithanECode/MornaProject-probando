-- ============================================
-- Tabla para conversaciones ocultas por usuario
-- ============================================
-- Permite que cada usuario "elimine" conversaciones de su vista
-- sin borrar los mensajes reales

CREATE TABLE IF NOT EXISTS chat_hidden_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hidden_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, hidden_user_id)
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_chat_hidden_user ON chat_hidden_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_hidden_target ON chat_hidden_conversations(hidden_user_id);

-- RLS Policies
ALTER TABLE chat_hidden_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo pueden ver sus propias conversaciones ocultas
CREATE POLICY "Users can view their own hidden conversations"
    ON chat_hidden_conversations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Los usuarios solo pueden ocultar conversaciones para sí mismos
CREATE POLICY "Users can hide conversations for themselves"
    ON chat_hidden_conversations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Los usuarios solo pueden des-ocultar sus propias conversaciones
CREATE POLICY "Users can unhide their own conversations"
    ON chat_hidden_conversations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Comentarios
COMMENT ON TABLE chat_hidden_conversations IS 'Almacena qué conversaciones ha ocultado cada usuario de su vista';
COMMENT ON COLUMN chat_hidden_conversations.user_id IS 'Usuario que oculta la conversación';
COMMENT ON COLUMN chat_hidden_conversations.hidden_user_id IS 'Usuario con quien tiene la conversación oculta';
