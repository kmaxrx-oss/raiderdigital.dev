/**
 * Hostinger / Node deploy: run from repository root:
 *   npm ci && npm run build && npm run start
 * Default Next listens on PORT (Hostinger often sets this).
 *
 * Plain .mjs (not .ts) so Hostinger build hosts with older glibc can load
 * config without compiling TypeScript via native SWC.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
