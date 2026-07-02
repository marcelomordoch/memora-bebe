import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply COOP/COEP only on the compor page (FFmpeg.wasm needs SharedArrayBuffer)
        source: '/compor/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy',  value: 'require-corp' },
        ],
      },
    ]
  },
};

export default nextConfig;
