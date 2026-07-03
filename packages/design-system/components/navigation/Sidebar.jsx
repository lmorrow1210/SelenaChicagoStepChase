import * as React from 'react';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   Sidebar v3 — "Midnight Dossier" amber phosphor terminal.
   A nighttime intelligence terminal: ink chassis, inset amber
   phosphor screen listing tracker commands, stamped bureau
   header. Collapsed 60px → expanded 200px on hover (§10).
   NAV per addendum §1: Map · Field Ops · Prediction · Nemesis.
   ============================================================ */

const NAV = [
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'fieldops', label: 'Field Ops', icon: 'bingo' },
  { id: 'prediction', label: 'Predict', icon: 'prediction' },
  { id: 'nemesis', label: 'Nemesis', icon: 'nemesis' },
];

/* Faint phosphor scanlines — texture, not a CRT filter */
const SCANLINES = 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.16) 2px, rgba(0,0,0,0.16) 3px)';

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
        background: 'var(--ink-700)',
        borderRight: '1px solid var(--hairline-paper)',
        boxShadow: 'var(--bevel-raised-shadow)',
        display: 'flex', flexDirection: 'column',
        padding: '12px 8px', gap: 10,
        transition: 'width var(--dur-base) var(--ease-out)',
        overflow: 'hidden',
        zIndex: 'var(--z-nav)',
      }}
    >
      {/* ── Bureau nameplate — stamped label on the chassis ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '2px 6px', minHeight: 34, flex: 'none', overflow: 'hidden',
      }}>
        <span style={{
          display: 'grid', placeItems: 'center',
          width: 28, height: 28, flex: 'none',
          borderRadius: 'var(--r-tight)',
          background: 'var(--amber)', color: 'var(--ink-900)',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
        }}>1</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--bone)', whiteSpace: 'nowrap',
          opacity: expanded ? 1 : 0, transition: 'opacity var(--dur-fast)',
        }}>One Step Ahead</span>
      </div>

      {/* ── Phosphor screen — inset telemetry well with nav lines ── */}
      <div style={{
        flex: 1,
        background: 'var(--crt-bg)',
        backgroundImage: SCANLINES,
        borderRadius: 'var(--r-tight)',
        boxShadow: 'var(--screen-inset-shadow)',
        padding: '10px 6px',
        display: 'flex', flexDirection: 'column', gap: 2,
        overflow: 'hidden', position: 'relative',
      }}>
        {/* Stamped screen header */}
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10,
          color: 'var(--crt-dim)', letterSpacing: 'var(--ls-label)',
          textTransform: 'uppercase',
          marginBottom: 6, paddingBottom: 6, paddingLeft: 4,
          borderBottom: '1px solid rgba(255, 176, 32, 0.14)',
          whiteSpace: 'nowrap', overflow: 'hidden',
        }}>
          {expanded ? '[ LOOP BUREAU ]' : '[ · ]'}
        </div>

        {items.map((it) => {
          const on = it.id === active;
          return (
            <button
              key={it.id}
              onClick={() => onNavigate && onNavigate(it.id)}
              title={!expanded ? it.label : undefined}
              aria-current={on ? 'page' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                height: 36, padding: '0 6px', width: '100%',
                border: 'none', cursor: 'pointer',
                borderRadius: 'var(--r-tight)',
                background: on ? 'var(--crt-row)' : 'transparent',
                boxShadow: on ? 'inset 0 0 10px 0 rgba(255,176,32,0.10)' : 'none',
                color: on ? 'var(--crt-hi)' : 'var(--crt-dim)',
                textAlign: 'left',
                transition: 'color var(--dur-fast), background var(--dur-fast)',
              }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.color = 'var(--amber)'; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.color = 'var(--crt-dim)'; }}
            >
              {/* Terminal cursor marks the live line */}
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: on ? 'var(--crt-hi)' : 'transparent',
                flex: 'none', width: 10, lineHeight: 1,
              }}>{'>'}</span>
              <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 22 }}>
                <Icon name={it.icon} size={19} strokeWidth={on ? 2.3 : 1.9} />
              </span>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                whiteSpace: 'nowrap', lineHeight: 1,
                opacity: expanded ? 1 : 0, transition: 'opacity var(--dur-fast)',
              }}>{it.label}</span>
            </button>
          );
        })}

        {/* Phosphor vignette — corners fall off like a tube, no flicker */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          borderRadius: 'var(--r-tight)',
          background: 'radial-gradient(ellipse at 50% 45%, transparent 60%, rgba(0,0,0,0.45) 100%)',
        }} />
      </div>

      {/* ── Operative file — avatar + profile ── */}
      <button
        onClick={() => onNavigate && onNavigate('profile')}
        aria-current={active === 'profile' ? 'page' : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 52, padding: '0 4px', width: '100%',
          border: 'none', background: 'transparent', cursor: 'pointer',
          borderTop: '1px solid var(--hairline-paper)',
          overflow: 'hidden',
        }}
      >
        <span style={{ flex: 'none', display: 'grid', placeItems: 'center' }}>
          {avatar || <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ink-600)' }} />}
        </span>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
          letterSpacing: 'var(--ls-label)', textTransform: 'uppercase',
          color: 'var(--bone-dim)', whiteSpace: 'nowrap',
          opacity: expanded ? 1 : 0, transition: 'opacity var(--dur-fast)',
        }}>Operative file</span>
      </button>
    </nav>
  );
}

export default Sidebar;
