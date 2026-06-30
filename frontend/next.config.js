/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: [],
  },
  // API proxying handled by middleware.ts
};

module.exports = nextConfig;
