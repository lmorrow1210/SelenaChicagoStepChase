import * as React from 'react';
import Icon from '../icons/Icon.jsx';
import { getCityIcon } from './CityBadge.jsx';

/* ============================================================
   MapPin v3 — "Midnight Dossier" world-map marker.
   Variants:
     current  — amber live pulse (Selena's last confirmed sighting)
     next     — where she's heading; with selena=true this is HER
                red calling-card pin (the only red on the trail)
     visited  — dimmed manila with a ✓ notch (already investigated)
     upcoming — ghost outline (on the route, not reached)
   Pass `cityName` to render that city's landmark silhouette
   instead of the generic glyph.
   ============================================================ */

export function MapPin({
  variant = 'current',  // 'current' | 'next' | 'visited' | 'upcoming'
  label,
  cityName,
  selena = false,       // true = Selena's calling-card pin
  size = 'md',          // 'sm' | 'md'
  style,
}) {
  const dim = size === 'sm' ? 16 : 24;
  const headSize = dim + 14;

  const isCurrent = variant === 'current';
  const isNext = variant === 'next';
  const isVisited = variant === 'visited';
  const isUpcoming = variant === 'upcoming';
  const isSelena = selena && (isNext || isCurrent);

  const bg =
    isSelena  ? 'var(--signal-red)' :
    isCurrent ? 'var(--ink-600)'    :
    isNext    ? 'var(--ink-600)'    :
    isVisited ? 'var(--ink-700)'    :
    'transparent';

  const glyphColor =
    isSelena  ? 'var(--ink-900)' :
    isCurrent ? 'var(--amber)'   :
    isNext    ? 'var(--bone)'    :
    isVisited ? 'var(--bone-dim)' :
    'var(--bone-dim)';

  const ringColor =
    isSelena  ? 'var(--signal-red)' :
    isCurrent ? 'var(--amber)'      :
    isNext    ? 'var(--hairline-paper)' :
    isVisited ? 'var(--hairline-paper)' :
    'var(--hairline-paper)';

  const stemColor =
    isSelena  ? 'var(--signal-red)' :
    isCurrent ? 'var(--amber)'      :
    isVisited ? 'var(--bone-dim)'   :
    'var(--bone-dim)';

  /* City silhouette overrides the generic glyph (never on Selena's pin) */
  const CityIcon = selena ? null : getCityIcon(cityName);

  return (
    <div style={{
      position: 'relative', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 3,
      opacity: isUpcoming ? 0.45 : 1,
      ...style,
    }}>
      {/* Pin head */}
      <div style={{
        position: 'relative', display: 'grid', placeItems: 'center',
        width: headSize, height: headSize, borderRadius: '50%',
        background: bg,
        border: isUpcoming ? '1.5px dashed var(--hairline-paper)' : `2px solid ${ringColor}`,
        boxShadow:
          isSelena  ? 'var(--glow-selena)' :
          isCurrent ? 'var(--glow-live)'   :
          'var(--shadow-pin)',
        color: glyphColor,
      }}>
        {/* Live pulse — amber for the sighting, red for Selena herself */}
        {(isCurrent || isSelena) && (
          <span style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            animation: `${isSelena ? 'sc-pulse-selena' : 'sc-pulse-amber'} 2s var(--ease-in-out) infinite`,
          }} />
        )}
        {CityIcon ? (
          <div style={{ width: dim * 0.82, height: dim * 0.82, display: 'grid', placeItems: 'center' }}>
            <CityIcon color={glyphColor} />
          </div>
        ) : (
          <Icon
            name={selena ? 'nemesis' : 'city'}
            size={Math.round(dim * 0.7)}
            strokeWidth={2.2}
          />
        )}
        {/* Visited ✓ notch */}
        {isVisited && (
          <span style={{
            position: 'absolute', bottom: -3, right: -3,
            display: 'grid', placeItems: 'center',
            width: 14, height: 14, borderRadius: '50%',
            background: 'var(--ink-900)',
            border: '1px solid var(--hairline-paper)',
            color: 'var(--bone-dim)',
          }}>
            <Icon name="check" size={8} strokeWidth={3} />
          </span>
        )}
      </div>

      {/* Stem */}
      <span style={{
        width: 2, height: 8, marginTop: -3,
        background: stemColor, opacity: 0.8, flexShrink: 0,
      }} />

      {/* Label — stamped file-tab chip */}
      {label && (
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: isSelena ? 'var(--signal-red)' : isUpcoming ? 'var(--bone-dim)' : 'var(--bone)',
          whiteSpace: 'nowrap',
          background: isUpcoming ? 'transparent' : 'var(--ink-800)',
          padding: '2px 8px',
          borderRadius: 'var(--r-tight)',
          border: `1px solid ${isSelena ? 'var(--signal-red-20)' : 'var(--hairline-paper)'}`,
        }}>{label}</span>
      )}
    </div>
  );
}

export default MapPin;
