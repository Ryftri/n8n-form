import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Set batas body jadi 10MB
    },
  },
};

export default nextConfig;
