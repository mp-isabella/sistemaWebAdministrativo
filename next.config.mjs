/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // ✅ Modo para serverless en Netlify
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
