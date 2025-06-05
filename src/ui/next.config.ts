import type { NextConfig } from "next"; // Ensure 'next' is installed

const nextConfig: NextConfig = {
  reactComponentAnnotation: {
    enabled: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
