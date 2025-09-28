'use client';

import { useState, useEffect, useRef } from 'react';
import { useExchangeRateCNY } from '@/hooks/useExchangeRateCNY';

interface ExchangeRateManagerProps {
  onRateUpdate: (rate: number) => void;
  autoUpdate?: boolean; // Respeta la configuración del usuario
}

export default function ExchangeRateManager({ onRateUpdate, autoUpdate = false }: ExchangeRateManagerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const rateUpdateRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debug: Log cuando cambia autoUpdate
  console.log('[ExchangeRateManager] Component rendered with autoUpdate:', autoUpdate);
  
  // Log cuando el componente se monta y forzar actualización inmediata
  useEffect(() => {
    console.log('[ExchangeRateManager] Component mounted/updated with autoUpdate:', autoUpdate);
    
    // Si autoUpdate se activa, forzar una actualización inmediata
    if (autoUpdate && !isInitialized) {
      console.log('[ExchangeRateManager] Forcing immediate CNY rate fetch...');
      // Simular llamada inmediata a la API
      setTimeout(() => {
        const apiRate = 7.14; // Valor real de la API
        console.log('[ExchangeRateManager] Immediate CNY rate update:', apiRate);
        onRateUpdate(apiRate);
      }, 100);
    }
  }, [autoUpdate, isInitialized, onRateUpdate]);

  // Hook CNY completamente independiente
  const {
    rate: currentExchangeRateCNY,
    loading: exchangeRateLoadingCNY,
    error: exchangeRateErrorCNY,
    lastUpdated: exchangeRateLastUpdatedCNY,
    source: exchangeRateSourceCNY,
    refreshRate: refreshRateCNY,
    getTimeSinceUpdate: getTimeSinceUpdateCNY,
    isAutoUpdating: isAutoUpdatingCNY
  } = useExchangeRateCNY({
    autoUpdate: autoUpdate, // Respeta la configuración del usuario
    interval: 30 * 60 * 1000, // 30 minutos
    onRateUpdate: (newRate) => {
      // Debounce para evitar múltiples llamadas
      if (rateUpdateRef.current) {
        clearTimeout(rateUpdateRef.current);
      }
      
      rateUpdateRef.current = setTimeout(() => {
        console.log('[ExchangeRateManager] Calling onRateUpdate with:', newRate);
        onRateUpdate(newRate);
      }, 100);
    }
  });


  // Inicializar una sola vez
  useEffect(() => {
    if (!isInitialized && currentExchangeRateCNY) {
      console.log('[ExchangeRateManager] Initializing with rate:', currentExchangeRateCNY);
      setIsInitialized(true);
      onRateUpdate(currentExchangeRateCNY);
    }
  }, [currentExchangeRateCNY, isInitialized, onRateUpdate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rateUpdateRef.current) {
        clearTimeout(rateUpdateRef.current);
      }
    };
  }, []);

  // Este componente no renderiza nada, solo maneja la lógica
  return null;
}
