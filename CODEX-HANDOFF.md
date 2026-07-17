# CODEX-HANDOFF.md — One Step Ahead: state + the Narrative DNA build

Written 2026-07-16 for a Codex session (or any coding agent). Read
**`AGENTS.md` first** — it is the working guide with the CI gates, hard
rules, and design-system law. `HANDOFF.md` holds deep per-milestone history.
This document adds two things on top: (1) exact current state and the queued
engineering work, and (2) the full spec for the **Narrative DNA** initiative
— the product direction the owner has committed to next.

---

## 1. Current state

- Repo: `main` plus local M12 changes for Sunday nemesis reveal; push pending.
- CI + GitHub Pages deploy: **green**. Live demo:
  https://lmorrow1210.github.io/SelenaChicagoStepChase/
- API tests: **71/71** against Postgres (`brew services start postgresql@16`;
  test db `one_step_ahead_test` exists).
- Just shipped (2026-07-16): Sunday nemesis reveal (A1/M12). Migration `006`
  adds `scheduled` weeks and unique active/scheduled partial indexes; Sunday
  cron creates next week's scheduled row + pairings; Monday rollover activates
  that row while leaving all scoring/close-out on Monday after full Mon–Sun
  data; `/api/nemesis/current` and the demo show `state: "scheduled"`.
- Previously shipped (2026-07-16): the `bedtime_before` bingo detector.
  Product rule, now locked: a night qualifies only when bedtime falls
  **18:00–23:59 on the calendar day BEFORE the wake-up log date**;
  post-midnight bedtimes (1 AM, 2 AM) always fail, no exceptions.
  Implementation: `evaluateDetector` in `apps/api/src/services/bingo.ts`,
  `week_bedtimes` context built in `bingoService.ts`, unit tests in
  `test/engines.test.ts`.

### Architecture you'll touch (30-second map)

- Hourly cron (`apps/api/src/services/cron.ts`): sync hours are 0 / 12 / 18
  group-local. `runGroupSync` does: sync every member → detection pipeline
  per synced date (bingo card update → scout tokens) → nemesis
  `closeElapsedDays` → and at **Monday 00:00 group-local**, `weekRollover`.
- `weekRollover` (`services/weekRollover.ts`) closes the week in ONE
  transaction: predictions, badges, nemesis Saturday-tiebreak fallback,
  bingo freeze, then activates/creates the next week and ensures cards +
  pairings. Sunday preparation is split into `prepareNextWeekReveal`.
- Notifications: plain table `notifications (user_id, kind, message, read,
  created_at)`; `GET /api/notifications` returns latest 20; writes happen
  inline (see `weekRollover.ts:31,267`, `cron.ts:48`).
- Frontend: Next.js app router; demo mode (`NEXT_PUBLIC_DEMO=1`) is backed
  entirely by `apps/web/lib/demo.ts` fixtures — **fixtures are a de-facto
  API contract; every route change must update them.**
- Fiction-forward components already shipped: `CallingCard.tsx`,
  `CaseStatusStrip.tsx` (case lip readout), `SundayCountdown.tsx` ("She
  vanishes in …"), terminal login, CRT settle transition.

---

## 2. Track A — queued engineering

### A1. Sunday nemesis reveal — shipped M12

Done:
- New migration `006_sunday_nemesis_reveal.sql`.
- `prepareNextWeekReveal` creates scheduled next week + pairings on Sunday.
- `weekRollover` activates scheduled weeks on Monday and keeps close-out logic
  Monday-only.
- `/api/nemesis/current` reads the scheduled reveal on Sunday; other active
  week routes still read `status = 'active'`.
- Demo, OpenAPI, generated API types, group departure repair, and tests are
  updated. See `HANDOFF.md` M12.

### A2. Owner-only (skip; listed so you don't chase them)

Health API sandbox smoke test → flip `HEALTH_API_MODE=real`; Railway/Vercel
deploys; physical-device QA. Also `RealFitbitClient.steps_by_hour` stays
`null` until that smoke test confirms the intraday endpoint shape.

---

## 3. Track B — the Narrative DNA (the owner's chosen direction)

### The directive

> **Never show a number when you can show a story. The steps are real;
> everything they touch should feel like fiction closing around Selena
> Chicago.**

The game's magic is that real-world effort feeds a manhunt. Five pillars,
in priority order:

1. **Selena is a character, not a scoreboard** — she reacts to the group's
   real data (taunts, calling cards, near-miss drama).
2. **Cadence becomes ritual** — Monday briefing, mid-week twist, Saturday
   sudden death as an *event*, Sunday reveal + vanish clock.
3. **The world is the reward** — dossiers/fun-facts already work this way;
   extend toward seasons and an evidence board with a finale.
4. **Fully diegetic UI** — syncs are "field reports," badges stamp onto
   paper, optional CRT/teletype sound (muteable, respect
   `prefers-reduced-motion`).
5. **Trust is a feature** — the fiction collapses if a number is wrong or
   stale. Sync honesty and a11y stay at the current bar (Lighthouse 100s).

### Phase N1 — the Beat Engine (build this first; highest magic-per-effort)

A deterministic, data-driven narrative layer: "beats" are short in-fiction
messages triggered by real events, delivered through the existing
notifications pipeline and surfaced as calling cards / briefing lines.

**Data model** (new migration, e.g. `007_narrative_beats.sql`):

```sql
CREATE TABLE beat_definitions (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,          -- e.g. 'near_miss_week'
  trigger JSONB NOT NULL,             -- detector-style condition (see below)
  scope TEXT NOT NULL,                -- 'user' | 'group'
  variants JSONB NOT NULL,            -- array of copy templates
  cooldown_days INT NOT NULL DEFAULT 7,
  priority INT NOT NULL DEFAULT 0     -- when multiple fire, highest wins
);

CREATE TABLE beat_events (
  id BIGSERIAL PRIMARY KEY,
  beat_id INT NOT NULL REFERENCES beat_definitions(id),
  group_id UUID NOT NULL,
  user_id UUID,                       -- NULL for group-scope beats
  week_id UUID,
  fired_on DATE NOT NULL,
  rendered TEXT NOT NULL,             -- final copy, params already filled
  UNIQUE (beat_id, group_id, user_id, fired_on)  -- idempotency under cron re-ticks
);
```

**Evaluation** — new `apps/api/src/services/beats.ts`, modeled directly on
the bingo detector pattern (`evaluateDetector` + a `BeatContext` built from
SQL, like `bingoService.updateBingoCard` builds `DetectorContext`). Reuse
what exists; much of the context is already computed in the detection
pipeline (daily rank, hot pursuit, streaks, group week steps, nemesis day
results).

**Hook points** (both already exist — no new scheduler):

- End of the detection pipeline in `runGroupSync` (`cron.ts`, after the
  nemesis `closeElapsedDays` loop): evaluate day-scope beats for each
  synced date.
- Inside/after `weekRollover`: week-scope beats (near-miss week, city
  escaped/caught, nemesis outcome flavor). The Sunday reveal step (Track
  A1) is itself a beat surface — the reveal should arrive as a note *from
  Selena* choosing your nemesis.

**Determinism is non-negotiable:** pick copy variants with
`seededRand(...)` from `services/bingo.ts` seeded by
`${beat.slug}:${weekId}:${userId ?? group_id}` — never `Math.random()` —
so teammates see the same beat and cron re-runs render identically. The
`UNIQUE` constraint + `ON CONFLICT DO NOTHING` makes firing idempotent.

**Delivery:** insert into `notifications` with a new `kind = 'beat'` (check
whether `kind` has a CHECK constraint in `001_init.sql` — if so, widen it
in the new migration) AND into `beat_events` for history. Frontend renders
`kind='beat'` notifications inside `CallingCard.tsx` styling instead of the
plain alert row.

**Starter beat set** (all computable from existing data today):

| slug | scope | trigger sketch | example copy |
|---|---|---|---|
| `near_miss_week` | group | week closed, group total within 5% of catch threshold | "You were {gap} steps from cornering her in {city}. She knows it." |
| `weak_day` | group | group daily total < 60% of trailing avg | "Quiet day out there. She made {miles} miles on you. —S.C." |
| `target_blowout` | user | steps ≥ 1.5× daily target | "Subject moving fast. She's noticed. Field reports say she skipped dinner." |
| `hot_pursuit_streak` | group | hot_pursuit 2 days running | "Every operative in motion. She's checking over her shoulder." |
| `nemesis_flip` | user | trailed the nemesis, then won a day | "You took the day back. {nemesis} is rereading the case file." |
| `streak_broken` | user | daily_target_streak was ≥ 3, today missed | "The trail went cold on day {n}. She left a matchbook. It's mocking." |
| `sudden_death_eve` | user | Friday close, nemesis week tied | "Five days. Dead even. Saturday decides it. Sleep — or don't." |

**Voice guide** (binding):

- Case-file/telex register: clipped, typewritten, present tense. No emoji,
  no exclamation marks from the system; Selena may use one, rarely.
- Selena's notes sign off `—S.C.` and are confident, playful, never cruel
  about a specific person's body or health — she taunts *effort and
  the chase*, never the player. Losing must sting in fiction and stay fun.
- System/handler lines are unsigned ("Field report incoming.",
  "Subject last confirmed: {city}.").
- **Beats never reveal locked intel** — the spoiler rule (fun facts, city
  catalogue) applies to copy too. Beats may reference the *current* city
  only.
- **PII rule applies to copy pipelines:** never log rendered beats or step
  values; the structured logger must keep redacting `steps`/`token`/`email`.

**Testing:** unit-test trigger evaluation exactly like
`test/engines.test.ts` does for detectors (pure function + context
object); one integration test proving idempotency (run the cron hook twice
for the same date → one `beat_events` row) modeled on
`test/bingoIntraday.integration.test.ts`. Update `demo.ts` with 2–3 fixture
beats so the demo deploy shows the feature.

### Phase N2 — ritual events (after N1)

- **Monday briefing:** a composed screen/section assembling the week-open
  state (new nemesis, Selena's next city, last week's beats) with the telex
  print-in treatment. Mostly frontend; data all exists once N1 + A1 land.
- **Saturday sudden death treatment:** one of the few earned uses of
  `--signal-red` — a takeover banner on the nemesis screen while a
  tiebreak is live. Red stays RARE everywhere else (hard rule).
- **Sunday reveal as fiction:** deliver A1's reveal through a beat.

### Phase N3 — seasons & evidence board (needs owner product calls first)

Don't build yet. Decisions the owner must make: season length (city count),
what "catching" Selena means mechanically at a finale, whether progress
resets. Park it; note it in `HANDOFF.md` when N1/N2 ship.

---

## 4. Guardrails (violations have broken CI before — take these literally)

1. Never log steps, tokens, or email. 2. Tests use `MockFitbitClient`,
never the real Health API. 3. Migrations are append-only. 4. No raw hex in
`apps/web/app` + `apps/web/lib` — design tokens only (`lib/brand.ts` is the
sole exception). 5. OAuth refresh tokens encrypted via `encryptToken()`.
6. Square corners everywhere; radius is `0 !important`. 7. Red =
Selena/threat/urgency/stamps ONLY; routine deltas use `--phosphor-dim` /
`--phosphor-hot`. 8. Selena's sky-blue `#41B6E6` fedora in `SelenaMark.jsx`
is a locked exception — used sparingly (map sighting, mugshot, calling
card); don't add new blue usage. 9. One reset clock only
(`SundayCountdown`); don't add competing countdown copy. 10. Keep
`CaseStatusStrip` query-free (reads `useSession()` only). 11. Spoiler rule:
locked `fun_fact` stays NULL server-side. 12. `SelenaDesign/` is frozen —
never edit.

**Pages export trap:** the normal web build passing does NOT guarantee the
static export passes. Never read the `searchParams` page prop — use
`useSearchParams()` inside `<Suspense>`. Reproduce with
`NEXT_OUTPUT=export NEXT_PUBLIC_DEMO=1
NEXT_PUBLIC_BASE_PATH=/SelenaChicagoStepChase`.

## 5. Verification sweep (all must pass before every push)

```bash
npx tsc --noEmit -p apps/api/tsconfig.json
npx tsc --noEmit -p apps/web/tsconfig.json
TEST_DATABASE_URL="postgres://localhost:5432/one_step_ahead_test" \
  npm run test -w apps/api          # 68/68 baseline
npm run build -w apps/web
node scripts/contrast-audit.mjs     # 23/23
# + the no-raw-hex grep and OpenAPI type sync run in CI — see AGENTS.md §CI gates
```

If touching palette/new UI: Lighthouse a11y spot-check (baseline 100 on all
9 screens; the `--tan-300` bevel-edge contrast gotcha in AGENTS.md is real).

## 6. Suggested execution order

1. **N1** Beat engine (migration `007`, `beats.ts`, cron + rollover hooks,
   starter beat set, CallingCard rendering, fixtures, tests).
2. **N2** Monday briefing + sudden-death treatment.
3. Update `AGENTS.md` (backlog) + `HANDOFF.md` (milestone entry) with what
   shipped, and keep this file's state section current or delete it once
   absorbed into `HANDOFF.md`.
