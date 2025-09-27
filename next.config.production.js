/** @type {import('next').NextConfig} */
const nextConfig = {
    // Optimizations for production
    experimental: {
        optimizeCss: true,
        scrollRestoration: true,
    },

    // Disable telemetry
    telemetry: false,

    // Optimize images
    images: {
        domains: ['res.cloudinary.com'],
        formats: ['image/webp', 'image/avif'],
    },

    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Output configuration
    output: 'standalone',

    // Environment variables
    env: {
        NODE_OPTIONS: '--max-old-space-size=4096',
        NEXT_TELEMETRY_DISABLED: '1',
    },

    // Webpack optimizations
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }

        return config;
    },

    // Headers for security
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
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
        ];
    },

    // Redirects
    async redirects() {
        return [
            {
                source: '/admin',
                destination: '/dashboard/admin',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
