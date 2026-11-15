"use client";

import { useEffect, useState } from "react";

/* §11: the Sunday countdown surfaces on every screen — she vanishes when
   the board resets Sunday 11:59 PM local. Pure client-side clock. */

function nextSundayEnd(): Date {
  const now = new Date();
  const d = new Date(now);
  const daysToSunday = (7 - d.getDay()) % 7; // 0 if today is Sunday
  d.setDate(d.getDate() + daysToSunday);
  d.setHours(23, 59, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 7);
  return d;
}

/** Under a day the readout adds minutes and pulses; under an hour it is minutes only. */
export function formatCountdown(ms: number): { text: string; urgent: boolean } {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  if (days > 0) return { text: `${days}d ${hours}h`, urgent: false };
  if (totalHours > 0) return { text: `${hours}h ${String(minutes).padStart(2, "0")}m`, urgent: true };
  return { text: `${minutes}m`, urgent: true };
}

function label(): { text: string; urgent: boolean } {
  return formatCountdown(nextSundayEnd().getTime() - Date.now());
}

export function SundayCountdown({ style }: { style?: React.CSSProperties }) {
  const [state, setState] = useState<{ text: string; urgent: boolean } | null>(null);

  useEffect(() => {
    setState(label()); // client-only to avoid hydration drift
    const t = setInterval(() => setState(label()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!state) return null;
  const { text, urgent } = state;

  return (
    <span
      title="The board resets Sunday 11:59 PM — then she's gone."
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 6,
        fontFamily: "var(--font-mono)",
        fontVariantNumeric: "tabular-nums",
        fontSize: "var(--fs-caption)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        /* §6: vanish timer reads in signal-red urgency on a screen face */
        color: "var(--signal-red)",
        background: "var(--screen-700)",
        borderRadius: "var(--r-tight)",
        boxShadow: "var(--screen-inset-shadow)",
        padding: "var(--sp-1) var(--sp-2)",
        whiteSpace: "nowrap",
        // Final day: the timer breathes (red is Selena/threat/urgency only).
        animation: urgent ? "sc-pulse-selena 2.4s var(--ease-in-out) infinite" : undefined,
        ...style,
      }}
    >
      <span style={{ color: "var(--phosphor-dim)" }}>She vanishes in</span>
      {text}
    </span>
  );
}
