"use client";

import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function useResponsive(): ResponsiveState {
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    breakpoint: 'sm',
  });

  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;
      const isDesktop = width >= 1024 && width < 1536;
      const isLargeDesktop = width >= 1536;

      let breakpoint: ResponsiveState['breakpoint'] = 'sm';
      if (width < 640) breakpoint = 'xs';
      else if (width < 768) breakpoint = 'sm';
      else if (width < 1024) breakpoint = 'md';
      else if (width < 1280) breakpoint = 'lg';
      else if (width < 1536) breakpoint = 'xl';
      else breakpoint = '2xl';

      setResponsiveState({
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        screenWidth: width,
        screenHeight: height,
        breakpoint,
      });
    };

    // Ejecutar inmediatamente
    updateResponsiveState();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', updateResponsiveState);
    window.addEventListener('orientationchange', updateResponsiveState);

    return () => {
      window.removeEventListener('resize', updateResponsiveState);
      window.removeEventListener('orientationchange', updateResponsiveState);
    };
  }, []);

  return responsiveState;
}

// Hook para obtener clases responsivas
export function useResponsiveClasses() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return {
    // Padding responsivo
    padding: isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-6',
    paddingX: isMobile ? 'px-3' : isTablet ? 'px-4' : 'px-6',
    paddingY: isMobile ? 'py-3' : isTablet ? 'py-4' : 'py-6',
    
    // Margin responsivo
    margin: isMobile ? 'm-3' : isTablet ? 'm-4' : 'm-6',
    marginX: isMobile ? 'mx-3' : isTablet ? 'mx-4' : 'mx-6',
    marginY: isMobile ? 'my-3' : isTablet ? 'my-4' : 'my-6',
    
    // Gap responsivo
    gap: isMobile ? 'gap-3' : isTablet ? 'gap-4' : 'gap-6',
    gapX: isMobile ? 'gap-x-3' : isTablet ? 'gap-x-4' : 'gap-x-6',
    gapY: isMobile ? 'gap-y-3' : isTablet ? 'gap-y-4' : 'gap-y-6',
    
    // Tamaños de texto
    textSize: {
      xs: isMobile ? 'text-xs' : 'text-sm',
      sm: isMobile ? 'text-sm' : 'text-base',
      base: isMobile ? 'text-base' : 'text-lg',
      lg: isMobile ? 'text-lg' : 'text-xl',
      xl: isMobile ? 'text-xl' : 'text-2xl',
      '2xl': isMobile ? 'text-2xl' : 'text-3xl',
    },
    
    // Tamaños de iconos
    iconSize: isMobile ? 'h-4 w-4' : isTablet ? 'h-5 w-5' : 'h-6 w-6',
    
    // Grid responsivo
    gridCols: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3',
    gridColsAuto: isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    
    // Flex responsivo
    flexDirection: isMobile ? 'flex-col' : 'flex-row',
    flexWrap: isMobile ? 'flex-wrap' : 'flex-nowrap',
    
    // Espaciado entre elementos
    space: isMobile ? 'space-y-3' : isTablet ? 'space-y-4' : 'space-y-6',
    spaceX: isMobile ? 'space-x-3' : isTablet ? 'space-x-4' : 'space-x-6',
    
    // Ancho de contenedores
    containerWidth: isMobile ? 'w-full' : isTablet ? 'w-11/12' : 'w-10/12',
    maxWidth: isMobile ? 'max-w-full' : isTablet ? 'max-w-4xl' : 'max-w-6xl',
  };
}
