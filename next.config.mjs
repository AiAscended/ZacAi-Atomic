/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // For server-side (API routes), allow Node.js modules
    if (isServer) {
      config.externals = config.externals || [];
      // Mark Node.js built-in modules as external (don't bundle them)
      config.externals.push({
        'fs': 'commonjs fs',
        'path': 'commonjs path',
        'crypto': 'commonjs crypto',
        'stream': 'commonjs stream',
        'util': 'commonjs util',
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
      };
    }
    return config;
  },
}

export default nextConfig
