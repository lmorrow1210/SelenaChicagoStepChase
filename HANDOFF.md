# HANDOFF — Selena's Chase (Claude → CodeX)

Date: 2026-06-11. Claude Code laid Module 0 groundwork; CodeX picks up from here.

## Source of truth
- `docs/selenas-chase-spec.md` — product spec
- `docs/selenas-chase-design-system-prompt.md` + `SelenaDesign/` — all visual decisions (tokens, components, screens). **Consume, don't rebuild.**
- `docs/implementation-plan.md` — full phased plan (architecture, schema, API spec, modules M0–M9, testing matrix, deployment). **If this file is missing, ask Lindsey to paste Implementation Plan v1.0 into it — it is the master roadmap.**

## What is DONE
- Monorepo skeleton: npm workspaces — `apps/api` (Express, TS), `packages/shared` (zod schemas + constants), root scripts. `apps/web` dir exists but is empty.
- `apps/api/src/db/migrations/001_init.sql` — full schema (copy-paste-ready from the plan, §2): cities, landmarks, badge_definitions, bingo_challenge_definitions, groups, users, weeks, step_logs, predictions, nemesis_matchups, bingo_cards, city_unlocks, badges, notifications.
- `apps/api/src/db/migrations/002_seed_cities.sql` — 3 cities × 7 landmarks, 10 badge defs, 18 bingo challenge defs with detector JSON.
- `apps/api/src/index.ts` — Express bootstrap (helmet, cookie-parser, CORS to WEB_ORIGIN, /healthz). Routes are TODO stubs.
- `packages/shared/src/index.ts` — zod schemas for user patch, group create/join, prediction submit, bingo tile / nemesis day JSONB shapes, error envelope; constants (max 8 members, invite charset, free-space index 12).
- `.env.example` — every env var documented (plan §1).

## What is NOT done (next steps, in order — plan §6)
1. **Finish M0:** `npm install`; scaffold `apps/web` with `create-next-app` (App Router, TS); wire `SelenaDesign/` as `packages/design-system` (port from `window.DesignSystem_19034b` shim to ESM imports, fonts via next/font: Barlow Condensed 700, DM Sans, DM Mono); run migrations against Postgres; CI (lint incl. `SelenaDesign/_adherence.oxlintrc.json`, typecheck, vitest). Done when `npm run dev` boots web+api with blank AppShell (Sidebar ≥1024px ⇄ TabBar).
2. **M1 Auth & Onboarding** — Google OAuth (login + Health scopes in one flow), AES-256-GCM refresh-token encryption, httpOnly JWT cookie, 5-step onboarding, group CRUD. ⚠ Verify the Health API base URL first (spec says `health.googleapis.com/v4`; confirm against current Google docs) and **start Google OAuth verification immediately** — sensitive scopes take weeks.
3. M2 Map+Leaderboard (incl. mock-backed sync stub) → M3 City → M4 Prediction → M5 Bingo → M6 Nemesis → M7 Profile → M8 real sync+cron rollover → M9 polish. Acceptance criteria per module are in the plan.

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
