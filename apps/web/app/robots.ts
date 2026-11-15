import type { MetadataRoute } from "next";

// Static so it also works in the GitHub Pages export (NEXT_OUTPUT=export).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" } };
}
