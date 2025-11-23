import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-0dfa82468e274a9cb1498740d1ce6c91.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
