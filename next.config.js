/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de imágenes para carga más rápida
  images: {
    // Formatos optimizados para mejor rendimiento
    formats: ['image/webp', 'image/avif'],
    
    // Tamaños de imagen optimizados
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Configuración de dominios si usas imágenes externas
    domains: [],
    
    // Habilitar optimización de imágenes estáticas
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // Minimizar el layout shift
    minimumCacheTTL: 86400, // 24 horas
  },
  
  // Optimizaciones de rendimiento
  experimental: {
    // Optimizar la carga de imágenes
    optimizeCss: true,
    
    // Mejorar el rendimiento de las imágenes
    scrollRestoration: true,
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
};

module.exports = nextConfig;
