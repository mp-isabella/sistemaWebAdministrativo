"use client";

import { useCallback, useEffect, useState } from 'react';

interface MobileOptimizerProps {
  children: React.ReactNode;
  enableFormOptimizations?: boolean;
  enableImageOptimizations?: boolean;
  enableAnimationOptimizations?: boolean;
}

export default function MobileOptimizer({
  children,
  enableFormOptimizations = true,
  enableImageOptimizations = true,
  enableAnimationOptimizations = true
}: MobileOptimizerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Función optimizada para detectar dispositivos móviles
  const updateMobileInfo = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Detección más precisa de dispositivos móviles
    const mobile = width <= 768 || (width <= 1024 && isTouchDevice);
    const tablet = width > 768 && width <= 1024 && isTouchDevice;

    setIsMobile(mobile);
    setIsTablet(tablet);
    setViewportHeight(height);
  }, []);

  // Actualizar información del dispositivo solo después de la hidratación
  useEffect(() => {
    updateMobileInfo();

    const handleResize = () => {
      updateMobileInfo();
    };

    const handleOrientationChange = () => {
      // Delay para asegurar que la orientación se haya cambiado completamente
      setTimeout(updateMobileInfo, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [updateMobileInfo]);

  // Optimizaciones específicas para móvil
  useEffect(() => {
    if (!isMobile && !isTablet) return;

    if (enableImageOptimizations) {
      // Optimizar imágenes de fondo y contenido
      const images = document.querySelectorAll('img, [style*="background-image"]');
      images.forEach((element) => {
        if (element instanceof HTMLImageElement) {
          element.loading = 'lazy';
          element.decoding = 'async';

          // Agregar clases de optimización para móvil
          element.classList.add('mobile-optimized');
        }
      });
    }

    if (enableAnimationOptimizations) {
      // Optimizar animaciones CSS para móvil
      const style = document.createElement('style');
      style.id = 'mobile-optimizations';
      style.textContent = `
        @media (max-width: 768px) {
          * {
            animation-duration: 0.2s !important;
            transition-duration: 0.2s !important;
          }

          .animate-slow {
            animation-duration: 0.3s !important;
          }

          .transition-slow {
            transition-duration: 0.3s !important;
          }

          /* Optimizaciones específicas para el Hero */
          .hero-background {
            background-attachment: scroll !important;
          }

          /* Reducir sombras en móvil para mejor rendimiento */
          .shadow-2xl {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          }
        }

        @media (max-width: 480px) {
          /* Optimizaciones adicionales para móviles pequeños */
          .text-6xl {
            font-size: 2.5rem !important;
            line-height: 1.1 !important;
          }

          .text-5xl {
            font-size: 2rem !important;
            line-height: 1.2 !important;
          }
        }
      `;

      // Evitar duplicar estilos
      const existingStyle = document.getElementById('mobile-optimizations');
      if (!existingStyle) {
        try {
          document.head.appendChild(style);
        } catch (error) {
        }
      }
    }

    // Prevenir zoom en inputs en iOS
    if (enableFormOptimizations) {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
      }
    }

  }, [isMobile, isTablet, enableFormOptimizations, enableImageOptimizations, enableAnimationOptimizations]);

  // Optimizaciones de rendimiento para scroll
  useEffect(() => {
    if (!isMobile) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Manejar scroll optimizado
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Optimizaciones de memoria y caché
  useEffect(() => {
    if (!isMobile) return;

    // Limpiar caché de imágenes no utilizadas
    const cleanupImages = () => {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach((img) => {
        const rect = img.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) {
          img.removeAttribute('src');
        }
      });
    };

    const interval = setInterval(cleanupImages, 10000); // Reducido a 10 segundos
    return () => clearInterval(interval);
  }, [isMobile]);

  // Optimizaciones específicas para formularios móviles
  useEffect(() => {
    if (!isMobile || !enableFormOptimizations) return;

    // Mejorar experiencia de formularios en móvil
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      if (input instanceof HTMLElement) {
        // Agregar clases de optimización para móvil
        input.classList.add('mobile-form-input');

        // Prevenir zoom en iOS
        if (input instanceof HTMLInputElement) {
          input.style.fontSize = '16px';
        }
      }
    });
  }, [isMobile, enableFormOptimizations]);

  // Optimizaciones de viewport para móviles
  useEffect(() => {
    if (!isMobile || !viewportHeight) return;

    // Ajustar altura del viewport para móviles
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);

    return () => window.removeEventListener('resize', setVH);
  }, [isMobile, viewportHeight]);

  // Renderizar children siempre para evitar problemas de hidratación
  return <>{children}</>;
}
