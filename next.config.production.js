/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configuración para producción en Vercel
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    // Evitar consultas a BD durante build
    experimental: {
        serverComponentsExternalPackages: ['@prisma/client'],
    },

    // Configuración de imágenes
    images: {
        domains: ['localhost', 'vercel.app'],
        unoptimized: true,
    },

    // Optimizaciones de webpack
    webpack: (config, { isServer, dev }) => {
        // Evitar problemas con Prisma durante build
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                url: false,
                zlib: false,
                http: false,
                https: false,
                assert: false,
                os: false,
                path: false,
            };
        }

        // Optimizaciones para producción
        if (!dev && !isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
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
                    },
                },
            };
        }

        return config;
    },

    // Configuración de salida
    output: 'standalone',

    // Variables de entorno
    env: {
        SKIP_ENV_VALIDATION: 'true',
    },

    // Configuración de headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;