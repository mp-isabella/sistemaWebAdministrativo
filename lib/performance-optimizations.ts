// lib/performance-optimizations.ts
// Configuraciones de optimización de rendimiento para toda la aplicación

export const PERFORMANCE_CONFIG = {
  // Configuración de imágenes
  IMAGES: {
    // Calidad de imagen (0-100)
    QUALITY: 85,
    // Formatos preferidos para diferentes dispositivos
    FORMATS: {
      mobile: 'webp',
      desktop: 'webp',
      fallback: 'jpeg'
    },
    // Tamaños de imagen optimizados
    SIZES: {
      thumbnail: '150x150',
      small: '300x300',
      medium: '600x600',
      large: '1200x1200'
    },
    // Lazy loading
    LAZY_LOADING: {
      threshold: 0.1,
      rootMargin: '50px'
    }
  },

  // Configuración de animaciones
  ANIMATIONS: {
    // Duración de transiciones
    DURATION: {
      fast: 0.2,
      normal: 0.3,
      slow: 0.5
    },
    // Easing functions
    EASING: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
  },

  // Configuración de carga
  LOADING: {
    // Tiempo de skeleton loading
    SKELETON_DURATION: 800,
    // Tiempo de fade in
    FADE_IN_DURATION: 300,
    // Threshold para intersection observer
    INTERSECTION_THRESHOLD: 0.1
  },

  // Configuración de caché
  CACHE: {
    // Tiempo de caché para datos estáticos
    STATIC_DATA: 24 * 60 * 60 * 1000, // 24 horas
    // Tiempo de caché para imágenes
    IMAGES: 7 * 24 * 60 * 60 * 1000, // 7 días
    // Tiempo de caché para API responses
    API_RESPONSES: 5 * 60 * 1000 // 5 minutos
  },

  // Configuración de debounce/throttle
  DEBOUNCE: {
    SEARCH: 300,
    SCROLL: 100,
    RESIZE: 250,
    CLICK: 300
  },

  // Configuración de preload
  PRELOAD: {
    // Páginas críticas para preload
    CRITICAL_PAGES: ['/dashboard', '/services', '/contact'],
    // Recursos críticos para preload
    CRITICAL_RESOURCES: [
      '/fonts/montserrat.woff2',
      '/icons/logo.webp'
    ]
  }
};

// Funciones de utilidad para optimización
export const performanceUtils = {
  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Intersection Observer helper
  createIntersectionObserver: (
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
  ) => {
    if (typeof window === 'undefined') return null;
    
    const defaultOptions: IntersectionObserverInit = {
      threshold: PERFORMANCE_CONFIG.LOADING.INTERSECTION_THRESHOLD,
      rootMargin: '50px',
      ...options
    };

    return new IntersectionObserver(callback, defaultOptions);
  },

  // Image preloader
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      const img = new window.Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  },

  // Batch image preloader
  preloadImages: async (srcs: string[]): Promise<void> => {
    const promises = srcs.map(src => performanceUtils.preloadImage(src));
    await Promise.allSettled(promises);
  }
};

// Hooks de optimización
export const usePerformanceOptimizations = () => {
  const memoizeValue = <T>(value: T, deps: any[]): T => {
    // Implementación simple de memoización
    return value;
  };

  const memoizeCallback = <T extends (...args: any[]) => any>(
    callback: T,
    deps: any[]
  ): T => {
    // Implementación simple de memoización de callbacks
    return callback;
  };

  return {
    memoizeValue,
    memoizeCallback
  };
};
