const React = window.React;

/* ============================================================
   CityBadge v2 — Collectible city badge.
   Warm parchment palette. Bevel-chrome quality rings.
   Bronze / silver / gold. Locked = greyscale dust.
   Sizes: 48 (collection grid), 80 (featured).
   ============================================================ */

/* Quality ring border-colors (bevel on the ring itself) */
const QUALITY_BORDER = {
  gold:   'var(--gold-light) var(--gold) var(--gold) var(--gold-light)',
  silver: '#C8C8C8 #787878 #787878 #C8C8C8',
  bronze: '#D89048 #906020 #906020 #D89048',
};
const QUALITY_CHECK_BG = {
  gold:   'var(--gold)',
  silver: '#A0A0A0',
  bronze: 'var(--bronze)',
};

/* ── City landmark silhouettes (viewBox 0 0 48 48) ── */
const CITY_ICONS = {

  chicago: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="18" y="14" width="12" height="28" fill={color} rx="0" />
      <rect x="18" y="14" width="5.5" height="14" fill={color} rx="0" />
      <rect x="24.5" y="14" width="5.5" height="14" fill={color} rx="0" />
      <rect x="18" y="14" width="12" height="8" fill={color} rx="0" />
      <rect x="19.5" y="22" width="9" height="6" fill={color} rx="0" />
      <rect x="21" y="6" width="1.8" height="9" fill={color} rx="0" />
      <rect x="25.2" y="9" width="1.8" height="6" fill={color} rx="0" />
      <rect x="16" y="40" width="16" height="2" fill={color} rx="0" />
    </svg>
  ),

  tokyo: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="23" y="3" width="2" height="10" fill={color} />
      <polygon points="19,13 29,13 27,10 21,10" fill={color} />
      <rect x="21" y="13" width="6" height="4" fill={color} />
      <polygon points="16,20 32,20 30,17 18,17" fill={color} />
      <rect x="19" y="20" width="10" height="4" fill={color} />
      <polygon points="13,28 35,28 33,25 15,25" fill={color} />
      <rect x="18" y="28" width="12" height="4" fill={color} />
      <rect x="15" y="32" width="18" height="3" fill={color} />
      <rect x="19" y="35" width="10" height="6" fill={color} />
      <rect x="14" y="40" width="20" height="2" fill={color} />
    </svg>
  ),

  cairo: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <polygon points="26,40 44,40 35,18" fill={color} opacity="0.4" />
      <polygon points="4,40 44,40 24,8" fill={color} />
      <line x1="12" y1="32" x2="36" y2="32" stroke="var(--tobacco)" strokeWidth="1" opacity="0.4" />
      <line x1="16" y1="24" x2="32" y2="24" stroke="var(--tobacco)" strokeWidth="1" opacity="0.4" />
      <rect x="2" y="40" width="44" height="2" fill={color} />
    </svg>
  ),

  oslo: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <path d="M7 30 Q24 20 41 30 L39 36 Q24 38 9 36 Z" fill={color} />
      <path d="M9 36 Q24 40 39 36" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M41 30 Q46 26 44 22 Q40 26 39 30" fill={color} />
      <path d="M7 30 Q3 26 6 23 Q9 27 9 30" fill={color} />
      <rect x="23" y="14" width="2" height="17" fill={color} />
      <path d="M25 14 L25 28 L34 22 Z" fill={color} opacity="0.75" />
      <rect x="19" y="17" width="15" height="1.5" fill={color} opacity="0.8" />
      <circle cx="14" cy="34" r="1.2" fill="var(--tobacco)" opacity="0.5" />
      <circle cx="20" cy="35" r="1.2" fill="var(--tobacco)" opacity="0.5" />
      <circle cx="28" cy="35" r="1.2" fill="var(--tobacco)" opacity="0.5" />
      <circle cx="34" cy="34" r="1.2" fill="var(--tobacco)" opacity="0.5" />
    </svg>
  ),

  lima: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <polygon points="8,42 24,12 40,42" fill={color} opacity="0.25" />
      <rect x="8"  y="38" width="32" height="4" fill={color} />
      <rect x="11" y="32" width="26" height="6" fill={color} opacity="0.9" />
      <rect x="14" y="26" width="20" height="6" fill={color} opacity="0.85" />
      <rect x="17" y="20" width="14" height="6" fill={color} opacity="0.8" />
      <rect x="20" y="14" width="8" height="6" fill={color} />
      <polygon points="18,14 30,14 24,10" fill={color} />
      <rect x="6" y="42" width="36" height="2" fill={color} />
    </svg>
  ),
};

function SkylineFallback({ color }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="8"  y="28" width="6"  height="14" fill={color} />
      <rect x="16" y="20" width="8"  height="22" fill={color} />
      <rect x="26" y="24" width="6"  height="18" fill={color} />
      <rect x="34" y="30" width="6"  height="12" fill={color} />
      <rect x="20" y="16" width="2"  height="5"  fill={color} />
      <rect x="6"  y="42" width="36" height="2"  fill={color} />
    </svg>
  );
}

export function CityBadge({
  name = 'Chicago',
  quality = 'gold',     // 'bronze' | 'silver' | 'gold'
  locked = false,
  size = 80,
  style,
}) {
  const { Icon } = window.DesignSystem_19034b;
  const featured = size >= 72;
  const iconColor = locked ? 'var(--dust)' : 'var(--parchment)';
  const iconSize = size * 0.62;
  const CityIcon = CITY_ICONS[name.toLowerCase()];
  const ringBorderColor = locked
    ? 'var(--walnut) var(--bevel-lo) var(--bevel-lo) var(--walnut)'
    : QUALITY_BORDER[quality];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: size + 24, ...style }}>
      <div style={{
        position: 'relative', display: 'grid', placeItems: 'center',
        width: size, height: size, borderRadius: '50%',
        background: locked ? 'var(--tobacco)' : 'var(--mahogany)',
        border: `3px solid`,
        borderColor: ringBorderColor,
        boxShadow: (!locked && quality === 'gold') ? '2px 2px 0 0 var(--bevel-lo)' : 'none',
        filter: locked ? 'grayscale(1) brightness(0.6)' : 'none',
        overflow: 'hidden',
        padding: size * 0.1,
      }}>
        {locked ? (
          <Icon name="lock" size={size * 0.38} strokeWidth={2} color="var(--dust)" />
        ) : (
          <div style={{ width: iconSize, height: iconSize }}>
            {CityIcon
              ? <CityIcon color={iconColor} />
              : <SkylineFallback color={iconColor} />
            }
          </div>
        )}
        {/* Quality check badge */}
        {!locked && featured && (
          <span style={{
            position: 'absolute', bottom: -2, right: -2,
            display: 'grid', placeItems: 'center',
            width: size * 0.34, height: size * 0.34,
            borderRadius: '50%',
            background: QUALITY_CHECK_BG[quality],
            color: 'var(--tobacco)',
            border: '2px solid var(--tobacco)',
          }}>
            <Icon name="check" size={size * 0.2} strokeWidth={3} />
          </span>
        )}
      </div>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: featured ? 11 : 8,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: locked ? 'var(--dust)' : 'var(--parchment)',
        textAlign: 'center', lineHeight: 1.4,
      }}>{locked ? '???' : name}</span>
    </div>
  );
}
