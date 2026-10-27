import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite builds separados (ex.: várias sessões testando ao mesmo tempo): NEXT_DIST_DIR=.next-outro
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
