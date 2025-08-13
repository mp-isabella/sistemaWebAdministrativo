/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👇 Agrega esta línea para generar una exportación estática
  output: 'export', 
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