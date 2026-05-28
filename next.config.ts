import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Shopify CDN images on <Image> components.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "shopify.com" },
    ],
  },
};

export default nextConfig;
