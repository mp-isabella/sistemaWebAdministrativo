import { useState, useEffect, useCallback } from 'react';

interface UseImageLoaderOptions {
  src: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function useImageLoader({ src, priority = false, onLoad, onError }: UseImageLoaderOptions) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadImage = useCallback(() => {
    if (!src) return;

    const img = new Image();
    
    img.onload = () => {
      setIsLoading(false);
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };

    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      setIsLoaded(false);
      onError?.();
    };

    img.src = src;
  }, [src, onLoad, onError]);

  useEffect(() => {
    if (priority) {
      // Cargar inmediatamente si es prioritaria
      loadImage();
    } else {
      // Cargar con delay para no bloquear el render
      const timer = setTimeout(loadImage, 100);
      return () => clearTimeout(timer);
    }
  }, [loadImage, priority]);

  return {
    isLoading,
    hasError,
    isLoaded,
    reload: loadImage
  };
}

// Hook optimizado para precargar múltiples imágenes
export function useImagePreloader(imageUrls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isAllLoaded, setIsAllLoaded] = useState(false);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setIsAllLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageUrls.length;
    const maxConcurrent = 2; // Limitar carga concurrente
    let currentIndex = 0;

    const loadImage = (url: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          loadedCount++;
          setLoadedImages(prev => new Set([...prev, url]));
          setLoadingProgress((loadedCount / totalImages) * 100);
          
          if (loadedCount === totalImages) {
            setIsAllLoaded(true);
          }
          resolve();
        };

        img.onerror = () => {
          loadedCount++;
          setLoadingProgress((loadedCount / totalImages) * 100);
          
          if (loadedCount === totalImages) {
            setIsAllLoaded(true);
          }
          resolve();
        };

        img.src = url;
      });
    };

    const loadNextBatch = async () => {
      const batch = imageUrls.slice(currentIndex, currentIndex + maxConcurrent);
      if (batch.length === 0) return;

      await Promise.all(batch.map(url => loadImage(url)));
      currentIndex += maxConcurrent;

      if (currentIndex < imageUrls.length) {
        // Cargar siguiente batch con delay
        setTimeout(loadNextBatch, 100);
      }
    };

    // Iniciar carga con delay para no bloquear el render
    const timer = setTimeout(() => {
      loadNextBatch();
    }, 200);

    return () => clearTimeout(timer);
  }, [imageUrls]);

  return {
    loadedImages,
    loadingProgress,
    isAllLoaded
  };
}
