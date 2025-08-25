/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Explicitly define environment variables
  // This ensures they're available both at build time and runtime
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_INTERNAL_API_URL: process.env.NEXT_INTERNAL_API_URL,
    API_KEY: process.env.API_KEY,
  },
}

module.exports = nextConfig
