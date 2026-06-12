const React = window.React;

/* ============================================================
   StatCard — compact icon + label + value. Leaderboard / profile.
   ============================================================ */

export function StatCard({
  icon,
  label,
  value,
  unit,
  accent = 'var(--blue)',
  style,
}) {
  const { Icon } = window.DesignSystem_19034b;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      background: 'var(--card)', border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-card)', padding: '16px 18px', minWidth: 120,
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && (
          <span style={{
            display: 'grid', placeItems: 'center', width: 28, height: 28,
            borderRadius: 'var(--r-tight)', background: 'var(--blue-12)', color: accent,
          }}>
            <Icon name={icon} size={18} />
          </span>
        )}
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)',
        }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 500, color: 'var(--cream)', lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)' }}>{unit}</span>}
      </div>
    </div>
  );
}
