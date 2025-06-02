/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow builds to complete even with type errors during development
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow builds to complete even with ESLint errors during development
    ignoreDuringBuilds: true,
  },
  // Enable strict mode for React
  reactStrictMode: true,
}

module.exports = nextConfig 