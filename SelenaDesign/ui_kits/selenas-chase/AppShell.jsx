const React = window.React;
const DS = window.DesignSystem_19034b;

/* ============================================================
   AppShell — responsive frame. Desktop = sidebar; mobile = tab bar.
   Switches `screen` and renders the matching view.
   ============================================================ */

const TITLES = {
  map: 'World Map', prediction: 'Prediction', city: 'City', bingo: 'Bingo', nemesis: 'Nemesis',
};

function useIsMobile(bp = 900) {
  const [m, setM] = React.useState(typeof window !== 'undefined' && window.innerWidth < bp);
  React.useEffect(() => {
    const onR = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, [bp]);
  return m;
}

function AppShell({ screen, onNavigate, children, countdownHours = 56 }) {
  const { Sidebar, TabBar, Avatar, CountdownPill, Badge } = DS;
  const mobile = useIsMobile();

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', background: 'var(--navy)', overflow: 'hidden' }}>
      {!mobile && (
        <Sidebar active={screen} onNavigate={onNavigate} avatar={<Avatar size={40} colorway="chicago" />} />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: mobile ? '14px 16px' : '18px 28px', flex: 'none',
          borderBottom: '1px solid var(--hairline)', background: 'var(--navy)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{
              margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: mobile ? 24 : 30, textTransform: 'uppercase', letterSpacing: '0.01em', color: 'var(--cream)',
            }}>{TITLES[screen]}</h1>
            {!mobile && <Badge tone="blue" icon="globe">Lakefront Steppers</Badge>}
          </div>
          <CountdownPill hoursLeft={countdownHours} />
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: mobile ? '16px' : '28px', paddingBottom: mobile ? 'calc(var(--tabbar-height) + 24px)' : 28 }}>
          <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
      {mobile && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 200 }}>
          <TabBar active={screen} onNavigate={onNavigate} />
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AppShell });
