# Selena's Chase — Design System

A complete design system for **Selena's Chase**, a web-first (mobile-responsive)
fitness social game. Players connect their Fitbit data and chase a globe-trotting
villain named **Selena Chicago** around the world — competing on weekly step counts
and unlocking cities together across five screens: **Map, Prediction, City, Bingo,
Nemesis**. Built for React / Next.js.

This system produces every token, component, and guideline a developer needs for
handoff: CSS custom properties, a typed React component library, illustrated icons,
specimen cards, motion specs, and a full interactive UI-kit recreation of the app.

---

## Sources

- **GitHub:** [`lmorrow1210/SelenaChicagoStepChase`](https://github.com/lmorrow1210/SelenaChicagoStepChase)
  — the product repository. *At build time this repo had no commits (empty), so the
  system was authored from the written product brief.* Explore the repo further to
  refine components against real source once it has code.
- **Product brief** — the detailed specification of tokens, components, screens, and
  motion that this system implements verbatim.

---

## The vibe

> Game feel, not wellness app. Bold condensed type, strong contrast, bouncy
> celebratory interactions. A colorful illustrated travel board — never a dark spy
> dashboard. If it looks moody or clinical, it's wrong.

Dark-mode only. **No pure black, no pure white.** Navy is the darkest value; cream is
the lightest. No gradients except bright accent glows on achievement moments.

---

## Content fundamentals

**Voice — second person, playful, competitive.** The app talks *to* the player
("you") about the group and the villain ("Selena"). It is a friendly rivalry: needling
but encouraging, never clinical or corporate-wellness.

- **Tone:** punchy, energetic, a little cheeky. Short sentences. Action-forward.
- **Person:** "you" for the player; "the group" / proper names for teammates;
  "Selena" for the antagonist (she's always *just ahead, taunting*).
- **Casing:** Display headings and titles render **UPPERCASE** via CSS (Barlow
  Condensed). Write copy in normal sentence case — let the type system do the shouting.
  Labels/eyebrows are uppercase + tracked.
- **Numbers:** always monospaced (DM Mono), grouped with commas: `48,512`. Units are
  spelled out small and muted ("steps", "km", "2d 14h left").
- **Emoji:** none. Personality comes from type, color, the trench-coat avatar, and
  motion — not emoji.

Example copy:
- "Selena's one city ahead — log 8,000 steps today and the group closes the gap to Tokyo."
- "Alex beat you today. Rematch tomorrow."
- "Tokyo — Senso-ji unlocked!"
- "No nemesis yet. Join a group and we'll match you with a rival."
- "Sync failed. Retrying at 6pm."

---

## Visual foundations

**Color.** Seven locked brand tokens: `--navy` (base), `--card` (surfaces),
`--blue` (primary UI — Selena's coat), `--red` (rivalry/action — her boots),
`--gold` (unlocks/badges), `--cream` (text), `--muted` (secondary). Derived navy
shades (`--navy-deep`, `--card-elevated`, `--hairline`) handle elevation without ever
touching pure black. A separate **map palette** (greens, teals, tans, warm tones)
keeps the illustrated atlas colorful. All text meets WCAG AA on its surface.

**Type.** Three Google families: **Barlow Condensed 700** for display/headings (bold,
energetic, set uppercase) — city names, scores, win moments; **DM Sans 400/500** for
all body copy and labels; **DM Mono** for every number, stat, and timer. Display runs
tight (`line-height: 0.95`); body breathes (`1.55`); labels are uppercase, tracked
`0.14em`.

**Spacing & shape.** 4px base unit (4 → 96). Radii: 4 tight, 8 card, 16 pill, 50%
avatar/badge. Cards are `--card` fill, 8px radius, a 1px `--hairline` border, and a
soft **navy-tinted** shadow (never harsh black). Elevated cards use a lighter surface
for modals.

**Backgrounds.** Flat navy canvas with an occasional faint dotted texture on the map.
No photographic imagery — everything is **illustrated and flat-colored**. The only
warm, bright surface in the app is the globe behind the Prediction card.

**Borders & shadows.** 1px hairline borders define cards on dark surfaces. Shadows are
navy-tinted and soft (`--shadow-card/elevated/modal`). **Glows** (`--glow-blue/gold/red`)
are reserved for achievement moments and active states — the only "gradient-like" effect
allowed.

**Motion — bouncy and celebratory.** Spring easing with overshoot
(`cubic-bezier(.34,1.56,.64,1)`) for rewards (landmark unlock, badge earn, skyscraper
rise, avatar hop); snappy ease-out (`.22,1,.36,1`, 150–250ms) for transitions;
gold flash for bingo lines; confetti + bounce for city arrival (the biggest moment).
Avoid slow cinematic fades. Everything respects `prefers-reduced-motion` (springs fall
back to ease-out, decorative loops stop).

**Hover / press.** Buttons darken ~10% on hover (`--blue-hover`, `--red-hover`); ghost
adds a subtle cream fill; press scales to `0.97` with spring. Nav items tint with
`--blue-12` when active.

**Avatar.** A mini trench-coat figure (Selena's signature look) parameterized by skin
tone (6), hair color (8), and colorway (6 preset coat/boots combos). Renders crisply
at 24 / 40 / 120px.

---

## Iconography

A single hand-built **stroke icon set** lives in `components/icons/Icon.jsx` —
24px grid, 2px stroke, rounded caps and joins, consistent optical weight. Color
inherits `currentColor`: `--cream` default, `--blue` when active. No icon font, no
emoji, no third-party icon library — the set is intentionally small and on-brand.

Names: **nav** — `map`, `prediction`, `city`, `bingo`, `nemesis`; **stats/utility** —
`step`, `workout`, `sleep`, `heart`, `badge`, `settings`, `sync`, `crown`, `star`;
**UI** — `lock`, `check`, `close`, `chevronRight`, `flame`, `clock`, `globe`, `trophy`.
Use `<Icon name="…" />`. The illustrated **world map** (`ui_kits/.../WorldMap.jsx`) is a
stylized SVG travel board — abstract continents in the map palette, a dashed gold route,
and `MapPin` markers — not a tile-map service.

---

## Index / manifest

**Root**
- `styles.css` — global entry point (consumers link this one file). `@import`s only.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `base.css`.
- `README.md` — this guide. · `SKILL.md` — Agent-Skills wrapper.

**Components** (`window.DesignSystem_19034b`)
- `components/icons/` — `Icon`
- `components/core/` — `Button`, `Card`, `StatCard`, `Badge`, `CountdownPill`
- `components/forms/` — `Input` (text + numeric), `Slider`
- `components/feedback/` — `Toast`, `EmptyState`, `Skeleton`
- `components/navigation/` — `Sidebar`, `TabBar`
- `components/game/` — `Avatar`, `ProgressStrip`, `CityBadge`, `LandmarkTile`,
  `BingoTile`, `SkyscraperPair`, `PredictionCard`, `MapPin`

**Foundations** (`guidelines/foundations/`) — specimen cards for colors, type, spacing,
radius, shadow, and motion (rendered in the Design System tab).

**UI kit** (`ui_kits/selenas-chase/`) — interactive recreation of the full app
(Map · Prediction · City · Bingo · Nemesis) with a responsive shell. Open `index.html`.

---

## Responsive behavior

- **Desktop ≥ 1024px** — `Sidebar` nav (60px collapsed → 200px on hover), multi-column layouts.
- **Tablet 768–1023px** — `TabBar` bottom nav, single column, condensed.
- **Mobile < 768px** — `TabBar`, full-width cards, touch targets ≥ 44px, safe-area insets.

`Sidebar`/`TabBar` swap automatically in `AppShell`. `ProgressStrip` has a `compact`
variant; the landmark and bingo grids reflow column counts; the Prediction layout
collapses to a single column.
