/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración definitiva para evitar problemas de hidratación
  
  // Deshabilitar SSR problemático
  experimental: {
    // Optimizaciones de compilación
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    
    // Turbopack para desarrollo más rápido
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    
    // Configuraciones para evitar hidratación problemática
    serverComponentsExternalPackages: ['@prisma/client'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Configuración de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configuración de webpack para hidratación segura
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones solo para producción
    if (!dev && !isServer) {
      config.optimization.minimize = true;
      config.optimization.usedExports = true;
      
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
        },
      };
    }

    // Optimizaciones para todos los entornos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Optimización de SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Configuración específica para evitar problemas de hidratación
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Forzar uso de versiones del cliente para ciertos módulos
        'react-dom/server': 'react-dom/client',
      };
    }

    return config;
  },

  // Headers de seguridad y caché
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Headers específicos para evitar problemas de hidratación
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Configuración de trailing slash
  trailingSlash: false,

  // Configuración de output
  output: 'standalone',

  // Configuración de distDir
  distDir: '.next',

  // Configuración de env
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    // Variables específicas para hidratación
    NEXT_PUBLIC_SUPPRESS_HYDRATION_WARNING: 'true',
  },

  // Configuración de serverRuntimeConfig
  serverRuntimeConfig: {
    mySecret: process.env.MY_SECRET,
  },

  // Configuración de publicRuntimeConfig
  publicRuntimeConfig: {
    staticFolder: '/static',
    // Configuración para hidratación
    suppressHydrationWarning: true,
  },

  // Configuración específica para desarrollo
  ...(process.env.NODE_ENV === 'development' && {
    // En desarrollo, forzar renderizado del lado del cliente
    experimental: {
      ...nextConfig.experimental,
      // Deshabilitar SSR problemático en desarrollo
      serverComponents: false,
    },
  }),
};

module.exports = nextConfig;
