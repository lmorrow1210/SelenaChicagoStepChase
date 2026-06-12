const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   MapScreen — illustrated world map + group progress + leaderboard.
   ============================================================ */

const PLAYERS = [
  { id: 'm', name: 'Maya',  steps: 61240, pct: 78, colorway: 'emerald', leader: true },
  { id: 'y', name: 'You',   steps: 54880, pct: 70, colorway: 'chicago' },
  { id: 'a', name: 'Alex',  steps: 49120, pct: 63, colorway: 'desert' },
  { id: 'j', name: 'Jordan', steps: 38400, pct: 49, colorway: 'violet' },
];

function MapScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <window.WorldMap />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <DS.StatCard icon="step" label="Group steps" value="203,640" />
        <DS.StatCard icon="globe" label="Cities unlocked" value="4" accent="var(--gold)" />
        <DS.StatCard icon="flame" label="Gap to Selena" value="12k" unit="steps" accent="var(--red)" />
      </div>

      <DS.ProgressStrip from="Chicago" to="Tokyo" players={PLAYERS} />

      <DS.Card padding="0">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--hairline)' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, textTransform: 'uppercase', color: 'var(--cream)' }}>Leaderboard</h2>
          <DS.Badge tone="muted">This week</DS.Badge>
        </div>
        <div>
          {PLAYERS.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px',
              borderBottom: i < PLAYERS.length - 1 ? '1px solid var(--hairline)' : 'none',
              background: p.name === 'You' ? 'var(--blue-08)' : 'transparent',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--muted)', width: 22 }}>{i + 1}</span>
              <DS.Avatar size={36} colorway={p.colorway} ring={p.leader ? 'var(--gold)' : undefined}
                badge={p.leader ? <span style={{ display: 'grid', placeItems: 'center', width: 18, height: 18, borderRadius: '50%', background: 'var(--gold)', color: 'var(--navy)' }}><DS.Icon name="crown" size={11} /></span> : undefined} />
              <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: p.name === 'You' ? 700 : 500, fontSize: 15, color: 'var(--cream)' }}>{p.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: p.name === 'You' ? 'var(--blue)' : 'var(--cream)' }}>{p.steps.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </DS.Card>
    </div>
  );
}

Object.assign(window, { MapScreen });
