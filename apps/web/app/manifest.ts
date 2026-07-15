import type { MetadataRoute } from "next";
import { SCREEN_BASE } from "../lib/brand";

// Installable web-app manifest. Paths are relative so the same manifest
// works at the root (Vercel) and under the GitHub Pages basePath.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "One Step Ahead — The Search for Selena Chicago",
    short_name: "One Step Ahead",
    description: "She's always one step ahead.",
    start_url: ".",
    display: "standalone",
    background_color: SCREEN_BASE,
    theme_color: SCREEN_BASE,
    icons: [
      { src: "icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
