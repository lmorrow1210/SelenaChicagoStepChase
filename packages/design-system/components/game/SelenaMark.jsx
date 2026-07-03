import * as React from 'react';

/* ============================================================
   SelenaMark — Selena Chicago's compact silhouette glyph.
   Wide-brim fedora (sky blue, red band) over a popped trench
   collar (bone "Star-Stitch" trench — four red six-point stars
   down the spine, hinted by the stitch dots). Her costume is the
   ONLY place the Chicago-flag palette appears (§11).
   Use sparingly: map pin moments, gap stat, calling card, escape.
   ============================================================ */

export function SelenaMark({ size = 32, mono = false, style }) {
  /* mono=true renders single-color (currentColor) for stamps/redactions */
  const sky = mono ? 'currentColor' : '#41B6E6';
  const band = mono ? 'currentColor' : 'var(--signal-red, #FF3B30)';
  const coat = mono ? 'currentColor' : 'var(--bone, #F3ECD9)';
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      style={style}
    >
      {/* Fedora brim — wide, tilted */}
      <ellipse cx="24" cy="17" rx="16" ry="4.5" fill={sky} />
      {/* Crown */}
      <path d="M15 16.5 Q15 7 24 7 Q33 7 33 16.5 Q28.5 18.5 24 18.5 Q19.5 18.5 15 16.5 Z" fill={sky} />
      {/* Red band */}
      <path d="M15.4 14.2 Q24 17.4 32.6 14.2 L32.9 16.2 Q24 19.2 15.1 16.2 Z" fill={band} />
      {/* Face shadow under the brim */}
      <path d="M18 21.5 Q24 24 30 21.5 L29 26 Q24 28 19 26 Z" fill="var(--ink-900, #0C0F14)" opacity="0.9" />
      {/* Popped trench collar + shoulders */}
      <path d="M10 42 Q11 30 19 27.5 L24 31 L29 27.5 Q37 30 38 42 Z" fill={coat} />
      {/* Collar notches */}
      <path d="M19 27.5 L24 31 L21 34 L17.5 29.5 Z" fill={coat} stroke="var(--ink-900, #0C0F14)" strokeWidth="0.6" />
      <path d="M29 27.5 L24 31 L27 34 L30.5 29.5 Z" fill={coat} stroke="var(--ink-900, #0C0F14)" strokeWidth="0.6" />
      {/* Star-Stitch — four red points down the spine */}
      {!mono && [34.5, 37.2, 39.9, 42.6].map((y, i) => (
        <path
          key={i}
          d={`M24 ${y - 1.4} L24.5 ${y - 0.4} L25.5 ${y} L24.5 ${y + 0.4} L24 ${y + 1.4} L23.5 ${y + 0.4} L22.5 ${y} L23.5 ${y - 0.4} Z`}
          fill={band}
        />
      ))}
    </svg>
  );
}

export default SelenaMark;
