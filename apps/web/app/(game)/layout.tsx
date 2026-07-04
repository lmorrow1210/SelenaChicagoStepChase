"use client";

import Avatar from "@one-step-ahead/design-system/components/game/Avatar";
import Sidebar from "@one-step-ahead/design-system/components/navigation/Sidebar";
import TabBar from "@one-step-ahead/design-system/components/navigation/TabBar";
import { usePathname, useRouter } from "next/navigation";

const GAME_SECTIONS = ["map", "fieldops", "prediction", "nemesis", "profile"] as const;

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const active =
    pathname.startsWith("/dossier")
      ? "fieldops"
      : GAME_SECTIONS.find((section) => pathname.startsWith(`/${section}`)) ?? "map";
  const onNavigate = (id: string) => router.push(`/${id}`);

  return (
    <div className="sc-shell">
      <div className="sc-sidebarHost">
        <Sidebar active={active} onNavigate={onNavigate} avatar={<Avatar size={40} ring />} />
      </div>
      <main className="sc-main">
        {children}
        {/* Faint CRT scanlines + vignette over the screen area only (not the
            tan chrome). ≤6% so telemetry stays legible; off for reduced-motion
            and high-contrast users. */}
        <div className="sc-screenFx" aria-hidden="true" />
      </main>
      <div className="sc-tabbarHost">
        <TabBar active={active} onNavigate={onNavigate} />
      </div>
      <style jsx>{`
        .sc-shell {
          min-height: 100dvh;
          display: flex;
          background: var(--screen-base);
        }
        .sc-sidebarHost {
          display: none;
          min-height: 100dvh;
          position: sticky;
          top: var(--sp-0);
        }
        .sc-main {
          position: relative;
          flex: 1;
          min-width: var(--sp-0);
          padding-bottom: calc(var(--tabbar-height) + var(--safe-bottom));
        }
        .sc-screenFx {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background-image:
            repeating-linear-gradient(
              to bottom,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.06) 2px,
              rgba(0, 0, 0, 0.06) 3px
            ),
            radial-gradient(ellipse at 50% 42%, transparent 62%, rgba(0, 0, 0, 0.32) 100%);
        }
        @media (prefers-reduced-motion: reduce), (prefers-contrast: more) {
          .sc-screenFx {
            display: none;
          }
        }
        .sc-tabbarHost {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: var(--z-nav);
        }
        @media (min-width: 1024px) {
          .sc-sidebarHost {
            display: block;
          }
          .sc-tabbarHost {
            display: none;
          }
          .sc-main {
            padding-bottom: var(--sp-0);
          }
        }
      `}</style>
    </div>
  );
}
