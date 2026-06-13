import * as React from 'react';
import Icon from '../icons/Icon.jsx';
import { getCityIcon } from './CityBadge.jsx';

/* ============================================================
   MapPin — world map marker.
   Variants:
     current  — glowing blue, active pulse (Selena's last known city)
     next     — red accent (where Selena is heading; renders Selena glyph)
     visited  — solid dim gold tint (player has already hunted here)
     upcoming — ghost outline (city is on route but not yet reached)
   Pass `cityName` to render that city's landmark silhouette
   instead of the generic glyph.
   ============================================================ */

export function MapPin({
  variant = 'current',  // 'current' | 'next' | 'visited' | 'upcoming'
  label,
  cityName,
  selena = false,
  size = 'md',          // 'sm' | 'md'
  style,
}) {
  const isCurrent = variant === 'current';
  const isNext = variant === 'next';
  const isVisited = variant === 'visited';
  const isUpcoming = variant === 'upcoming';
  const dim = size === 'sm' ? 16 : 24;

  const accentColor = isCurrent
    ? 'var(--blue)'
    : isNext
    ? 'var(--red)'
    : isVisited
    ? 'var(--gold, #c8a96e)'
    : 'var(--hairline)';

  const bgColor = isCurrent
    ? 'var(--blue)'
    : isNext
    ? 'var(--red)'
    : isVisited
    ? 'var(--card-elevated)'
    : 'transparent';

  const glyphColor = isCurrent || isNext
    ? 'var(--navy)'
    : isVisited
    ? 'var(--gold, #c8a96e)'
    : 'var(--muted)';

  const borderStyle = isUpcoming
    ? `1.5px dashed var(--hairline)`
    : `2px solid ${isCurrent || isNext ? 'var(--cream)' : isVisited ? 'var(--gold, #c8a96e)' : 'var(--hairline)'}`;

  const CityIcon = selena ? null : getCityIcon(cityName);

  return (
    <div style={{
      position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      opacity: isUpcoming ? 0.45 : 1,
      ...style,
    }}>
      <div style={{
        position: 'relative', display: 'grid', placeItems: 'center',
        width: dim + 14, height: dim + 14, borderRadius: '50%',
        background: bgColor,
        border: borderStyle,
        boxShadow: isCurrent ? 'var(--glow-blue)' : isNext ? 'var(--glow-red)' : 'var(--shadow-pin)',
        color: glyphColor,
      }}>
        {isCurrent && (
          <span style={{
            position: 'absolute', inset: -2, borderRadius: '50%',
            border: '2px solid var(--blue)',
            animation: 'sc-pulse-blue 1.8s var(--ease-in-out) infinite',
          }} />
        )}
        {CityIcon ? (
          <div style={{ width: dim * 0.82, height: dim * 0.82, display: 'grid', placeItems: 'center' }}>
            <CityIcon color={glyphColor} />
          </div>
        ) : (
          <Icon name={selena ? 'nemesis' : 'city'} size={dim * 0.7} strokeWidth={2.2} />
        )}
      </div>
      {/* stem */}
      <span style={{
        width: 2, height: 8, marginTop: -4,
        background: accentColor, opacity: 0.7,
      }} />
      {label && (
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase',
          color: isUpcoming ? 'var(--muted)' : 'var(--cream)', whiteSpace: 'nowrap',
          background: isUpcoming ? 'transparent' : 'var(--navy)',
          padding: '1px 7px', borderRadius: 'var(--r-pill)',
          border: `1px solid ${accentColor}`,
        }}>{label}</span>
      )}
    </div>
  );
}

export default MapPin;
