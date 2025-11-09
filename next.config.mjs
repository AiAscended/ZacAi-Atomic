/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-grade: Enable strict mode for better error detection
  reactStrictMode: true,
  
  // Docker standalone output for containerized deployment
  output: 'standalone',
  
  // Keep TypeScript and ESLint checks enabled for production quality
  eslint: {
    // Run ESLint on src directory
    dirs: ['src'],
  },
  typescript: {
    // Enable TypeScript checking in production
    ignoreBuildErrors: false,
  },
  
  // Image optimization
  images: {
    // Enable optimization for production
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Resolve TypeScript path aliases in webpack
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '/workspaces/ZacAi-Atomic/src',
      '@/components': '/workspaces/ZacAi-Atomic/src/components',
      '@/ui': '/workspaces/ZacAi-Atomic/src/components/ui',
      '@/lib': '/workspaces/ZacAi-Atomic/src/lib',
      '@/utils': '/workspaces/ZacAi-Atomic/src/utils',
      '@/hooks': '/workspaces/ZacAi-Atomic/src/hooks',
      '@/styles': '/workspaces/ZacAi-Atomic/src/styles',
      '@/ai': '/workspaces/ZacAi-Atomic/src/ai',
      '@/app': '/workspaces/ZacAi-Atomic/src/app',
    };
    
    // For server-side (API routes), handle Node.js modules properly
    if (isServer) {
      config.externals = config.externals || [];
      // Mark Node.js built-in modules as external (don't bundle them)
      config.externals.push({
        'fs': 'commonjs fs',
        'path': 'commonjs path',
        'crypto': 'commonjs crypto',
        'stream': 'commonjs stream',
        'util': 'commonjs util',
        'child_process': 'commonjs child_process',
        'worker_threads': 'commonjs worker_threads',
      });
    } else {
      // For client-side, provide empty mocks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        child_process: false,
        worker_threads: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    
    return config;
  },
  
  // Output configuration
  output: 'standalone', // For Docker/containerized deployments
  
  // Performance optimization
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
