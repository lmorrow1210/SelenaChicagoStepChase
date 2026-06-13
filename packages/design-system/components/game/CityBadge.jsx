import * as React from 'react';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   CityBadge — circular collectible badge.
   Border quality: bronze / silver / gold. Locked = greyscale.
   Sizes: 48 (collection grid), 80 (featured).

   Each known city renders a unique SVG landmark silhouette.
   Unknown cities fall back to a generic skyline icon.
   ============================================================ */

/* v2 bevel-chrome quality rings (border-color shorthand) */
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
      <rect x="23.2" y="4" width="1.6" height="8" fill={color} rx="0.5" />
      <ellipse cx="24" cy="15" rx="9" ry="3.5" fill={color} />
      <path d="M20 13 L22 20 L26 20 L28 13 Z" fill={color} />
      <rect x="22.5" y="20" width="3" height="16" fill={color} rx="0.5" />
      <path d="M24 36 L13 43" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M24 36 L24 43" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M24 36 L35 43" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect x="4" y="43" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  miami: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="11" y="22" width="22" height="18" fill={color} />
      <rect x="13" y="15" width="18" height="8" fill={color} />
      <rect x="16" y="9" width="12" height="7" fill={color} />
      <rect x="8" y="24" width="3" height="12" fill={color} />
      <rect x="33" y="24" width="3" height="12" fill={color} />
      <circle cx="39" cy="13" r="4" fill={color} />
      <rect x="37" y="32" width="2" height="8" fill={color} rx="0.5" />
      <path d="M38 32 Q33 27 29 29" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M38 32 Q43 28 45 32" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M38 32 Q37 26 38 23" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <rect x="4" y="40" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  orlando: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="16" y="24" width="16" height="18" fill={color} />
      <rect x="20" y="10" width="8" height="16" fill={color} />
      <polygon points="22,3 26,3 24,10" fill={color} />
      <rect x="10" y="30" width="7" height="12" fill={color} />
      <polygon points="10,30 17,30 13.5,23" fill={color} />
      <rect x="31" y="30" width="7" height="12" fill={color} />
      <polygon points="31,30 38,30 34.5,23" fill={color} />
      <rect x="20" y="7" width="2" height="3" fill={color} />
      <rect x="23" y="7" width="2" height="3" fill={color} />
      <rect x="26" y="7" width="2" height="3" fill={color} />
      <rect x="4" y="42" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  charlotte: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="19" y="16" width="10" height="26" fill={color} />
      <rect x="17" y="11" width="4" height="6" fill={color} />
      <rect x="27" y="11" width="4" height="6" fill={color} />
      <rect x="20" y="6" width="8" height="10" fill={color} />
      <rect x="9" y="28" width="9" height="14" fill={color} />
      <rect x="30" y="32" width="9" height="10" fill={color} />
      <rect x="4" y="42" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  indianapolis: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="21" y="16" width="6" height="24" fill={color} />
      <polygon points="19,16 29,16 24,8" fill={color} />
      <rect x="18" y="38" width="12" height="3" fill={color} />
      <rect x="14" y="41" width="20" height="2" fill={color} />
      <rect x="29" y="8" width="11" height="10" fill={color} />
      <rect x="29" y="8" width="2.7" height="5" fill="var(--navy)" opacity="0.6" />
      <rect x="34.3" y="8" width="2.7" height="5" fill="var(--navy)" opacity="0.6" />
      <rect x="31.6" y="13" width="2.7" height="5" fill="var(--navy)" opacity="0.6" />
      <rect x="36.9" y="13" width="2.7" height="5" fill="var(--navy)" opacity="0.6" />
      <rect x="39.5" y="4" width="1.5" height="16" fill={color} rx="0.5" />
      <rect x="4" y="43" width="22" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  sanfrancisco: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="10" y="12" width="4" height="24" fill={color} />
      <rect x="9" y="16" width="6" height="2" fill={color} />
      <rect x="9" y="24" width="6" height="2" fill={color} />
      <rect x="34" y="12" width="4" height="24" fill={color} />
      <rect x="33" y="16" width="6" height="2" fill={color} />
      <rect x="33" y="24" width="6" height="2" fill={color} />
      <path d="M12 12 Q24 30 36 12" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="18" y1="18" x2="18" y2="28" stroke={color} strokeWidth="1.2" />
      <line x1="22" y1="25" x2="22" y2="28" stroke={color} strokeWidth="1.2" />
      <line x1="26" y1="25" x2="26" y2="28" stroke={color} strokeWidth="1.2" />
      <line x1="30" y1="19" x2="30" y2="28" stroke={color} strokeWidth="1.2" />
      <rect x="6" y="28" width="36" height="3" fill={color} />
      <rect x="4" y="38" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  portland: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <polygon points="8,40 24,6 40,40" fill={color} />
      <polygon points="20,15 24,6 28,15 26,18 22,18" fill="var(--navy)" opacity="0.45" />
      <polygon points="2,40 7,26 12,40" fill={color} />
      <polygon points="3,34 7,23 11,34" fill={color} />
      <polygon points="36,40 41,26 46,40" fill={color} />
      <polygon points="37,34 41,23 45,34" fill={color} />
      <rect x="4" y="40" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  memphis: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="22" y="2" width="6" height="4" fill={color} rx="0.5" />
      <rect x="23" y="4" width="4" height="5" fill={color} />
      <path d="M27 8 L30 8 Q36 8 36 16 L36 32 Q36 42 26 42 L20 42 Q12 42 12 36 Q12 30 18 30 L21 30"
            stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="20" cy="40" rx="5" ry="2.5" fill={color} />
      <circle cx="33" cy="16" r="1.5" fill={color} />
      <circle cx="34.5" cy="22" r="1.5" fill={color} />
      <circle cx="34" cy="28" r="1.5" fill={color} />
      <circle cx="10" cy="14" r="2" fill={color} />
      <rect x="11.8" y="10" width="1.2" height="5" fill={color} />
      <circle cx="16" cy="9" r="2" fill={color} />
      <rect x="17.8" y="5" width="1.2" height="5" fill={color} />
    </svg>
  ),

  nashville: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="24" cy="36" rx="12" ry="9" fill={color} />
      <ellipse cx="24" cy="22" rx="8.5" ry="6.5" fill={color} />
      <rect x="20" y="26" width="8" height="5" fill={color} />
      <circle cx="24" cy="34" r="3.5" fill="var(--navy)" opacity="0.4" />
      <rect x="22.5" y="7" width="3" height="17" fill={color} />
      <rect x="20" y="3" width="8" height="5" fill={color} rx="1" />
      <circle cx="19" cy="5" r="1.5" fill={color} />
      <circle cx="29" cy="5" r="1.5" fill={color} />
    </svg>
  ),

  denver: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <polygon points="2,40 18,14 28,30 20,40" fill={color} opacity="0.55" />
      <polygon points="10,40 26,5 42,40" fill={color} />
      <polygon points="22,13 26,5 30,13 28,18 24,18" fill="var(--navy)" opacity="0.4" />
      <polygon points="30,40 40,16 48,40" fill={color} opacity="0.8" />
      <polygon points="37,22 40,16 43,22" fill="var(--navy)" opacity="0.4" />
      <circle cx="8" cy="10" r="4" fill={color} />
      <rect x="4" y="40" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  oklahomacity: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <path d="M30 36 L22 8" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
      <line x1="22" y1="8" x2="6" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="8" x2="11" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="8" x2="17" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="8" x2="28" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="8" x2="34" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="8" x2="42" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="4" y="28" width="40" height="3" fill={color} />
      <rect x="4" y="38" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  stlouis: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <path d="M10 42 C10 20 17 6 24 4 C31 6 38 20 38 42 L34 42 C34 22 29 9 24 7 C19 9 14 22 14 42 Z" fill={color} />
      <rect x="4" y="42" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  boston: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <path d="M6 34 L10 40 L38 40 L42 34 Q32 36 24 36 Q16 36 6 34 Z" fill={color} />
      <rect x="23" y="6" width="2" height="28" fill={color} />
      <polygon points="25,8 25,28 39,22" fill={color} opacity="0.9" />
      <polygon points="23,10 23,28 11,24" fill={color} opacity="0.75" />
      <polygon points="25,6 25,14 33,11" fill={color} opacity="0.85" />
      <line x1="23" y1="26" x2="10" y2="32" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="4" y="40" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  minneapolis: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <polygon points="8,38 12,24 16,38" fill={color} />
      <polygon points="9,32 12,20 15,32" fill={color} />
      <polygon points="10,26 12,17 14,26" fill={color} />
      <rect x="11" y="38" width="2" height="3" fill={color} />
      <path d="M14 36 Q22 31 30 33 Q38 35 42 33" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M18 36 Q30 30 42 36 L40 40 Q30 35 20 40 Z" fill={color} />
      <line x1="30" y1="32" x2="26" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="25.5" cy="42.5" rx="2.5" ry="1.2" fill={color} />
      <rect x="4" y="42" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  lasvegas: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <polygon points="24,2 25.5,6 30,6 26.5,9 28,13 24,10.5 20,13 21.5,9 18,6 22.5,6" fill={color} />
      <polygon points="6,10 42,10 45,30 3,30" fill={color} />
      <rect x="9" y="13" width="30" height="3" fill="var(--navy)" opacity="0.5" />
      <rect x="11" y="18" width="26" height="4" fill="var(--navy)" opacity="0.5" />
      <rect x="9" y="24" width="30" height="3" fill="var(--navy)" opacity="0.5" />
      <polygon points="24,30 37,38 24,46 11,38" fill={color} />
    </svg>
  ),

  neworleans: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="14" cy="6" rx="3" ry="7" fill={color} transform="rotate(-25 14 6)" />
      <ellipse cx="20" cy="3" rx="3" ry="8" fill={color} transform="rotate(-10 20 3)" />
      <ellipse cx="28" cy="3" rx="3" ry="8" fill={color} transform="rotate(10 28 3)" />
      <ellipse cx="34" cy="6" rx="3" ry="7" fill={color} transform="rotate(25 34 6)" />
      <path d="M6 20 Q6 9 24 9 Q42 9 42 20 L42 32 Q42 40 34 40 L30 40 Q28 36 24 36 Q20 36 18 40 L14 40 Q6 40 6 32 Z" fill={color} />
      <ellipse cx="15" cy="23" rx="5.5" ry="4.5" fill="var(--navy)" opacity="0.75" />
      <ellipse cx="33" cy="23" rx="5.5" ry="4.5" fill="var(--navy)" opacity="0.75" />
      <path d="M21 31 Q24 35 27 31" stroke="var(--navy)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  ),

  atlanta: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <circle cx="24" cy="30" r="16" fill={color} />
      <path d="M24 14 Q20 22 24 30 Q28 22 24 14" fill="var(--navy)" opacity="0.3" />
      <rect x="23" y="10" width="2" height="5" fill={color} rx="0.5" />
      <path d="M24 13 Q31 7 36 11 Q31 16 24 13 Z" fill={color} />
      <path d="M24 13 Q17 7 12 11 Q17 16 24 13 Z" fill={color} opacity="0.85" />
    </svg>
  ),

  detroit: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <path d="M4 32 L6 28 L12 22 L18 20 L30 20 L36 22 L44 28 L44 32 Z" fill={color} />
      <path d="M14 28 L16 22 L22 20 L30 20 L34 22 L36 28 Z" fill={color} />
      <path d="M16 26 L17 22 L22 21 L22 26 Z" fill="var(--navy)" opacity="0.45" />
      <path d="M34 26 L33 22 L30 21 L30 26 Z" fill="var(--navy)" opacity="0.45" />
      <circle cx="12" cy="33" r="5" fill={color} />
      <circle cx="12" cy="33" r="2.5" fill="var(--navy)" opacity="0.5" />
      <circle cx="36" cy="33" r="5" fill={color} />
      <circle cx="36" cy="33" r="2.5" fill="var(--navy)" opacity="0.5" />
      <rect x="4" y="38" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  pittsburgh: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="8" y="16" width="4" height="20" fill={color} />
      <rect x="22" y="13" width="4" height="23" fill={color} />
      <rect x="36" y="16" width="4" height="20" fill={color} />
      <path d="M10 16 Q16 26 24 13" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M24 13 Q32 26 38 16" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <line x1="14" y1="22" x2="14" y2="28" stroke={color} strokeWidth="1.2" />
      <line x1="18" y1="27" x2="18" y2="28" stroke={color} strokeWidth="1.2" />
      <line x1="28" y1="27" x2="28" y2="28" stroke={color} strokeWidth="1.2" />
      <line x1="32" y1="22" x2="32" y2="28" stroke={color} strokeWidth="1.2" />
      <rect x="4" y="28" width="40" height="3" fill={color} />
      <rect x="4" y="38" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  houston: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <path d="M22 8 L26 8 L28 22 L24 24 L20 22 Z" fill={color} />
      <polygon points="22,4 26,4 24,8" fill={color} />
      <polygon points="20,22 13,34 20,34" fill={color} />
      <polygon points="28,22 35,34 28,34" fill={color} />
      <rect x="21" y="24" width="6" height="12" fill={color} rx="0.5" />
      <rect x="14" y="26" width="4" height="10" fill={color} rx="0.5" />
      <rect x="30" y="26" width="4" height="10" fill={color} rx="0.5" />
      <rect x="16" y="36" width="16" height="3" fill={color} />
      <rect x="12" y="39" width="24" height="2" fill={color} />
      <path d="M17 36 Q15 41 13 44" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M24 36 L24 44" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M31 36 Q33 41 35 44" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  ),

  phoenix: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="20" y="10" width="8" height="32" fill={color} rx="4" />
      <rect x="10" y="22" width="12" height="6" fill={color} rx="3" />
      <rect x="10" y="16" width="6" height="12" fill={color} rx="3" />
      <rect x="26" y="26" width="12" height="6" fill={color} rx="3" />
      <rect x="32" y="20" width="6" height="12" fill={color} rx="3" />
      <ellipse cx="24" cy="10" rx="4" ry="4" fill={color} />
      <ellipse cx="13" cy="16" rx="3" ry="3" fill={color} />
      <ellipse cx="35" cy="20" rx="3" ry="3" fill={color} />
      <circle cx="40" cy="10" r="5" fill={color} />
      <rect x="4" y="42" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  philadelphia: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="18" y="4" width="12" height="5" fill={color} rx="1" />
      <rect x="22" y="8" width="4" height="4" fill={color} />
      <path d="M14 12 Q14 28 10 36 L38 36 Q34 28 34 12 Z" fill={color} />
      <path d="M8 36 Q8 40 24 40 Q40 40 40 36 Z" fill={color} />
      <path d="M22 14 L20 26 L23 30" stroke="var(--navy)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
      <line x1="24" y1="34" x2="24" y2="40" stroke={color} strokeWidth="2" />
      <circle cx="24" cy="41" r="2" fill={color} />
      <rect x="10" y="42" width="28" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  sanantonio: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="8" y="20" width="32" height="22" fill={color} />
      <path d="M8 20 L8 11 Q24 4 40 11 L40 20 Z" fill={color} />
      <path d="M18 42 L18 31 Q24 25 30 31 L30 42" fill="var(--navy)" opacity="0.55" />
      <rect x="10" y="25" width="6" height="8" fill="var(--navy)" opacity="0.45" rx="0.5" />
      <rect x="32" y="25" width="6" height="8" fill="var(--navy)" opacity="0.45" rx="0.5" />
      <rect x="14" y="13" width="4" height="5" fill="var(--navy)" opacity="0.4" rx="0.5" />
      <rect x="30" y="13" width="4" height="5" fill="var(--navy)" opacity="0.4" rx="0.5" />
      <rect x="4" y="42" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  saltlakecity: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="10" y="26" width="28" height="16" fill={color} />
      <rect x="6" y="30" width="8" height="12" fill={color} />
      <rect x="34" y="30" width="8" height="12" fill={color} />
      <rect x="22" y="10" width="4" height="18" fill={color} />
      <polygon points="22,10 26,10 24,3" fill={color} />
      <rect x="18" y="14" width="4" height="14" fill={color} />
      <polygon points="18,14 22,14 20,7" fill={color} />
      <rect x="26" y="14" width="4" height="14" fill={color} />
      <polygon points="26,14 30,14 28,7" fill={color} />
      <rect x="8" y="22" width="3" height="10" fill={color} />
      <polygon points="8,22 11,22 9.5,16" fill={color} />
      <rect x="37" y="22" width="3" height="10" fill={color} />
      <polygon points="37,22 40,22 38.5,16" fill={color} />
      <rect x="4" y="42" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  santafe: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <rect x="4" y="30" width="40" height="12" fill={color} rx="2" />
      <rect x="10" y="20" width="28" height="12" fill={color} rx="2" />
      <rect x="16" y="12" width="18" height="10" fill={color} rx="2" />
      <rect x="20" y="5" width="10" height="9" fill={color} rx="2" />
      <rect x="2" y="33" width="4" height="2" fill={color} rx="0.5" />
      <rect x="2" y="37" width="4" height="2" fill={color} rx="0.5" />
      <rect x="42" y="33" width="4" height="2" fill={color} rx="0.5" />
      <rect x="42" y="37" width="4" height="2" fill={color} rx="0.5" />
      <rect x="8" y="23" width="4" height="2" fill={color} rx="0.5" />
      <rect x="36" y="23" width="4" height="2" fill={color} rx="0.5" />
      <path d="M20 42 L20 36 Q24 31 28 36 L28 42" fill="var(--navy)" opacity="0.5" />
    </svg>
  ),

  honolulu: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <circle cx="38" cy="11" r="5" fill={color} />
      <path d="M4 36 L8 18 L18 14 L30 17 L38 30 L44 36 Z" fill={color} />
      <path d="M4 38 Q10 33 16 38 Q22 43 28 38 Q34 33 40 36 L44 38 L4 38 Z" fill={color} />
      <path d="M4 38 Q10 34 16 38" stroke="var(--navy)" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
      <path d="M28 38 Q34 33 40 36" stroke="var(--navy)" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
      <rect x="4" y="40" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

  anchorage: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="24" cy="38" rx="8" ry="5.5" fill={color} />
      <ellipse cx="24" cy="42" rx="5" ry="3" fill={color} />
      <path d="M19 34 C17 26 10 18 8 9" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M13 20 C9 15 6 12 4 10" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M8 9 C6 4 3 4 2 6" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M8 9 C8 3 11 2 12 5" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M8 9 C13 5 14 5 14 7" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M29 34 C31 26 38 18 40 9" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M35 20 C39 15 42 12 44 10" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40 9 C42 4 45 4 46 6" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M40 9 C40 3 37 2 36 5" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M40 9 C35 5 34 5 34 7" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  ),

  austin: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <path d="M4 28 Q12 20 20 28" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M20 28 Q28 20 36 28" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M36 28 Q42 23 44 28" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="4" y="28" width="40" height="3" fill={color} />
      <rect x="8" y="31" width="2" height="8" fill={color} />
      <rect x="21" y="31" width="2" height="8" fill={color} />
      <rect x="34" y="31" width="2" height="8" fill={color} />
      <rect x="4" y="38" width="40" height="2" fill={color} rx="0.5" opacity="0.6" />
      <path d="M15 20 Q13 16 12 18 Q13 18 15 16 Q17 18 19 18 Q17 16 15 20 Z" fill={color} />
      <path d="M27 14 Q25 10 24 12 Q25 12 27 10 Q29 12 31 12 Q29 10 27 14 Z" fill={color} />
      <path d="M36 22 Q34 18 33 20 Q34 20 36 18 Q38 20 40 20 Q38 18 36 22 Z" fill={color} />
      <path d="M22 24 Q20 20 19 22 Q20 22 22 20 Q24 22 26 22 Q24 20 22 24 Z" fill={color} />
      <circle cx="38" cy="12" r="4.5" fill={color} opacity="0.55" />
    </svg>
  ),

  sandiego: ({ color }) => (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <circle cx="38" cy="12" r="6" fill={color} />
      <rect x="23" y="10" width="2" height="24" fill={color} />
      <polygon points="25,12 25,30 40,27" fill={color} opacity="0.9" />
      <polygon points="23,14 23,28 10,25" fill={color} opacity="0.75" />
      <path d="M10 30 L14 36 L34 36 L38 30 Q30 32 24 32 Q18 32 10 30 Z" fill={color} />
      <path d="M4 34 Q12 32 20 34 Q28 36 36 34 Q42 32 44 34" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <rect x="4" y="36" width="40" height="2" fill={color} rx="0.5" />
    </svg>
  ),

};

const SLUG_ALIASES = {
  newyorkcity: 'newyork',
  washingtondc: 'washingtondc',
  dc: 'washingtondc',
  sf: 'sanfrancisco',
  la: 'losangeles',
  nyc: 'newyork',
};

/* Normalize a city name to an icon key: "New York" -> "newyork". */
function citySlug(name) {
  return (name || '').toLowerCase().replace(/[^a-z]/g, '');
}

/** The per-city silhouette component for a name, or null if none. */
export function getCityIcon(name) {
  const slug = citySlug(name);
  return CITY_ICONS[SLUG_ALIASES[slug] ?? slug] ?? null;
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
  const featured = size >= 72;
  const iconColor = locked ? 'var(--dust)' : 'var(--parchment)';
  const iconSize = size * 0.62;
  const CityIcon = getCityIcon(name);
  const ringBorderColor = locked
    ? 'var(--walnut) var(--bevel-lo) var(--bevel-lo) var(--walnut)'
    : QUALITY_BORDER[quality];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: size + 24, ...style }}>
      <div style={{
        position: 'relative', display: 'grid', placeItems: 'center',
        width: size, height: size, borderRadius: '50%',
        background: locked ? 'var(--tobacco)' : 'var(--mahogany)',
        border: '3px solid',
        borderColor: ringBorderColor,
        boxShadow: (!locked && quality === 'gold') ? '2px 2px 0 0 var(--bevel-lo)' : 'none',
        filter: locked ? 'grayscale(1) brightness(0.6)' : 'none',
        overflow: 'hidden',
        padding: size * 0.1,
      }}>
        {locked
          ? <Icon name="lock" size={size * 0.38} strokeWidth={2} color="var(--dust)" />
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
            borderRadius: '50%', background: QUALITY_CHECK_BG[quality], color: 'var(--tobacco)',
            border: '2px solid var(--tobacco)',
          }}>
            <Icon name="check" size={size * 0.2} strokeWidth={3} />
          </span>
        )}
      </div>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: featured ? 11 : 8, textTransform: 'uppercase', letterSpacing: '0.04em',
        color: locked ? 'var(--dust)' : 'var(--parchment)', textAlign: 'center', lineHeight: 1.4,
      }}>{locked ? '???' : name}</span>
    </div>
  );
}

export default CityBadge;
