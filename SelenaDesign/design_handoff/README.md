# Handoff: Selena Steps Chase — Design System + App UI

## Overview
Selena Steps Chase is a web-first (mobile-responsive) fitness social game. Players connect Fitbit data and chase a globe-trotting villain named **Selena Chicago** around the world, competing on weekly step counts and unlocking cities together as a group.

## About the Design Files
The files in this bundle are **high-fidelity design references built in HTML** — prototypes showing the intended look, component behavior, and screen flows. They are **not** production code to copy directly.

Your task is to **recreate these designs in the target codebase's environment** (React, Next.js, React Native, or whatever framework the production app uses) using that codebase's established patterns and libraries. Treat the HTML files as pixel-perfect visual specs, not as deployment artifacts.

## Fidelity
**High-fidelity.** These are pixel-perfect mockups with final colors, typography, spacing, component shapes, and interactions. Recreate the UI exactly as shown using the design tokens documented below.

---

## Screens / Views

### 1. Map Screen (`MapScreen.jsx`)
The home screen — shows the world map, group progress, and leaderboard.

**Layout:**
- Full-bleed `WorldMap` component (16:9 aspect ratio, `border-radius: 12px`)
- Below map: 3-column stat strip (Steps This Week / Cities Unlocked / Rank)
- Leaderboard list below stats, each row: Avatar (40px) + name + step count mono

**Key components:** `WorldMap`, `ProgressStrip`, `Avatar`, `StatCard`

---

### 2. Prediction Screen (`PredictionScreen.jsx`)
Weekly prediction — players guess Selena's next city before the week starts.

**Layout:**
- Full-bleed globe illustration behind a `PredictionCard`
- Card: city name (display type, 40px Barlow Condensed Bold), submit button, countdown pill
- Below: group guesses list (Avatar + city name + timestamp)

**Key components:** `PredictionCard`, `CountdownPill`, `Avatar`, `Button`

---

### 3. City Screen (`CityScreen.jsx`)
City detail — badge header + grid of unlockable landmark tiles.

**Layout:**
- Header: large `CityBadge` (80px) centered, city name below in display type
- Grid: 3-col / 2-col / 2-col rows of `LandmarkTile` (128px cards)
- Locked tiles show lock icon + "???" label

**Key components:** `CityBadge`, `LandmarkTile`

---

### 4. Bingo Screen (`BingoScreen.jsx`)
Weekly bingo card — 5×5 grid of step milestone tiles.

**Layout:**
- 5×5 CSS grid, equal columns, `gap: 8px`
- Each `BingoTile`: 80px × 80px, `border-radius: 8px`
- Winning row highlighted with gold glow (`box-shadow: 0 0 24px rgba(212,168,32,0.55)`)

**Key components:** `BingoTile`

---

### 5. Nemesis Screen (`NemesisScreen.jsx`)
Head-to-head duel vs. assigned rival.

**Layout:**
- Two-column duel header: your Avatar + stats vs. rival Avatar + stats
- 5-day skyline bar chart below (`SkyscraperPair`)
- "Challenge" CTA button (full-width, red)

**Key components:** `SkyscraperPair`, `Avatar`, `Button`

---

## Navigation
- **Desktop (≥ 900px):** Collapsible `Sidebar` (60px collapsed / 200px expanded), left edge
- **Mobile (< 900px):** `TabBar` (64px tall), bottom of screen, respects `safe-area-inset-bottom`
- 5 tabs: Map · Prediction · City · Bingo · Nemesis

---

## Avatar Component

The player avatar is an SVG figure wearing a **trench coat + fedora hat**. Fully parameterized:

### Colorways (coat color → boot color)
| ID | Label | Coat | Boots |
|---|---|---|---|
| `chicago` | Chicago | `#7CCDEF` | `#CC0000` |
| `midnight` | Midnight | `#1A1A2E` | `#D4A820` |
| `emerald` | Emerald | `#1E4D2B` | `#F0E8DC` |
| `crimson` | Crimson | `#8B0000` | `#1A1A1A` |
| `desert` | Desert | `#C4956A` | `#8B3A0F` |
| `violet` | Violet | `#3D1A6B` | `#A8A8B8` |

### 5 Skin Tones
| # | Hex | Label |
|---|---|---|
| 1 | `#F2D2B6` | Fair |
| 2 | `#E8B98F` | Light medium |
| 3 | `#C68642` | Medium |
| 4 | `#8B4513` | Dark |
| 5 | `#4A2E1C` | Deep |

### 5 Hair Colors
| # | Hex | Label |
|---|---|---|
| 1 | `#0D0806` | Black |
| 2 | `#3D1F0C` | Dark brown |
| 3 | `#9B6535` | Light brown |
| 4 | `#C04418` | Auburn / red |
| 5 | `#D4A827` | Blonde |

### Hat logic
- Hat crown + brim uses boot color (slightly darkened, `-8` brightness)
- Hat band uses boot color darkened by `-45`
- If boots are very dark (all RGB channels < 55), lighten coat by `+28` instead

### Sizes
| Use | Size |
|---|---|
| Leaderboard row | 24px |
| Tab bar / strip | 40px |
| Profile / card | 80px+ |

---

## City Badge Component

Circular collectible badge with city-specific SVG landmark silhouette.

### Quality rings
| Quality | Color |
|---|---|
| Bronze | `#CD7F32` |
| Silver | `#A8A9AD` |
| Gold | `#D4A820` + glow `rgba(212,168,32,0.55)` |
| Locked | Greyscale, `--muted` color, lock icon |

### City landmark icons (SVG viewBox 0 0 48 48)
Each city has a unique hand-drawn SVG silhouette:

| City | Landmark | Key shapes |
|---|---|---|
| **Chicago** | Willis Tower | Bundled-tube setbacks, twin antennae, base rect |
| **Tokyo** | Pagoda | 3-tier upswept eaves, spire, base platform |
| **Cairo** | Great Pyramid | Triangle + smaller background triangle, stone course lines |
| **Oslo** | Viking longship | Curved hull, dragon prow, mast + sail, oar dots |
| **Lima** | Machu Picchu terraces | Stacked rects tapering upward, roofed temple on top |
| **Unknown** | Generic skyline | 4 varied-height rects + antenna |

### Sizes
| Use | Size |
|---|---|
| Collection grid | 48px |
| Featured / city header | 80px |

---

## World Map Component

Real-world accurate SVG continent paths on a dark ocean background.

### Ocean
- Radial gradient: center `#1B4E80` → edge `#15406B`
- Dot texture overlay: `rgba(240,232,220,0.045)`, 28px tile, 1.25px dots

### Continent fill colors (CSS custom properties)
| Continent | Token | Hex |
|---|---|---|
| North America | `--map-land-green` | `#3E7C54` |
| Greenland / Arctic | `--map-land-sage` | `#6E9E63` |
| South America | `--map-land-warm` | `#C97B4A` |
| Europe (mainland+islands) | `--map-land-sage` | `#6E9E63` |
| Africa | `--map-land-tan` | `#C9A86A` |
| Eurasia | `--map-land-teal` | `#2E8B83` |
| Oceania | `--map-land-warm` | `#C97B4A` |

All continents: `stroke: rgba(6,16,29,0.38)`, `strokeWidth: 2.5`

### Grid lines
- Latitude lines: `rgba(240,232,220,0.04)`, 1px
- Equator: `rgba(240,232,220,0.12)`, 1px, `dasharray: 6 10`

### Journey route overlay
- **Dashed** (planned route): gold `#D4A820`, 4px, `dasharray: 3 13`
- **Solid** (visited legs): gold `#D4A820`, 5px, full opacity
- City pins render as absolute-positioned overlays at `(x%, y%)` coordinates

### Default city pin positions (% of map width/height)
| City | x% | y% | Variant |
|---|---|---|---|
| Chicago | 24% | 38% | current |
| Lima | 30% | 70% | visited |
| Cairo | 55% | 46% | visited |
| Oslo | 52% | 24% | visited |
| Tokyo | 85% | 40% | next (Selena here) |

---

## Design Tokens

### Colors
```css
--navy:         #0A1628   /* base background */
--card:         #0F2240   /* cards, panels */
--blue:         #7CCDEF   /* primary — Chicago flag blue (Pantone 297C) */
--red:          #CC0000   /* action, rivalry */
--gold:         #D4A820   /* achievements, unlocks */
--cream:        #F0E8DC   /* primary text */
--muted:        #4A6080   /* secondary text, disabled */
--navy-deep:    #06101D   /* deepest recess */
--card-elevated:#16315A   /* modals, overlays */
--card-hover:   #14294C   /* hover surface */
--hairline:     #1C355C   /* borders */
--blue-hover:   #60BCDE
--blue-press:   #44A8CE
--red-hover:    #B30000
--gold-hover:   #BD9418
--bronze:       #CD7F32
--silver:       #A8A9AD
```

### Typography
```
Display:  Barlow Condensed 700, 64px, uppercase, lh 0.95, ls -0.01em
H1:       Barlow Condensed 700, 40px, lh 1.15
H2:       Barlow Condensed 700, 30px, lh 1.15
H3:       Barlow Condensed 600, 22px, lh 1.15
Body:     DM Sans 400, 16px, lh 1.55
Body SM:  DM Sans 400, 14px, lh 1.55
Label:    DM Sans 500, 12px, uppercase, ls 0.14em
Data:     DM Mono 500, 28px (large) / 16px (inline), lh 1.1
Caption:  DM Sans 400, 11px, lh 1.4
```

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=DM+Mono:wght@400;500&display=swap
```

### Spacing (4px base)
```
--sp-1:  4px    --sp-2:  8px    --sp-3:  12px
--sp-4:  16px   --sp-5:  24px   --sp-6:  32px
--sp-7:  48px   --sp-8:  64px   --sp-9:  96px
```

### Border radius
```
--r-sm:   4px
--r-md:   8px
--r-card: 12px
--r-lg:   16px
--r-xl:   24px
--r-pill: 999px
```

### Shadows / Glows
```
--shadow-card:  0 2px 12px rgba(6,16,29,0.5)
--shadow-modal: 0 8px 40px rgba(6,16,29,0.75)
--glow-blue:    0 0 24px rgba(124,205,239,0.55)
--glow-gold:    0 0 24px rgba(212,168,32,0.55)
--glow-red:     0 0 20px rgba(204,0,0,0.45)
```

### Layout constants
```
--sidebar-collapsed: 60px
--sidebar-expanded:  200px
--tabbar-height:     64px
--touch-min:         44px
--content-max:       1120px
```

---

## Interactions & Behavior

### Navigation
- Sidebar tabs show active state: left `3px` border in `--blue`, background `--blue-08`
- Tab bar active: icon + label in `--blue`, inactive in `--muted`
- Sidebar collapses to 60px on desktop, hides on mobile

### Buttons
- **Primary (blue):** bg `--blue`, text `--navy`, hover bg `--blue-hover`, active bg `--blue-press`
- **Danger (red):** bg `--red`, text `--cream`, hover `--red-hover`
- **Ghost:** transparent, border `--hairline`, hover bg `--cream-08`
- All buttons: `border-radius: var(--r-pill)`, `min-height: 44px`, Barlow Condensed 700, uppercase, ls 0.05em

### Cards
- Default: bg `--card`, border `1px solid var(--hairline)`, radius `--r-card`
- Hover: bg `--card-hover`, `transition: background 150ms ease`
- Elevated: bg `--card-elevated`

### Achievement moments
- Gold badge unlock: pulse animation with `--glow-gold`
- No continuous decorative loops on game content

### Countdown pill
- bg `--red-12`, border `--red`, text `--red`, mono font
- Pulses (scale 1→1.04) in last 24 hours

---

## Assets

### SVG Map
The full real-world continent SVG is in `WorldMap.jsx`. The SVG paths were derived from an equirectangular projection at 1000×562 viewBox. Use exactly these paths — they match the visual style (slightly simplified, illustrated, not GIS-precise).

### Fonts
All loaded via Google Fonts. No local font files needed.

### Icons
Uses [Lucide Icons](https://lucide.dev/) via a thin `Icon` wrapper component. Pass `name` (kebab-case Lucide name), `size`, `strokeWidth`, `color`.

---

## Files in This Package

| File | Purpose |
|---|---|
| `README.md` | This document |
| `styles.css` | Global stylesheet entry (imports all tokens) |
| `tokens/colors.css` | All color custom properties |
| `tokens/typography.css` | Font families, sizes, weights, line-heights |
| `tokens/spacing.css` | Spacing scale + layout constants |
| `tokens/effects.css` | Border radii, shadows, transitions |
| `tokens/base.css` | CSS reset + base element styles |
| `components/game/Avatar.jsx` | Avatar SVG component (coat + fedora, skin/hair params) |
| `components/game/CityBadge.jsx` | City badge with landmark icons |
| `components/game/LandmarkTile.jsx` | Individual landmark card |
| `ui_kits/selenas-chase/WorldMap.jsx` | World map with real continent paths |
| `ui_kits/selenas-chase/index.html` | Full interactive prototype (open in browser) |
| `ui_kits/selenas-chase/*.jsx` | Individual screen components |

---

## How to Push to GitHub

```bash
# Clone your repo
git clone https://github.com/lmorrow1210/SelenaChicagoStepChase.git
cd SelenaChicagoStepChase

# Copy the design system files into a /design subfolder
cp -r <downloaded-zip-contents>/ ./design/

# Commit and push
git add design/
git commit -m "feat: add design system + hi-fi prototype (Selena Steps Chase)"
git push origin main
```

Alternatively, drag-and-drop the unzipped folder into the GitHub web UI at:
`https://github.com/lmorrow1210/SelenaChicagoStepChase` → **Add file → Upload files**
