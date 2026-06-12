import * as React from 'react';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   LandmarkTile — City screen tile.
   States: locked (silhouette), unlocked (full color + fact),
   today (locked + pulsing blue border).
   ============================================================ */

export function LandmarkTile({
  name = 'Senso-ji',
  fact = '',
  state = 'unlocked',   // 'locked' | 'unlocked' | 'today'
  color = 'var(--map-land-teal)',
  icon = 'city',
  style,
}) {
  const isUnlocked = state === 'unlocked';
  const isToday = state === 'today';

  return (
    <div style={{
      position: 'relative', display: 'flex', flexDirection: 'column',
      borderRadius: 'var(--r-card)', overflow: 'hidden',
      background: isUnlocked ? 'var(--card-elevated)' : 'var(--navy-deep)',
      border: `2px solid ${isToday ? 'var(--blue)' : 'var(--hairline)'}`,
      animation: isToday ? 'sc-pulse-blue 1.8s var(--ease-in-out) infinite' : 'none',
      minHeight: 132, ...style,
    }}>
      {/* art area */}
      <div style={{
        flex: 1, display: 'grid', placeItems: 'center', minHeight: 78,
        background: isUnlocked
          ? `radial-gradient(circle at 50% 35%, ${color} 0%, ${color} 60%, color-mix(in srgb, ${color} 60%, var(--navy)) 100%)`
          : 'transparent',
        color: isUnlocked ? 'var(--cream)' : 'var(--muted)',
        opacity: isUnlocked ? 1 : 0.55,
        filter: isUnlocked ? 'none' : 'grayscale(1)',
      }}>
        <Icon name={isUnlocked ? icon : (isToday ? icon : icon)} size={42} strokeWidth={1.8}
          style={{ opacity: isUnlocked ? 1 : 0.5 }} />
      </div>
      {/* label area */}
      <div style={{ padding: '10px 12px', background: isUnlocked ? 'var(--card)' : 'transparent' }}>
        {isUnlocked ? (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', color: 'var(--cream)' }}>{name}</div>
            {fact && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{fact}</div>}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)' }}>
            <Icon name="lock" size={13} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500 }}>
              {isToday ? "Today's landmark" : 'Locked'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandmarkTile;
