import type { NextConfig } from "next";

/**
 * Hostinger / Node deploy: run from repository root:
 *   npm ci && npm run build && npm run start
 * Default Next listens on PORT (Hostinger often sets this).
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
