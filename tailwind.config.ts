import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        amestica: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
          brand: '#002D71',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        // Colores adicionales para el dashboard
        dashboard: {
          primary: '#002D71',
          primaryLight: '#1e40af',
          primaryDark: '#001f5a',
          accent: '#f46015',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          sidebar: '#002D71',
          header: '#002D71',
          background: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0.6, 1) infinite',
        'dashboard-fade-in': 'dashboardFadeIn 0.5s ease-out forwards',
        'dashboard-slide-in': 'dashboardSlideIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        dashboardFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dashboardSlideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
        'sidebar': '280px',
        'header': '64px',
        // Espaciado responsivo
        'mobile': '0.75rem',
        'tablet': '1rem',
        'desktop': '1.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'dashboard': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dashboard-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'dashboard': 'all',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'sidebar': '50',
        'header': '40',
        'modal': '1000',
        'overlay': '999',
      },
      // Configuraciones específicas para el dashboard
      screens: {
        'xs': '374px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Breakpoints adicionales para responsividad
        'mobile': '374px',
        'mobile-lg': '480px',
        'tablet': '768px',
        'tablet-lg': '1024px',
        'desktop': '1280px',
        'desktop-lg': '1536px',
        'wide': '1920px',
      },
      // Variables CSS personalizadas
      cssVariables: {
        '--dashboard-primary': '#002D71',
        '--dashboard-primary-light': '#1e40af',
        '--dashboard-primary-dark': '#001f5a',
        '--dashboard-accent': '#f46015',
        '--dashboard-success': '#10b981',
        '--dashboard-warning': '#f59e0b',
        '--dashboard-error': '#ef4444',
        '--dashboard-sidebar-width': '280px',
        '--dashboard-header-height': '64px',
        // Variables responsivas
        '--mobile-padding': '0.75rem',
        '--tablet-padding': '1rem',
        '--desktop-padding': '1.5rem',
        '--mobile-gap': '0.75rem',
        '--tablet-gap': '1rem',
        '--desktop-gap': '1.5rem',
      },
      // Utilidades responsivas personalizadas
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
          '2xl': '3rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      // Grid responsivo personalizado
      gridTemplateColumns: {
        'responsive-1': 'repeat(1, minmax(0, 1fr))',
        'responsive-2': 'repeat(auto-fit, minmax(250px, 1fr))',
        'responsive-3': 'repeat(auto-fit, minmax(300px, 1fr))',
        'responsive-4': 'repeat(auto-fit, minmax(200px, 1fr))',
        'responsive-auto': 'repeat(auto-fit, minmax(250px, 1fr))',
      },
      // Flexbox responsivo
      flex: {
        'responsive-col': '0 1 auto',
        'responsive-row': '1 1 auto',
      },
      // Tamaños responsivos
      width: {
        'mobile': '100%',
        'tablet': 'auto',
        'desktop': 'auto',
      },
      height: {
        'mobile': 'auto',
        'tablet': 'auto',
        'desktop': 'auto',
      },
      // Padding responsivo
      padding: {
        'mobile': '0.75rem',
        'tablet': '1rem',
        'desktop': '1.5rem',
      },
      // Margin responsivo
      margin: {
        'mobile': '0.75rem',
        'tablet': '1rem',
        'desktop': '1.5rem',
      },
      // Gap responsivo
      gap: {
        'mobile': '0.75rem',
        'tablet': '1rem',
        'desktop': '1.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // Plugin personalizado para utilidades responsivas
    function({ addUtilities, theme }: any) {
      const responsiveUtilities = {
        '.mobile-only': {
          display: 'block',
          '@media (min-width: 640px)': {
            display: 'none',
          },
        },
        '.tablet-only': {
          display: 'none',
          '@media (min-width: 640px)': {
            display: 'block',
          },
          '@media (min-width: 1024px)': {
            display: 'none',
          },
        },
        '.desktop-only': {
          display: 'none',
          '@media (min-width: 1024px)': {
            display: 'block',
          },
        },
        '.hidden-mobile': {
          display: 'none',
          '@media (min-width: 640px)': {
            display: 'block',
          },
        },
        '.hidden-tablet': {
          display: 'block',
          '@media (min-width: 640px)': {
            display: 'none',
          },
          '@media (min-width: 1024px)': {
            display: 'block',
          },
        },
        '.hidden-desktop': {
          display: 'block',
          '@media (min-width: 1024px)': {
            display: 'none',
          },
        },
      };
      addUtilities(responsiveUtilities);
    },
  ],
  // Optimizaciones para producción
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;
