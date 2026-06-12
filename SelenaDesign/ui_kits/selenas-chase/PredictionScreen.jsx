const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   PredictionScreen — make a weekly prediction + see the group's.
   ============================================================ */

const GUESSES = [
  { id: 'm', name: 'Maya', colorway: 'emerald', val: 51000 },
  { id: 'a', name: 'Alex', colorway: 'desert', val: 47500 },
  { id: 'j', name: 'Jordan', colorway: 'violet', val: 44000 },
];

function PredictionScreen() {
  const [value, setValue] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 22, alignItems: 'start' }} className="sc-pred-grid">
      <DS.PredictionCard
        city="Tokyo"
        value={value}
        prediction={value || '48,500'}
        onChange={(e) => setValue(e.target.value)}
        onSubmit={() => setSubmitted(true)}
        submitted={submitted}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <DS.Card>
          <h3 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, textTransform: 'uppercase', color: 'var(--cream)' }}>Group guesses</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {GUESSES.map((g) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <DS.Avatar size={28} colorway={g.colorway} />
                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14, color: 'var(--cream)' }}>{g.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--blue)' }}>{g.val.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </DS.Card>
        <DS.StatCard icon="trophy" label="Closest last week" value="Maya" accent="var(--gold)" />
      </div>
      <style>{`@media (max-width: 760px){ .sc-pred-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

Object.assign(window, { PredictionScreen });
