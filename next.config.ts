import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagens são SVGs locais ou base64 enviadas pelo admin: não há o que otimizar no servidor
  images: { unoptimized: true },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
