const React = window.React;

/* ============================================================
   MapPin v2 — Vintage game world-map marker.
   current (player): gold border, parchment bg
   current + selena: sky-blue — Selena's last sighting
   next:             slate blue — predicted destination
   visited:          muted tan — already investigated
   ============================================================ */

export function MapPin({
  variant = 'current',  // 'current' | 'next' | 'visited'
  label,
  selena = false,       // true = this is Selena's pin
  size = 'md',          // 'sm' | 'md'
  style,
}) {
  const { Icon } = window.DesignSystem_19034b;
  const dim = size === 'sm' ? 16 : 24;
  const headSize = dim + 14;

  const isCurrent = variant === 'current';
  const isNext = variant === 'next';
  const isVisited = variant === 'visited';

  /* Background & icon colors by state */
  const bg =
    selena && isCurrent ? 'var(--selena)'    :
    isCurrent           ? 'var(--mahogany)'  :
    isNext              ? 'var(--slate)'     :
    'var(--walnut)';

  const iconColor =
    selena && isCurrent ? 'var(--tobacco)'   :
    isCurrent           ? 'var(--selena)'    :
    isNext              ? 'var(--parchment)' :
    'var(--dust)';

  const borderColor =
    selena && isCurrent ? 'var(--selena-dark) var(--bevel-lo) var(--bevel-lo) var(--selena-dark)'  :
    isCurrent           ? 'var(--gold-light) var(--gold) var(--gold) var(--gold-light)'             :
    isNext              ? 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)'         :
    'var(--walnut) var(--bevel-lo) var(--bevel-lo) var(--walnut)';

  const stemColor =
    selena && isCurrent ? 'var(--selena)'   :
    isCurrent           ? 'var(--gold)'     :
    isNext              ? 'var(--slate)'    :
    'var(--dust)';

  return (
    <div style={{
      position: 'relative', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 3,
      ...style,
    }}>
      {/* Pin head */}
      <div style={{
        position: 'relative', display: 'grid', placeItems: 'center',
        width: headSize, height: headSize, borderRadius: '50%',
        background: bg,
        border: '2px solid',
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
        <Icon
          name={selena ? 'nemesis' : 'city'}
          size={Math.round(dim * 0.7)}
          strokeWidth={2.2}
        />
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
          color: 'var(--parchment)', whiteSpace: 'nowrap',
          background: 'var(--felt)',
          padding: '3px 8px',
          border: '2px solid',
          borderColor: 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)',
        }}>{label}</span>
      )}
    </div>
  );
}
