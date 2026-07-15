import type { MetadataRoute } from "next";

// Installable web-app manifest. Paths are relative so the same manifest
// works at the root (Vercel) and under the GitHub Pages basePath.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "One Step Ahead — The Search for Selena Chicago",
    short_name: "One Step Ahead",
    description: "She's always one step ahead.",
    start_url: ".",
    display: "standalone",
    background_color: "#08120A",
    theme_color: "#08120A",
    icons: [
      { src: "icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
