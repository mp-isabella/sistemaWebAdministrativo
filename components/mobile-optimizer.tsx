"use client";

import { useEffect, useState } from 'react';
import { useIsClient } from '@/hooks/use-hydration-safe';

interface MobileOptimizerProps {
  children: React.ReactNode;
}

export default function MobileOptimizer({ children }: MobileOptimizerProps) {
  const isClient = useIsClient();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);

  // Update mobile detection only after hydration
  useEffect(() => {
    if (!isClient) return;
    
    const updateMobileInfo = () => {
      const width = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const mobile = width <= 768 || (width <= 1024 && isTouchDevice);
      const tablet = width > 768 && width <= 1024 && isTouchDevice;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
    };

    updateMobileInfo();
    window.addEventListener('resize', updateMobileInfo);
    window.addEventListener('orientationchange', updateMobileInfo);

    return () => {
      window.removeEventListener('resize', updateMobileInfo);
      window.removeEventListener('orientationchange', updateMobileInfo);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !isMobile && !isTablet) return;
    
    // Optimizaciones específicas para móvil
    // Reducir la calidad de las imágenes
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        img.loading = 'lazy';
        img.decoding = 'async';
      }
    });

    // Optimizar animaciones CSS
    const style = document.createElement('style');
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
      }
    `;
    document.head.appendChild(style);

    // Prevenir zoom en inputs en iOS
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }

    setIsOptimized(true);
  }, [isMobile, isTablet, isClient]);

  // Optimizaciones de rendimiento
  useEffect(() => {
    if (!isClient || !isMobile) return;
    
    // Reducir la frecuencia de eventos de scroll
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
  }, [isMobile, isClient]);

  // Optimizaciones de memoria
  useEffect(() => {
    if (!isClient || !isMobile) return;
    
    // Limpiar caché de imágenes no utilizadas
    const cleanupImages = () => {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach((img) => {
        const rect = img.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          img.removeAttribute('src');
        }
      });
    };

    const interval = setInterval(cleanupImages, 5000);
    return () => clearInterval(interval);
  }, [isMobile, isClient]);

  // Always render children to avoid hydration issues
  return <>{children}</>;
}
