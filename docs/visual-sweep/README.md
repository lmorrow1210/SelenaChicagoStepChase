# Visual sweep + Week 13 pixel send-off

Branch: `claude/visual-sweep-finale`. Built on the integration of PRs #6, #15, #16, #17, #11 and #13.

Screenshots in this folder were taken in demo mode with stub fonts (serif fallback), so type judgments are limited. Real fonts load in a normal browser.

## How to view the finale in demo mode

| What | Where |
| --- | --- |
| Standalone replay (any time, demo or after Week 13 closes) | `/finale` |
| Week 13 case-closed card, then the send-off | `/dev/week-simulator?week=13&phase=case_closed&outcome=interception`, press "Trigger case closed", then "Watch the send-off" |
| Pick any avatar in the simulator | Skin / hair / coat selects on `/dev/week-simulator` |
| All 150 avatar sprites | `/dev/sprite-sheet` |
| Real map flow (auto-opens after the case report) | Build with `NEXT_PUBLIC_DEMO=1 NEXT_PUBLIC_DEMO_FINALE=1` |

The Pages workflow was not changed, so `/finale`, the simulator and the sprite sheet work on the published demo, but the map flow needs `NEXT_PUBLIC_DEMO_FINALE=1`.

## The finale, beat by beat (about 16 seconds)

1. Fade in on the San Francisco bridge at dusk, fog drifting.
2. Your avatar (matching your skin, hair and coat) runs in from the left.
3. Selena, in her current sky-blue fedora, turns around.
4. Three typed lines: "Thirteen cities, and you never once lost the thread. I loved the chase." / "That is the whole confession. Do not repeat it." / "The next cable car leaves now. After that, Chicago. I would not unpack." Signed "— S.C."
5. She tips her hat, hops onto the cable car roof, and it rolls into the fog.
6. End card: "The chase begins again" with "Continue to the Map" and "Replay".

Skip is always reachable by keyboard. Reduced motion shows two static frames with a "Next frame" button. All text is real DOM text, with a screen-reader live region. Focus moves to Continue at the end, and returns to the page on close.

Frames: `finale/` (beats), `reduced-motion/`.

Scope: a playful send-off only. No lore. The season loops to Week 1 Chicago and keeps all user data. See the dated note in `docs/canon/season-scope.md`.

## What changed in the sweep (before/after in `before/` and `after/`, 390 and 1440 wide)

- Overlays (briefing, midweek, case report) now portal to the body, so the tab bar no longer covers the bottom of long reports on phones.
- Case-closed report: Close button, stamp and decode-in animation. Week 13 card rewritten as "One lap complete".
- Evidence board: sealed slots are compact, only the next sealed slot shows its hint, "Recovered: n of 13" tally, replay-the-send-off link.
- Page titles unified on the `--fs-h1` scale (fieldops, prediction, dossier, nemesis, evidence).
- Tap targets: small buttons, category chips, avatar swatches (with `aria-pressed`) and dossier link are now 44px. New `dangerOutline` button variant for Disconnect.
- Error states have Retry (map, evidence, fieldops).
- Toasts pause behind overlays and stay off login, onboarding and finale.
- Sunday countdown shows minutes and pulses under 24 hours.
- Bingo tiles pop when they lock in.
- Sidebar shows your own avatar; collapsed-rail icon clipping fixed.
- Savannah city icon added (it was missing).
- City kicker colour adjusted to pass contrast (4.42 to above 4.5).
- `robots.txt` added (SEO 91 to 100).

## Skipped

- Map page length on mobile was not restructured.
- Real fonts are not visible in the sandbox, so type tuning was limited.
- No contrast pairs added to the audit, since no new colour pairs were introduced.
- `weekRollover.ts` untouched (other session). The season loop rollover on the server has not landed yet.
- The `CaseClosedReport` teaser leaks `teaser.body` to all outcomes. Left as-is, as agreed.
- Playwright only ran through a local config pointing at the sandbox chromium.

## Decisions for the owner

- Week 13 "One lap complete" copy and the same send-off for all four outcomes.
- Selena's sky-blue fedora is kept as currently shown (new token `--sprite-selena-sky`).
- Migration `012_season_finale_ritual.sql` may collide with another branch's migration number.
- The finale triggers off `previousCase`, so it is offered only while Week 13 is the latest closed case. `/finale` is the permanent replay.
- Added `@types/react-dom`, changed `template.tsx` animation fill-mode, and `Button` size `sm` is now 44px (was 34).
