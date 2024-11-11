/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the static export
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;