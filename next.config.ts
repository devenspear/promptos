import type { NextConfig } from "next";

const isTauriBuild = process.env.TAURI_BUILD === 'true';

const nextConfig: NextConfig = {
  // Static export for Tauri builds
  ...(isTauriBuild && {
    output: 'export',
    distDir: 'out',
    images: {
      unoptimized: true,
    },
    // Skip TypeScript errors for Tauri build (API routes not needed)
    typescript: {
      ignoreBuildErrors: true,
    },
  }),
  env: {
    // Inject version from package.json at build time
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || require('./package.json').version,
    // Vercel automatically provides these, but we expose them to client
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    // Flag to indicate Tauri build
    NEXT_PUBLIC_IS_TAURI: isTauriBuild ? 'true' : 'false',
  },
};

export default nextConfig;
