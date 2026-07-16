"use client";

import Avatar from "@one-step-ahead/design-system/components/game/Avatar";
import Sidebar from "@one-step-ahead/design-system/components/navigation/Sidebar";
import TabBar from "@one-step-ahead/design-system/components/navigation/TabBar";
import { usePathname, useRouter } from "next/navigation";
import { CaseStatusStrip } from "../../lib/CaseStatusStrip";

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
      {/* Desktop chassis: a fixed tan bezel frame the screen scrolls under,
          plus an engraved model line on the case lip. Pure fiction, no hit area. */}
      <div className="sc-caseFrame" aria-hidden="true" />
      <span className="sc-caseEngraving" aria-hidden="true">
        ONE STEP AHEAD · MODEL OSA/86 · LOOP BUREAU FIELD EQUIPMENT
      </span>
      {/* Live readout on the left of the same lip: operative / week / signal */}
      <CaseStatusStrip />
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
          /* Phosphor ambience — the tube is warmer at center-top, never flat */
          background:
            radial-gradient(120% 80% at 50% 0%, rgba(var(--phosphor-glow), 0.045), transparent 62%),
            var(--screen-base);
        }
        .sc-caseFrame,
        .sc-caseEngraving {
          display: none;
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
            /* clear the fixed bezel frame so nothing hides under the lip */
            padding-top: 10px;
            padding-right: 12px;
          }
          /* The screen sits recessed INTO the molded tan case: a fixed bezel
             frame the content scrolls under (a monitor's bezel doesn't
             scroll), with a case-shadow groove and deep inner lip shadow.
             The sidebar chassis is the fourth side. */
          .sc-caseFrame {
            display: block;
            position: fixed;
            inset: 0;
            left: var(--sidebar-collapsed);
            pointer-events: none;
            z-index: 50; /* over content, under nav chrome + toasts */
            border-top: 10px solid var(--tan-300);
            border-right: 12px solid var(--tan-400);
            border-bottom: 24px solid var(--tan-500);
            border-left: 0;
            box-shadow:
              inset 0 0 0 1px var(--case-shadow),
              inset 0 2px 14px rgba(0, 0, 0, 0.6);
          }
          .sc-caseEngraving {
            display: block;
            position: fixed;
            right: 20px;
            bottom: 7px;
            z-index: 51;
            font-family: var(--font-mono);
            font-size: 8px;
            letter-spacing: 0.22em;
            white-space: nowrap;
            /* letterpress into the plastic */
            color: var(--case-700);
            text-shadow: 0 1px 0 rgba(241, 231, 204, 0.45);
          }
        }
      `}</style>
    </div>
  );
}
