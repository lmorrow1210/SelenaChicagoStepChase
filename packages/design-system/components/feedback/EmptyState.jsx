import * as React from 'react';
import Icon from '../icons/Icon.jsx';

/* ============================================================
   EmptyState — illustration/icon + headline + body + CTA.
   Encouraging, on-brand. Not clinical.
   ============================================================ */

export function EmptyState({ icon = 'globe', title, body, action, accent = 'var(--blue)', style }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      gap: 14, padding: '40px 28px', maxWidth: 380, margin: '0 auto', ...style,
    }}>
      <div style={{
        display: 'grid', placeItems: 'center', width: 72, height: 72, borderRadius: '50%',
        background: 'var(--card)', border: `1.5px dashed ${accent}`, color: accent,
      }}>
        <Icon name={icon} size={34} strokeWidth={1.8} />
      </div>
      {title && <h3 style={{
        margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
        textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--cream)',
      }}>{title}</h3>}
      {body && <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.5, color: 'var(--muted)' }}>{body}</p>}
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}

export default EmptyState;
