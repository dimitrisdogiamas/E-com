/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow builds to complete even with type errors during development
    ignoreBuildErrors: false,
  },
  eslint: {
    // Allow builds to complete even with ESLint errors during development
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig 