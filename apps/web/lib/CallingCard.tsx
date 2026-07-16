"use client";

import SelenaMark from "@one-step-ahead/design-system/components/game/SelenaMark";
import { useEffect, useState } from "react";

/* §11: the Sunday "calling card" reset — when a fresh week opens, a
   red-stamped dossier announces she's gone. Shows once per week id
   (dismiss is remembered in localStorage). */

const STORAGE_PREFIX = "osa-calling-card-";

export function CallingCard({
  weekId,
  weekStartsOn,
  lastSeen,
}: {
  weekId: string;
  weekStartsOn: string;
  lastSeen: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fresh week = within ~36h of Monday 00:00. Otherwise stay quiet.
    const started = new Date(`${weekStartsOn}T00:00:00`);
    const ageMs = Date.now() - started.getTime();
    const fresh = ageMs >= 0 && ageMs < 36 * 3_600_000;
    const dismissed = typeof window !== "undefined" && localStorage.getItem(STORAGE_PREFIX + weekId);
    setVisible(fresh && !dismissed);
  }, [weekId, weekStartsOn]);

  if (!visible) return null;

  return (
    <section className="callingCard" role="status" aria-label="Selena's calling card">
      <div className="callingCardArt" aria-hidden="true">
        <SelenaMark size={56} />
      </div>
      <div className="callingCardBody">
        <p className="callingCardStamp">She&apos;s gone.</p>
        <h2>
          Last seen: {lastSeen}. Next silhouette: <span className="unknown">???</span>
        </h2>
        <p className="callingCardNote">
          The board reset at midnight. New card, new pairings — open the next file.
        </p>
      </div>
      <button
        className="callingCardDismiss"
        aria-label="File the card"
        onClick={() => {
          localStorage.setItem(STORAGE_PREFIX + weekId, "1");
          setVisible(false);
        }}
      >
        File it
      </button>
      <style jsx>{`
        .callingCard {
          position: relative;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: var(--sp-3);
          align-items: center;
          padding: var(--sp-3) var(--sp-4);
          background: var(--paper-grain) var(--tan-200);
          border-radius: var(--r-card);
          box-shadow: var(--shadow-elevated);
          overflow: hidden;
          text-shadow: none; /* paper printout does not glow */
        }
        .callingCard::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-top: 16px solid var(--case-900);
          border-left: 16px solid transparent;
        }
        .callingCardArt {
          display: grid;
          place-items: center;
          width: 68px;
          height: 68px;
          border-radius: var(--r-tight);
          background: radial-gradient(circle at 50% 35%, var(--case-700), var(--case-900) 85%);
        }
        .callingCardStamp {
          margin: 0;
          display: inline-block;
          transform: rotate(-8deg);
          transform-origin: left bottom;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--red-deep);
          border: 2px solid var(--red-deep);
          border-radius: var(--r-tight);
          padding: 1px 8px;
          animation: sc-stamp var(--dur-slow) var(--ease-spring) both;
        }
        .callingCardBody h2 {
          margin: var(--sp-2) 0 0;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 19px;
          line-height: 1.1;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: var(--case-900);
        }
        .unknown {
          color: var(--red-deep);
        }
        .callingCardNote {
          margin: var(--sp-1) 0 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--case-700);
        }
        .callingCardDismiss {
          align-self: start;
          border: 1.5px solid var(--case-700);
          background: transparent;
          border-radius: var(--r-tight);
          padding: var(--sp-1) var(--sp-2);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--case-900);
          cursor: pointer;
        }
      `}</style>
    </section>
  );
}
