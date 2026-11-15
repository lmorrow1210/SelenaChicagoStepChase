import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SCREEN_BASE } from "../lib/brand";
import "@one-step-ahead/design-system/styles.css";
import { Providers } from "./providers";

// v3 "Midnight Dossier" type stack:
//   display / stamped labels → Barlow Condensed 700, UPPERCASE
//   narrative / intel body   → DM Sans, sentence case
//   telemetry / odometers    → DM Mono, tabular-nums
//
// Self-hosted (app/fonts/, OFL-1.1) rather than next/font/google: a build
// must not depend on reaching Google Fonts. When that fetch failed, CI either
// broke outright or silently shipped fallback fonts and missed its budgets.
const barlowCondensed = localFont({
  src: [
    { path: "./fonts/barlow-condensed-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/barlow-condensed-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});

const dmSans = localFont({
  src: [
    { path: "./fonts/dm-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/dm-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/dm-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

const dmMono = localFont({
  src: [
    { path: "./fonts/dm-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/dm-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "Menlo", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  title: "One Step Ahead — The Search for Selena Chicago",
  description: "She's always one step ahead.",
  applicationName: "One Step Ahead",
  appleWebApp: { capable: true, title: "One Step Ahead", statusBarStyle: "black-translucent" },
  openGraph: {
    title: "One Step Ahead",
    description: "The Search for Selena Chicago — she's always one step ahead.",
    siteName: "One Step Ahead",
  },
};

// Mobile browser chrome matches the CRT screen; user zoom stays enabled.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: SCREEN_BASE,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${barlowCondensed.variable} ${dmSans.variable} ${dmMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
