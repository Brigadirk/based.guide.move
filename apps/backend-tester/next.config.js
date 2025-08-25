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
    NEXT_PUBLIC_RAILWAY_PUBLIC_URL: process.env.NEXT_PUBLIC_RAILWAY_PUBLIC_URL,
    NEXT_PUBLIC_LOCAL_URL: process.env.NEXT_PUBLIC_LOCAL_URL,
    NEXT_PUBLIC_TESTING_API_KEY: process.env.NEXT_PUBLIC_TESTING_API_KEY,
  },
}

module.exports = nextConfig
