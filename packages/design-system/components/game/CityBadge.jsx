import * as React from 'react';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   CityBadge — circular collectible badge.
   Border quality: bronze / silver / gold. Locked = greyscale.
   Sizes: 48 (collection grid), 80 (featured).

   Each known city renders a unique SVG landmark silhouette.
   Unknown cities fall back to a generic skyline icon.
   ============================================================ */

const QUALITY = {
  bronze: 'var(--bronze)',
  silver: 'var(--silver)',
  gold:   'var(--gold)',
};

/* ── City landmark silhouettes (viewBox 0 0 48 48) ── */
const CITY_ICONS = {

  chicago: ({ color }) => (
    /* Willis Tower — bundled-tube silhouette with twin antennae */
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      {/* Main tower block */}
      <rect x="18" y="14" width="12" height="28" fill={color} rx="0.5" />
      {/* Upper setback notches (bundled tube look) */}
      <rect x="18" y="14" width="5.5" height="14" fill={color} rx="0.5" />
      <rect x="24.5" y="14" width="5.5" height="14" fill={color} rx="0.5" />
      <rect x="18" y="14" width="12" height="8" fill={color} rx="0.5" />
      {/* Skydeck notch */}
      <rect x="19.5" y="22" width="9" height="6" fill={color} rx="0.3" />
      {/* Twin antennae */}
      <rect x="21" y="6" width="1.8" height="9" fill={color} rx="0.5" />
      <rect x="25.2" y="9" width="1.8" height="6" fill={color} rx="0.5" />
      {/* Base */}
      <rect x="16" y="40" width="16" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  tokyo: ({ color }) => (
    /* Five-story pagoda with upswept eaves and spire */
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      {/* Spire */}
      <rect x="23" y="3" width="2" height="10" fill={color} rx="0.5" />
      {/* Tier 1 (top) */}
      <polygon points="19,13 29,13 27,10 21,10" fill={color} />
      <rect x="21" y="13" width="6" height="4" fill={color} />
      {/* Tier 2 */}
      <polygon points="16,20 32,20 30,17 18,17" fill={color} />
      <rect x="19" y="20" width="10" height="4" fill={color} />
      {/* Tier 3 */}
      <polygon points="13,28 35,28 33,25 15,25" fill={color} />
      <rect x="18" y="28" width="12" height="4" fill={color} />
      {/* Base platform */}
      <rect x="15" y="32" width="18" height="3" fill={color} rx="0.3" />
      <rect x="19" y="35" width="10" height="6" fill={color} />
      <rect x="14" y="40" width="20" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  cairo: ({ color }) => (
    /* Great Pyramid of Giza with smaller second pyramid */
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      {/* Shadow / second pyramid behind */}
      <polygon points="26,40 44,40 35,18" fill={color} opacity="0.4" />
      {/* Great Pyramid */}
      <polygon points="4,40 44,40 24,8" fill={color} />
      {/* Stone course lines */}
      <line x1="12" y1="32" x2="36" y2="32" stroke="var(--navy)" strokeWidth="1" opacity="0.3" />
      <line x1="16" y1="24" x2="32" y2="24" stroke="var(--navy)" strokeWidth="1" opacity="0.3" />
      {/* Ground line */}
      <rect x="2" y="40" width="44" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  oslo: ({ color }) => (
    /* Viking longship — curved hull, dragon prow, mast & sail */
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      {/* Hull */}
      <path d="M7 30 Q24 20 41 30 L39 36 Q24 38 9 36 Z" fill={color} />
      {/* Keel */}
      <path d="M9 36 Q24 40 39 36" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
      {/* Dragon prow (front) */}
      <path d="M41 30 Q46 26 44 22 Q40 26 39 30" fill={color} />
      {/* Stern curl */}
      <path d="M7 30 Q3 26 6 23 Q9 27 9 30" fill={color} />
      {/* Mast */}
      <rect x="23" y="14" width="2" height="17" fill={color} rx="0.5" />
      {/* Sail */}
      <path d="M25 14 L25 28 L34 22 Z" fill={color} opacity="0.75" />
      {/* Cross-spar */}
      <rect x="19" y="17" width="15" height="1.5" fill={color} rx="0.5" opacity="0.8" />
      {/* Oar dots */}
      <circle cx="14" cy="34" r="1.2" fill="var(--navy)" opacity="0.5" />
      <circle cx="20" cy="35" r="1.2" fill="var(--navy)" opacity="0.5" />
      <circle cx="28" cy="35" r="1.2" fill="var(--navy)" opacity="0.5" />
      <circle cx="34" cy="34" r="1.2" fill="var(--navy)" opacity="0.5" />
    </svg>
  ),

  lima: ({ color }) => (
    /* Machu Picchu — Incan terraced citadel on a mountain peak */
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      {/* Mountain peak behind */}
      <polygon points="8,42 24,12 40,42" fill={color} opacity="0.25" />
      {/* Terraces (bottom to top) */}
      <rect x="8"  y="38" width="32" height="4" fill={color} rx="0.4" />
      <rect x="11" y="32" width="26" height="6" fill={color} rx="0.4" opacity="0.9" />
      <rect x="14" y="26" width="20" height="6" fill={color} rx="0.4" opacity="0.85" />
      <rect x="17" y="20" width="14" height="6" fill={color} rx="0.4" opacity="0.8" />
      {/* Temple on top */}
      <rect x="20" y="14" width="8" height="6" fill={color} rx="0.3" />
      <polygon points="18,14 30,14 24,10" fill={color} />
      {/* Ground */}
      <rect x="6" y="42" width="36" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  newyork: ({ color }) => (
    /* Statue of Liberty + Empire State Building + skyline */
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      {/* Empire State Building (centre) */}
      <rect x="21" y="16" width="8" height="26" fill={color} rx="0.5" />
      <rect x="23" y="10" width="4" height="6" fill={color} rx="0.5" />
      <rect x="24.6" y="4" width="1.4" height="6" fill={color} rx="0.5" />
      {/* Stepped towers (right) */}
      <rect x="31" y="22" width="6" height="20" fill={color} rx="0.5" />
      <rect x="38" y="28" width="4" height="14" fill={color} rx="0.5" />
      {/* Statue of Liberty (left) */}
      <rect x="7" y="34" width="9" height="8" fill={color} rx="0.5" />
      <polygon points="9,34 14,34 13,20 10,20" fill={color} />
      <circle cx="11.5" cy="18" r="1.8" fill={color} />
      {/* Crown spikes */}
      <polygon points="9.4,17 10,14.4 10.6,17" fill={color} />
      <polygon points="10.9,16.6 11.5,13.6 12.1,16.6" fill={color} />
      <polygon points="12.4,17 13,14.4 13.6,17" fill={color} />
      {/* Raised arm + torch */}
      <rect x="13.2" y="12" width="1.5" height="9" fill={color} rx="0.5" transform="rotate(22 13.95 16.5)" />
      <circle cx="16.4" cy="11" r="1.7" fill={color} />
      {/* Waterline */}
      <rect x="4" y="40" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  washingtondc: ({ color }) => (
    /* U.S. Capitol dome + Washington Monument */
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      {/* Capitol base / steps */}
      <rect x="6" y="34" width="22" height="8" fill={color} rx="0.5" />
      {/* Colonnade: lintel + columns */}
      <rect x="8.5" y="29" width="17" height="1.8" fill={color} rx="0.3" />
      <rect x="9.5"  y="30.8" width="1.4" height="3.2" fill={color} />
      <rect x="12.4" y="30.8" width="1.4" height="3.2" fill={color} />
      <rect x="15.3" y="30.8" width="1.4" height="3.2" fill={color} />
      <rect x="18.2" y="30.8" width="1.4" height="3.2" fill={color} />
      <rect x="21.1" y="30.8" width="1.4" height="3.2" fill={color} />
      {/* Drum + dome */}
      <rect x="13.5" y="25" width="7" height="4" fill={color} rx="0.3" />
      <path d="M13.5 25 Q17 17.5 20.5 25 Z" fill={color} />
      {/* Lantern + statue of Freedom */}
      <rect x="16.3" y="15" width="1.4" height="2.6" fill={color} />
      <circle cx="17" cy="14.2" r="1" fill={color} />
      {/* Washington Monument (obelisk) */}
      <rect x="34" y="14" width="4" height="28" fill={color} rx="0.4" />
      <polygon points="34,14 38,14 36,9" fill={color} />
      {/* Ground */}
      <rect x="4" y="40" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  losangeles: ({ color }) => (
    /* Hollywood sign on the hills + palm + setting sun */
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      {/* Hill ridge */}
      <polygon points="2,23 13,13 24,17 34,11 46,16 46,24 2,24" fill={color} opacity="0.22" />
      {/* Hollywood sign letters */}
      <rect x="8.5"  y="12" width="1.3" height="5" fill={color} />
      <rect x="11.6" y="11.4" width="1.3" height="5" fill={color} />
      <rect x="14.7" y="12.4" width="1.3" height="5" fill={color} />
      <rect x="17.8" y="13.2" width="1.3" height="5" fill={color} />
      <rect x="20.9" y="14" width="1.3" height="5" fill={color} />
      {/* Setting sun */}
      <circle cx="23" cy="33" r="5" fill={color} />
      {/* Water reflections */}
      <rect x="6"  y="39" width="13" height="1.4" fill={color} rx="0.5" opacity="0.7" />
      <rect x="28" y="39" width="12" height="1.4" fill={color} rx="0.5" opacity="0.7" />
      {/* Palm tree (right) */}
      <path d="M37.5 40 Q38.5 31 39.5 25.5" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M39.5 25.5 Q35.5 23 33 24.8" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M39.5 25.5 Q43.5 23 45.5 25.5" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M39.5 25.5 Q37.5 21 38.6 18.5" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M39.5 25.5 Q41.6 21.5 42.8 19.5" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* Ground */}
      <rect x="4" y="40" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  seattle: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <!-- Space Needle -->
        <rect x="47" y="50" width="6" height="42" fill={color} />
        <polygon points="40,50 60,50 55,30 45,30" fill={color} />
        <rect x="44" y="22" width="12" height="8" fill={color} rx="1" />
        <rect x="49" y="14" width="2" height="9" fill={color} />
        <!-- Observation deck ring -->
        <ellipse cx="50" cy="30" rx="14" ry="3" fill={color} />
        <!-- Base legs -->
        <line x1="40" y1="92" x2="50" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="92" x2="50" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="92" x2="50" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <!-- Ground -->
        <rect x="10" y="92" width="80" height="4" fill={color} rx="1" />
    </svg>
  ),


};

/* Normalize a city name to an icon key: "New York" -> "newyork". */
function citySlug(name) {
  return (name || '').toLowerCase().replace(/[^a-z]/g, '');
}

/** The per-city silhouette component for a name, or null if none. */
export function getCityIcon(name) {
  return CITY_ICONS[citySlug(name)] ?? null;
}

/* Generic skyline fallback */
function SkylineFallback({ color }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="8"  y="28" width="6"  height="14" fill={color} rx="0.5" />
      <rect x="16" y="20" width="8"  height="22" fill={color} rx="0.5" />
      <rect x="26" y="24" width="6"  height="18" fill={color} rx="0.5" />
      <rect x="34" y="30" width="6"  height="12" fill={color} rx="0.5" />
      <rect x="20" y="16" width="2"  height="5"  fill={color} rx="0.5" />
      <rect x="6"  y="42" width="36" height="2"  fill={color} rx="0.5" />
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
  const ring = locked ? 'var(--muted)' : QUALITY[quality];
  const featured = size >= 72;
  const iconColor = locked ? 'var(--muted)' : 'var(--cream)';
  const iconSize = size * 0.62;
  const CityIcon = getCityIcon(name);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: size + 24, ...style }}>
      <div style={{
        position: 'relative', display: 'grid', placeItems: 'center',
        width: size, height: size, borderRadius: '50%',
        background: locked ? 'var(--navy-deep)' : 'var(--card-elevated)',
        border: `3px solid ${ring}`,
        boxShadow: locked ? 'none' : (quality === 'gold' ? 'var(--glow-gold)' : 'var(--shadow-card)'),
        filter: locked ? 'grayscale(1) brightness(0.7)' : 'none',
        overflow: 'hidden',
        padding: size * 0.1,
      }}>
        {locked
          ? <Icon name="lock" size={size * 0.38} strokeWidth={2} color="var(--muted)" />
          : (
            <div style={{ width: iconSize, height: iconSize }}>
              {CityIcon
                ? <CityIcon color={iconColor} />
                : <SkylineFallback color={iconColor} />
              }
            </div>
          )
        }
        {!locked && featured && (
          <span style={{
            position: 'absolute', bottom: -2, right: -2,
            display: 'grid', placeItems: 'center', width: size * 0.34, height: size * 0.34,
            borderRadius: '50%', background: ring, color: 'var(--navy)',
            border: '2px solid var(--navy)',
          }}>
            <Icon name="check" size={size * 0.2} strokeWidth={3} />
          </span>
        )}
      </div>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: featured ? 18 : 13, textTransform: 'uppercase', letterSpacing: '0.01em',
        color: locked ? 'var(--muted)' : 'var(--cream)', textAlign: 'center', lineHeight: 1.1,
      }}>{locked ? '???' : name}</span>
    </div>
  );
}

export default CityBadge;
