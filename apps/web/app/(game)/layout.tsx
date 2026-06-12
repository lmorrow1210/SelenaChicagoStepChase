"use client";

import Avatar from "@selenas-chase/design-system/components/game/Avatar";
import Sidebar from "@selenas-chase/design-system/components/navigation/Sidebar";
import TabBar from "@selenas-chase/design-system/components/navigation/TabBar";
import { usePathname, useRouter } from "next/navigation";

const GAME_SECTIONS = ["map", "prediction", "city", "bingo", "nemesis", "profile"] as const;

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = GAME_SECTIONS.find((section) => pathname.startsWith(`/${section}`)) ?? "map";
  const onNavigate = (id: string) => router.push(`/${id}`);

  return (
    <div className="sc-shell">
      <div className="sc-sidebarHost">
        <Sidebar active={active} onNavigate={onNavigate} avatar={<Avatar size={40} ring />} />
      </div>
      <main className="sc-main">{children}</main>
      <div className="sc-tabbarHost">
        <TabBar active={active} onNavigate={onNavigate} />
      </div>
      <style jsx>{`
        .sc-shell {
          min-height: 100dvh;
          display: flex;
          background: var(--navy);
        }
        .sc-sidebarHost {
          display: none;
          min-height: 100dvh;
          position: sticky;
          top: var(--sp-0);
        }
        .sc-main {
          flex: 1;
          min-width: var(--sp-0);
          padding-bottom: calc(var(--tabbar-height) + var(--safe-bottom));
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
