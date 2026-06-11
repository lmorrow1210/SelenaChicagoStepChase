# Design System Brief: Selena's Chase

## What you're designing

A complete design system for **Selena's Chase** — a web-first (mobile-responsive) fitness social game. Players connect their Fitbit data and chase a globe-trotting villain named Selena Chicago around the world, competing on weekly step counts and unlocking cities together.

The app has 5 screens: Map, Prediction, City, Bingo, Nemesis. It is built in React / Next.js. The design system should produce all tokens, components, and guidelines needed to hand off to a developer.

---

## The character

**Selena Chicago** is the game's villain and mascot — a stylish, mysterious Black woman with long curly hair, a wide-brimmed sky blue hat, a sky blue trench coat, and red gloves and boots. Her color palette IS the game's color palette. She is the visual anchor. Every player also has a mini version of this character as their avatar, customized by skin tone, hair color, and outfit colorway.

The aesthetic is: **fun, colorful chase game meets illustrated travel board**. Think Carmen Sandiego the cartoon — bright, energetic, adventurous. Like a board game came to life on screen. Punchy colors, bold type, celebratory moments, illustrated world. Not dark and moody, not clinical, not a wellness app. The dark navy background exists to make the bright colors pop — it should feel like game night, not a spy film.

---

## Established color tokens (must use exactly)

```
--navy:   #0A1628   Base background — deep midnight navy
--card:   #0F2240   Cards, panels, elevated surfaces
--blue:   #41B6E6   Primary UI — Chicago sky blue (Selena's coat)
--red:    #CC0000   Competition, rivalry, action states — Chicago red (Selena's boots)
--gold:   #D4A820   Unlocks, badges, achievements
--cream:  #F0E8DC   Primary text on dark backgrounds
--muted:  #4A6080   Secondary text, disabled states, placeholders
```

No pure black. No pure white. The navy is the darkest value; cream is the lightest.

---

## Established typography (must use exactly)

- **Display / headers:** `Barlow Condensed`, weight 700 — for screen titles, scores, city names, big win moments. Should feel bold and energetic, not serious.
- **Body:** `DM Sans`, weight 400/500 — all body copy, labels, descriptions
- **Numbers / data:** `DM Mono` — all step counts, distances, timers, stats

Both are Google Fonts. Load both at build time.

---

## What the design system must include

### 1. Token documentation
Formalize all color, typography, spacing, border-radius, shadow, and z-index tokens as CSS custom properties. Include a visual swatch sheet.

Suggested spacing scale: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64, 96)
Suggested border radii: 4px (tight), 8px (card), 16px (pill), 50% (avatar/badge)

### 2. Typography scale
Full type scale with size, weight, line height, and letter spacing for each role:
- Display (city names, win moments — big, bold, celebratory)
- H1, H2, H3
- Body, Body small
- Label / eyebrow (uppercase, tracked — for stat labels)
- Data / mono (step counts, scores)
- Caption

### 3. Core components

#### Navigation
- **Desktop sidebar:** 60px collapsed (icons only) / 200px expanded on hover. 5 nav items + avatar at bottom. Active state, hover state, collapsed state.
- **Mobile bottom tab bar:** 5 icons with labels. Active state. Safe area handling.

#### Avatar component
The mini trench coat figure. Must render at 3 sizes: 24px (leaderboard), 40px (progress strip), 120px (profile). Parameterized by: skin tone (6 hex values), hair color (8 hex values), colorway (6 preset coat/boots color combos). Show all 6 colorways:
1. Chicago — coat `#41B6E6`, boots `#CC0000`
2. Midnight — coat `#1A1A2E`, boots `#D4A820`
3. Emerald — coat `#1E4D2B`, boots `#F0E8DC`
4. Crimson — coat `#8B0000`, boots `#1A1A1A`
5. Desert — coat `#C4956A`, boots `#8B3A0F`
6. Violet — coat `#3D1A6B`, boots `#A8A8B8`

#### Progress strip (straight line leaderboard)
A horizontal strip with City A icon (left) and City B icon (right) connected by a straight line. Each player's avatar sits on the line at their proportional position (0–100% based on steps vs. target). Show: default state (week in progress), end state (someone at 100%), empty state. Desktop and mobile variants.

#### City badge
Circular badge component. Has: city illustrated icon center, city name below, border quality (bronze `#CD7F32`, silver `#A8A9AD`, gold `#D4A820`). Show all three border states. Show locked (greyscale, future city) state. Sizes: 48px (collection grid), 80px (featured).

#### Landmark tile
Used on the City screen. Two states:
- **Locked:** dark card with a muted silhouette of the landmark, no text visible
- **Unlocked:** full-color image/illustration, landmark name, one-line fun fact
- **Today / active:** locked but with a glowing blue border pulse animation
Show the grid layout: 3 tiles across top row, 2 middle, 2 bottom.

#### Bingo tile
Square tile for the 5×5 bingo card. Four states:
- Incomplete: dark outline, muted icon, greyed label
- In progress: blue outline glow
- Complete: filled with `--blue` at 20% opacity, icon in `--blue`, checkmark
- Free space: Selena icon, always complete
Show full 5×5 grid mockup with a mix of states. Show a completed bingo line with animated highlight.

#### Skyscraper pair (Nemesis)
Two buildings side by side. Building height = step count (normalized). Left = you, right = nemesis. Taller building gets a gold crown. Show: you winning, nemesis winning, tied, in-progress (current day animating upward). Show a full 5-day skyline side by side.

#### Prediction card
Central card on the Prediction screen. Contains: headline text, large numeric input, submit button, state for after submission. Colorful illustrated globe background behind it — bright, not dark and moody.

#### Buttons
- Primary: `--blue` fill, `--navy` text, hover darkens 10%
- Secondary: transparent, `--blue` border and text
- Danger / rivalry: `--red` fill, `--cream` text
- Ghost: no border, `--cream` text, hover adds subtle fill
- Disabled state for all
- Loading state (spinner) for async actions

#### Form inputs
- Step target slider (onboarding + settings): range input styled with `--blue` track fill
- Numeric input (prediction): large, centered, monospaced
- Text input (group name): standard
- All inputs: dark fill (`--card`), `--cream` text, `--blue` focus ring

#### Cards / panels
- Default card: `--card` background, 8px radius, subtle shadow
- Elevated card: slightly lighter surface for modals/overlays
- Stat card: compact, icon + label + value — used in leaderboard and profile

#### Toast / notification
Slim bar at top of screen. Three types:
- Achievement (gold left border): "Tokyo — Senso-ji unlocked!"
- Social (blue left border): "Alex beat you today. Rematch tomorrow."
- Alert (red left border): "Sync failed. Retrying at 6pm."

#### Empty states
Design for: no group joined, no nemesis assigned, week not started, bingo card loading. Each should include a small illustration or icon, a headline, and a CTA. Keep them encouraging and on-brand — not clinical.

#### Loading states
Skeleton screens for: leaderboard list, landmark grid, bingo card. Pulsing animation using `--card` and a slightly lighter shade.

#### Map pin / city marker
Two variants: current city (glowing blue, active pulse), next city / Selena's position (dimmer, red accent). Used on the world map.

#### Week countdown
Small pill component showing days/hours until week closes. Used on Map and Prediction screens. Changes color as deadline approaches: default `--muted` → `--gold` (2 days left) → `--red` (24 hours left).

### 4. Icon set
Design or specify icons for all 5 nav items: Map, Prediction, City, Bingo, Nemesis. Plus: step count, workout, sleep, heart rate, badge, settings, sync, crown, star. Style: 24px, 2px stroke, rounded caps, consistent optical weight. Color: `--cream` default, `--blue` active.

### 5. Motion guidelines
The motion language is **bouncy and celebratory** — achievements should feel earned and fun. Use spring/bounce easing for reward moments, ease-out for transitions. Avoid slow, cinematic fades — this is a game, keep it snappy.

Specify timing, easing, and behavior for:
- Landmark unlock: silhouette pops to full color with a bounce scale (recommend: 500ms, spring easing, slight overshoot)
- Skyscraper height: buildings bounce up on load (recommend: 600ms, spring easing with overshoot)
- Bingo line: sweeps across with a satisfying flash (recommend: 400ms, ease-in-out, gold flash on completion)
- City arrival: confetti burst + bouncy screen transition — this is the biggest celebration moment in the app
- Progress strip: avatar hops to new position on sync (recommend: 800ms, spring easing)
- Badge earn: badge drops in and bounces (recommend: 600ms, spring easing)
- Respect `prefers-reduced-motion` — all animations should have a no-motion fallback

### 6. Responsive behavior
- **Desktop breakpoint:** ≥ 1024px — sidebar nav, multi-column layouts
- **Tablet:** 768–1023px — bottom nav, single column, condensed
- **Mobile:** < 768px — bottom nav, full-width cards, touch targets ≥ 44px

Document how each core component adapts across breakpoints.

### 7. Map visual language
The world map should feel like a **colorful illustrated travel board** — think Ticket to Ride, a fun atlas, or a board game map. Bright, inviting, full of personality. Not dark or surveillance-like.

The map uses:
- Navy base (`--navy`) but the illustrated landmasses should be colorful — greens, tans, teals, warm tones for continents
- Ocean: a mid-blue, lighter than `--navy`, not black
- Route path: a bright dashed line in `--blue` or `--gold` showing the journey traveled
- Unvisited cities: small illustrated icons, slightly muted
- Current city: glowing `--blue` pin, larger, with a subtle bounce animation
- Next city / Selena's position: `--red` pin with Selena's tiny icon — she's always just ahead, taunting the group
- The overall vibe: you want to explore this map, not surveil it

The map is purely visual — not interactive beyond tapping city pins. A stylized SVG or canvas illustration is strongly preferred over a dark tile map service.

---

## Deliverables expected

1. CSS custom properties file with all tokens
2. Component library (React components or annotated Figma-style specs)
3. All component states documented (default, hover, active, disabled, loading, empty)
4. Responsive behavior documented for each component
5. Typography specimen showing full scale in use
6. Color palette with usage rules
7. Motion spec with timing values and easing curves
8. Icon set (24px SVG)
9. Example screen compositions showing components in context:
   - Map screen (desktop + mobile)
   - City screen (landmark grid)
   - Nemesis screen (5-day skyline)

---

## Constraints

- Dark mode only — no light mode
- No pure black (`#000000`) or pure white (`#FFFFFF`) anywhere
- No gradients except bright accent glows on achievement moments (confetti, badge earn, bingo line)
- **Game feel, not wellness app feel** — bold type, strong contrast, bouncy interactions, celebratory moments
- **Fun and colorful, not moody or cinematic** — if something looks like a spy thriller or a dark dashboard, it's wrong
- Illustrated art style throughout — icons, map, landmarks should all feel hand-crafted and playful, not photographic or clinical
- Accessible: all text meets WCAG AA contrast against its background
- All components must work on both dark navy and card navy surfaces
