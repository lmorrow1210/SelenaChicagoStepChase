/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  transpilePackages: ["@one-step-ahead/shared", "@one-step-ahead/design-system"],
  // Static export for the GitHub Pages demo (NEXT_OUTPUT=export). The normal
  // server build (CI, Vercel) leaves output undefined so nothing else changes.
  output: process.env.NEXT_OUTPUT === "export" ? "export" : undefined,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  webpack(config) {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
