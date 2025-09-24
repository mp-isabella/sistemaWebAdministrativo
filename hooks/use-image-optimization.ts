// hooks/use-image-optimization.ts
// Hook personalizado para optimización de imágenes

import { useCallback, useEffect, useRef, useState } from 'react';

interface ImageOptimizationOptions {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface ImageOptimizationResult {
  isLoaded: boolean;
  isError: boolean;
  imageProps: {
    src: string;
    alt: string;
    sizes: string;
    priority: boolean;
    quality: number;
    placeholder: 'blur' | 'empty';
    onLoad: () => void;
    onError: (error: Error) => void;
  };
  reloadImage: () => void;
  loadTime: number;
  optimizedSrc: string;
}

export const useImageOptimization = ({
  src,
  alt,
  sizes = '100vw',
  priority = false,
  quality = 85,
  placeholder = 'empty',
  onLoad,
  onError
}: ImageOptimizationOptions): ImageOptimizationResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadTime, setLoadTime] = useState(0);
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const startTimeRef = useRef<number>(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Generar URL optimizada
  const generateOptimizedSrc = useCallback((originalSrc: string) => {
    // Si ya es WebP, no cambiar
    if (originalSrc.endsWith('.webp')) {
      return originalSrc;
    }

    // Si es JPG/PNG, intentar usar versión WebP
    const baseName = originalSrc.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '');
    const webpSrc = `${baseName}.webp`;

    return webpSrc;
  }, []);

  // Manejar carga exitosa
  const handleLoad = useCallback(() => {
    const endTime = performance.now();
    const loadTime = endTime - startTimeRef.current;

    setIsLoaded(true);
    setIsError(false);
    setLoadTime(loadTime);
    onLoad?.();
  }, [onLoad]);

  // Manejar error de carga
  const handleError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
    onError?.(new Error(`Failed to load image: ${src}`));
  }, [src, onError]);

  // Preload de imagen si es prioritaria
  useEffect(() => {
    if (priority && src) {
      startTimeRef.current = performance.now();

      const img = new window.Image();
      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = src;

      imgRef.current = img;

      return () => {
        if (imgRef.current) {
          imgRef.current.onload = null;
          imgRef.current.onerror = null;
        }
      };
    }
    return undefined;
  }, [src, priority, handleLoad, handleError]);

  // Actualizar src optimizado cuando cambie la fuente
  useEffect(() => {
    const newOptimizedSrc = generateOptimizedSrc(src);
    setOptimizedSrc(newOptimizedSrc);
  }, [src, generateOptimizedSrc]);

  // Función para recargar imagen
  const reloadImage = useCallback(() => {
    setIsLoaded(false);
    setIsError(false);
    setLoadTime(0);

    if (imgRef.current) {
      startTimeRef.current = performance.now();
      imgRef.current.src = optimizedSrc;
    }
  }, [optimizedSrc]);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || !src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startTimeRef.current = performance.now();

            const img = new window.Image();
            img.onload = handleLoad;
            img.onerror = handleError;
            img.src = optimizedSrc;

            imgRef.current = img;
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Cargar 50px antes de que sea visible
        threshold: 0.1
      }
    );

    // Crear un elemento dummy para observar
    const dummyElement = document.createElement('div');
    observer.observe(dummyElement);

    return () => {
      observer.disconnect();
      if (imgRef.current) {
        imgRef.current.onload = null;
        imgRef.current.onerror = null;
      }
    };
  }, [src, priority, optimizedSrc, handleLoad, handleError]);

  return {
    isLoaded,
    isError,
    imageProps: {
      src: optimizedSrc,
      alt,
      sizes,
      priority,
      quality,
      placeholder,
      onLoad: handleLoad,
      onError: handleError
    },
    reloadImage,
    loadTime,
    optimizedSrc
  };
};

// Hook para preload de múltiples imágenes
export const useImagePreloader = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [totalImages] = useState(imageUrls.length);

  useEffect(() => {
    if (imageUrls.length === 0) return;

    const loadImage = (url: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(Array.from(prev).concat(url)));
          resolve();
        };
        img.onerror = () => {
          // Contar como cargada incluso si falla
          setLoadedImages(prev => new Set(Array.from(prev).concat(url)));
          resolve();
        };
        img.src = url;
      });
    };

    // Cargar todas las imágenes en paralelo
    Promise.all(imageUrls.map(loadImage));
  }, [imageUrls]);

  const progress = loadedImages.size / totalImages;
  const isComplete = loadedImages.size === totalImages;

  return {
    loadedImages: Array.from(loadedImages),
    progress,
    isComplete,
    totalImages
  };
};

// Hook para optimización de imágenes responsivas
export const useResponsiveImage = (src: string, breakpoints: number[] = [640, 768, 1024, 1280]) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [currentBreakpoint, setCurrentBreakpoint] = useState(0);

  useEffect(() => {
    const updateImage = () => {
      const width = window.innerWidth;
      let breakpointIndex = 0;

      for (let i = 0; i < breakpoints.length; i++) {
        if (width >= (breakpoints[i] ?? 0)) {
          breakpointIndex = i;
        }
      }

      if (breakpointIndex !== currentBreakpoint) {
        setCurrentBreakpoint(breakpointIndex);

        // Generar src optimizado para el breakpoint actual
        const baseName = src.replace(/\.(webp|jpg|jpeg|png)$/i, '');
        const extension = src.match(/\.(webp|jpg|jpeg|png)$/i)?.[1] ?? 'webp';
        const newSrc = `${baseName}-${breakpoints[breakpointIndex]}w.${extension}`;

        setCurrentSrc(newSrc);
      }
    };

    updateImage();
    window.addEventListener('resize', updateImage);

    return () => window.removeEventListener('resize', updateImage);
  }, [src, breakpoints, currentBreakpoint]);

  return {
    currentSrc,
    currentBreakpoint,
    breakpoint: breakpoints[currentBreakpoint]
  };
};
