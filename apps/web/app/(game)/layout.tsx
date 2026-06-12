"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Placeholder AppShell. TODO(M0): replace nav markup with the design-system
// Sidebar/TabBar components once they're ported from SelenaDesign/_ds_bundle.js
// to ESM (plan §7). The ≥1024px sidebar ⇄ <1024px tab-bar swap is CSS-driven
// via the .sc-sidebar / .sc-tabbar media queries below tokens.

const NAV = [
  { href: "/map", label: "Map" },
  { href: "/prediction", label: "Prediction" },
  { href: "/city", label: "City" },
  { href: "/bingo", label: "Bingo" },
  { href: "/nemesis", label: "Nemesis" },
  { href: "/profile", label: "Profile" },
] as const;

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const nav = (
    <>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname.startsWith(item.href) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
  return (
    <div className="sc-shell">
      <nav className="sc-sidebar" aria-label="Primary">
        {nav}
      </nav>
      <main className="sc-main">{children}</main>
      <nav className="sc-tabbar" aria-label="Primary">
        {nav}
      </nav>
      <style jsx>{`
        .sc-shell {
          min-height: 100dvh;
          display: flex;
        }
        .sc-sidebar {
          display: none;
        }
        .sc-main {
          flex: 1;
          padding-bottom: 72px;
        }
        .sc-tabbar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-around;
          padding: var(--space-2, 8px) 0 env(safe-area-inset-bottom);
          border-top: 1px solid var(--hairline, rgba(0, 0, 0, 0.1));
          background: var(--color-surface, #fff);
        }
        .sc-tabbar :global(a) {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .sc-sidebar {
            display: flex;
            flex-direction: column;
            gap: var(--space-3, 12px);
            width: 220px;
            padding: var(--space-4, 16px);
            border-right: 1px solid var(--hairline, rgba(0, 0, 0, 0.1));
          }
          .sc-tabbar {
            display: none;
          }
          .sc-main {
            padding-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
}
