/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Explicitly define public environment variables
  // This ensures they're available both at build time and runtime
  env: {
    NEXT_PUBLIC_RAILWAY_INTERNAL_URL: process.env.NEXT_PUBLIC_RAILWAY_INTERNAL_URL,
    NEXT_PUBLIC_RAILWAY_PUBLIC_URL: process.env.NEXT_PUBLIC_RAILWAY_PUBLIC_URL,
    NEXT_PUBLIC_LOCAL_URL: process.env.NEXT_PUBLIC_LOCAL_URL,
  },
}

module.exports = nextConfig
