# Self-hosted fonts

Latin-subset WOFF2 files for the three type families, loaded with
`next/font/local` in `app/layout.tsx`. They are committed so that builds
(CI, Vercel, local, sandboxes) never depend on reaching Google Fonts.

| Family | Weights | Source |
|---|---|---|
| Barlow Condensed | 600, 700 | `@fontsource/barlow-condensed` 5.3.0 |
| DM Sans | 400, 500, 700 | `@fontsource/dm-sans` |
| DM Mono | 400, 500 | `@fontsource/dm-mono` 5.3.0 |

All three are licensed under the SIL Open Font License 1.1 (see the
`LICENSE-*.txt` files here), which permits bundling and redistribution.

To add a weight: copy `<family>-latin-<weight>-normal.woff2` from the matching
`@fontsource/*` package into this folder and add it to the `src` list in
`app/layout.tsx`.
