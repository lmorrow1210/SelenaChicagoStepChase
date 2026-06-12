const React = window.React;

/* ============================================================
   BingoTile — square tile for the 5×5 card.
   States: incomplete, progress, complete, free.
   ============================================================ */

export function BingoTile({
  label = '10k steps',
  icon = 'step',
  state = 'incomplete',  // 'incomplete' | 'progress' | 'complete' | 'free'
  highlight = false,     // part of an animated winning line
  style,
}) {
  const { Icon } = window.DesignSystem_19034b;
  const free = state === 'free';
  const complete = state === 'complete' || free;
  const progress = state === 'progress';

  const border =
    progress ? 'var(--blue)' :
    complete ? 'var(--blue-40)' : 'var(--hairline)';

  const bg =
    free ? 'var(--blue-20)' :
    complete ? 'var(--blue-20)' :
    'var(--card)';

  const fg =
    complete || progress ? 'var(--blue)' : 'var(--muted)';

  return (
    <div style={{
      position: 'relative', aspectRatio: '1', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center',
      padding: 8, borderRadius: 'var(--r-card)',
      background: bg,
      border: `1.5px solid ${border}`,
      boxShadow: (progress || highlight) ? 'var(--glow-blue)' : 'none',
      animation: highlight ? 'sc-pulse-blue 0.9s var(--ease-in-out) infinite' : 'none',
      transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base)',
      ...style,
    }}>
      {complete && !free && (
        <span style={{
          position: 'absolute', top: 5, right: 5, display: 'grid', placeItems: 'center',
          width: 16, height: 16, borderRadius: '50%', background: 'var(--blue)', color: 'var(--navy)',
        }}>
          <Icon name="check" size={11} strokeWidth={3} />
        </span>
      )}
      <Icon name={free ? 'star' : icon} size={26} strokeWidth={2} color={fg} />
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: complete ? 600 : 500,
        lineHeight: 1.2, color: complete || progress ? 'var(--cream)' : 'var(--muted)',
      }}>{free ? 'FREE' : label}</span>
    </div>
  );
}
