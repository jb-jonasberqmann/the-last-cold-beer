import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint checked separately — don't block Vercel builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
