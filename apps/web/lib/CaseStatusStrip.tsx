"use client";

import { useSession } from "./session";

/* Live status strip on the bottom case lip (design cut-list, July 2026).
   Chassis fiction like the engraved model line, but LIVE: operative name,
   active week, signal state from the last tracker sync. Desktop only (the
   lip doesn't exist on mobile) and aria-hidden — every fact shown here is
   announced properly inside the screen UI (profile, lastSyncedAt pill). */

function two(n: number) {
  return String(n).padStart(2, "0");
}

export function CaseStatusStrip() {
  const { user, activeWeek } = useSession();
  if (!user) return null;

  const operative = (user.display_name || "UNASSIGNED").toUpperCase();

  const startsOn = typeof activeWeek?.starts_on === "string" ? activeWeek.starts_on : null;
  const week = startsOn ? `WK OF ${startsOn.slice(5, 7)}.${startsOn.slice(8, 10)}` : "WK --.--";

  let signal = "SEARCHING";
  let lit = false;
  if (user.last_synced_at) {
    const d = new Date(user.last_synced_at);
    signal = `LOCK ${two(d.getHours())}:${two(d.getMinutes())}`;
    lit = true;
  } else if (!user.fitbit_connected) {
    signal = "NO CARRIER";
  }

  return (
    <span className="sc-caseStatus" aria-hidden="true">
      <span className="sig" data-lit={lit ? "true" : "false"} />
      {`OPERATIVE: ${operative} · ${week} · SIGNAL: ${signal}`}
      <style jsx>{`
        .sc-caseStatus {
          display: none;
        }
        @media (min-width: 1024px) {
          .sc-caseStatus {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            position: fixed;
            left: calc(var(--sidebar-collapsed) + 20px);
            bottom: 7px;
            z-index: 51; /* on the lip, over the bezel frame */
            font-family: var(--font-mono);
            font-size: 8px;
            letter-spacing: 0.22em;
            white-space: nowrap;
            /* letterpress into the plastic, matching the model engraving */
            color: var(--case-700);
            text-shadow: 0 1px 0 rgba(241, 231, 204, 0.45);
          }
          .sig {
            width: 5px;
            height: 5px;
            flex: none;
            background: var(--case-600);
            box-shadow: inset 0 1px 1px rgba(28, 20, 11, 0.6);
          }
          .sig[data-lit="true"] {
            background: var(--phosphor-dim);
            box-shadow: 0 0 5px rgba(var(--phosphor-glow), 0.55);
            animation: sc-pulse-amber 2.4s var(--ease-in-out) infinite;
          }
        }
      `}</style>
    </span>
  );
}
