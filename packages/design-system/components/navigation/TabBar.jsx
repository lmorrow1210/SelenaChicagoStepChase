import * as React from 'react';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   TabBar v4 — "Field Terminal" command rail.
   The chunky command row of the two-pane console. Ink face with
   tan chrome; the active command lights up as an inset CRT chip with a phosphor
   inner glow and stamped label. Red never appears here.
   NAV per addendum §1: Map · Field Ops · Prediction · Nemesis.
   ============================================================ */

const NAV = [
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'fieldops', label: 'Field Ops', icon: 'bingo' },
  { id: 'prediction', label: 'Predict', icon: 'prediction' },
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
        /* Molded tan-plastic command rail — top-lit like the sidebar chassis */
        background:
          'linear-gradient(180deg, var(--tan-300) 0%, var(--tan-400) 22%, var(--tan-400) 74%, var(--tan-500) 100%)',
        borderTop: '1px solid var(--case-shadow)',
        boxShadow: 'var(--bevel-raised-shadow)',
        zIndex: 'var(--z-nav)',
        textShadow: 'none', /* chrome text is matte; only the lit tab glows */
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
              gap: 3,
              minWidth: 'var(--touch-min)',
              /* Active tab lights up as an inset CRT chip */
              background: on ? 'var(--screen-600)' : 'transparent',
              boxShadow: on ? 'var(--screen-inset)' : 'none',
              border: 'none',
              borderRight: idx < items.length - 1 ? '1px solid var(--case-shadow)' : 'none',
              borderRadius: 0,
              color: on ? 'var(--phosphor-hot)' : 'var(--case-900)',
              textShadow: on ? 'var(--text-glow)' : 'none',
              cursor: 'pointer',
              transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast)',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
              padding: 0,
            }}
          >
            <Icon name={it.icon} size={22} strokeWidth={on ? 2.3 : 1.9} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: 'var(--ls-label)',
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
