/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/data/images/**',
      },
    ],
    unoptimized: true
  },
}

module.exports = nextConfig 