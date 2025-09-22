import { useState, useEffect, useCallback, useRef } from 'react';

interface CurrencyConfig {
  usdRate: number;
  lastUpdated: string;
}

interface ConversionResult {
  usd: number;
  bolivars: number;
  rate: number;
  formatted: {
    usd: string;
    bolivars: string;
    both: string;
  };
}

interface UseCurrencyConverterReturn {
  convert: (amount: number, fromCurrency: 'USD' | 'VES') => ConversionResult;
  currentRate: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshRate: () => void;
}

export function useCurrencyConverter(): UseCurrencyConverterReturn {
  const [rate, setRate] = useState<number>(36.25); // Default fallback rate
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Función para obtener la tasa de cambio actual
  const fetchCurrentRate = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      // Primero verificar configuración desde localStorage (más confiable)
      let autoUpdateEnabled = false;
      
      try {
        const savedConfig = localStorage.getItem('businessConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          autoUpdateEnabled = parsedConfig.autoUpdateExchangeRate || false;
        }
      } catch (e) {
        console.error('Error reading localStorage config:', e);
      }

      // Si no hay localStorage, intentar API como fallback
      if (!autoUpdateEnabled) {
        try {
          const configResponse = await fetch('/api/config', {
            signal: abortControllerRef.current.signal
          });

          if (configResponse.ok) {
            const configData = await configResponse.json();
            if (configData.success && configData.config) {
              autoUpdateEnabled = configData.config.autoUpdateExchangeRate || false;
            }
          }
        } catch (e) {
          console.error('Error fetching config from API:', e);
        }
      }

      // Si auto-update está activo, usar API de exchange rate
      if (autoUpdateEnabled) {
        const exchangeResponse = await fetch('/api/exchange-rate', {
          signal: abortControllerRef.current.signal
        });

        if (exchangeResponse.ok) {
          const exchangeData = await exchangeResponse.json();
          if (exchangeData.success && exchangeData.rate) {
            setRate(exchangeData.rate);
            setLastUpdated(new Date(exchangeData.timestamp));
            return;
          }
        }
      }
      
      // Usar tasa de configuración si auto-update está desactivado o falla
      // Intentar obtener desde localStorage primero
      try {
        const savedConfig = localStorage.getItem('businessConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          if (parsedConfig.usdRate) {
            setRate(parsedConfig.usdRate);
            setLastUpdated(new Date(parsedConfig.lastUpdated || new Date().toISOString()));
            return;
          }
        }
      } catch (e) {
        console.error('Error using localStorage config for rate:', e);
      }

      // Fallback a API si localStorage no funciona
      try {
        const configResponse = await fetch('/api/config', {
          signal: abortControllerRef.current.signal
        });

        if (configResponse.ok) {
          const configData = await configResponse.json();
          if (configData.success && configData.config && configData.config.usdRate) {
            setRate(configData.config.usdRate);
            setLastUpdated(new Date(configData.config.lastUpdated));
            return;
          }
        }
      } catch (e) {
        console.error('Error fetching fallback config:', e);
      }

      throw new Error('Failed to fetch currency rate');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      
      console.error('Error fetching currency rate:', error);
      setError(error.message || 'Failed to fetch currency rate');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función de conversión
  const convert = useCallback((amount: number, fromCurrency: 'USD' | 'VES' = 'USD'): ConversionResult => {
    const numAmount = Number(amount) || 0;
    
    let usd: number;
    let bolivars: number;
    
    if (fromCurrency === 'USD') {
      usd = numAmount;
      bolivars = numAmount * rate;
    } else {
      bolivars = numAmount;
      usd = numAmount / rate;
    }

    return {
      usd,
      bolivars,
      rate,
      formatted: {
        usd: `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        bolivars: `${bolivars.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`,
        both: `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${bolivars.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs)`
      }
    };
  }, [rate]);

  // Función manual para refrescar
  const refreshRate = useCallback(() => {
    fetchCurrentRate();
  }, [fetchCurrentRate]);

  // Efecto para cargar la tasa al montar el componente
  useEffect(() => {
    fetchCurrentRate();

    // Actualizar cada 5 minutos
    const interval = setInterval(fetchCurrentRate, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCurrentRate]);

  return {
    convert,
    currentRate: rate,
    isLoading,
    error,
    lastUpdated,
    refreshRate
  };
}
