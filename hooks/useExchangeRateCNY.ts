import { useState, useEffect, useRef, useCallback } from 'react';

interface ExchangeRateDataCNY {
  rate: number;
  timestamp: string;
  source: string;
  from_database: boolean;
  warning?: string;
  error?: string;
}

interface UseExchangeRateCNYOptions {
  autoUpdate?: boolean;
  interval?: number; // en milisegundos
  onRateUpdate?: (rate: number) => void;
}

export const useExchangeRateCNY = (options: UseExchangeRateCNYOptions = {}) => {
  const {
    autoUpdate = false,
    interval = 30 * 60 * 1000, // 30 minutos por defecto
    onRateUpdate
  } = options;

  const [rate, setRate] = useState<number | null>(null); // Sin valor inicial hasta cargar desde API
  const [loading, setLoading] = useState<boolean>(true); // Empezar en true para mostrar loading inicial
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<string>('');
  const [isAutoUpdating, setIsAutoUpdating] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Función estable para obtener la tasa actual (sin useCallback para evitar loops)
  const fetchRate = async (showLoading = true) => {
    console.log('[CNY Hook] fetchRate called, showLoading:', showLoading);
    
    if (!isMountedRef.current) {
      console.log('[CNY Hook] Component unmounted, returning');
      return;
    }

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('[CNY Hook] Making API request...');
      const response = await fetch('/api/exchange-rate/cny', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      console.log('[CNY Hook] API response received, status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[CNY Hook] API response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch CNY exchange rate');
      }

      const newRate = parseFloat(data.rate?.toString() || '0');
      
      if (isNaN(newRate) || newRate <= 0) {
        throw new Error(`Invalid CNY rate received from API: ${data.rate}`);
      }

      console.log('[CNY Hook] Setting rate to:', newRate);
      setRate(newRate);
      setLastUpdated(new Date());
      setSource(data.source || 'API');
      
      // Callback para notificar cambio de tasa
      if (onRateUpdate) {
        console.log('[CNY Hook] Calling onRateUpdate with:', newRate);
        onRateUpdate(newRate);
      }

      // Mostrar warning si existe
      if (data.warning) {
        console.warn('[CNY ExchangeRate]', data.warning);
      }

    } catch (err: any) {
      console.log('[CNY Hook] Error in fetchRate:', err);
      if (!isMountedRef.current) return;
      
      const errorMessage = err.message || 'Error al obtener tasa CNY';
      setError(errorMessage);
      console.error('[CNY ExchangeRate] Error:', err);
    } finally {
      console.log('[CNY Hook] fetchRate finally block - setting loading to false');
      setLoading(false);
    }
  };

  // Función pública para refrescar manualmente
  const refreshRate = useCallback(() => {
    fetchRate(true);
  }, []); // Sin dependencias para evitar loops

  // Función para obtener tiempo desde última actualización
  const getTimeSinceUpdate = useCallback(() => {
    if (!lastUpdated) return 'Nunca';
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Hace menos de 1 minuto';
    } else if (diffMinutes < 60) {
      return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    }
  }, [lastUpdated]);

  // Configurar/limpiar intervalos para auto-actualización
  useEffect(() => {
    console.log('[CNY Hook] useEffect triggered, autoUpdate:', autoUpdate, 'interval:', interval);
    
    if (autoUpdate) {
      console.log('[CNY Hook] Setting up auto-update...');
      setIsAutoUpdating(true);
      
      // Obtener tasa inicial
      console.log('[CNY Hook] Calling fetchRate(false)...');
      fetchRate(false);
      
      // Configurar intervalo
      intervalRef.current = setInterval(() => {
        console.log('[CNY Hook] Interval triggered, calling fetchRate(false)...');
        fetchRate(false); // No mostrar loading en actualizaciones automáticas
      }, interval);
      
    } else {
      console.log('[CNY Hook] Disabling auto-update...');
      setIsAutoUpdating(false);
      setLoading(false); // Desactivar loading cuando no hay auto-update
      
      // Limpiar intervalo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // NO obtener tasa de API cuando autoUpdate está desactivado
      // El valor manual debe mantenerse desde localStorage/config
    }

    console.log('[CNY Hook] useEffect completed, autoUpdate:', autoUpdate);

    return () => {
      console.log('[CNY Hook] useEffect cleanup');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoUpdate, interval]); // Solo depende de autoUpdate e interval

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    rate,
    loading,
    error,
    lastUpdated,
    source,
    refreshRate,
    getTimeSinceUpdate,
    isAutoUpdating: isAutoUpdating && autoUpdate
  };
};
