import * as React from 'react';

/* ============================================================
   Icon — Selena's Chase icon set.
   24px grid, 2px stroke, rounded caps/joins, consistent weight.
   Color inherits from `currentColor` (set color via CSS).
   ============================================================ */

const P = {
  /* ---- Nav ---- */
  map: (
    <>
      <path d="M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5L9 4Z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </>
  ),
  prediction: (
    <>
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.85 1 .95 1.65l.15 1.05h5l.15-1.05c.1-.66.45-1.26.95-1.66A6 6 0 0 0 12 3Z" />
      <path d="M9.5 20.5h5M10.5 22.5h3" />
    </>
  ),
  city: (
    <>
      <path d="M4 21V9l5-2v14M14 21V4l5 2v15M4 21h17" />
      <path d="M7 11v0M7 14v0M7 17v0M16 9v0M16 12v0M16 15v0" />
    </>
  ),
  bingo: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M9 3.5v17M15 3.5v17M3.5 9h17M3.5 15h17" />
    </>
  ),
  nemesis: (
    <>
      <path d="M6 20V11l3-1.5M18 20V11l-3-1.5" />
      <path d="M9 9.5 12 4l3 5.5M6 20h12" />
      <path d="M9.5 14h0M14.5 14h0M9.5 17h0M14.5 17h0" />
    </>
  ),

  /* ---- Stats / utility ---- */
  step: (
    <>
      <path d="M8 4c-1.5 1-2 3-1.5 5.5C7 12 8.5 13 9 15c.3 1.2 0 2.5-1 3.2-1.3.9-3 .2-3.2-1.3" />
      <path d="M16 6c1.5 1 2 3 1.5 5.5C17 14 15.5 15 15 17c-.3 1.2 0 2.5 1 3.2" />
    </>
  ),
  workout: (
    <>
      <path d="M5 9v6M19 9v6M3 11v2M21 11v2M5 12h14" />
      <rect x="5" y="8.5" width="3" height="7" rx="1" />
      <rect x="16" y="8.5" width="3" height="7" rx="1" />
    </>
  ),
  sleep: (
    <>
      <path d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z" />
      <path d="M15 4h3.5L15 7.5H18.5" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20S4 14.5 4 9.2A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 8 2.2C20 14.5 12 20 12 20Z" />
      <path d="M7.5 11h2l1-1.8 1.5 3 1-1.2h3.5" />
    </>
  ),
  badge: (
    <>
      <circle cx="12" cy="10" r="6" />
      <path d="m12 7 1.1 2.2 2.4.35-1.75 1.7.4 2.4L12 12.5l-2.15 1.15.4-2.4L8.5 9.55l2.4-.35L12 7Z" />
      <path d="m9 15-1 6 4-2 4 2-1-6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6" />
    </>
  ),
  sync: (
    <>
      <path d="M20 8a8 8 0 0 0-14.3-2M4 6v3.5h3.5" />
      <path d="M4 16a8 8 0 0 0 14.3 2M20 18v-3.5h-3.5" />
    </>
  ),
  crown: (
    <>
      <path d="M4 8l3.5 3 4.5-6 4.5 6L20 8l-1.5 9h-13L4 8Z" />
      <path d="M5.5 20h13" />
    </>
  ),
  star: (
    <path d="m12 4 2.35 4.76 5.25.76-3.8 3.7.9 5.24L12 16.7l-4.7 2.47.9-5.24-3.8-3.7 5.25-.76L12 4Z" />
  ),

  /* ---- Misc UI ---- */
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  flame: (
    <path d="M12 3c.5 3-1.5 4-2.5 5.5C8 10.5 7 12 7 14a5 5 0 0 0 10 0c0-2.5-1.5-4-2.5-5.5C14 9.5 13 10 12.5 9c-.6-1.2.3-2.5-.5-6Z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.3 2.5 14.7 0 17M12 3.5c-2.5 2.3-2.5 14.7 0 17" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5a2.5 2.5 0 0 0 3 2.4M17 6h2.5a2.5 2.5 0 0 1-3 2.4M10 13.5h4l.5 3.5h-5l.5-3.5ZM8.5 20h7" />
    </>
  ),
};

export function Icon({ name, size = 24, strokeWidth = 2, color, style, ...rest }) {
  const body = P[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={rest['aria-label'] ? undefined : true}
      style={{ display: 'block', flex: 'none', ...style }}
      {...rest}
    >
      {body || P.star}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(P);
export default Icon;
