import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image2url.com",
        pathname: "/r2/default/images/**",
      },
    ],
  },
};

export default nextConfig;
