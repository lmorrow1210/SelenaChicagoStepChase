import * as React from 'react';
import Icon from '../icons/Icon.jsx';
import { getCityIcon } from './CityBadge.jsx';

/* ============================================================
   MapPin v2 — Vintage game world-map marker.
   Variants:
     current  — Selena's last sighting (selena=true → sky blue);
                player's current city (gold bevel, mahogany bg)
     next     — slate blue, predicted destination (Selena glyph)
     visited  — muted walnut, already investigated (player has been)
     upcoming — ghost: dashed walnut, low opacity, not yet reached
   Pass `cityName` to render that city's landmark silhouette
   instead of the generic glyph.
   ============================================================ */

export function MapPin({
  variant = 'current',  // 'current' | 'next' | 'visited' | 'upcoming'
  label,
  cityName,
  selena = false,       // true = this is Selena's pin
  size = 'md',          // 'sm' | 'md'
  style,
}) {
  const dim = size === 'sm' ? 16 : 24;
  const headSize = dim + 14;

  const isCurrent = variant === 'current';
  const isNext = variant === 'next';
  const isVisited = variant === 'visited';
  const isUpcoming = variant === 'upcoming';

  /* Background & icon colors by state */
  const bg =
    selena && isCurrent ? 'var(--selena)'    :
    isCurrent           ? 'var(--mahogany)'  :
    isNext              ? 'var(--slate)'     :
    isVisited           ? 'var(--walnut)'    :
    'transparent';

  const iconColor =
    selena && isCurrent ? 'var(--tobacco)'   :
    isCurrent           ? 'var(--selena)'    :
    isNext              ? 'var(--parchment)' :
    isVisited           ? 'var(--linen)'     :
    'var(--dust)';

  const borderColor =
    selena && isCurrent ? 'var(--selena-dark) var(--bevel-lo) var(--bevel-lo) var(--selena-dark)'  :
    isCurrent           ? 'var(--gold-light) var(--gold) var(--gold) var(--gold-light)'             :
    isNext              ? 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)'         :
    isVisited           ? 'var(--walnut) var(--bevel-lo) var(--bevel-lo) var(--walnut)'             :
    'var(--walnut)';

  const stemColor =
    selena && isCurrent ? 'var(--selena)'   :
    isCurrent           ? 'var(--gold)'     :
    isNext              ? 'var(--slate)'    :
    isVisited           ? 'var(--linen)'    :
    'var(--dust)';

  /* City silhouette overrides the generic glyph (never for Selena's pin) */
  const CityIcon = selena ? null : getCityIcon(cityName);

  return (
    <div style={{
      position: 'relative', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 3,
      opacity: isUpcoming ? 0.5 : 1,
      ...style,
    }}>
      {/* Pin head */}
      <div style={{
        position: 'relative', display: 'grid', placeItems: 'center',
        width: headSize, height: headSize, borderRadius: '50%',
        background: bg,
        border: isUpcoming ? '1.5px dashed' : '2px solid',
        borderColor: borderColor,
        color: iconColor,
        boxShadow: isCurrent ? '2px 2px 0 0 var(--bevel-lo)' : 'none',
      }}>
        {/* Active pulse ring for current locations */}
        {isCurrent && (
          <span style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: `2px solid ${selena ? 'var(--selena)' : 'var(--gold)'}`,
            animation: 'sc-pulse-blue 2s var(--ease-in-out) infinite',
            opacity: 0.5,
          }} />
        )}
        {CityIcon ? (
          <div style={{ width: dim * 0.82, height: dim * 0.82, display: 'grid', placeItems: 'center' }}>
            <CityIcon color={iconColor} />
          </div>
        ) : (
          <Icon
            name={selena ? 'nemesis' : 'city'}
            size={Math.round(dim * 0.7)}
            strokeWidth={2.2}
          />
        )}
      </div>

      {/* Stem */}
      <span style={{
        width: 2, height: 8, marginTop: -3,
        background: stemColor, opacity: 0.8,
        flexShrink: 0,
      }} />

      {/* Label chip */}
      {label && (
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 8,
          textTransform: 'uppercase', letterSpacing: '0.04em',
          color: isUpcoming ? 'var(--dust)' : 'var(--parchment)', whiteSpace: 'nowrap',
          background: isUpcoming ? 'transparent' : 'var(--felt)',
          padding: '3px 8px',
          border: '2px solid',
          borderColor: isUpcoming
            ? 'var(--walnut)'
            : 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)',
        }}>{label}</span>
      )}
    </div>
  );
}

export default MapPin;
