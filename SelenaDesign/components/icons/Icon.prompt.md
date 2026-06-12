Renders a single icon from the Selena's Chase set (24px grid, 2px stroke, rounded caps); use anywhere you need a nav, stat, or UI glyph.

```jsx
<Icon name="map" size={24} />
<Icon name="crown" color="var(--gold)" />
<Icon name="step" size={20} style={{ color: 'var(--blue)' }} />
```

Names: nav (map, prediction, city, bingo, nemesis); stats (step, workout, sleep, heart, badge, settings, sync, crown, star); UI (lock, check, close, chevronRight, flame, clock, globe, trophy). Color inherits `currentColor` — set `color` on a parent or pass `color`. Default --cream; use --blue for active.
