// lib/responsive-config.ts
// Configuración completa de responsividad para todo el sistema administrativo

import * as React from 'react'

export const RESPONSIVE_CONFIG = {
  // Breakpoints principales
  BREAKPOINTS: {
    MIN_WIDTH: 374,        // Tamaño mínimo soportado
    MOBILE_SMALL: 375,     // iPhone SE y dispositivos muy pequeños
    MOBILE: 480,           // Móviles estándar
    TABLET: 768,           // Tablets
    DESKTOP: 1024,         // Desktop
    DESKTOP_LARGE: 1440,   // Monitores grandes
    DESKTOP_XL: 1920,      // Monitores ultra-wide
  },

  // Configuración de espaciado responsivo
  SPACING: {
    XS: {
      mobile: '0.125rem',    // 2px
      tablet: '0.25rem',     // 4px
      desktop: '0.25rem',    // 4px
    },
    SM: {
      mobile: '0.25rem',     // 4px
      tablet: '0.5rem',      // 8px
      desktop: '0.5rem',     // 8px
    },
    MD: {
      mobile: '0.5rem',      // 8px
      tablet: '0.75rem',     // 12px
      desktop: '1rem',       // 16px
    },
    LG: {
      mobile: '0.75rem',     // 12px
      tablet: '1rem',        // 16px
      desktop: '1.5rem',     // 24px
    },
    XL: {
      mobile: '1rem',        // 16px
      tablet: '1.5rem',      // 24px
      desktop: '2rem',       // 32px
    },
    '2XL': {
      mobile: '1.5rem',      // 24px
      tablet: '2rem',        // 32px
      desktop: '3rem',       // 48px
    },
  },

  // Configuración de tipografía responsiva
  TYPOGRAPHY: {
    XS: {
      mobile: '0.625rem',    // 10px
      tablet: '0.75rem',     // 12px
      desktop: '0.75rem',    // 12px
    },
    SM: {
      mobile: '0.75rem',     // 12px
      tablet: '0.875rem',    // 14px
      desktop: '0.875rem',   // 14px
    },
    BASE: {
      mobile: '0.875rem',    // 14px
      tablet: '1rem',        // 16px
      desktop: '1rem',       // 16px
    },
    LG: {
      mobile: '1rem',        // 16px
      tablet: '1.125rem',    // 18px
      desktop: '1.125rem',   // 18px
    },
    XL: {
      mobile: '1.125rem',    // 18px
      tablet: '1.25rem',     // 20px
      desktop: '1.25rem',    // 20px
    },
    '2XL': {
      mobile: '1.25rem',     // 20px
      tablet: '1.375rem',    // 22px
      desktop: '1.5rem',     // 24px
    },
    '3XL': {
      mobile: '1.5rem',      // 24px
      tablet: '1.625rem',    // 26px
      desktop: '1.875rem',   // 30px
    },
    '4XL': {
      mobile: '1.75rem',     // 28px
      tablet: '1.875rem',    // 30px
      desktop: '2.25rem',    // 36px
    },
  },

  // Configuración de bordes redondeados responsivos
  BORDER_RADIUS: {
    SM: {
      mobile: '0.125rem',    // 2px
      tablet: '0.25rem',     // 4px
      desktop: '0.25rem',    // 4px
    },
    MD: {
      mobile: '0.25rem',     // 4px
      tablet: '0.5rem',      // 8px
      desktop: '0.5rem',     // 8px
    },
    LG: {
      mobile: '0.375rem',    // 6px
      tablet: '0.75rem',     // 12px
      desktop: '0.75rem',    // 12px
    },
    XL: {
      mobile: '0.5rem',      // 8px
      tablet: '1rem',        // 16px
      desktop: '1rem',       // 16px
    },
  },

  // Configuración de sombras responsivas
  SHADOWS: {
    SM: {
      mobile: '0 1px 1px 0 rgba(0, 0, 0, 0.05)',
      tablet: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      desktop: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    MD: {
      mobile: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
      tablet: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      desktop: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    LG: {
      mobile: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      tablet: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      desktop: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    XL: {
      mobile: '0 8px 10px -1px rgba(0, 0, 0, 0.1)',
      tablet: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      desktop: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  },

  // Configuración de grids responsivos
  GRIDS: {
    MOBILE: {
      columns: 1,
      gap: '0.5rem',
    },
    TABLET: {
      columns: 2,
      gap: '0.75rem',
    },
    DESKTOP: {
      columns: 3,
      gap: '1rem',
    },
    DESKTOP_LARGE: {
      columns: 4,
      gap: '1.5rem',
    },
    DESKTOP_XL: {
      columns: 5,
      gap: '2rem',
    },
  },

  // Configuración de animaciones responsivas
  ANIMATIONS: {
    DURATION: {
      mobile: 0.2,
      tablet: 0.3,
      desktop: 0.3,
    },
    EASING: {
      mobile: 'ease-out',
      tablet: 'ease-in-out',
      desktop: 'ease-in-out',
    },
  },

  // Configuración de componentes específicos
  COMPONENTS: {
    SIDEBAR: {
      mobile: {
        width: '100vw',
        position: 'fixed',
        transform: 'translateX(-100%)',
      },
      tablet: {
        width: '100vw',
        position: 'fixed',
        transform: 'translateX(-100%)',
      },
      desktop: {
        width: '280px',
        position: 'fixed',
        transform: 'translateX(0)',
      },
    },
    HEADER: {
      mobile: {
        padding: '0.5rem',
        height: 'auto',
        flexDirection: 'column',
      },
      tablet: {
        padding: '0.75rem',
        height: 'auto',
        flexDirection: 'row',
      },
      desktop: {
        padding: '1rem',
        height: '64px',
        flexDirection: 'row',
      },
    },
    CARDS: {
      mobile: {
        padding: '0.5rem',
        margin: '0.125rem',
        borderRadius: '0.375rem',
      },
      tablet: {
        padding: '0.75rem',
        margin: '0.25rem',
        borderRadius: '0.5rem',
      },
      desktop: {
        padding: '1rem',
        margin: '0.5rem',
        borderRadius: '0.75rem',
      },
    },
    BUTTONS: {
      mobile: {
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        minHeight: '40px',
        borderRadius: '0.375rem',
      },
      tablet: {
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        minHeight: '44px',
        borderRadius: '0.5rem',
      },
      desktop: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        minHeight: '44px',
        borderRadius: '0.5rem',
      },
    },
    INPUTS: {
      mobile: {
        padding: '0.375rem 0.5rem',
        fontSize: '0.875rem',
        minHeight: '40px',
        borderRadius: '0.375rem',
      },
      tablet: {
        padding: '0.5rem 0.75rem',
        fontSize: '1rem',
        minHeight: '44px',
        borderRadius: '0.5rem',
      },
      desktop: {
        padding: '0.5rem 0.75rem',
        fontSize: '1rem',
        minHeight: '44px',
        borderRadius: '0.5rem',
      },
    },
    TABLES: {
      mobile: {
        display: 'block',
        overflowX: 'auto',
        fontSize: '0.875rem',
      },
      tablet: {
        display: 'table',
        fontSize: '0.875rem',
      },
      desktop: {
        display: 'table',
        fontSize: '1rem',
      },
    },
    MODALS: {
      mobile: {
        padding: '0.5rem',
        maxWidth: '95vw',
        maxHeight: '95vh',
        borderRadius: '0.5rem',
      },
      tablet: {
        padding: '0.75rem',
        maxWidth: '90vw',
        maxHeight: '90vh',
        borderRadius: '0.75rem',
      },
      desktop: {
        padding: '1rem',
        maxWidth: '80vw',
        maxHeight: '80vh',
        borderRadius: '1rem',
      },
    },
  },

  // Configuración del calendario
  CALENDAR: {
    TIME_SLOTS: {
      start: 7, // Hora de inicio: 7:00 AM
      end: 19,  // Hora de fin: 7:00 PM
      total: 12 // Total de horas: 7:00-19:00
    },
    TIME_COLUMN: {
      mobile: {
        width: '3.5rem',
        cellHeight: '3rem',
        fontSize: '0.75rem',
      },
      tablet: {
        width: '4rem',
        cellHeight: '3rem',
        fontSize: '0.875rem',
      },
      desktop: {
        width: '5.5rem',
        cellHeight: '3.5rem',
        fontSize: '0.875rem',
      },
    },
    TECHNICIAN_COLUMN: {
      mobile: {
        width: '120px',
        cellHeight: '3rem',
        headerHeight: '60px',
        avatarSize: '1.75rem',
      },
      tablet: {
        width: '140px',
        cellHeight: '3rem',
        headerHeight: '60px',
        avatarSize: '2rem',
      },
      desktop: {
        width: '160px',
        cellHeight: '3.5rem',
        headerHeight: '80px',
        avatarSize: '2.5rem',
      },
    },
    EVENTS: {
      mobile: {
        fontSize: '10px',
        padding: '2px 4px',
        minHeight: '16px',
        borderRadius: '2px',
      },
      tablet: {
        fontSize: '12px',
        padding: '4px 6px',
        minHeight: '20px',
        borderRadius: '4px',
      },
      desktop: {
        fontSize: '12px',
        padding: '6px 8px',
        minHeight: '24px',
        borderRadius: '6px',
      },
    },
  },

  // Configuración de navegación
  NAVIGATION: {
    MOBILE: {
      direction: 'column',
      gap: '0.25rem',
      itemPadding: '0.5rem',
      itemWidth: '100%',
    },
    TABLET: {
      direction: 'row',
      gap: '0.5rem',
      itemPadding: '0.75rem',
      itemWidth: 'auto',
    },
    DESKTOP: {
      direction: 'row',
      gap: '0.75rem',
      itemPadding: '1rem',
      itemWidth: 'auto',
    },
  },

  // Configuración de formularios
  FORMS: {
    MOBILE: {
      gap: '0.5rem',
      gridColumns: 1,
      labelSize: '0.875rem',
      inputSize: '0.875rem',
    },
    TABLET: {
      gap: '0.75rem',
      gridColumns: 2,
      labelSize: '1rem',
      inputSize: '1rem',
    },
    DESKTOP: {
      gap: '1rem',
      gridColumns: 3,
      labelSize: '1rem',
      inputSize: '1rem',
    },
  },

  // Configuración de paginación
  PAGINATION: {
    MOBILE: {
      gap: '0.25rem',
      buttonSize: '36px',
      fontSize: '0.875rem',
      flexWrap: true,
    },
    TABLET: {
      gap: '0.5rem',
      buttonSize: '40px',
      fontSize: '1rem',
      flexWrap: false,
    },
    DESKTOP: {
      gap: '0.75rem',
      buttonSize: '44px',
      fontSize: '1rem',
      flexWrap: false,
    },
  },
};

// Funciones de utilidad para responsividad
export const responsiveUtils = {
  // Obtener el breakpoint actual basado en el ancho de pantalla
  getCurrentBreakpoint: (width: number): string => {
    if (width <= RESPONSIVE_CONFIG.BREAKPOINTS.MOBILE_SMALL) return 'mobile-small';
    if (width <= RESPONSIVE_CONFIG.BREAKPOINTS.MOBILE) return 'mobile';
    if (width <= RESPONSIVE_CONFIG.BREAKPOINTS.TABLET) return 'tablet';
    if (width <= RESPONSIVE_CONFIG.BREAKPOINTS.DESKTOP) return 'desktop';
    if (width <= RESPONSIVE_CONFIG.BREAKPOINTS.DESKTOP_LARGE) return 'desktop-large';
    return 'desktop-xl';
  },

  // Obtener el valor de espaciado para un breakpoint específico
  getSpacing: (size: keyof typeof RESPONSIVE_CONFIG.SPACING, breakpoint: string): string => {
    const spacing = RESPONSIVE_CONFIG.SPACING[size];
    switch (breakpoint) {
      case 'mobile-small':
      case 'mobile':
        return spacing.mobile;
      case 'tablet':
        return spacing.tablet;
      default:
        return spacing.desktop;
    }
  },

  // Obtener el valor de tipografía para un breakpoint específico
  getTypography: (size: keyof typeof RESPONSIVE_CONFIG.TYPOGRAPHY, breakpoint: string): string => {
    const typography = RESPONSIVE_CONFIG.TYPOGRAPHY[size];
    switch (breakpoint) {
      case 'mobile-small':
      case 'mobile':
        return typography.mobile;
      case 'tablet':
        return typography.tablet;
      default:
        return typography.desktop;
    }
  },

  // Obtener el valor de borde redondeado para un breakpoint específico
  getBorderRadius: (size: keyof typeof RESPONSIVE_CONFIG.BORDER_RADIUS, breakpoint: string): string => {
    const radius = RESPONSIVE_CONFIG.BORDER_RADIUS[size];
    switch (breakpoint) {
      case 'mobile-small':
      case 'mobile':
        return radius.mobile;
      case 'tablet':
        return radius.tablet;
      default:
        return radius.desktop;
    }
  },

  // Obtener el valor de sombra para un breakpoint específico
  getShadow: (size: keyof typeof RESPONSIVE_CONFIG.SHADOWS, breakpoint: string): string => {
    const shadow = RESPONSIVE_CONFIG.SHADOWS[size];
    switch (breakpoint) {
      case 'mobile-small':
      case 'mobile':
        return shadow.mobile;
      case 'tablet':
        return shadow.tablet;
      default:
        return shadow.desktop;
    }
  },

  // Obtener la configuración de grid para un breakpoint específico
  getGrid: (breakpoint: string) => {
    switch (breakpoint) {
      case 'mobile-small':
      case 'mobile':
        return RESPONSIVE_CONFIG.GRIDS.MOBILE;
      case 'tablet':
        return RESPONSIVE_CONFIG.GRIDS.TABLET;
      case 'desktop':
        return RESPONSIVE_CONFIG.GRIDS.DESKTOP;
      case 'desktop-large':
        return RESPONSIVE_CONFIG.GRIDS.DESKTOP_LARGE;
      default:
        return RESPONSIVE_CONFIG.GRIDS.DESKTOP_XL;
    }
  },

  // Obtener la configuración de animación para un breakpoint específico
  getAnimation: (breakpoint: string) => {
    switch (breakpoint) {
      case 'mobile-small':
      case 'mobile':
        return RESPONSIVE_CONFIG.ANIMATIONS.DURATION.mobile;
      case 'tablet':
        return RESPONSIVE_CONFIG.ANIMATIONS.DURATION.tablet;
      default:
        return RESPONSIVE_CONFIG.ANIMATIONS.DURATION.desktop;
    }
  },

  // Verificar si es un dispositivo móvil
  isMobile: (breakpoint: string): boolean => {
    return breakpoint === 'mobile-small' || breakpoint === 'mobile';
  },

  // Verificar si es una tablet
  isTablet: (breakpoint: string): boolean => {
    return breakpoint === 'tablet';
  },

  // Verificar si es desktop
  isDesktop: (breakpoint: string): boolean => {
    return breakpoint === 'desktop' || breakpoint === 'desktop-large' || breakpoint === 'desktop-xl';
  },

  // Verificar si es un dispositivo táctil
  isTouchDevice: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Obtener la orientación del dispositivo
  getOrientation: (): 'portrait' | 'landscape' => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  },
};

// Hook personalizado para responsividad (para uso en React)
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = React.useState<string>('desktop');
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const [isTablet, setIsTablet] = React.useState<boolean>(false);
  const [isDesktop, setIsDesktop] = React.useState<boolean>(true);

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const newBreakpoint = responsiveUtils.getCurrentBreakpoint(width);
      setBreakpoint(newBreakpoint);
      setIsMobile(responsiveUtils.isMobile(newBreakpoint));
      setIsTablet(responsiveUtils.isTablet(newBreakpoint));
      setIsDesktop(responsiveUtils.isDesktop(newBreakpoint));
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice: responsiveUtils.isTouchDevice(),
    orientation: responsiveUtils.getOrientation(),
    getSpacing: (size: keyof typeof RESPONSIVE_CONFIG.SPACING) =>
      responsiveUtils.getSpacing(size, breakpoint),
    getTypography: (size: keyof typeof RESPONSIVE_CONFIG.TYPOGRAPHY) =>
      responsiveUtils.getTypography(size, breakpoint),
    getBorderRadius: (size: keyof typeof RESPONSIVE_CONFIG.BORDER_RADIUS) =>
      responsiveUtils.getBorderRadius(size, breakpoint),
    getShadow: (size: keyof typeof RESPONSIVE_CONFIG.SHADOWS) =>
      responsiveUtils.getShadow(size, breakpoint),
    getGrid: () => responsiveUtils.getGrid(breakpoint),
    getAnimation: () => responsiveUtils.getAnimation(breakpoint),
  };
};

// Exportar la configuración por defecto
export default RESPONSIVE_CONFIG;
