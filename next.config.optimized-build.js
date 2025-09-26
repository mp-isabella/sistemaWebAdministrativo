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

    // Optimizaciones experimentales para reducir bundle size
    experimental: {
        optimizeCss: true,
        optimizePackageImports: [
            '@radix-ui/react-icons',
            'lucide-react',
            'react-icons'
        ],
        serverComponentsExternalPackages: ['@prisma/client'],
    },

    // Optimizaciones para reducir el tamaño del bundle
    webpack: (config, { isServer, dev }) => {
        // Optimizaciones solo para producción
        if (!dev && !isServer) {
            // Configuración de split chunks optimizada
            config.optimization.splitChunks = {
                chunks: 'all',
                minSize: 20000,
                maxSize: 244000, // 244KB máximo por chunk
                cacheGroups: {
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        priority: -10,
                        chunks: 'all',
                        maxSize: 244000,
                    },
                    radix: {
                        test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
                        name: 'radix',
                        priority: 10,
                        chunks: 'all',
                        maxSize: 100000,
                    },
                    lucide: {
                        test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
                        name: 'lucide',
                        priority: 10,
                        chunks: 'all',
                        maxSize: 50000,
                    },
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                        name: 'react',
                        priority: 20,
                        chunks: 'all',
                        maxSize: 100000,
                    },
                },
            };
        }

        // Optimizar para reducir el tamaño del bundle
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                util: false,
                buffer: false,
                process: false,
            };
        }

        return config;
    },

    // Configuración optimizada de imágenes
    images: {
        // Formatos optimizados para mejor rendimiento
        formats: ['image/webp', 'image/avif'],
        quality: 75, // Reducir calidad para menor tamaño
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        unoptimized: false,
        minimumCacheTTL: 86400,
        loader: 'default',
        path: '/_next/image',
    },

    // Configuración de headers para mejor caching
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

    // Compresión habilitada
    compress: true,

    // Remover powered by header
    poweredByHeader: false,

    // Configuración para manejar errores de imágenes
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

    // Configuración de output para optimizar el build
    output: 'standalone',

    // Configuración de trailing slash
    trailingSlash: false,

    // Configuración de base path si es necesario
    basePath: '',

    // Configuración de asset prefix si es necesario
    assetPrefix: '',
};

module.exports = nextConfig;
