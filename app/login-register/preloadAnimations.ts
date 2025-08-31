// Preload de animaciones para mejorar el rendimiento
export const preloadAnimations = () => {
  // Lista de animaciones importantes para preload
  const animationsToPreload = [
    '/animations/wired-flat-497-truck-delivery-loop-cycle.json',
    '/animations/login.json',
    '/animations/Register.json',
    '/animations/Success.json'
  ];

  // Preload cada animación
  animationsToPreload.forEach(animationPath => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'fetch';
    link.href = animationPath;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Función para precargar una animación específica
export const preloadSpecificAnimation = (path: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Animation preload timeout'));
    }, 10000);

    fetch(path)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to preload animation');
        }
        return response.json();
      })
      .then(data => {
        clearTimeout(timeout);
        resolve(data);
      })
      .catch(error => {
        clearTimeout(timeout);
        reject(error);
      });
  });
};

// Cache para animaciones ya cargadas
const animationCache = new Map<string, any>();

// Función para obtener una animación del cache o cargarla
export const getCachedAnimation = async (path: string): Promise<any> => {
  if (animationCache.has(path)) {
    return animationCache.get(path);
  }

  try {
    const animationData = await preloadSpecificAnimation(path);
    animationCache.set(path, animationData);
    return animationData;
  } catch (error) {
    console.warn(`Failed to load animation: ${path}`, error);
    return null;
  }
};
