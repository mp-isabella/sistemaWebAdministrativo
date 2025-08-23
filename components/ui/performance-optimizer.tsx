"use client";

import { useEffect } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

export default function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    // Optimización: Preload de recursos críticos solo
    const preloadCriticalResources = () => {
      const criticalImages = [
        '/logo.png',
        '/logo-blanco.png'
      ];

      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.type = src.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
        document.head.appendChild(link);
      });
    };

    // Optimización: Configuración de rendimiento
    const optimizePerformance = () => {
      // Deshabilitar animaciones en dispositivos que prefieren movimiento reducido
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition-duration', '0.1s');
      }

      // Optimizar para conexiones lentas
      if ('connection' in navigator && (navigator as any).connection?.effectiveType === 'slow-2g') {
        document.documentElement.classList.add('slow-connection');
      }
    };

    // Ejecutar optimizaciones de forma asíncrona para no bloquear el render
    setTimeout(() => {
      preloadCriticalResources();
      optimizePerformance();
    }, 100);
  }, []);

  return <>{children}</>;
}
