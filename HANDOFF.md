# HANDOFF — Selena's Chase (Claude → CodeX)

Date: 2026-06-11. Claude Code laid Module 0 groundwork; CodeX picks up from here.

## Source of truth
- `docs/selenas-chase-spec.md` — product spec
- `docs/selenas-chase-design-system-prompt.md` + `SelenaDesign/` — all visual decisions (tokens, components, screens). **Consume, don't rebuild.**
- `docs/implementation-plan.md` — full phased plan (architecture, schema, API spec, modules M0–M9, testing matrix, deployment). The master roadmap.

## What is DONE
- Monorepo: npm workspaces — `apps/api` (Express, TS), `apps/web` (Next.js 14 App Router), `packages/shared` (zod schemas + constants), `packages/design-system` (tokens + components copied from `SelenaDesign/`). `npm install` works; api typechecks; web `next build` passes; `npm run test -w apps/api` → 11 tests green.
- **API (M1 partial, credential-free parts):**
  - `src/lib/crypto.ts` — AES-256-GCM refresh-token encryption (IV‖tag‖payload), tested incl. tamper rejection.
  - `src/lib/session.ts` — httpOnly `sc_session` JWT cookie (7-day), sign/verify/set/clear, tested.
  - `src/lib/inviteCode.ts` — 6-char code from unambiguous charset, tested.
  - `src/middleware/auth.ts` (`requireAuth` → `req.userId`) and `src/middleware/errors.ts` (ApiError + uniform `{error:{code,message}}` envelope, zod → 422).
  - `src/routes/groups.ts` — create (transactional, collision-retry invite code, creates first week), join (404/GROUP_FULL/ALREADY_IN_GROUP), me, leave (admin promotion). Untested against a live DB yet — needs integration tests with Dockerized Postgres.
  - `src/routes/users.ts` — GET/PATCH `/api/users/me` (zod-validated).
  - `src/routes/auth.ts` — `/session` boot payload + `/logout` live; `/google` returns 501 stub pending credentials.
  - `src/services/week.ts` — `weekMonday`/`weekSunday` in group tz (DST-safe, tested across date line) + `createFirstWeek` (city route_order 1, target = Σ member targets, idempotent).
- **Web:** AppShell placeholder with sidebar ⇄ tab-bar swap at 1024px (44px touch targets, safe-area inset), all 6 game routes + `/login` as placeholders, `lib/api.ts` typed fetch client (credentials, error envelope), `lib/session.tsx` SessionContext wired to `/api/auth/session`, TanStack Query provider (staleTime 60s). Design-system `styles.css` imported in root layout (fonts still via CSS @import — move to next/font per plan §7).
- `.github/workflows/ci.yml` — typecheck + api tests + web build (adherence lint still TODO).
- `apps/api/src/db/migrations/001_init.sql` — full schema (copy-paste-ready from the plan, §2): cities, landmarks, badge_definitions, bingo_challenge_definitions, groups, users, weeks, step_logs, predictions, nemesis_matchups, bingo_cards, city_unlocks, badges, notifications.
- `apps/api/src/db/migrations/002_seed_cities.sql` — 3 cities × 7 landmarks, 10 badge defs, 18 bingo challenge defs with detector JSON.
- `apps/api/src/index.ts` — Express bootstrap (helmet, cookie-parser, CORS to WEB_ORIGIN, /healthz). Routes are TODO stubs.
- `packages/shared/src/index.ts` — zod schemas for user patch, group create/join, prediction submit, bingo tile / nemesis day JSONB shapes, error envelope; constants (max 8 members, invite charset, free-space index 12).
- `.env.example` — every env var documented (plan §1).

## What is NOT done (next steps, in order — plan §6)
1. **Finish M0:** run migrations against a local Postgres (`npm run migrate` after setting `DATABASE_URL`; note node-pg-migrate expects its own naming — verify the two `.sql` files run, or convert to its format); port design-system components from the `window.DesignSystem_19034b` shim in `SelenaDesign/_ds_bundle.js` to ESM and replace the placeholder AppShell nav with ds Sidebar/TabBar; fonts via next/font; wire `_adherence.oxlintrc.json` into CI.
2. **Finish M1:** Google OAuth `/google` + `/google/callback` (stub at `apps/api/src/routes/auth.ts` — upsert by `google_sub`, encrypt refresh token with `lib/crypto.ts`, `setSessionCookie`, redirect new→/onboarding, returning→/map); `DELETE /api/auth/fitbit`; admin endpoints (PATCH group, remove member); rate limiting; the 5-step onboarding UI. ⚠ Verify the Health API base URL first and **start Google OAuth verification immediately** — sensitive scopes take weeks.
3. Integration tests for group routes (Dockerized Postgres) — they've only been typechecked, never run against a DB.
4. M2 Map+Leaderboard (incl. mock-backed sync stub; `createFirstWeek` already exists) → M3 City → M4 Prediction → M5 Bingo → M6 Nemesis → M7 Profile → M8 real sync+cron rollover → M9 polish. Acceptance criteria per module are in the plan.

## Key decisions already made (don't re-litigate)
- REST (not GraphQL); Express on Railway for cron jobs; Next.js on Vercel; TanStack Query + one SessionContext (no Redux).
- Bingo tiles & nemesis daily results are denormalized JSONB on purpose.
- Week boundaries use `groups.timezone`; sync 3×/day (noon/6pm/midnight group-local), hourly cron tick.
- Nemesis 5-day tie → **Saturday sudden death** (confirm with Lindsey before M6 ships).
- Bingo tiles server-detected only — no write endpoints.
- Notifications v1 in-app only.

## Gotchas
- Never log raw step data, tokens, or email (PII rule); never call the real Health API in automated tests.
- Migrations forward-only via node-pg-migrate; never edit a shipped migration.
- Any new UI must use design-system tokens — no raw hex/magic numbers (adherence lint enforces).
