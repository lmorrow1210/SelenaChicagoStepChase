import * as React from 'react';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   Sidebar — desktop nav. 60px collapsed (icons) / 200px on hover.
   5 nav items + avatar at bottom.
   ============================================================ */

const NAV = [
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'city', label: 'Destination', icon: 'city' },
  { id: 'bingo', label: 'Bingo', icon: 'bingo' },
  { id: 'nemesis', label: 'Nemesis', icon: 'nemesis' },
];

export function Sidebar({ active = 'map', onNavigate, avatar, items = NAV, forceExpanded = false }) {
  const [hover, setHover] = React.useState(false);
  const expanded = forceExpanded || hover;

  return (
    <nav
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: expanded ? 'var(--sidebar-expanded)' : 'var(--sidebar-collapsed)',
        height: '100%', flex: 'none',
        background: 'var(--card)',
        borderRight: '1px solid var(--hairline)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 10px', gap: 6,
        transition: 'width var(--dur-base) var(--ease-out)',
        overflow: 'hidden',
        zIndex: 'var(--z-nav)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px', height: 40, marginBottom: 12 }}>
        <span style={{
          display: 'grid', placeItems: 'center', width: 32, height: 32, flex: 'none',
          borderRadius: 'var(--r-tight)', background: 'var(--blue)', color: 'var(--navy)',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
        }}>S</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, letterSpacing: '0.01em',
          color: 'var(--cream)', whiteSpace: 'nowrap', textTransform: 'uppercase',
          opacity: expanded ? 1 : 0, transition: 'opacity var(--dur-fast)',
        }}>Selena's Chase</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {items.map((it) => {
          const on = it.id === active;
          return (
            <button
              key={it.id}
              onClick={() => onNavigate && onNavigate(it.id)}
              title={it.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                height: 44, padding: '0 10px', border: 'none', cursor: 'pointer',
                borderRadius: 'var(--r-card)', textAlign: 'left',
                background: on ? 'var(--blue-12)' : 'transparent',
                color: on ? 'var(--blue)' : 'var(--cream)',
                transition: 'background var(--dur-fast)',
              }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'var(--cream-08)'; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 24 }}>
                <Icon name={it.icon} size={23} strokeWidth={on ? 2.4 : 2} />
              </span>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: on ? 600 : 500,
                whiteSpace: 'nowrap', opacity: expanded ? 1 : 0, transition: 'opacity var(--dur-fast)',
              }}>{it.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onNavigate && onNavigate('profile')}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, height: 48, padding: '0 6px',
          border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 'var(--r-card)',
        }}
      >
        {avatar || <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--card-elevated)', flex: 'none' }} />}
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--cream)',
          whiteSpace: 'nowrap', opacity: expanded ? 1 : 0, transition: 'opacity var(--dur-fast)',
        }}>You</span>
      </button>
    </nav>
  );
}

export default Sidebar;
