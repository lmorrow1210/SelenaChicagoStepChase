const React = window.React;

/* ============================================================
   Skeleton — pulsing loading placeholder.
   Presets: leaderboard row, landmark grid, bingo card.
   ============================================================ */

function Block({ w = '100%', h = 16, r = 'var(--r-tight)', style }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'var(--skeleton)',
      animation: 'sc-skeleton 1.2s var(--ease-in-out) infinite',
      ...style,
    }} />
  );
}

export function Skeleton({ preset = 'leaderboard', rows = 4, style }) {
  if (preset === 'landmark') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, ...style }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Block key={i} w="100%" h={120} r="var(--r-card)" style={{ animationDelay: `${i * 90}ms` }} />
        ))}
      </div>
    );
  }
  if (preset === 'bingo') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, ...style }}>
        {Array.from({ length: 25 }).map((_, i) => (
          <Block key={i} w="100%" h={56} r="var(--r-card)" style={{ aspectRatio: '1', height: 'auto', animationDelay: `${i * 35}ms` }} />
        ))}
      </div>
    );
  }
  if (preset === 'block') {
    return <Block style={style} {...{}} />;
  }
  // leaderboard
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--card)', borderRadius: 'var(--r-card)', border: '1px solid var(--hairline)' }}>
          <Block w={28} h={28} r="50%" style={{ animationDelay: `${i * 90}ms` }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Block w="40%" h={12} style={{ animationDelay: `${i * 90}ms` }} />
            <Block w="65%" h={10} style={{ animationDelay: `${i * 90 + 40}ms` }} />
          </div>
          <Block w={60} h={16} style={{ animationDelay: `${i * 90}ms` }} />
        </div>
      ))}
    </div>
  );
}

Skeleton.Block = Block;
