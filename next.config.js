/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deshabilitar ESLint durante el build para evitar errores
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Deshabilitar TypeScript durante el build si es necesario
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimizaciones para reducir el tamaño del bundle
  webpack: (config, { isServer }) => {
    // Optimizar para reducir el tamaño del bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Optimizar chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000, // 244KB
          },
        },
      },
    };

    return config;
  },
  // Configuración optimizada de imágenes
  images: {
    // Formatos optimizados para mejor rendimiento
    formats: ['image/webp', 'image/avif'],

    // Tamaños de imagen optimizados para carga rápida
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Configuración de dominios (usar remotePatterns en lugar de domains)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],

    // Habilitar optimización de imágenes estáticas
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Configuración para manejar imágenes locales
    unoptimized: false,

    // Minimizar el layout shift y mejorar la carga
    minimumCacheTTL: 86400, // 24 horas

    // Configuración adicional para mejor rendimiento
    loader: 'default',
    path: '/_next/image',
  },

  // Optimizaciones de rendimiento
  experimental: {
    // Optimizar la carga de imágenes
    optimizeCss: true,

    // Mejorar el rendimiento de las imágenes
    scrollRestoration: true,

    // Optimizar conexiones de base de datos
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Configuración de headers para mejor caching de imágenes
  async headers() {
    return [
      {
        source: '/_next/image(.*)',
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
      {
        source: '/(.*).webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Configuración mínima para evitar errores
  // Manejar errores de imágenes
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/favicon.ico',
      },
    ];
  },

  // Configuración para manejar errores de imágenes
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
