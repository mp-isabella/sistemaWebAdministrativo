// next.config.optimized.js
// Configuración optimizada de Next.js para máximo rendimiento

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de compilación
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
  },

  // Optimizaciones de imágenes
  images: {
    // Formatos modernos
    formats: ['image/webp', 'image/avif'],
    
    // Calidad optimizada
    quality: 85,
    
    // Tamaños de dispositivo
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Dominios permitidos
    domains: [],
    
    // Paths de imágenes
    path: '/_next/image',
    
    // Carga lazy por defecto
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Optimizaciones de webpack
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones solo para producción
    if (!dev && !isServer) {
      // Compresión de CSS
      config.optimization.minimize = true;
      
      // Tree shaking más agresivo
      config.optimization.usedExports = true;
      
      // Split chunks optimizado
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
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Compresión
  compress: true,

  // Powered by header
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,

  // SWC minify
  swcMinify: true,

  // Trailing slash
  trailingSlash: false,

  // Base path
  basePath: '',

  // Asset prefix
  assetPrefix: '',

  // Output directory
  distDir: '.next',

  // Build output
  output: 'standalone',

  // Experimental features
  experimental: {
    // App directory
    appDir: true,
    
    // Server components
    serverComponentsExternalPackages: [],
    
    // Concurrent features
    concurrentFeatures: true,
    
    // Server actions
    serverActions: true,
  },

  // TypeScript
  typescript: {
    // Ignorar errores de TypeScript durante el build
    ignoreBuildErrors: false,
  },

  // ESLint
  eslint: {
    // Ignorar errores de ESLint durante el build
    ignoreDuringBuilds: false,
  },

  // Bundle analyzer
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
  },
};

module.exports = nextConfig;
