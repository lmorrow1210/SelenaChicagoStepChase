const React = window.React;

/* ============================================================
   Badge — small status chip / tag.
   Tones: blue, gold, red, bronze, silver, muted.
   ============================================================ */

const TONES = {
  blue:   { bg: 'var(--blue-12)',  fg: 'var(--blue)',   bd: 'var(--blue-40)' },
  gold:   { bg: 'var(--gold-12)',  fg: 'var(--gold)',   bd: 'var(--gold-20)' },
  red:    { bg: 'var(--red-12)',   fg: '#FF6B6B',       bd: 'rgba(204,0,0,0.4)' },
  bronze: { bg: 'rgba(205,127,50,0.14)', fg: 'var(--bronze)', bd: 'rgba(205,127,50,0.4)' },
  silver: { bg: 'rgba(168,169,173,0.14)', fg: 'var(--silver)', bd: 'rgba(168,169,173,0.4)' },
  muted:  { bg: 'var(--cream-08)', fg: 'var(--muted)',  bd: 'var(--hairline)' },
};

export function Badge({ children, tone = 'blue', icon, solid = false, style }) {
  const { Icon } = window.DesignSystem_19034b;
  const t = TONES[tone] || TONES.blue;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      height: 24, padding: '0 10px', borderRadius: 'var(--r-pill)',
      background: solid ? t.fg : t.bg,
      color: solid ? 'var(--navy)' : t.fg,
      border: solid ? 'none' : `1px solid ${t.bd}`,
      fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
      letterSpacing: '0.02em', whiteSpace: 'nowrap',
      ...style,
    }}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}
