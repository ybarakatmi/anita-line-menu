import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["www.anita-gelato.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "www.anita-gelato.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
