import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Cloudflare Pages workers have a strict 3MiB size limit on the Free tier.
    // We aggressively exclude Node-only dependencies that NextAuth or Prisma 
    // might accidentally bundle into the edge runtime to keep size down.
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "fs": false,
        "net": false,
        "tls": false,
        "crypto": false,
        "zlib": false,
        "stream": false,
        "http": false,
        "https": false,
        "url": false,
        "util": false,
        "child_process": false,
        "os": false,
        "path": false,
      }
    }
    return config;
  },
  turbopack: {},
};

export default nextConfig;
