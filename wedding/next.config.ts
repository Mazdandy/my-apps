import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output so the VPS systemd unit can run .next/standalone/server.js
  output: 'standalone',
};

export default nextConfig;
