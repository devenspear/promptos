import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Inject version from package.json at build time
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || require('./package.json').version,
    // Vercel automatically provides these, but we expose them to client
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  },
};

export default nextConfig;
