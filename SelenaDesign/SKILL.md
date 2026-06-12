---
name: selenas-chase-design
description: Use this skill to generate well-branded interfaces and assets for Selena's Chase, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map
- `README.md` — full design guide: color, type, content voice, motion, iconography, responsive rules.
- `styles.css` — the one stylesheet to link; `@import`s all tokens + Google Fonts (Barlow Condensed, DM Sans, DM Mono).
- `tokens/` — CSS custom properties (colors, typography, spacing, effects, base resets + keyframes).
- `components/` — typed React primitives (icons, core, forms, feedback, navigation, game). Each has a `.prompt.md` with usage.
- `ui_kits/selenas-chase/` — interactive recreation of the 5-screen app; good reference for composing components.
- `guidelines/foundations/` — specimen cards.

## Working with components
In a standalone HTML artifact, link `styles.css`, load React + ReactDOM + Babel, then
`<script src="…/_ds_bundle.js">`, and read components from `window.DesignSystem_19034b`
inside a `<script type="text/babel">` block. See any `*.card.html` for the exact pattern.

## Non-negotiables
- Dark mode only. No pure black (#000) or pure white (#FFF).
- Numbers in DM Mono; display/headings in Barlow Condensed 700 (set uppercase); body in DM Sans.
- Bouncy spring motion for rewards; respect `prefers-reduced-motion`.
- Game feel, not wellness app. Colorful illustrated, never moody/clinical. No emoji.
