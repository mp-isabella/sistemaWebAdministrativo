// hooks/use-component-optimization.ts
// Hook para optimización de componentes

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { PERFORMANCE_CONFIG, performanceUtils } from '@/lib/performance-optimizations';

interface ComponentOptimizationOptions {
  // Debounce para eventos
  debounceEvents?: boolean;
  debounceDelay?: number;
  
  // Throttle para eventos
  throttleEvents?: boolean;
  throttleDelay?: number;
  
  // Memoización
  memoizeProps?: boolean;
  memoizeCallbacks?: boolean;
  
  // Lazy loading
  lazyLoad?: boolean;
  intersectionThreshold?: number;
  
  // Preload
  preload?: boolean;
  preloadDelay?: number;
}

export const useComponentOptimization = (options: ComponentOptimizationOptions = {}) => {
  const {
    debounceEvents = true,
    debounceDelay = PERFORMANCE_CONFIG.DEBOUNCE.CLICK,
    throttleEvents = false,
    throttleDelay = 100,
    memoizeProps = true,
    memoizeCallbacks = true,
    lazyLoad = false,
    intersectionThreshold = PERFORMANCE_CONFIG.LOADING.INTERSECTION_THRESHOLD,
    preload = false,
    preloadDelay = 0
  } = options;

  const componentRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isVisibleRef = useRef(false);
  const isLoadedRef = useRef(false);

  // Memoización de props
  const memoizedProps = useMemo(() => {
    if (!memoizeProps) return {};
    
    return {
      // Props memoizados para evitar re-renders innecesarios
      className: 'optimized-component',
      'data-optimized': 'true'
    };
  }, [memoizeProps]);

  // Debounce para eventos
  const debouncedCallback = useCallback(
    <T extends (...args: any[]) => any>(callback: T): T => {
      if (!debounceEvents) return callback;
      
      return performanceUtils.debounce(callback, debounceDelay) as T;
    },
    [debounceEvents, debounceDelay]
  );

  // Throttle para eventos
  const throttledCallback = useCallback(
    <T extends (...args: any[]) => any>(callback: T): T => {
      if (!throttleEvents) return callback;
      
      return performanceUtils.throttle(callback, throttleDelay) as T;
    },
    [throttleEvents, throttleDelay]
  );

  // Lazy loading con Intersection Observer
  useEffect(() => {
    if (!lazyLoad || !componentRef.current) return;

    const observer = performanceUtils.createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisibleRef.current) {
            isVisibleRef.current = true;
            
            // Trigger lazy load
            if (preload && preloadDelay > 0) {
              setTimeout(() => {
                isLoadedRef.current = true;
              }, preloadDelay);
            } else {
              isLoadedRef.current = true;
            }
          }
        });
      },
      { threshold: intersectionThreshold }
    );

    observerRef.current = observer;
    observer.observe(componentRef.current);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [lazyLoad, intersectionThreshold, preload, preloadDelay]);

  // Optimización de eventos
  const optimizedEventHandlers = useMemo(() => {
    const handlers: Record<string, any> = {};

    if (debounceEvents) {
      handlers.onClick = debouncedCallback((e: Event) => {
        // Handle click with debounce
        console.log('Debounced click event');
      });
      
      handlers.onScroll = debouncedCallback((e: Event) => {
        // Handle scroll with debounce
        console.log('Debounced scroll event');
      });
    }

    if (throttleEvents) {
      handlers.onResize = throttledCallback((e: Event) => {
        // Handle resize with throttle
        console.log('Throttled resize event');
      });
    }

    return handlers;
  }, [debounceEvents, throttleEvents, debouncedCallback, throttledCallback]);

  // Función para optimizar cualquier callback
  const optimizeCallback = useCallback(
    <T extends (...args: any[]) => any>(
      callback: T,
      type: 'debounce' | 'throttle' = 'debounce'
    ): T => {
      if (type === 'debounce') {
        return debouncedCallback(callback);
      } else {
        return throttledCallback(callback);
      }
    },
    [debouncedCallback, throttledCallback]
  );

  // Función para forzar re-render optimizado
  const forceOptimizedRender = useCallback(() => {
    if (componentRef.current) {
      // Trigger re-render con optimizaciones
      componentRef.current.style.transform = 'translateZ(0)';
      requestAnimationFrame(() => {
        if (componentRef.current) {
          componentRef.current.style.transform = '';
        }
      });
    }
  }, []);

  // Estado de optimización
  const optimizationState = useMemo(() => ({
    isVisible: isVisibleRef.current,
    isLoaded: isLoadedRef.current,
    isOptimized: true,
    debounceEnabled: debounceEvents,
    throttleEnabled: throttleEvents,
    lazyLoadEnabled: lazyLoad
  }), [debounceEvents, throttleEvents, lazyLoad]);

  return {
    // Refs
    componentRef,
    
    // Props optimizados
    optimizedProps: memoizedProps,
    
    // Event handlers optimizados
    optimizedEventHandlers,
    
    // Funciones de optimización
    optimizeCallback,
    forceOptimizedRender,
    
    // Estado
    optimizationState,
    
    // Utilidades
    debouncedCallback,
    throttledCallback
  };
};

// Hook específico para optimización de listas
export const useListOptimization = <T>(
  items: T[],
  options: {
    pageSize?: number;
    virtualScroll?: boolean;
    lazyLoad?: boolean;
  } = {}
) => {
  const {
    pageSize = 20,
    virtualScroll = false,
    lazyLoad = true
  } = options;

  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Memoizar items visibles
  const memoizedVisibleItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  // Cargar más items
  const loadMore = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoading(false);
    }, 100);
  }, [isLoading]);

  // Resetear paginación
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setVisibleItems([]);
  }, []);

  // Actualizar items visibles
  useEffect(() => {
    if (lazyLoad) {
      setVisibleItems(prev => [...prev, ...memoizedVisibleItems]);
    } else {
      setVisibleItems(memoizedVisibleItems);
    }
  }, [memoizedVisibleItems, lazyLoad]);

  return {
    visibleItems,
    currentPage,
    isLoading,
    loadMore,
    resetPagination,
    hasMore: currentPage * pageSize < items.length
  };
};
