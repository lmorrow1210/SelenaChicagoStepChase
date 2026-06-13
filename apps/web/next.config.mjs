/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  transpilePackages: ["@selenas-chase/shared", "@selenas-chase/design-system"],
  // Static export for the GitHub Pages demo (NEXT_OUTPUT=export). The normal
  // server build (CI, Vercel) leaves output undefined so nothing else changes.
  output: process.env.NEXT_OUTPUT === "export" ? "export" : undefined,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
