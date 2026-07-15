import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Mono, DM_Sans } from "next/font/google";
import "@one-step-ahead/design-system/styles.css";
import { Providers } from "./providers";

// v3 "Midnight Dossier" type stack:
//   display / stamped labels → Barlow Condensed 700, UPPERCASE
//   narrative / intel body   → DM Sans, sentence case
//   telemetry / odometers    → DM Mono, tabular-nums
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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
  themeColor: "#08120A",
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
