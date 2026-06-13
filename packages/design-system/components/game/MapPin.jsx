import * as React from 'react';
import Icon from '../icons/Icon.jsx';
import { getCityIcon } from './CityBadge.jsx';

/* ============================================================
   MapPin — world map marker.
   Variants: current (glowing blue, active pulse),
             next/selena (dimmer red accent).
   Pass `cityName` to render that city's landmark silhouette
   instead of the generic glyph.
   ============================================================ */

export function MapPin({
  variant = 'current',  // 'current' | 'next' | 'visited'
  label,
  cityName,
  selena = false,
  size = 'md',          // 'sm' | 'md'
  style,
}) {
  const isCurrent = variant === 'current';
  const isNext = variant === 'next';
  const dim = size === 'sm' ? 16 : 24;
  const color = isCurrent ? 'var(--blue)' : isNext ? 'var(--red)' : 'var(--muted)';
  const glyphColor = isCurrent || isNext ? 'var(--navy)' : 'var(--muted)';
  const CityIcon = selena ? null : getCityIcon(cityName);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, ...style }}>
      <div style={{
        position: 'relative', display: 'grid', placeItems: 'center',
        width: dim + 14, height: dim + 14, borderRadius: '50%',
        background: isCurrent ? 'var(--blue)' : isNext ? 'var(--red)' : 'var(--card-elevated)',
        border: `2px solid ${isVisitedBorder(variant)}`,
        boxShadow: isCurrent ? 'var(--glow-blue)' : isNext ? 'var(--glow-red)' : 'var(--shadow-pin)',
        color: isCurrent || isNext ? 'var(--navy)' : 'var(--muted)',
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
        background: color, opacity: 0.7,
      }} />
      {label && (
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase',
          color: 'var(--cream)', whiteSpace: 'nowrap',
          background: 'var(--navy)', padding: '1px 7px', borderRadius: 'var(--r-pill)',
          border: `1px solid ${color}`,
        }}>{label}</span>
      )}
    </div>
  );
}

function isVisitedBorder(variant) {
  if (variant === 'current') return 'var(--cream)';
  if (variant === 'next') return 'var(--cream)';
  return 'var(--hairline)';
}

export default MapPin;
