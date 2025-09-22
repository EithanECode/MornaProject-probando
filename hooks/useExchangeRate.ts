import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ExchangeRateResponse {
  success: boolean;
  rate?: number;
  timestamp?: string;
  source?: string;
  error?: string;
}

interface UseExchangeRateOptions {
  autoUpdate?: boolean;
  interval?: number; // en milisegundos
  onRateUpdate?: (rate: number) => void;
}

export function useExchangeRate(options: UseExchangeRateOptions = {}) {
  const {
    autoUpdate = false,
    interval = 30 * 60 * 1000, // 30 minutos por defecto
    onRateUpdate
  } = options;

  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<string>('');

  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const onRateUpdateRef = useRef(onRateUpdate);
  const toastRef = useRef(toast);

  // Actualizar refs cuando cambien las props
  useEffect(() => {
    onRateUpdateRef.current = onRateUpdate;
    toastRef.current = toast;
  }, [onRateUpdate, toast]);

  // Función para obtener la tasa de cambio
  const fetchRate = useCallback(async (showToast = true) => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/exchange-rate', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal
      });

      const data: ExchangeRateResponse = await response.json();

      if (data.success && data.rate) {
        setRate(data.rate);
        setLastUpdated(new Date());
        setSource(data.source || 'API');
        
        // Callback para actualizar el componente padre
        if (onRateUpdateRef.current) {
          onRateUpdateRef.current(data.rate);
        }

        if (showToast && toastRef.current) {
          toastRef.current({
            title: "Tasa actualizada",
            description: `Nuevo valor: ${data.rate.toFixed(2)} Bs/USD`,
            duration: 3000,
          });
        }
      } else {
        throw new Error(data.error || 'Error al obtener tasa de cambio');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return; // Request cancelado, no mostrar error
      }

      const errorMessage = error.message || 'Error de conexión';
      setError(errorMessage);
      
      if (showToast && toastRef.current) {
        toastRef.current({
          title: "Error al actualizar tasa",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []); // Removemos las dependencias para evitar re-creación constante

  // Función para iniciar auto-actualización
  const startAutoUpdate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Fetch inicial
    fetchRate(false);

    // Configurar intervalo
    intervalRef.current = setInterval(() => {
      fetchRate(false);
    }, interval);
  }, [interval]); // Solo depende del interval

  // Función para detener auto-actualización
  const stopAutoUpdate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Función manual para refrescar
  const refreshRate = useCallback(() => {
    fetchRate(true);
  }, []);

  // Effect para manejar auto-actualización
  useEffect(() => {
    if (autoUpdate) {
      // Iniciar auto-actualización inline para evitar dependencias
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Fetch inicial
      fetchRate(false);

      // Configurar intervalo
      intervalRef.current = setInterval(() => {
        fetchRate(false);
      }, interval);
    } else {
      // Detener auto-actualización
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoUpdate, interval]); // Solo depende de autoUpdate e interval

  // Effect para actualizar el tiempo transcurrido cada minuto
  useEffect(() => {
    const timeUpdateInterval = setInterval(() => {
      // Forzar re-render para actualizar getTimeSinceUpdate
      setLastUpdated(prev => prev);
    }, 60000); // Cada minuto

    return () => {
      clearInterval(timeUpdateInterval);
    };
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Función para obtener el tiempo transcurrido desde la última actualización
  const getTimeSinceUpdate = useCallback(() => {
    if (!lastUpdated) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Hace menos de 1 minuto';
    if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  }, [lastUpdated]);

  return {
    rate,
    loading,
    error,
    lastUpdated,
    source,
    refreshRate,
    startAutoUpdate,
    stopAutoUpdate,
    getTimeSinceUpdate,
    isAutoUpdating: !!intervalRef.current
  };
}
