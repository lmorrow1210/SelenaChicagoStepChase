const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   CityScreen — landmark grid (3 / 2 / 2) + city header + badges.
   ============================================================ */

const LANDMARKS = [
  { name: 'Senso-ji', fact: "Tokyo's oldest temple, founded 645 AD.", state: 'unlocked', color: 'var(--map-land-warm)', icon: 'city' },
  { name: 'Tokyo Tower', fact: 'Taller than the Eiffel Tower it was modeled on.', state: 'unlocked', color: 'var(--red)', icon: 'city' },
  { name: "Today's landmark", state: 'today', icon: 'star' },
  { name: 'Shibuya', fact: 'The busiest pedestrian crossing on Earth.', state: 'unlocked', color: 'var(--map-land-teal)', icon: 'map' },
  { state: 'locked' },
  { name: 'Meiji Shrine', fact: '100,000 trees donated from across Japan.', state: 'unlocked', color: 'var(--map-land-sage)', icon: 'globe' },
  { state: 'locked' },
];

function CityScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <DS.Card variant="elevated" style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <DS.CityBadge name="Tokyo" quality="gold" size={80} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)' }}>City 4 of 12 · Unlocked</span>
          <h2 style={{ margin: '4px 0 6px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40, textTransform: 'uppercase', color: 'var(--cream)', lineHeight: 1 }}>Tokyo</h2>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--muted)' }}>4 of 7 landmarks discovered. Walk to reveal the rest before Selena flees to Sydney.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <DS.StatCard icon="badge" label="Landmarks" value="4/7" accent="var(--gold)" />
        </div>
      </DS.Card>

      <div>
        <h3 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, textTransform: 'uppercase', color: 'var(--cream)' }}>Landmarks</h3>
        <div className="sc-landmark-grid">
          {LANDMARKS.map((l, i) => (
            <DS.LandmarkTile key={i} {...l} />
          ))}
        </div>
      </div>
      <style>{`
        .sc-landmark-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .sc-landmark-grid > *:nth-child(4), .sc-landmark-grid > *:nth-child(5) { grid-column: span 1; }
        @media (max-width: 720px){ .sc-landmark-grid{ grid-template-columns:repeat(2,1fr);} }
      `}</style>
    </div>
  );
}

Object.assign(window, { CityScreen });
