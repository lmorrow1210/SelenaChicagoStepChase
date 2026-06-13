const React = window.React;

/* ============================================================
   Sidebar v2 — Vintage spy terminal.
   Warm putty plastic outer casing with bevel chrome.
   CRT phosphor screen inside. Colorful Carmen-style action
   buttons below the screen. Collapsed: 72px. Expanded: 220px.
   ============================================================ */

const NAV = [
  { id: 'map',        label: 'Map',        icon: 'map',        color: '#41B6E6', textDark: false },
  { id: 'prediction', label: 'Prediction', icon: 'prediction', color: '#C8A040', textDark: true  },
  { id: 'city',       label: 'City',       icon: 'city',       color: '#4A8A3A', textDark: false },
  { id: 'bingo',      label: 'Bingo',      icon: 'bingo',      color: '#4A6898', textDark: false },
  { id: 'nemesis',    label: 'Nemesis',    icon: 'nemesis',    color: '#8B3A2A', textDark: false },
];

/* CRT scanlines — subtle horizontal line overlay */
const CRT_SCANLINES = 'repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0,0,0,0.22) 1px, rgba(0,0,0,0.22) 2px)';

export function Sidebar({ active = 'map', onNavigate, avatar, items = NAV, forceExpanded = false }) {
  const { Icon } = window.DesignSystem_19034b;
  const [hover, setHover] = React.useState(false);
  const expanded = forceExpanded || hover;

  /* Putty casing bevel */
  const casingBevel = 'var(--casing-hi) var(--casing-lo) var(--casing-lo) var(--casing-hi)';
  const casingInset = 'var(--casing-lo) var(--casing-hi) var(--casing-hi) var(--casing-lo)';

  return (
    <nav
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: expanded ? 220 : 72,
        height: '100%', flex: 'none',
        /* Warm putty plastic outer casing */
        background: 'var(--casing)',
        border: '3px solid',
        borderColor: casingBevel,
        display: 'flex', flexDirection: 'column',
        padding: 10, gap: 8,
        transition: 'width var(--dur-base) var(--ease-out)',
        overflow: 'hidden',
        zIndex: 'var(--z-nav)',
      }}
    >
      {/* ── Brand nameplate — recessed into casing ── */}
      <div style={{
        background: 'var(--casing-mid)',
        border: '2px solid',
        borderColor: casingInset,
        padding: '4px 8px',
        display: 'flex', alignItems: 'center', gap: 8,
        minHeight: 28, overflow: 'hidden', flex: 'none',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 9,
          color: '#3A2810', letterSpacing: '0.04em',
          flex: 'none', lineHeight: 1.4,
        }}>S</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 8,
          color: '#3A2810', letterSpacing: '0.02em',
          whiteSpace: 'nowrap', overflow: 'hidden',
          lineHeight: 1.4,
          opacity: expanded ? 1 : 0,
          transition: 'opacity var(--dur-fast)',
        }}>SELENA'S CHASE</span>
      </div>

      {/* ── CRT Phosphor Screen ── */}
      <div style={{
        flex: 1,
        background: 'var(--crt-bg)',
        backgroundImage: CRT_SCANLINES,
        border: '3px solid',
        /* Deeply inset — the screen sits inside the plastic */
        borderColor: 'var(--casing-lo) var(--casing-hi) var(--casing-hi) var(--casing-lo)',
        padding: '8px 6px',
        display: 'flex', flexDirection: 'column',
        gap: 1, overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Screen header line */}
        {expanded && (
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 7,
            color: 'var(--crt-dim)', letterSpacing: '0.05em',
            marginBottom: 5, paddingBottom: 4,
            borderBottom: '1px solid #1A4A1A',
            whiteSpace: 'nowrap',
          }}>
            TRACKER CONSOLE
          </div>
        )}

        {/* Nav items — terminal readout lines */}
        {items.map((it) => {
          const on = it.id === active;
          return (
            <button
              key={it.id}
              onClick={() => onNavigate && onNavigate(it.id)}
              title={!expanded ? it.label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 30, padding: '0 4px',
                border: 'none', cursor: 'pointer', width: '100%',
                background: on ? 'var(--crt-row)' : 'transparent',
                color: on ? 'var(--crt-hi)' : 'var(--crt-dim)',
                textAlign: 'left',
                transition: 'color var(--dur-fast)',
              }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.color = '#2ABF2A'; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.color = 'var(--crt-dim)'; }}
            >
              {/* Terminal ">" cursor */}
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 8,
                color: on ? 'var(--crt-hi)' : 'transparent',
                flex: 'none', width: 10, lineHeight: 1,
              }}>{'>'}</span>
              {/* Icon */}
              <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 20 }}>
                <Icon name={it.icon} size={18} strokeWidth={on ? 2.2 : 1.8} />
              </span>
              {/* Label — only visible when expanded */}
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 8,
                letterSpacing: '0.03em', textTransform: 'uppercase',
                whiteSpace: 'nowrap', lineHeight: 1,
                opacity: expanded ? 1 : 0,
                transition: 'opacity var(--dur-fast)',
              }}>{it.label}</span>
            </button>
          );
        })}

        {/* CRT vignette — darkens edges like a real CRT tube */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)',
        }} />
      </div>

      {/* ── Action buttons — Carmen Sandiego colorful squares ── */}
      <div style={{
        display: 'flex',
        flexDirection: expanded ? 'row' : 'column',
        gap: 4,
        alignItems: 'center',
        justifyContent: expanded ? 'flex-start' : 'center',
      }}>
        {items.map((it) => {
          const on = it.id === active;
          return (
            <button
              key={`btn-${it.id}`}
              onClick={() => onNavigate && onNavigate(it.id)}
              title={it.label}
              style={{
                width:  expanded ? 34 : 48,
                height: expanded ? 26 : 36,
                background: it.color,
                border: '2px solid',
                /* Bevel: active = pressed in, inactive = raised */
                borderColor: on
                  ? '#606060 #D0D0D0 #D0D0D0 #606060'
                  : '#D0D0D0 #606060 #606060 #D0D0D0',
                display: 'grid', placeItems: 'center',
                cursor: 'pointer', flex: 'none', padding: 0,
                opacity: on ? 1 : 0.7,
                transition: 'opacity var(--dur-fast), border-color var(--dur-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = on ? '1' : '0.7'; }}
            >
              <Icon
                name={it.icon}
                size={expanded ? 13 : 20}
                strokeWidth={2}
                color={it.textDark ? '#3A2810' : '#FFFFFF'}
              />
            </button>
          );
        })}
      </div>

      {/* ── Avatar / tracker ID ── */}
      {avatar && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          paddingTop: 6,
          borderTop: '1px solid var(--casing-mid)',
          overflow: 'hidden',
        }}>
          <div style={{
            border: '2px solid',
            borderColor: casingBevel,
            flex: 'none',
          }}>
            {avatar}
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 8,
            color: '#3A2810', letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
            opacity: expanded ? 1 : 0,
            transition: 'opacity var(--dur-fast)',
          }}>TRACKER</span>
        </div>
      )}
    </nav>
  );
}
