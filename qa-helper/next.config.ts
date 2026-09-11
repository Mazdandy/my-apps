import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  // npm workspaces hoists node_modules to the monorepo root.
  turbopack: {
    root: path.join(__dirname, '..'),
  },
};

export default nextConfig;
