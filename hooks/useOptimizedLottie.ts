import { useState, useEffect, useMemo } from 'react';

interface UseOptimizedLottieOptions {
  animationPath: string;
  timeout?: number;
}

interface UseOptimizedLottieReturn {
  animationData: any;
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
}

// Cache global para animaciones
const animationCache = new Map<string, any>();

export const useOptimizedLottie = ({ 
  animationPath, 
  timeout = 5000 
}: UseOptimizedLottieOptions): UseOptimizedLottieReturn => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const loadAnimation = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      // Verificar cache primero
      if (animationCache.has(animationPath)) {
        setAnimationData(animationCache.get(animationPath));
        setIsLoading(false);
        return;
      }

      // Crear timeout para evitar carga infinita
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Animation load timeout')), timeout);
      });

      // Cargar animación
      const fetchPromise = fetch(animationPath);
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        throw new Error('Failed to fetch animation');
      }

      const data = await response.json();
      
      // Guardar en cache
      animationCache.set(animationPath, data);
      setAnimationData(data);
      setIsLoading(false);
    } catch (error) {
      console.warn('Animation loading failed:', error);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const retry = () => {
    loadAnimation();
  };

  useEffect(() => {
    loadAnimation();
  }, [animationPath]);

  const memoizedOptions = useMemo(() => {
    if (!animationData) return null;
    
    return {
      loop: true,
      autoplay: true,
      animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };
  }, [animationData]);

  return {
    animationData: memoizedOptions,
    isLoading,
    hasError,
    retry,
  };
};
