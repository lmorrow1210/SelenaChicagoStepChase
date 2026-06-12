const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   NemesisScreen — head-to-head duel + 5-day skyline.
   ============================================================ */

const DAYS = [
  { d: 'Mon', you: 9200, nem: 7400 },
  { d: 'Tue', you: 6100, nem: 8800 },
  { d: 'Wed', you: 8700, nem: 8700 },
  { d: 'Thu', you: 11200, nem: 9100 },
  { d: 'Fri', you: 4200, nem: 3100, today: true },
];

function MiniDay({ d, you, nem, today }) {
  const max = Math.max(...DAYS.flatMap(x => [x.you, x.nem]));
  const yh = (you / max) * 100, nh = (nem / max) * 100;
  const youWin = you >= nem;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140 }}>
        <div title="You" style={{ width: 16, height: `${Math.max(6, yh)}%`, background: 'var(--blue)', borderRadius: '3px 3px 0 0', border: youWin ? '1.5px solid var(--gold)' : '1.5px solid color-mix(in srgb, var(--blue) 70%, var(--navy))', animation: today ? 'sc-bounce-up 0.6s var(--ease-spring) both' : 'none' }} />
        <div title="Selena" style={{ width: 16, height: `${Math.max(6, nh)}%`, background: 'var(--red)', borderRadius: '3px 3px 0 0', border: !youWin ? '1.5px solid var(--gold)' : '1.5px solid color-mix(in srgb, var(--red) 70%, var(--navy))', animation: today ? 'sc-bounce-up 0.6s var(--ease-spring) both' : 'none' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: today ? 700 : 500, color: today ? 'var(--blue)' : 'var(--muted)' }}>{d}</span>
    </div>
  );
}

function NemesisScreen() {
  const youTotal = DAYS.reduce((s, x) => s + x.you, 0);
  const nemTotal = DAYS.reduce((s, x) => s + x.nem, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <DS.Card variant="elevated" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <DS.Avatar size={64} colorway="chicago" />
          <div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)' }}>You</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--cream)' }}>{youTotal.toLocaleString()}</div>
          </div>
        </div>
        <DS.Badge tone={youTotal >= nemTotal ? 'gold' : 'red'} icon={youTotal >= nemTotal ? 'crown' : 'nemesis'} solid={youTotal >= nemTotal}>
          {youTotal >= nemTotal ? 'You lead' : 'Down 700'}
        </DS.Badge>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexDirection: 'row-reverse' }}>
          <DS.Avatar size={64} colorway="crimson" />
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--red)' }}>Selena</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--cream)' }}>{nemTotal.toLocaleString()}</div>
          </div>
        </div>
      </DS.Card>

      <DS.Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, textTransform: 'uppercase', color: 'var(--cream)' }}>This week's skyline</h3>
          <div style={{ display: 'flex', gap: 14, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: 'var(--blue)', borderRadius: 2 }} />You</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: 'var(--red)', borderRadius: 2 }} />Selena</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
          {DAYS.map((x) => <MiniDay key={x.d} {...x} />)}
        </div>
      </DS.Card>
    </div>
  );
}

Object.assign(window, { NemesisScreen });
