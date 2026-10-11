import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep resolution and deployment tracing inside the website application.
  outputFileTracingRoot: __dirname,
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
