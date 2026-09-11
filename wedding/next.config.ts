import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  // Standalone output for the VPS systemd unit; server.js lands at
  // .next/standalone/wedding/server.js under the monorepo tracing root.
  output: 'standalone',
  // npm workspaces hoists node_modules to the monorepo root.
  turbopack: {
    root: path.join(__dirname, '..'),
  },
};

export default nextConfig;
