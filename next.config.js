/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // serverActions: true,
  },
  images: {
    remotePatterns: [],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
