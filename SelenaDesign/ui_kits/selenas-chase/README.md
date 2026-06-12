# Selena's Chase — App UI Kit

A high-fidelity, click-through recreation of the Selena's Chase app: a web-first
(mobile-responsive) fitness social game. Players sync Fitbit data and chase the
villain **Selena Chicago** around the world, competing on weekly step counts and
unlocking cities together.

## Run it
Open `index.html`. It loads the compiled design-system bundle (`_ds_bundle.js`),
links the global `styles.css`, and mounts the interactive shell. Click the sidebar
(desktop) or bottom tab bar (mobile, < 900px) to move between the five screens.

## Screens
| File | Screen | Highlights |
|------|--------|-----------|
| `MapScreen.jsx` | **Map** | Illustrated `WorldMap`, group stats, `ProgressStrip`, leaderboard |
| `PredictionScreen.jsx` | **Prediction** | Globe-backed `PredictionCard` (live submit), group guesses |
| `CityScreen.jsx` | **City** | `CityBadge` header, `LandmarkTile` grid (3 / 2 / 2) |
| `BingoScreen.jsx` | **Bingo** | 5×5 `BingoTile` card with a highlighted winning line |
| `NemesisScreen.jsx` | **Nemesis** | Head-to-head duel + 5-day skyline |

## Structure
- `AppShell.jsx` — responsive frame: `Sidebar` on desktop, `TabBar` on mobile, header with title + `CountdownPill`.
- `WorldMap.jsx` — the stylized illustrated travel board (abstract continents, mid-blue ocean, dashed gold route, `MapPin`s). Not geographically precise — a playful board-game atlas.
- Each screen composes design-system primitives (`window.DesignSystem_19034b`) — it does **not** re-implement them.

## Notes
- All gameplay data is mocked inline for demonstration.
- The kit is a visual + interaction recreation, not production code — built from the
  product brief (the source repo `lmorrow1210/SelenaChicagoStepChase` was empty at
  build time). See the root `README.md` for the full source list.
