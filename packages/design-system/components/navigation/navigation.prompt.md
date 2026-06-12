Navigation group: desktop `Sidebar` and mobile `TabBar`.

```jsx
<Sidebar active="map" onNavigate={setScreen} avatar={<Avatar size={40} />} />
<TabBar active="map" onNavigate={setScreen} />
```

`Sidebar` is 60px collapsed (icons only) and expands to 200px on hover, with the brand mark up top and avatar at the bottom. `TabBar` is the bottom mobile bar with 5 labelled icons, a blue active indicator, and safe-area padding. Both default to the five game screens (Map, Prediction, City, Bingo, Nemesis).
