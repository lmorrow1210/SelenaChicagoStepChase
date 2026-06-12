Core surfaces and chips: `Card`, `StatCard`, `Badge`, `CountdownPill` (plus `Button`).

```jsx
<Card variant="elevated" glow="gold">…</Card>
<StatCard icon="step" label="Steps" value="48,512" unit="this wk" />
<Badge tone="gold" icon="badge" solid>Gold</Badge>
<CountdownPill hoursLeft={9} />   {/* turns red ≤24h, gold ≤48h */}
```

Use `Card` for any panel (default vs elevated modal surface; optional achievement `glow`). `StatCard` is the compact icon+label+mono-value tile. `Badge` covers status chips and badge qualities (bronze/silver/gold). `CountdownPill` color-shifts with deadline urgency.
