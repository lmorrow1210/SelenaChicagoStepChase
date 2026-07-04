import * as React from 'react';
import { Icon } from '../icons/Icon.jsx';

/* ============================================================
   Badge — small status chip / tag.
   Tones: blue, gold, red, bronze, silver, muted.
   ============================================================ */

const TONES = {
  blue:   { bg: 'var(--blue-12)',  fg: 'var(--blue)',   bd: 'var(--blue-40)' },
  gold:   { bg: 'var(--gold-12)',  fg: 'var(--gold)',   bd: 'var(--gold-20)' },
  red:    { bg: 'var(--red-12)',   fg: 'var(--signal-red)', bd: 'var(--signal-red-20)' },
  bronze: { bg: 'rgba(192,120,48,0.14)', fg: 'var(--bronze)', bd: 'rgba(192,120,48,0.4)' },
  silver: { bg: 'rgba(205,180,136,0.14)', fg: 'var(--silver)', bd: 'rgba(205,180,136,0.4)' },
  muted:  { bg: 'var(--cream-08)', fg: 'var(--muted)',  bd: 'var(--hairline)' },
};

export function Badge({ children, tone = 'blue', icon, solid = false, style }) {
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

export default Badge;
