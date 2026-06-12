const React = window.React;

/* ============================================================
   ProgressStrip — straight-line leaderboard.
   City A (left) → City B (right) connected by a line.
   Each player avatar sits at proportional position (0–100%).
   States: default (in progress), end (someone at 100%), empty.
   ============================================================ */

function CityNode({ name, side, reached }) {
  const { Icon } = window.DesignSystem_19034b;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 'none',
      width: 64,
    }}>
      <div style={{
        display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: '50%',
        background: 'var(--card-elevated)',
        border: `2px solid ${reached ? 'var(--gold)' : side === 'left' ? 'var(--blue)' : 'var(--muted)'}`,
        color: reached ? 'var(--gold)' : side === 'left' ? 'var(--blue)' : 'var(--muted)',
        boxShadow: reached ? 'var(--glow-gold)' : 'none',
      }}>
        <Icon name="city" size={22} />
      </div>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, textTransform: 'uppercase',
        color: 'var(--cream)', letterSpacing: '0.01em', whiteSpace: 'nowrap',
      }}>{name}</span>
    </div>
  );
}

export function ProgressStrip({
  from = 'Chicago',
  to = 'Tokyo',
  players = [],          // [{ id, name, pct, colorway, leader }]
  state = 'default',     // 'default' | 'end' | 'empty'
  compact = false,
  style,
}) {
  const { Avatar, Icon } = window.DesignSystem_19034b;
  const avSize = compact ? 28 : 40;

  if (state === 'empty') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '20px 18px',
        background: 'var(--card)', border: '1px dashed var(--hairline)', borderRadius: 'var(--r-card)', ...style,
      }}>
        <CityNode name={from} side="left" />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'repeating-linear-gradient(90deg, var(--hairline) 0 8px, transparent 8px 16px)' }} />
        <CityNode name={to} side="right" />
        <div style={{ position: 'absolute' }} />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: compact ? '14px 12px' : '22px 18px',
      background: 'var(--card)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-card)', ...style,
    }}>
      <CityNode name={from} side="left" />
      <div style={{ position: 'relative', flex: 1, height: avSize + 12 }}>
        {/* track */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0, height: 4, borderRadius: 2,
          transform: 'translateY(-50%)',
          background: 'var(--hairline)',
        }} />
        {/* progress fill to furthest player */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, height: 4, borderRadius: 2,
          transform: 'translateY(-50%)',
          width: `${Math.max(0, ...players.map(p => p.pct))}%`,
          background: state === 'end' ? 'var(--gold)' : 'var(--blue)',
          boxShadow: state === 'end' ? 'var(--glow-gold)' : 'none',
          transition: 'width var(--dur-hop) var(--ease-spring)',
        }} />
        {/* avatars */}
        {players.map((p, i) => (
          <div key={p.id || i} style={{
            position: 'absolute', top: '50%', left: `${Math.min(100, Math.max(0, p.pct))}%`,
            transform: 'translate(-50%, -50%)', zIndex: p.leader ? 3 : 2,
            transition: 'left var(--dur-hop) var(--ease-spring)',
          }}>
            <Avatar
              size={avSize}
              colorway={p.colorway || 'chicago'}
              ring={p.leader ? 'var(--gold)' : 'var(--navy)'}
              badge={p.pct >= 100 ? (
                <span style={{ display: 'grid', placeItems: 'center', width: avSize * 0.5, height: avSize * 0.5, borderRadius: '50%', background: 'var(--gold)', color: 'var(--navy)' }}>
                  <Icon name="crown" size={avSize * 0.32} />
                </span>
              ) : undefined}
            />
          </div>
        ))}
      </div>
      <CityNode name={to} side="right" reached={state === 'end'} />
    </div>
  );
}
