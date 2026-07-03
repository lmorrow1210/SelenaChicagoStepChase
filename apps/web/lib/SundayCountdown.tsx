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

function label(): string {
  const ms = nextSundayEnd().getTime() - Date.now();
  const totalHours = Math.max(0, Math.floor(ms / 3_600_000));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

export function SundayCountdown({ style }: { style?: React.CSSProperties }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(label()); // client-only to avoid hydration drift
    const t = setInterval(() => setText(label()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!text) return null;

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
        color: "var(--amber)",
        background: "var(--ink-800)",
        borderRadius: "var(--r-tight)",
        boxShadow: "var(--screen-inset-shadow)",
        padding: "var(--sp-1) var(--sp-2)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span style={{ color: "var(--bone-dim)" }}>She vanishes in</span>
      {text}
    </span>
  );
}
