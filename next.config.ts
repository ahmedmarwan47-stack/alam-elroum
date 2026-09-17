import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages. The site is served under the repository
 * name, so the CI build sets NEXT_PUBLIC_BASE_PATH="/alam-elroum"; local
 * dev keeps the root. Raw asset URLs go through `asset()` in lib/asset.ts.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: {
    // GitHub Pages has no image optimiser; ship the source files as-is,
    // under the base path.
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
  },
};

export default nextConfig;
