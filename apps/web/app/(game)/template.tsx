"use client";

/* Remounts on every route change: each screen settles in like a CRT
   drawing a fresh frame — a fast fade with a slight phosphor flare.
   The global prefers-reduced-motion kill rule collapses it to instant. */

export default function GameTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="sc-screenSettle">
      {children}
      <style jsx>{`
        .sc-screenSettle {
          animation: sc-settle var(--dur-base) var(--ease-out) both;
        }
        @keyframes sc-settle {
          from {
            opacity: 0.35;
            filter: brightness(1.35) saturate(1.1);
          }
          to {
            opacity: 1;
            filter: brightness(1) saturate(1);
          }
        }
      `}</style>
    </div>
  );
}
