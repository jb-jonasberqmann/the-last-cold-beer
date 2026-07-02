/** @type {import('next').NextConfig} */
// NOTE: Next 14 only reads next.config.js — next.config.ts is ignored.
const nextConfig = {
  eslint: {
    // ESLint checked separately — don't block Vercel builds
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      // Ritual photos are sent as base64 data-URLs (~200-500 KB);
      // the default 1 MB limit is too tight once JSON overhead is added.
      bodySizeLimit: "3mb",
    },
  },
};

module.exports = nextConfig;
