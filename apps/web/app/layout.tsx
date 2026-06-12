import type { Metadata } from "next";
import "@selenas-chase/design-system/styles.css";
import { Providers } from "./providers";

// TODO(M0 checklist): move fonts to next/font/google (Barlow Condensed 700,
// DM Sans 400/500, DM Mono) and drop the @import in styles.css to avoid
// double-loading — see docs/implementation-plan.md §7.

export const metadata: Metadata = {
  title: "Selena's Chase",
  description: "Catch Selena. One city a week.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
