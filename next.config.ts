import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Needed for Vercel deployment
  output: "standalone",
  
  // Disable strict mode linting during build (optional, prevents build failures from warnings)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Images
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
