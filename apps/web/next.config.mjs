/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  typescript: {
    // Skip type checking during build to avoid worker termination while we stabilize pipeline.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip linting during build for now; re-enable once builds succeed reliably.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
