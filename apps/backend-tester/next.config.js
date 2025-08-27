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
    NEXT_PUBLIC_LOCAL_URL: process.env.NEXT_PUBLIC_LOCAL_URL,
    NEXT_PUBLIC_STAGING_API_URL: process.env.NEXT_PUBLIC_STAGING_API_URL,
    NEXT_PUBLIC_PRODUCTION_API_URL: process.env.NEXT_PUBLIC_PRODUCTION_API_URL,
    // Do not expose secrets in the browser
  },
}

module.exports = nextConfig
