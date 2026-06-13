import * as React from 'react';

/* ============================================================
   Avatar — the mini trench-coat + fedora figure.
   Renders at any size (24 leaderboard / 40 strip / 120 profile).
   Parameterized by skinTone, hairColor, colorway (coat + boots).
   Hat always visible; matches coat color by default.
   ============================================================ */

export const COLORWAYS = {
  chicago:  { label: 'Chicago',  coat: '#7CCDEF', boots: '#CC0000' },
  midnight: { label: 'Midnight', coat: '#1A1A2E', boots: '#D4A820' },
  emerald:  { label: 'Emerald',  coat: '#1E4D2B', boots: '#F0E8DC' },
  crimson:  { label: 'Crimson',  coat: '#8B0000', boots: '#1A1A1A' },
  desert:   { label: 'Desert',   coat: '#C4956A', boots: '#8B3A0F' },
  violet:   { label: 'Violet',   coat: '#3D1A6B', boots: '#A8A8B8' },
};

/* 5 skin tones: fair → deep */
export const SKIN_TONES = [
  '#F2D2B6',  // fair
  '#E8B98F',  // light medium
  '#C68642',  // medium
  '#8B4513',  // dark
  '#4A2E1C',  // deep
];

/* 5 hair colors: black → dark brown → light brown/tan → red/orange → yellow (blonde) */
export const HAIR_COLORS = [
  '#0D0806',  // black
  '#3D1F0C',  // dark brown
  '#9B6535',  // light brown / tan
  '#C04418',  // red / orange
  '#D4A827',  // yellow / blonde
];

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function Avatar({
  size = 40,
  colorway = 'chicago',
  skinTone = SKIN_TONES[1],
  hairColor = HAIR_COLORS[0],
  ring = false,        // ring color (string) or true for blue
  badge,               // node rendered top-right (e.g. crown)
  style,
  ...rest
}) {
  const cw = COLORWAYS[colorway] || COLORWAYS.chicago;
  const coatDark  = shade(cw.coat, -26);
  const bootDark  = shade(cw.boots, -22);
  // Hat: use boot color (always contrasts with coat by design).
  // If boots are too dark (all channels < 55), lighten the coat instead.
  const bootMax = Math.max(
    parseInt(cw.boots.slice(1,3), 16),
    parseInt(cw.boots.slice(3,5), 16),
    parseInt(cw.boots.slice(5,7), 16)
  );
  const hatC    = bootMax < 55 ? shade(cw.coat, 28) : shade(cw.boots, -8);
  const hatBand = bootMax < 55 ? shade(cw.coat, -20) : shade(cw.boots, -45);
  const ringColor = ring === true ? 'var(--blue)' : ring;

  return (
    <span style={{
      position: 'relative', display: 'inline-grid', placeItems: 'center',
      width: size, height: size, flex: 'none',
      borderRadius: '50%',
      background: 'var(--navy)',
      boxShadow: ringColor ? `0 0 0 2px ${ringColor}` : 'inset 0 0 0 1px var(--hairline)',
      overflow: 'hidden',
      ...style,
    }} {...rest}>
      <svg viewBox="0 0 48 56" width={size} height={size} style={{ display: 'block' }} aria-hidden="true">

        {/* ── Coat / body ── */}
        <path d="M9 56 C9 40 14 34 18 32 L30 32 C34 34 39 40 39 56 Z" fill={cw.coat} />
        {/* coat opening / inner panel */}
        <path d="M24 32 L20.5 56 L27.5 56 Z" fill={coatDark} />
        {/* belt */}
        <rect x="11" y="44" width="26" height="3.4" fill={coatDark} opacity="0.8" />
        {/* collar / lapels */}
        <path d="M18 32 L24 39 L20 33 Z" fill={shade(cw.coat, 18)} />
        <path d="M30 32 L24 39 L28 33 Z" fill={shade(cw.coat, 18)} />
        {/* boots */}
        <rect x="13.5" y="52" width="8" height="4" rx="1" fill={cw.boots} />
        <rect x="26.5" y="52" width="8" height="4" rx="1" fill={bootDark} />

        {/* ── Neck & head ── */}
        <rect x="21" y="27" width="6" height="7" fill={skinTone} />
        <circle cx="24" cy="20" r="9" fill={skinTone} />

        {/* ── Hair — long curly locks falling from under the brim, over the
               coat shoulders. Chains of overlapping curls so they read as
               "curly" even at 24px. ── */}
        <g fill={hairColor}>
          <circle cx="14.5" cy="17" r="3.4" />
          <circle cx="13.2" cy="21.5" r="3.6" />
          <circle cx="13.8" cy="26" r="3.6" fill={shade(hairColor, 16)} />
          <circle cx="15.2" cy="30.5" r="3.4" />
          <circle cx="17" cy="34" r="3" fill={shade(hairColor, 16)} />
          <circle cx="33.5" cy="17" r="3.4" />
          <circle cx="34.8" cy="21.5" r="3.6" />
          <circle cx="34.2" cy="26" r="3.6" fill={shade(hairColor, 16)} />
          <circle cx="32.8" cy="30.5" r="3.4" />
          <circle cx="31" cy="34" r="3" fill={shade(hairColor, 16)} />
        </g>

        {/* ── Fedora hat ── */}
        {/* Crown */}
        <path d="M17 14 Q17.5 3 24 2 Q30.5 3 31 14 Z" fill={hatC} />
        {/* Brim */}
        <ellipse cx="24" cy="14" rx="12.5" ry="2.8" fill={hatC} />
        {/* Band / ribbon */}
        <rect x="17" y="12" width="14" height="2.2" rx="0.4" fill={hatBand} />
        {/* Crown sheen */}
        <path d="M18.5 13.5 C18.5 7 20.5 3.5 24 2.5" stroke={shade(hatC, 30)} strokeWidth="1.1" fill="none" opacity="0.35" />

      </svg>
      {badge && (
        <span style={{ position: 'absolute', top: -2, right: -2, lineHeight: 0 }}>{badge}</span>
      )}
    </span>
  );
}

export default Avatar;
