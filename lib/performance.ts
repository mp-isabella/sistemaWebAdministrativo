/**
 * Utilidades de optimización de rendimiento
 */

// Configuración de lazy loading
export const LAZY_LOADING_CONFIG = {
  // Imágenes
  IMAGES: {
    rootMargin: '50px',
    threshold: 0.1,
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  },

  // Componentes
  COMPONENTS: {
    rootMargin: '100px',
    threshold: 0.1,
  },

  // Scripts
  SCRIPTS: {
    rootMargin: '200px',
    threshold: 0.1,
  },
};

// Configuración de caché
export const CACHE_CONFIG = {
  // Tiempo de vida del caché (en segundos)
  TTL: {
    STATIC: 86400, // 24 horas
    DYNAMIC: 3600, // 1 hora
    API: 300, // 5 minutos
    IMAGES: 2592000, // 30 días
  },

  // Estrategias de caché
  STRATEGIES: {
    STATIC: 'cache-first',
    DYNAMIC: 'stale-while-revalidate',
    API: 'network-first',
  },
};

// Configuración de debounce y throttle
export const TIMING_CONFIG = {
  SEARCH_DEBOUNCE: 300,
  SCROLL_THROTTLE: 16, // ~60fps
  RESIZE_THROTTLE: 100,
  API_RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
};

// Configuración de bundle splitting
export const BUNDLE_CONFIG = {
  // Tamaños máximos de chunks
  MAX_CHUNK_SIZE: 244 * 1024, // 244KB
  MAX_INITIAL_CHUNK_SIZE: 500 * 1024, // 500KB

  // Prioridades de carga
  PRIORITIES: {
    CRITICAL: ['dashboard', 'auth', 'layout'],
    HIGH: ['components', 'utils'],
    MEDIUM: ['charts', 'forms'],
    LOW: ['analytics', 'tracking'],
  },
};

// Configuración de compresión
export const COMPRESSION_CONFIG = {
  // Niveles de compresión
  LEVELS: {
    IMAGES: 85,
    CSS: 90,
    JS: 90,
    HTML: 95,
  },

  // Formatos optimizados
  FORMATS: {
    IMAGES: ['webp', 'avif'],
    FONTS: ['woff2', 'woff'],
  },
};

// Configuración de preload
export const PRELOAD_CONFIG = {
  // Recursos críticos para preload
  CRITICAL_RESOURCES: [
    '/fonts/inter.woff2',
    '/images/logo.webp',
    '/api/dashboard/stats',
  ],

  // Recursos para prefetch
  PREFETCH_RESOURCES: [
    '/api/jobs',
    '/api/clients',
    '/api/workers',
  ],

  // Timing de preload
  TIMING: {
    IMMEDIATE: 0,
    AFTER_LOAD: 1000,
    ON_HOVER: 200,
  },
};

// Configuración de service worker
export const SERVICE_WORKER_CONFIG = {
  CACHE_NAME: 'amestica-cache-v1',
  CACHE_STRATEGIES: {
    STATIC: 'cache-first',
    DYNAMIC: 'stale-while-revalidate',
    API: 'network-first',
  },
  OFFLINE_FALLBACK: '/offline.html',
};

// Configuración de métricas
export const METRICS_CONFIG = {
  // Core Web Vitals
  CORE_WEB_VITALS: {
    LCP: 2500, // Largest Contentful Paint
    FID: 100, // First Input Delay
    CLS: 0.1, // Cumulative Layout Shift
  },

  // Métricas personalizadas
  CUSTOM_METRICS: {
    DASHBOARD_LOAD_TIME: 2000,
    API_RESPONSE_TIME: 500,
    IMAGE_LOAD_TIME: 1000,
  },
};

// Funciones de utilidad para performance
export const performanceUtils = {
  // Medir tiempo de ejecución
  measureTime: (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  },

  // Medir tiempo de una función async
  measureAsyncTime: async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },

  // Verificar si está en modo de desarrollo
  isDevelopment: () => process.env.NODE_ENV === 'development',

  // Verificar si está en modo de producción
  isProduction: () => process.env.NODE_ENV === 'production',

  // Obtener información del navegador
  getBrowserInfo: () => {
    if (typeof window === 'undefined') return null;

    return {
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      memory: (performance as any).memory?.usedJSHeapSize || 0,
      timing: performance.timing,
    };
  },

  // Optimizar imágenes
  optimizeImage: (src: string, width?: number, height?: number, quality?: number) => {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality) params.set('q', quality.toString());

    return `${src}?${params.toString()}`;
  },

  // Lazy load de imágenes
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            observer.unobserve(img);
          }
        });
      },
      LAZY_LOADING_CONFIG.IMAGES
    );

    observer.observe(img);
  },

  // Preload de recursos
  preloadResource: (href: string, as: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Prefetch de recursos
  prefetchResource: (href: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  },
};

// Hook para medir performance en React
export const usePerformance = () => {
  const measureComponentRender = (componentName: string) => {
    const start = performance.now();

    return () => {
      const end = performance.now();
      if (performanceUtils.isDevelopment()) {
        console.log(`${componentName} render took ${end - start} milliseconds`);
      }
    };
  };

  const measureApiCall = async (apiName: string, apiCall: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      if (performanceUtils.isDevelopment()) {
        console.log(`${apiName} API call took ${end - start} milliseconds`);
      }
      return result;
    } catch (error) {
      const end = performance.now();
      if (performanceUtils.isDevelopment()) {
        console.log(`${apiName} API call failed after ${end - start} milliseconds`);
      }
      throw error;
    }
  };

  return {
    measureComponentRender,
    measureApiCall,
    ...performanceUtils,
  };
};
