/** @type {import('next').NextConfig} */
let withBundleAnalyzer
try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  })
} catch (error) {
  // Bundle analyzer not installed, use identity function
  withBundleAnalyzer = (config) => config
}

const nextConfig = {
  // Experimental features
  experimental: {
    // Enable optimized package imports for better performance
    optimizePackageImports: ['lucide-react', '@radix-ui/react-accordion'],
  },
  
  // Build optimization
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    domains: [],
    // Enable modern image formats
    formats: ['image/webp', 'image/avif'],
  },
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Output configuration to prevent manifest issues
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Build configuration
  generateBuildId: async () => {
    // Generate a unique build ID to prevent caching issues
    return `build-${Date.now()}`
  },
  
  // TypeScript strict mode
  typescript: {
    // Enable strict type checking during build
    ignoreBuildErrors: false,
  },
  
  // ESLint
  eslint: {
    // Temporarily ignore ESLint during builds
    ignoreDuringBuilds: true,
  },
  
  // Webpack configuration to handle module resolution
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Prevent build cache issues
    if (!dev) {
      config.cache = false
    }
    
    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)
