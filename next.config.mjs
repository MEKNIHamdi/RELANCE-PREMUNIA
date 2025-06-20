/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimisations de build
  experimental: {
    optimizePackageImports: ['lucide-react', '@vercel/blob'],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Réduire la taille du bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimiser les images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    unoptimized: true,
  },
  
  // Réduire les chunks
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    
    // Optimiser les chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    }
    
    return config
  },
}

export default nextConfig
