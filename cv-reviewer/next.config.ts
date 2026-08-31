import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  // Standalone output so the VPS systemd unit can run .next/standalone/server.js
  output: "standalone",
  // The repo lives under ~/Documents/Project, which itself contains package
  // manifests — without this, Next.js traces from the wrong root and nests
  // the whole working directory inside .next/standalone.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
