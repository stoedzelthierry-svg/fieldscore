/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: [],
  },
  // No rewrites needed in production - Nginx handles /api proxy
  // For local dev, set NEXT_PUBLIC_API_URL=http://localhost:8000
};

module.exports = nextConfig;
