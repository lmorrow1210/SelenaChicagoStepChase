const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   BingoScreen — 5×5 weekly habit bingo card.
   ============================================================ */

const TASKS = [
  ['10k steps','step'], ['Morning walk','workout'], ['8h sleep','sleep'], ['Hit target','flame'], ['Log a workout','workout'],
  ['Beat nemesis','nemesis'], ['Sync before noon','sync'], ['Walk a landmark','city'], ['Streak day','flame'], ['7am steps','clock'],
  ['Stairs','step'], ['Group chat','heart'], ['FREE','star'], ['New PR','trophy'], ['Lunch walk','workout'],
  ['Predict steps','prediction'], ['Heart zone','heart'], ['Evening walk','workout'], ['Unlock badge','badge'], ['12k steps','step'],
  ['Weekend hike','map'], ['Early bird','clock'], ['Double target','flame'], ['No-zero day','step'], ['Close the ring','globe'],
];

// mixed states; winning middle row highlighted
const STATES = [
  'complete','incomplete','progress','complete','incomplete',
  'incomplete','complete','incomplete','progress','incomplete',
  'win','win','free','win','win',
  'progress','incomplete','complete','incomplete','complete',
  'complete','incomplete','progress','incomplete','complete',
];

function BingoScreen() {
  const done = STATES.filter(s => s === 'complete' || s === 'win' || s === 'free').length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
      <DS.Card variant="elevated" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)' }}>Week 14 · Tokyo</span>
          <h2 style={{ margin: '4px 0 0', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, textTransform: 'uppercase', color: 'var(--cream)' }}>Habit Bingo</h2>
        </div>
        <DS.Badge tone="gold" icon="check" solid>1 line — bonus unlocked!</DS.Badge>
        <DS.StatCard icon="badge" label="Squares" value={`${done}/25`} accent="var(--gold)" />
      </DS.Card>

      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {STATES.map((s, i) => (
            <DS.BingoTile key={i} label={TASKS[i][0]} icon={TASKS[i][1]}
              state={s === 'win' ? 'complete' : s} highlight={s === 'win'} />
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BingoScreen });
