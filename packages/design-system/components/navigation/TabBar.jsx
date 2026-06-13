import * as React from 'react';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   TabBar v2 — Vintage detective game action bar.
   Carmen Sandiego-inspired bottom navigation.
   Bevel top border. Hard dividers. Press Start 2P labels.
   NAV reflects product decisions: Prediction lives on the Map
   screen, and the city tab is framed as "Destination".
   ============================================================ */

const NAV = [
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'city', label: 'Destination', icon: 'city' },
  { id: 'bingo', label: 'Bingo', icon: 'bingo' },
  { id: 'nemesis', label: 'Nemesis', icon: 'nemesis' },
];

export function TabBar({ active = 'map', onNavigate, items = NAV, style }) {
  return (
    <nav
      role="navigation"
      style={{
        display: 'flex', alignItems: 'stretch',
        width: '100%',
        height: 'var(--tabbar-height)',
        paddingBottom: 'var(--safe-bottom)',
        background: 'var(--mahogany)',
        /* Hard bevel top edge — the shelf the game world sits above */
        borderTop: '3px solid var(--bevel-hi)',
        borderBottom: '2px solid var(--bevel-lo)',
        zIndex: 'var(--z-nav)',
        ...style,
      }}
    >
      {items.map((it, idx) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            onClick={() => onNavigate && onNavigate(it.id)}
            aria-current={on ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 4,
              minWidth: 'var(--touch-min)',
              /* Active tab recesses inward */
              background: on ? 'var(--felt)' : 'transparent',
              /* Selena-blue top stripe on active tab */
              borderTop: on ? '2px solid var(--selena)' : '2px solid transparent',
              /* Hard dividers between tabs */
              borderRight: idx < items.length - 1 ? '1px solid var(--walnut)' : 'none',
              borderBottom: 'none',
              borderLeft: 'none',
              color: on ? 'var(--selena)' : 'var(--dust)',
              cursor: 'pointer',
              transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast)',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
              padding: 0,
            }}
          >
            <Icon name={it.icon} size={22} strokeWidth={on ? 2.2 : 1.8} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 8,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              lineHeight: 1,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              padding: '0 4px',
            }}>
              {it.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default TabBar;
