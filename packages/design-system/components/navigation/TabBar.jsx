import * as React from 'react';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   TabBar — mobile bottom nav. 5 icons + labels. Safe-area aware.
   ============================================================ */

const NAV = [
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'prediction', label: 'Predict', icon: 'prediction' },
  { id: 'city', label: 'City', icon: 'city' },
  { id: 'bingo', label: 'Bingo', icon: 'bingo' },
  { id: 'nemesis', label: 'Nemesis', icon: 'nemesis' },
];

export function TabBar({ active = 'map', onNavigate, items = NAV, style }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'stretch', justifyContent: 'space-around',
      width: '100%', height: 'var(--tabbar-height)',
      paddingBottom: 'var(--safe-bottom)',
      background: 'var(--card)',
      borderTop: '1px solid var(--hairline)',
      zIndex: 'var(--z-nav)',
      ...style,
    }}>
      {items.map((it) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            onClick={() => onNavigate && onNavigate(it.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, minWidth: 'var(--touch-min)',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: on ? 'var(--blue)' : 'var(--muted)',
              position: 'relative',
            }}
          >
            {on && <span style={{
              position: 'absolute', top: 0, width: 28, height: 3, borderRadius: '0 0 3px 3px',
              background: 'var(--blue)',
            }} />}
            <Icon name={it.icon} size={24} strokeWidth={on ? 2.4 : 2} />
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: on ? 700 : 500,
              letterSpacing: '0.02em',
            }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default TabBar;
