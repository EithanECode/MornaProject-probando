-- Tabla para almacenar las tasas de cambio históricas
-- Ejecutar en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS exchange_rates (
  id BIGSERIAL PRIMARY KEY,
  rate DECIMAL(10,4) NOT NULL CHECK (rate > 0),
  source VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_fallback BOOLEAN DEFAULT FALSE,
  api_response JSONB, -- Para guardar respuesta completa de la API
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_exchange_rates_timestamp ON exchange_rates(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_source ON exchange_rates(source);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_fallback ON exchange_rates(is_fallback);

-- Política RLS (Row Level Security) - permite lectura/escritura a todos
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on exchange_rates" 
ON exchange_rates FOR SELECT 
USING (true);

CREATE POLICY "Allow service role write access on exchange_rates" 
ON exchange_rates FOR ALL 
USING (auth.role() = 'service_role');

-- Función para obtener la última tasa válida (no fallback)
CREATE OR REPLACE FUNCTION get_latest_valid_exchange_rate()
RETURNS TABLE(
  rate DECIMAL(10,4),
  source VARCHAR(100),
  timestamp TIMESTAMPTZ,
  age_minutes INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    er.rate,
    er.source,
    er.timestamp,
    EXTRACT(EPOCH FROM (NOW() - er.timestamp))::INTEGER / 60 as age_minutes
  FROM exchange_rates er
  WHERE er.is_fallback = FALSE
  ORDER BY er.timestamp DESC
  LIMIT 1;
END;
$$;

-- Función para limpiar registros antiguos (mantener solo últimos 1000)
CREATE OR REPLACE FUNCTION cleanup_old_exchange_rates()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH old_records AS (
    SELECT id 
    FROM exchange_rates 
    ORDER BY timestamp DESC 
    OFFSET 1000
  )
  DELETE FROM exchange_rates 
  WHERE id IN (SELECT id FROM old_records);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Insertar tasa inicial por defecto (solo si la tabla está vacía)
INSERT INTO exchange_rates (rate, source, is_fallback, api_response)
SELECT 166.58, 'Initial Default', true, '{"note": "Initial default rate"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM exchange_rates);

-- Comentarios para documentación
COMMENT ON TABLE exchange_rates IS 'Almacena historial de tasas de cambio USD/VES obtenidas de APIs externas';
COMMENT ON COLUMN exchange_rates.rate IS 'Tasa de cambio en Bolívares por USD';
COMMENT ON COLUMN exchange_rates.source IS 'Fuente de la tasa (BCV Oficial, API alternativa, etc.)';
COMMENT ON COLUMN exchange_rates.is_fallback IS 'TRUE si es tasa de fallback, FALSE si es de API exitosa';
COMMENT ON COLUMN exchange_rates.api_response IS 'Respuesta completa de la API para debugging';
