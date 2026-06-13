import type { Metadata } from "next";
import { Press_Start_2P, Barlow_Condensed, VT323 } from "next/font/google";
import "@selenas-chase/design-system/styles.css";
import { Providers } from "./providers";

// v2 vintage-detective type stack:
//   display/headers/labels → Press Start 2P (pixel font, weight 400 only)
//   body/UI prose          → Barlow Condensed
//   data/numbers/scores    → VT323 (CRT monospace, weight 400 only)
const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Selena's Chase",
  description: "Catch Selena. One city a week.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${pressStart.variable} ${barlowCondensed.variable} ${vt323.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
