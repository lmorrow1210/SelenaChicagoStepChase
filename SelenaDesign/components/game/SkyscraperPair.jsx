const React = window.React;

/* ============================================================
   SkyscraperPair — Nemesis duel. Building height = steps.
   Left = you, right = nemesis. Taller gets a gold crown.
   Outcomes: you / nemesis / tie / progress (animates up).
   ============================================================ */

function Tower({ side, label, pct, win, color, animate }) {
  const { Icon } = window.DesignSystem_19034b;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
      {win && (
        <span style={{ color: 'var(--gold)', filter: 'drop-shadow(var(--glow-gold))' }}>
          <Icon name="crown" size={26} />
        </span>
      )}
      {!win && <span style={{ height: 26 }} />}
      <div style={{ position: 'relative', width: '100%', maxWidth: 88, height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{
          width: '100%',
          height: `${Math.max(8, Math.min(100, pct))}%`,
          background: color,
          border: `2px solid ${win ? 'var(--gold)' : 'color-mix(in srgb, ' + color + ' 70%, var(--navy))'}`,
          borderRadius: '4px 4px 0 0',
          boxShadow: win ? 'var(--glow-gold)' : 'none',
          transformOrigin: 'bottom',
          animation: animate ? `sc-bounce-up var(--dur-skyline) var(--ease-spring) both` : 'none',
          position: 'relative',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center',
          paddingTop: 8, gap: 6, overflow: 'hidden',
        }}>
          {/* windows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 8, height: 8, background: 'var(--gold)', opacity: 0.55, borderRadius: 1 }} />
              <span style={{ width: 8, height: 8, background: 'var(--gold)', opacity: 0.35, borderRadius: 1 }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', color: 'var(--cream)' }}>{label}</div>
      </div>
      <style>{`@keyframes sc-bounce-up{0%{height:0}70%{height:calc(${Math.max(8, Math.min(100, pct))}% + 10px)}100%{height:${Math.max(8, Math.min(100, pct))}%}}`}</style>
    </div>
  );
}

export function SkyscraperPair({
  you = { label: 'You', steps: 8200, colorway: 'chicago' },
  nemesis = { label: 'Nemesis', steps: 7400 },
  outcome,             // 'you' | 'nemesis' | 'tie' | 'progress' (auto if omitted)
  animate = false,
  style,
}) {
  const max = Math.max(you.steps, nemesis.steps, 1);
  const youPct = (you.steps / max) * 100;
  const nemPct = (nemesis.steps / max) * 100;
  const result = outcome || (you.steps === nemesis.steps ? 'tie' : you.steps > nemesis.steps ? 'you' : 'nemesis');

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 18, padding: '18px 20px',
      background: 'var(--card)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-card)', ...style,
    }}>
      <Tower side="you" label={you.label} pct={youPct}
        win={result === 'you' || result === 'tie'} color="var(--blue)" animate={animate} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 90, color: 'var(--muted)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>VS</span>
      </div>
      <Tower side="nemesis" label={nemesis.label} pct={nemPct}
        win={result === 'nemesis' || result === 'tie'} color="var(--red)" animate={animate} />
    </div>
  );
}
