"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  style?: React.CSSProperties;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}

/**
 * Componente de imagen optimizado que elimina fondos negros y carga más rápido
 * Implementa mejores prácticas de Next.js con Tailwind CSS
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  sizes = "100vw",
  priority = false,
  quality = 90,
  onLoad,
  onError,
  placeholder = "blur",
  blurDataURL,
  style,
  loading = "lazy",
  fetchPriority = "auto",
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Si es priority, considerarlo inmediatamente visible

  // Placeholder base64 optimizado (muy pequeño y claro)
  const defaultBlurDataURL = blurDataURL ||
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

  // Intersection Observer para lazy loading inteligente
  useEffect(() => {
    if (priority || isInView) return;

    // Verificar si IntersectionObserver está disponible
    if (typeof window === "undefined" || !window.IntersectionObserver) {
      setIsInView(true); // Fallback: cargar inmediatamente
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Cargar antes para mejor UX
        threshold: 0.01,
      }
    );

    const imageElement = document.querySelector(`[data-image-src="${src}"]`);
    if (imageElement) {
      observer.observe(imageElement);
    } else {
      // Si no encuentra el elemento, cargar inmediatamente
      setIsInView(true);
    }

    return () => observer.disconnect();
  }, [src, priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Estilos optimizados para evitar fondos negros
  const imageStyles: React.CSSProperties = {
    ...style,
    // Mejorar la calidad de renderizado
    filter: "brightness(1.02) contrast(1.05) saturate(1.1)",
    // Forzar aceleración por hardware
    transform: "translateZ(0)",
    // Suavizar la transición
    transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
    // Evitar fondos negros
    backgroundColor: "transparent",
    // Mejorar el renderizado de imágenes
    imageRendering: "crisp-edges" as any,
  };

  // Contenedor con fondo suave en lugar de negro
  const containerClasses = cn(
    "relative overflow-hidden",
    // Fondo suave durante la carga
    !isLoaded && !hasError && "bg-gradient-to-br from-gray-100 to-gray-200",
    // Animación suave de aparición
    isLoaded && "animate-in fade-in duration-300",
    className
  );

  // Si la imagen no está en vista y no es priority, mostrar placeholder
  if (!isInView && !priority) {
    return (
      <div
        data-image-src={src}
        className={containerClasses}
        style={{ width, height }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Overlay de carga con gradiente suave */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
      )}

      {/* Imagen principal */}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        loading={priority ? "eager" : loading}
        fetchPriority={priority ? "high" : fetchPriority}
        onLoad={handleLoad}
        onError={handleError}
        style={imageStyles}
        className={cn(
          "object-cover",
          // Transición suave de aparición
          isLoaded ? "opacity-100" : "opacity-0",
          // Mejorar la calidad visual
          "will-change-transform"
        )}
        {...props}
      />

      {/* Fallback en caso de error */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="text-gray-400 text-sm text-center p-4">
            <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded" />
            Imagen no disponible
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook para precargar imágenes críticas - versión optimizada
 */
export function useImagePreload(imageSources: string[], priority = false) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || imageSources.length === 0) {
      setIsLoading(false);
      return;
    }

    // Si no es priority, cargar de forma más simple
    if (!priority) {
      setIsLoading(false);
      return;
    }

    // Solo precargar imágenes priority para evitar demoras
    const preloadPromises = imageSources.slice(0, 3).map((src) => { // Solo las primeras 3
      return new Promise<string>((resolve) => {
        const img = new window.Image();

        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(src));
          resolve(src);
        };

        img.onerror = () => {
          resolve(src); // No bloquear por errores
        };

        img.src = src;
      });
    });

    Promise.allSettled(preloadPromises).then(() => {
      setIsLoading(false);
    });
  }, [imageSources, priority]);

  return { loadedImages, isLoading };
}