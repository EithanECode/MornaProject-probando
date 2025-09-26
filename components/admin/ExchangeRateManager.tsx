'use client';

import { useState, useEffect, useRef } from 'react';
import { useExchangeRateCNY } from '@/hooks/useExchangeRateCNY';

interface ExchangeRateManagerProps {
  onRateUpdate: (rate: number) => void;
}

export default function ExchangeRateManager({ onRateUpdate }: ExchangeRateManagerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const rateUpdateRef = useRef<NodeJS.Timeout | null>(null);

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
    autoUpdate: true, // SIEMPRE true
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
