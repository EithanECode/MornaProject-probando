-- ====================================================================
-- Tabla para almacenar tasas de cambio de Binance P2P (USDT → VES)
-- ====================================================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS exchange_rates_binance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rate DECIMAL(10, 4) NOT NULL,
  source TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_fallback BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_binance_timestamp ON exchange_rates_binance(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_binance_is_fallback ON exchange_rates_binance(is_fallback);
CREATE INDEX IF NOT EXISTS idx_binance_source ON exchange_rates_binance(source);

-- Row Level Security (RLS)
ALTER TABLE exchange_rates_binance ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (para evitar errores)
DROP POLICY IF EXISTS "Allow public read access on binance rates" ON exchange_rates_binance;
DROP POLICY IF EXISTS "Allow authenticated insert on binance rates" ON exchange_rates_binance;
DROP POLICY IF EXISTS "Allow authenticated update on binance rates" ON exchange_rates_binance;
DROP POLICY IF EXISTS "Allow authenticated delete on binance rates" ON exchange_rates_binance;

-- Política: Todos pueden leer
CREATE POLICY "Allow public read access on binance rates"
  ON exchange_rates_binance
  FOR SELECT
  TO public
  USING (true);

-- Política: Solo autenticados pueden insertar
CREATE POLICY "Allow authenticated insert on binance rates"
  ON exchange_rates_binance
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Solo autenticados pueden actualizar
CREATE POLICY "Allow authenticated update on binance rates"
  ON exchange_rates_binance
  FOR UPDATE
  TO authenticated
  USING (true);

-- Política: Solo autenticados pueden eliminar
CREATE POLICY "Allow authenticated delete on binance rates"
  ON exchange_rates_binance
  FOR DELETE
  TO authenticated
  USING (true);

-- ====================================================================
-- Funciones útiles
-- ====================================================================

-- Función para obtener la última tasa válida de Binance (no fallback, últimas 24h)
CREATE OR REPLACE FUNCTION get_latest_valid_binance_rate()
RETURNS TABLE (
  rate DECIMAL,
  rate_timestamp TIMESTAMPTZ,
  source TEXT,
  age_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    er.rate,
    er.timestamp AS rate_timestamp,
    er.source,
    EXTRACT(EPOCH FROM (NOW() - er.timestamp))::INTEGER / 60 AS age_minutes
  FROM exchange_rates_binance er
  WHERE er.is_fallback = FALSE
    AND er.timestamp >= NOW() - INTERVAL '24 hours'
  ORDER BY er.timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener historial de tasas de Binance
CREATE OR REPLACE FUNCTION get_binance_rate_history(
  result_limit INTEGER DEFAULT 20,
  only_valid BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  rate DECIMAL,
  source TEXT,
  rate_timestamp TIMESTAMPTZ,
  is_fallback BOOLEAN,
  metadata JSONB
) AS $$
BEGIN
  IF only_valid THEN
    RETURN QUERY
    SELECT 
      er.id,
      er.rate,
      er.source,
      er.timestamp AS rate_timestamp,
      er.is_fallback,
      er.metadata
    FROM exchange_rates_binance er
    WHERE er.is_fallback = FALSE
    ORDER BY er.timestamp DESC
    LIMIT result_limit;
  ELSE
    RETURN QUERY
    SELECT 
      er.id,
      er.rate,
      er.source,
      er.timestamp AS rate_timestamp,
      er.is_fallback,
      er.metadata
    FROM exchange_rates_binance er
    ORDER BY er.timestamp DESC
    LIMIT result_limit;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar tasas antiguas (mantener últimos 30 días)
CREATE OR REPLACE FUNCTION cleanup_old_binance_rates()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM exchange_rates_binance
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- Datos iniciales (opcional)
-- ====================================================================

-- Insertar una tasa inicial de ejemplo (puedes comentar esto si no quieres datos iniciales)
INSERT INTO exchange_rates_binance (rate, source, is_fallback, metadata)
VALUES (
  299.51,
  'Valor Inicial',
  TRUE,
  '{"note": "Tasa inicial aproximada según Monitor Venezuela, reemplazar con datos reales"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- Comentarios
-- ====================================================================

COMMENT ON TABLE exchange_rates_binance IS 'Almacena el historial de tasas de cambio de Binance P2P (USDT → VES)';
COMMENT ON COLUMN exchange_rates_binance.rate IS 'Tasa de cambio USDT → VES';
COMMENT ON COLUMN exchange_rates_binance.source IS 'Fuente de la tasa (Monitor Venezuela, AirTM, Manual, etc.)';
COMMENT ON COLUMN exchange_rates_binance.timestamp IS 'Fecha y hora de la tasa';
COMMENT ON COLUMN exchange_rates_binance.is_fallback IS 'Indica si esta tasa es un fallback (no proviene de API externa)';
COMMENT ON COLUMN exchange_rates_binance.metadata IS 'Información adicional sobre la tasa (errores, advertencias, etc.)';

-- ====================================================================
-- Fin del script
-- ====================================================================
