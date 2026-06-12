const React = window.React;

/* ============================================================
   Toast — slim bar at top of screen.
   Types: achievement (gold), social (blue), alert (red).
   ============================================================ */

const TYPES = {
  achievement: { accent: 'var(--gold)', icon: 'badge' },
  social:      { accent: 'var(--blue)', icon: 'nemesis' },
  alert:       { accent: 'var(--red)',  icon: 'sync' },
};

export function Toast({ type = 'social', title, message, icon, onClose, style }) {
  const { Icon } = window.DesignSystem_19034b;
  const t = TYPES[type] || TYPES.social;
  return (
    <div
      role="status"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', maxWidth: 460,
        background: 'var(--card-elevated)',
        borderRadius: 'var(--r-card)',
        borderLeft: `4px solid ${t.accent}`,
        boxShadow: 'var(--shadow-elevated)',
        padding: '12px 14px',
        ...style,
      }}
    >
      <span style={{
        display: 'grid', placeItems: 'center', width: 32, height: 32, flex: 'none',
        borderRadius: '50%', background: 'transparent', color: t.accent,
      }}>
        <Icon name={icon || t.icon} size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--cream)' }}>{title}</div>}
        {message && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', marginTop: 1 }}>{message}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss" style={{
          background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)',
          display: 'grid', placeItems: 'center', padding: 4, borderRadius: 6,
        }}>
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}
