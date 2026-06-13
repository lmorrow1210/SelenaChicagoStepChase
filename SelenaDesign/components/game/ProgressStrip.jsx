const React = window.React;

/* ============================================================
   ProgressStrip v2 — Vintage detective trail tracker.
   Carmen Sandiego-style route panel.
   Left city → right city. Player tokens on inset channel.
   ============================================================ */

function CityNode({ name, side, reached }) {
  const { Icon } = window.DesignSystem_19034b;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      width: 70, flex: 'none',
    }}>
      <div style={{
        display: 'grid', placeItems: 'center',
        width: 46, height: 46,
        background: reached ? 'var(--mahogany)' : 'var(--tobacco)',
        border: '2px solid',
        borderColor: reached
          ? 'var(--gold-light) var(--gold) var(--gold) var(--gold-light)'
          : 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)',
        color: reached ? 'var(--gold)' : (side === 'left' ? 'var(--selena)' : 'var(--linen)'),
      }}>
        <Icon name="city" size={22} />
      </div>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 8,
        textTransform: 'uppercase',
        color: reached ? 'var(--gold)' : 'var(--parchment)',
        letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.5,
        maxWidth: 70, wordBreak: 'break-all',
      }}>{name}</span>
    </div>
  );
}

export function ProgressStrip({
  from = 'Chicago',
  to = 'Tokyo',
  players = [],
  state = 'default',   // 'default' | 'end' | 'empty'
  compact = false,
  style,
}) {
  const { Avatar } = window.DesignSystem_19034b;
  const avSize = compact ? 26 : 34;
  const maxPct = players.length ? Math.max(0, ...players.map(p => p.pct)) : 0;

  return (
    <div style={{
      background: 'var(--felt)',
      border: '2px solid',
      borderColor: 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)',
      padding: compact ? '10px 12px' : '14px 16px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
      ...style,
    }}>
      {/* Dossier-style header label */}
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 8,
        color: 'var(--dust)', letterSpacing: '0.05em',
        borderBottom: '1px solid var(--walnut)', paddingBottom: 8,
      }}>
        Trail: {from} → {to}
      </div>

      {/* Track row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <CityNode name={from} side="left" />

        <div style={{ position: 'relative', flex: 1, height: avSize + 20 }}>
          {/* Inset channel */}
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0,
            height: 10, transform: 'translateY(-50%)',
            background: 'var(--tobacco)',
            border: '2px solid',
            borderColor: 'var(--bevel-lo) var(--bevel-hi) var(--bevel-hi) var(--bevel-lo)',
            overflow: 'hidden',
          }}>
            {state === 'empty' ? (
              <div style={{
                height: '100%',
                background: 'repeating-linear-gradient(90deg, var(--walnut) 0 5px, transparent 5px 10px)',
              }} />
            ) : (
              <div style={{
                height: '100%',
                width: `${maxPct}%`,
                background: state === 'end' ? 'var(--gold)' : 'var(--selena)',
                transition: 'width var(--dur-hop) var(--ease-spring)',
              }} />
            )}
          </div>

          {/* Player tokens */}
          {state !== 'empty' && players.map((p, i) => (
            <div key={p.id || i} style={{
              position: 'absolute', top: '50%',
              left: `${Math.min(100, Math.max(0, p.pct))}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: p.leader ? 3 : 2,
              transition: 'left var(--dur-hop) var(--ease-spring)',
            }}>
              <div style={{
                border: '2px solid',
                borderColor: p.leader
                  ? 'var(--gold-light) var(--gold) var(--gold) var(--gold-light)'
                  : 'var(--bevel-hi) var(--bevel-lo) var(--bevel-lo) var(--bevel-hi)',
              }}>
                <Avatar
                  size={avSize}
                  colorway={p.colorway || 'chicago'}
                  ring={p.leader ? 'var(--gold)' : 'var(--walnut)'}
                />
              </div>
            </div>
          ))}
        </div>

        <CityNode name={to} side="right" reached={state === 'end'} />
      </div>

      {/* End state: caught-up message */}
      {state === 'end' && (
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 8,
          color: 'var(--gold)', letterSpacing: '0.04em',
          borderTop: '1px solid var(--walnut)', paddingTop: 8,
          textAlign: 'center',
        }}>
          Selena reached!
        </div>
      )}
    </div>
  );
}
