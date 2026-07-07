import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // COOP/COEP removed: FFmpeg uses @ffmpeg/core UMD (non-threaded) which does NOT
  // need SharedArrayBuffer, so these headers are unnecessary and were blocking
  // the cross-origin PUT to Cloudflare R2.
};

export default nextConfig;
