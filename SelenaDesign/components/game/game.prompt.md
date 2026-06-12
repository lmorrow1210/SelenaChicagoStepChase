The game group — the gameplay primitives unique to Selena's Chase.

```jsx
<Avatar size={40} colorway="chicago" />
<ProgressStrip from="Chicago" to="Tokyo" players={[{id:'a',pct:61,colorway:'emerald',leader:true}]} />
<CityBadge name="Tokyo" quality="gold" />
<LandmarkTile name="Senso-ji" fact="Tokyo's oldest temple." state="unlocked" color="var(--map-land-warm)" />
<BingoTile label="10k steps" icon="step" state="complete" />
<SkyscraperPair you={{label:'You',steps:9200}} nemesis={{label:'Selena',steps:6400}} animate />
<PredictionCard city="Tokyo" value={v} onChange={fn} onSubmit={fn} />
<MapPin variant="current" label="Chicago" />
```

`Avatar` is the trench-coat figure (6 colorways, sizes 24/40/120). `ProgressStrip` is the straight-line leaderboard. `CityBadge` is the circular collectible (bronze/silver/gold + locked). `LandmarkTile` powers the City screen grid (locked/unlocked/today). `BingoTile` builds the 5×5 card. `SkyscraperPair` is the Nemesis duel. `PredictionCard` is the globe-backed prediction surface. `MapPin` marks cities on the world map.
