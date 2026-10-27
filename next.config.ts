import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite builds separados (ex.: várias sessões testando ao mesmo tempo): NEXT_DIST_DIR=.next-outro
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Fotos reais em public/img: o next/image gera versões menores para cards e home (sizes).
  // Imagens base64 enviadas pelo admin (data:) passam sem otimizar.
  images: { formats: ["image/webp"] },
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
