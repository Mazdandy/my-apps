import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  // Standalone output for the VPS systemd unit. With outputFileTracingRoot set to
  // the monorepo root, server.js lands at .next/standalone/cv-reviewer/server.js;
  // deploy/install-services.sh locates it instead of assuming a fixed path.
  output: "standalone",
  // Must point at the monorepo root: Next.js uses this as the filesystem root for
  // module resolution, and npm workspaces hoists node_modules up there. Pointing it
  // at this folder leaves `next` unresolvable and the build fails.
  outputFileTracingRoot: path.join(__dirname, '..'),
  // Same reason — keep Turbopack's workspace root at the monorepo root.
  turbopack: {
    root: path.join(__dirname, '..'),
  },
};

export default nextConfig;
