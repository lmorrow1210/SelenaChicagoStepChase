# Week One Repository Audit

Source read: `docs/one-step-ahead-season-one-implementation-spec.md`.

Note: the requested path `docs/season-one-implementation-spec.md` is not present in this checkout. The repository currently contains the Season One spec at `docs/one-step-ahead-season-one-implementation-spec.md`, which also says its recommended eventual path is `docs/season-one-implementation-spec.md`.

This audit is intentionally a migration map, not an implementation plan for duplicate systems. The existing app already has strong weekly gameplay systems. Season One should reuse them and add configuration, centralized chase calculation, week phases, evidence persistence, and narrative ritual surfaces around them.

## Executive Summary

The repository already supports:

- weekly group weeks with `active`, `scheduled`, and `closed` statuses;
- group step aggregation from synced daily `step_logs`;
- a map/home chase surface backed by `/api/weeks/current`;
- Field Ops as a shared weekly board with verified, honor-system, social, and assist mechanics;
- prediction submission, hidden reveal, scoring, and Oracle badge awarding;
- nemesis pairing, scoring, reroll, Sunday reveal, and Saturday sudden death;
- badges, notifications, intel cards, and a dossier;
- mock and real health synchronization paths;
- reusable terminal-style design components and several app-level narrative surfaces.

The largest Season One gaps are:

- no canonical Season One configuration for the 13-week route, chapter titles, evidence, complications, and closing copy;
- no single Chase Calculation service for final progress, capped bonuses, data confidence, remaining lead, and four weekly outcomes;
- no explicit `WeekPhase` state machine for Monday briefing, midweek update, final push, sudden death, case close, and case closed;
- no group-season evidence model for standard evidence, Intercept Clues, interception counts, or finale depth;
- existing seeded route and demo route conflict with the locked Season One route;
- prediction timing currently opens/locks only on Monday, while the Season One ritual expects Friday lock and Sunday reveal/close behavior;
- current progress uses `target_hit` as a boolean, not `trail_lost`, `pursuit_maintained`, `close_encounter`, or `interception`.

## 1. Weekly Rollover And Week State

### Relevant file paths

- `apps/api/src/db/migrations/001_init.sql`
- `apps/api/src/db/migrations/006_sunday_nemesis_reveal.sql`
- `apps/api/src/services/week.ts`
- `apps/api/src/services/weekClose.ts`
- `apps/api/src/services/weekRollover.ts`
- `apps/api/src/services/cron.ts`
- `apps/api/src/routes/weeks.ts`
- `apps/api/src/routes/auth.ts`
- `apps/api/test/week.test.ts`
- `apps/api/test/weekRollover.integration.test.ts`
- `apps/api/test/backoff.test.ts`

### What the current system supports

- `weeks` rows store `group_id`, `city_id`, `starts_on`, `ends_on`, `group_target_steps`, `status`, `group_total_steps`, and `target_hit`.
- Current statuses are `scheduled`, `active`, and `closed`.
- `createFirstWeek()` creates the first active week for a new group using route order 1 and the sum of member targets.
- `prepareNextWeekReveal()` creates next week's row as `scheduled` on Sunday and persists nemesis pairings before Monday.
- `weekRollover()` runs in one transaction and closes the current week, scores predictions, awards badges, freezes Field Ops cards, finalizes nemesis matchups, activates or creates next week, creates fresh Field Ops cards, persists nemesis pairings, and sends a summary notification.
- `cron.ts` runs group-local sync ticks and triggers Sunday nemesis reveal plus Monday rollover.
- Rollover is designed to be idempotent through unique constraints and conflict-safe inserts.

### Reusable directly

- Week date utilities in `week.ts`.
- `scheduled` week status and Sunday reveal behavior from A1.
- Transactional rollover structure in `weekRollover.ts`.
- Existing idempotency patterns for badges, weeks, cards, and matchups.
- Existing tests around rollover, scheduled reveal, and activation.

### Conflicts with the Season One specification

- Week state is too coarse. The spec wants centralized phases: `briefing`, `active`, `midweek_update`, `final_push`, `sudden_death`, `case_closing`, and `case_closed`.
- Current outcome is `target_hit` only. The spec wants four weekly outcomes based on final progress: `trail_lost`, `pursuit_maintained`, `close_encounter`, and `interception`.
- Current close math is raw step total against `group_target_steps`; it does not include capped Field Ops, special operation, nemesis participation, or prediction participation bonuses.
- There is no authoritative final progress, remaining lead, projected outcome, data confidence, or reconciliation state.
- Current route wraps after the last seeded city. Season One should be a 13-week season with a finale instead of a simple loop.
- Current Monday rollover creates/activates the new week, but Season One also needs distinct Monday briefing and Sunday case-close ritual surfaces.

### Smallest recommended migration path

1. Add a centralized weekly state service that wraps existing `week.ts`, `weekClose.ts`, and `weekRollover.ts` instead of replacing them.
2. Add a Chase Calculation service and have `weekClose.ts`/`weekRollover.ts` call it before stamping final results.
3. Keep `weeks.status` for lifecycle storage, but calculate or persist `phase` from authoritative time and week state in one place.
4. Add final-outcome fields to `weeks` or a new `group_week_state` table while leaving existing `target_hit` temporarily for backward compatibility.
5. Update `/api/weeks/current` to return calculated chase state, phase, data confidence, and current Season One config.

### Likely database/schema migrations

- Add `weeks.final_progress NUMERIC`, `weeks.base_progress NUMERIC`, `weeks.remaining_lead INTEGER`, `weeks.final_outcome TEXT`, `weeks.projected_outcome TEXT`, and `weeks.finalized_at TIMESTAMPTZ`, or introduce a separate `group_week_states` table.
- Add a check constraint for weekly outcomes if stored directly.
- Add bonus columns or JSONB for `field_ops`, `special_operation`, `nemesis_participation`, and `prediction_participation`.
- Add `data_confidence TEXT` if confidence is persisted.
- Add season/week references, either directly on `weeks` or via a new season state table.

### Technical risks or ambiguities

- Late health data could change totals after close; the spec requires controlled recalculation, but the current close path finalizes immediately.
- Midseason group membership and active-player eligibility are not defined in the current schema.
- The spec says Sunday case close, while the app currently does final close at Monday 00:00 after midnight sync. This may be acceptable if presented as Sunday 11:59 PM cutoff plus Monday reconciliation, but the product wording needs to be deliberate.

## 2. Group Step Aggregation

### Relevant file paths

- `apps/api/src/db/migrations/001_init.sql`
- `apps/api/src/services/sync.ts`
- `apps/api/src/services/weekClose.ts`
- `apps/api/src/routes/weeks.ts`
- `apps/api/src/routes/predictions.ts`
- `apps/api/src/services/beats.ts`
- `apps/web/app/(game)/map/page.tsx`
- `apps/web/lib/demo.ts`

### What the current system supports

- Daily step values are stored in `step_logs` keyed by `(user_id, log_date)`.
- Sync upserts daily step data, so repeated syncs replace the old value instead of duplicating it.
- `/api/weeks/current` sums step logs for all users in the group during the current week.
- `closeWeekPredictions()` calculates the authoritative closed-week total by summing all group members' step logs in the week window.
- Map data includes per-player current-week steps, previous-week delta, group target, and Selena lead.

### Reusable directly

- `step_logs` as the verified movement ledger.
- Existing sum queries for group weekly totals.
- Existing `group_target_steps` snapshot on `weeks`.
- Upsert semantics for sync trust and duplicate prevention.

### Conflicts with the Season One specification

- There is no eligible-active-player model. The current queries include all users currently in the group, with no joined-before cutoff, paused state, or tracker eligibility.
- `group_target_steps` is a raw sum of current member targets at week creation/activation. There is no baseline clamp or target-manipulation guard.
- `selenaLeadSteps` in `/api/weeks/current` has a hard minimum of 5,000, while the spec says visible remaining lead can fall to zero.
- Group progress is not centralized. The map, predictions, rollover, and beats all perform their own step calculations.
- No calculation includes Season One's 10 percentage point non-step bonus cap.

### Smallest recommended migration path

1. Create a Chase Calculation service that takes active players, verified group steps, Field Ops, special operation, nemesis, prediction, elapsed time, and sync freshness.
2. Keep existing step aggregation queries but move them behind that service.
3. Store the week target snapshot, active-player IDs, and eligibility inputs at week open so targets cannot be manipulated after the fact.
4. Replace map lead math with Chase Calculation output.

### Likely database/schema migrations

- Add `paused_at` or `paused_weeks` if paused players are needed for eligibility.
- Add a `week_participants` table with `week_id`, `user_id`, `weekly_target_snapshot`, `eligible`, `joined_before_cutoff`, and optional tracker/input mode.
- Add baseline fields later if target clamps are implemented.

### Technical risks or ambiguities

- The Season One spec defines eligibility but does not settle exact group-size and midseason membership behavior.
- Existing historical weeks may not have participant snapshots, so migrations need a backfill strategy.

## 3. Map Or Home Screen

### Relevant file paths

- `apps/web/app/(game)/map/page.tsx`
- `apps/web/app/(game)/map/PredictionSection.tsx`
- `apps/api/src/routes/weeks.ts`
- `apps/web/lib/CallingCard.tsx`
- `apps/web/lib/SundayCountdown.tsx`
- `packages/design-system/components/game/MapPin.jsx`
- `packages/design-system/components/game/ProgressStrip.jsx`
- `packages/design-system/components/game/SelenaMark.jsx`
- `packages/design-system/components/game/CityBadge.jsx`
- `apps/web/lib/demo.ts`

### What the current system supports

- The map is the main chase/home surface.
- It displays current city, next city, route pins, Selena lead, group steps, countdown, last sync, progress strip, and leaderboard.
- It already has a terminal/case-file visual treatment with `sc-corners`, a Selena calling card, a Sunday countdown, and an arrival celebration.
- It links completed past cities to trophy views.

### Reusable directly

- `/api/weeks/current` payload as the main data source.
- `ProgressStrip`, `MapPin`, `SelenaMark`, `CallingCard`, and `SundayCountdown`.
- Route/pin layout and leaderboard presentation.
- Existing a11y-friendly loading/error/no-group states.

### Conflicts with the Season One specification

- Route data comes from seeded `cities`, not Season One configuration.
- The map does not know about chapter title, weekly complication, evidence, outcome, data confidence, or week phase.
- It uses direct numeric progress language heavily; Season One wants numbers available but story consequences foregrounded.
- There is no primary beat area or ritual surface for Monday briefing, midweek update, final push, case close, evidence reveal, or next-city teaser.
- The map route currently supports a global loop, not a fixed 13-week season.

### Smallest recommended migration path

1. Keep the map as the home chase surface.
2. Extend `/api/weeks/current` with `season`, `chapter`, `phase`, `chase`, `primaryBeat`, and `dataConfidence`.
3. Add reusable narrative components above or within the existing map surface, beginning with Week 1 only.
4. Replace hardcoded city/recon copy with values from Season One config.

### Likely database/schema migrations

- Mostly depends on Season One config and weekly state migrations.
- No standalone map-specific table should be needed.

### Technical risks or ambiguities

- The map currently owns several bits of narrative copy directly in JSX. Those should move to config or reusable surfaces to avoid thirteen custom implementations.

## 4. Field Ops Board Configuration And Completion

### Relevant file paths

- `apps/api/src/db/migrations/001_init.sql`
- `apps/api/src/db/migrations/003_more_bingo_challenges.sql`
- `apps/api/src/db/migrations/004_field_ops.sql`
- `packages/shared/src/index.ts`
- `apps/api/src/services/bingo.ts`
- `apps/api/src/services/bingoService.ts`
- `apps/api/src/services/scoutService.ts`
- `apps/api/src/routes/fieldops.ts`
- `apps/api/src/routes/bingo.ts`
- `apps/web/app/(game)/fieldops/page.tsx`
- `apps/web/app/(game)/bingo/page.tsx`
- `packages/design-system/components/game/BingoTile.jsx`
- `packages/design-system/components/game/LandmarkCard.jsx`
- `apps/api/test/fieldops.integration.test.ts`
- `apps/api/test/scout.integration.test.ts`
- `apps/api/test/bingoIntraday.integration.test.ts`

### What the current system supports

- A 5x5 shared weekly Field Ops board, still stored as `bingo_cards`.
- Deterministic weekly card generation from `weekId`.
- Per-player accessibility substitutions for disabled objective categories.
- Verified detector tiles from steps, workouts, sleep, heart zones, intraday buckets, target streaks, group steps, nemesis day wins, daily rank, and hot pursuit.
- Honor-system tiles through `/api/fieldops/honor`.
- Gift-a-Tile assists through `/api/fieldops/gift`, limited to two assists per week.
- Board completion creates bingo lines and blackout state.
- Scout tokens from Field Ops lines unlock one recon landmark per day in the next city.
- Locked intel does not leak `fun_fact`.

### Reusable directly

- Board generation and detector engine.
- Honor and gift endpoints.
- Scout-token economy as a basis for weekly complications and special operations.
- `LandmarkCard` and Field Ops UI layout.
- Spoiler-safe payload rules.

### Conflicts with the Season One specification

- The board is still named `bingo` internally. That is fine technically, but Season One documentation and new APIs should use Field Ops language.
- Field Ops currently contributes intel and badges but not a capped chase bonus.
- Weekly complication behavior is not config-driven per chapter.
- There is no distinction in the schema between verified, self-reported, team, and choice tiles beyond `source = auto|honor` and category.
- No weekly special operation model exists yet.

### Smallest recommended migration path

1. Keep `bingo_cards` and challenge definitions as the Field Ops storage engine for now.
2. Add config overlays for Week 1 complication and later weekly variants rather than creating a second board system.
3. Add a Field Ops group-state helper that returns qualifying lines per active player and a bonus value capped at 5%.
4. Add a special-operation state model only after the central chase calculation service exists.

### Likely database/schema migrations

- Add fields to `bingo_challenge_definitions` for tile type if needed: `verified`, `self_reported`, `team`, `choice`.
- Add `weekly_special_operations` or config-backed persisted `special_operation_events`.
- Add a table for `field_ops_week_results` only if line history or bonus auditability cannot be reconstructed from cards.

### Technical risks or ambiguities

- Self-reported/honor tiles must not determine major competitive outcomes. Season One says they can enrich Field Ops, but chase math needs careful weighting.
- Current scout unlocks point one city ahead; Season One standard evidence is for the current weekly chapter, so evidence and recon intel should be related but not collapsed into one concept.

## 5. Prediction Submission And Reveal

### Relevant file paths

- `apps/api/src/db/migrations/001_init.sql`
- `packages/shared/src/index.ts`
- `apps/api/src/services/prediction.ts`
- `apps/api/src/services/weekClose.ts`
- `apps/api/src/routes/predictions.ts`
- `apps/web/app/(game)/prediction/page.tsx`
- `apps/web/app/(game)/map/PredictionSection.tsx`
- `packages/design-system/components/game/PredictionCard.jsx`
- `apps/api/test/predictions.integration.test.ts`

### What the current system supports

- One prediction per user per week.
- Predictions are hidden until everyone has submitted or Monday noon group-local.
- Submission is open only on the week start date.
- Current live group total is returned for UI context.
- Week close scores predictions by nearest actual group total, with earliest submission as tiebreak.
- The winner receives a `prediction_win` badge.

### Reusable directly

- `predictions` table and uniqueness constraint.
- `scorePredictions()` deterministic scoring.
- Existing hidden/revealed/final UI states.
- Oracle badge awarding in rollover.

### Conflicts with the Season One specification

- The spec's weekly cadence says predictions lock Friday, while current submission is Monday-only.
- Prediction participation does not yet contribute up to 1% to group chase progress.
- Prediction reveal language is still tied to "team calls" and not the sealed-estimates ritual.
- Oracle does not preview next-week details, which is optional, not a blocker.

### Smallest recommended migration path

1. Keep the current predictions table and scoring logic.
2. Move submission window/lock rules into a centralized weekly state service.
3. Add a prediction participation calculation to the Chase Calculation service.
4. Update UI language after the state service exists.

### Likely database/schema migrations

- Possibly add `predictions.locked_at` or `weeks.predictions_locked_at`.
- No new table is required for V1 unless prediction lock/reveal events need audit history.

### Technical risks or ambiguities

- The Season One spec says Friday lock but does not give an exact approved time.
- Existing users are trained to submit Monday; changing the window affects UX and tests.

## 6. Nemesis Pairing, Scoring, And Sudden Death

### Relevant file paths

- `apps/api/src/db/migrations/001_init.sql`
- `apps/api/src/db/migrations/006_sunday_nemesis_reveal.sql`
- `packages/shared/src/index.ts`
- `apps/api/src/services/nemesis.ts`
- `apps/api/src/services/nemesisService.ts`
- `apps/api/src/routes/nemesis.ts`
- `apps/api/src/routes/groups.ts`
- `apps/api/src/services/weekRollover.ts`
- `apps/api/src/services/cron.ts`
- `apps/web/app/(game)/nemesis/page.tsx`
- `packages/design-system/components/game/SkyscraperPair.jsx`
- `apps/api/test/weekRollover.integration.test.ts`

### What the current system supports

- Random weekly pairings via `pairPlayers()`.
- Odd group sizes produce a bye.
- Pairings are persisted in `nemesis_matchups`.
- Monday-Friday daily scoring; higher steps wins the day.
- Daily ties use earlier `target_hit_at` if available.
- Best-of-five tied after Friday moves to Saturday sudden death.
- If Saturday cannot resolve, week rollover falls back to weekly total; exact tie has no winner.
- Users can reroll once when a bye candidate exists.
- Sunday scheduled reveal exposes next week's nemesis before Monday.
- Group departure can dissolve/reassign matchups.

### Reusable directly

- Pairing, day scoring, sudden-death logic, and scheduled reveal.
- Existing `nemesis_matchups.daily_results` history.
- Nemesis UI and `SkyscraperPair`.
- Existing tests.

### Conflicts with the Season One specification

- Nemesis does not yet contribute up to 1% participation bonus to chase progress.
- Pairing is random; Season One only requires pairings, but narrative nemesis assignment may eventually want deterministic or story-aware logic.
- Current reroll may conflict with "pairing must be revealed Sunday so Monday starts with matchups known" if rerolls occur after reveal; this is probably acceptable but should be a deliberate product choice.
- Sudden death is implemented, but the spec still lists some sudden-death product questions as open.

### Smallest recommended migration path

1. Reuse all current nemesis mechanics.
2. Add a `nemesisParticipationBonus()` helper in Chase Calculation.
3. Add ritual beat/surface support for scheduled reveal and sudden death using current matchup state.
4. Keep reroll behavior unchanged until product explicitly revisits it.

### Likely database/schema migrations

- None required for V1 participation bonus if it can be computed from matchups and step logs.
- Optional future fields for assignment rationale or locked pairing state.

### Technical risks or ambiguities

- "Qualifying nemesis activity" is not precisely defined in the Season One spec.
- Missing tracker data in a duel needs trust-sensitive copy, especially for sudden death.

## 7. Badge And Reward Awarding

### Relevant file paths

- `apps/api/src/db/migrations/001_init.sql`
- `apps/api/src/db/migrations/002_seed_cities.sql`
- `apps/api/src/services/weekRollover.ts`
- `apps/api/src/routes/badges.ts`
- `apps/api/src/routes/users.ts`
- `apps/api/src/routes/cities.ts`
- `apps/web/app/(game)/profile/page.tsx`
- `apps/web/app/(game)/city/[cityId]/TrophyClient.tsx`
- `apps/web/lib/demo.ts`

### What the current system supports

- Badge definitions for city, prediction win, nemesis victor, bingo, blackout, hot pursuit, perfect week, and streaks.
- Badge awarding is idempotent per `(user_id, badge_code, week_id)`.
- Newly earned badges create achievement notifications.
- City badge quality depends on unlocked landmark count.
- Profile stats calculate all-time steps, weekly steps, city wins, bingo lines, and current city-badge streak.
- Past-city trophy view shows closed week stats, landmarks, and champion.

### Reusable directly

- `badges` table and `awardBadge()` helper.
- Badge definition pattern.
- Profile and trophy display patterns.
- Notification delivery for rewards.

### Conflicts with the Season One specification

- City badge currently goes to the weekly step leader only when `target_hit` is true; Season One says every week advances and should produce city result/evidence even at lower outcomes.
- Badge rewards do not include interception markers or group-season evidence rewards.
- Rewards are individual-first; Season One needs group-season persistence for evidence and weekly outcomes.
- Current badge code has no season awareness.

### Smallest recommended migration path

1. Keep current badge awarding for individual achievements.
2. Add separate group-season evidence/outcome persistence instead of overloading badges.
3. Decide how existing city badges relate to Season One city stamps.
4. Add interception/case-result badges only after outcome calculation exists.

### Likely database/schema migrations

- Add badge definitions for interception/case-close only if desired.
- Add `season_id` to badges only if multi-season badge filtering is required.
- More importantly, add group-season evidence/outcome tables described below.

### Technical risks or ambiguities

- The difference between a "city badge", "city stamp", and "weekly outcome marker" needs product naming clarity.
- Existing city badge quality by landmarks may not match Season One standard/enhanced/intercept evidence.

## 8. Evidence Or Intel

### Relevant file paths

- `apps/api/src/db/migrations/001_init.sql`
- `apps/api/src/db/migrations/004_field_ops.sql`
- `apps/api/src/services/scoutService.ts`
- `apps/api/src/routes/fieldops.ts`
- `apps/api/src/routes/cities.ts`
- `apps/web/app/(game)/fieldops/page.tsx`
- `apps/web/app/(game)/dossier/page.tsx`
- `apps/web/app/(game)/city/[cityId]/TrophyClient.tsx`
- `packages/design-system/components/game/LandmarkCard.jsx`
- `apps/api/test/fieldops.integration.test.ts`
- `apps/api/test/cities.integration.test.ts`

### What the current system supports

- `landmarks` are city-specific intel items.
- `city_unlocks` track team landmark unlocks for a week.
- `intel_cards` track a player's personal collected intel cards.
- Field Ops payload intentionally hides `fun_fact` for locked intel.
- Dossier access is group-scoped and does not reveal future or unearned intel facts.
- Past-city trophy view can show all landmark facts after the city has closed.

### Reusable directly

- Spoiler-safe locked/unlocked payload pattern.
- `LandmarkCard` UI.
- Dossier grouping by city.
- Group-scope access check for teammate dossier views.
- Team unlock mechanics as an input to evidence and weekly complications.

### Conflicts with the Season One specification

- Current intel is landmark/fun-fact based, not canonical Season One evidence.
- There is no standard evidence card per week, no Intercept Clue, no group-season evidence state, no interception count, and no finale depth tier.
- Current route has only a few seed cities, and landmarks do not match the locked Season One table.
- Current recon city is one ahead of the active week; Season One evidence belongs to the chapter being resolved, while next-city teaser/recon is a separate concept.

### Smallest recommended migration path

1. Preserve intel cards as Field Ops recon collectibles.
2. Add a separate Season One evidence configuration for standard evidence and Intercept Clues.
3. Add group-season evidence persistence keyed by `group_id`, `season_id`, `week_number`, and `evidence_id`.
4. Build Evidence Board UI using `LandmarkCard` design language but not the same data model.
5. Connect evidence unlock to finalized weekly outcome from the Chase Calculation service.

### Likely database/schema migrations

- `seasons`
- `season_weeks`
- `evidence_cards`
- `group_season_states`
- `group_week_results`
- `group_evidence_unlocks`

### Technical risks or ambiguities

- Some current docs use "intel" for landmarks and "evidence" loosely. Season One should keep these separate:
  - Field Ops intel: next-city recon and personal collection.
  - Season evidence: canonical plot memory and finale depth.

## 9. Health-Data Synchronization

### Relevant file paths

- `apps/api/src/services/fitbitClient.ts`
- `apps/api/src/services/realFitbitClient.ts`
- `apps/api/src/services/clientFactory.ts`
- `apps/api/src/services/sync.ts`
- `apps/api/src/services/cron.ts`
- `apps/api/src/routes/sync.ts`
- `apps/api/src/lib/crypto.ts`
- `apps/api/src/lib/backoff.ts`
- `apps/api/src/routes/auth.ts`
- `apps/api/test/fitbitClient.test.ts`
- `apps/api/test/realFitbitClient.test.ts`
- `apps/api/test/backoff.test.ts`

### What the current system supports

- A `FitbitClient` interface with `MockFitbitClient` for tests/dev.
- `RealFitbitClient` isolated as the only live Health API caller.
- Encrypted refresh tokens through `encryptToken()`/`decryptToken()`.
- Daily sync for steps, workouts, sleep, bedtime, active zone minutes, heart zones, and optional hourly steps.
- Upserted `step_logs` prevent duplicate daily rows.
- `target_hit_at` is set the first time a user hits daily target, supporting nemesis tiebreaks.
- Cron syncs at group-local midnight, noon, and 6 PM.
- Manual sync endpoint is rate-limited to once every ten minutes.
- User sync errors do not abort the whole group batch.

### Reusable directly

- The client abstraction and mock-vs-real split.
- The upserted daily log model.
- Existing cron cadence.
- Partial sync behavior where optional metrics can be null.
- PII-safe logging rules already reflected in comments and code.

### Conflicts with the Season One specification

- No explicit `DataConfidence` enum or sync freshness classification is exposed to the chase/narrative layer.
- No `recalculating` week state exists for late data that materially changes outcomes.
- Real intraday hourly steps are still intentionally `null` until sandbox smoke testing confirms the endpoint.
- The app has last synced timestamps, but not per-player freshness summaries for deciding whether Selena can make performance claims.

### Smallest recommended migration path

1. Add a sync-state helper that classifies each active player's tracker freshness as current, delayed, stale, disconnected, or missing.
2. Feed that into Chase Calculation as `dataConfidence`.
3. Make the beat engine suppress Selena taunts unless confidence is verified.
4. Add result-reconciliation handling before finalizing weekly outcomes.

### Likely database/schema migrations

- Possibly add `week_reconciliations` or `week_result_revisions` if recalculation history needs auditability.
- Possibly add per-user tracker/input-mode fields if eligibility requires them.

### Technical risks or ambiguities

- The real Health API is still pending a sandbox smoke test.
- The exact threshold for "materially changes outcome" needs product/engineering definition.

## 10. Demo Or Development Fixtures

### Relevant file paths

- `apps/web/lib/demo.ts`
- `apps/web/lib/api.ts`
- `apps/web/lib/session.tsx`
- `apps/api/src/services/fitbitClient.ts`
- `apps/api/test/helpers/db.ts`
- `apps/api/openapi.yaml`
- `apps/web/lib/api-types.d.ts`
- `.github/workflows/pages.yml`

### What the current system supports

- Static demo mode through `NEXT_PUBLIC_DEMO=1`.
- Baked fixtures for session, users, group, weeks, cities, predictions, Field Ops, dossier, nemesis, badges, and notifications.
- Demo mutation handling for notification read state.
- MockFitbitClient deterministic data for API tests and local development.
- Generated API types for frontend compile-time safety.

### Reusable directly

- Demo fixture pattern for GitHub Pages.
- API type generation workflow.
- Mock health data for deterministic tests.

### Conflicts with the Season One specification

- Demo route conflicts with the locked Season One route. It currently uses Chicago -> New York -> Washington, D.C. -> Los Angeles in the frontend fixture, while DB seed uses Chicago -> New York -> Reykjavik.
- Demo copy and landmark facts are older chase content, not Season One canonical evidence.
- Demo does not yet include Week 1 reference implementation states: all four outcomes, evidence reveal, Intercept Clue, trust-state beat, final push, and case close.

### Smallest recommended migration path

1. After adding Season One config, regenerate demo fixtures from the same config or manually align them to Week 1.
2. Keep demo mode static-export friendly.
3. Add fixture variants for Week 1 phases/outcomes as pages/components are implemented.

### Likely database/schema migrations

- None for demo directly, but API shape changes require OpenAPI and generated type updates.

### Technical risks or ambiguities

- Static export is sensitive to dynamic APIs and `searchParams`; the dossier page already handles this correctly with `useSearchParams()` inside `Suspense`.

## 11. Reusable Modal, Card, Progress, And Terminal Components

### Relevant file paths

- `packages/design-system/components/core/Card.jsx`
- `packages/design-system/components/core/Button.jsx`
- `packages/design-system/components/core/CountdownPill.jsx`
- `packages/design-system/components/core/StatCard.jsx`
- `packages/design-system/components/feedback/Toast.jsx`
- `packages/design-system/components/feedback/EmptyState.jsx`
- `packages/design-system/components/feedback/Skeleton.jsx`
- `packages/design-system/components/game/BingoTile.jsx`
- `packages/design-system/components/game/CityBadge.jsx`
- `packages/design-system/components/game/LandmarkCard.jsx`
- `packages/design-system/components/game/MapPin.jsx`
- `packages/design-system/components/game/PredictionCard.jsx`
- `packages/design-system/components/game/ProgressStrip.jsx`
- `packages/design-system/components/game/SelenaMark.jsx`
- `packages/design-system/components/game/SkyscraperPair.jsx`
- `packages/design-system/components/navigation/Sidebar.jsx`
- `packages/design-system/components/navigation/TabBar.jsx`
- `packages/design-system/tokens/base.css`
- `packages/design-system/tokens/colors.css`
- `apps/web/lib/toasts.tsx`
- `apps/web/lib/CallingCard.tsx`
- `apps/web/lib/CaseStatusStrip.tsx`
- `apps/web/lib/SundayCountdown.tsx`

### What the current system supports

- Core cards, buttons, stat cards, countdown pills, toasts, empty states, and skeletons.
- Game-specific components for avatars, board tiles, city badges/icons, landmarks, map pins, prediction cards, progress strips, Selena mark, and nemesis skyline duels.
- Field-terminal tokens, square-corner enforcement, paper-grain surfaces, corner brackets, phosphor glow, and red discipline.
- App-level narrative utilities: calling card, Sunday countdown, case status strip, and beat toast.

### Reusable directly

- Most existing design-system pieces.
- `LandmarkCard` as a visual basis for evidence cards, with a separate data model.
- `ToastShelf` and beat toast for short narrative messages.
- `ProgressStrip` and map pin route components.
- `CaseStatusStrip` and `SundayCountdown`, with care not to add competing reset clocks.

### Conflicts with the Season One specification

- There are no dedicated reusable ritual components yet for Monday briefing, midweek update, final push, sudden death, case close, evidence reveal, or next-city teaser.
- Some pages still use inline styles heavily, especially nemesis. That is workable, but reusable narrative surfaces will be harder if each ritual is page-local JSX.
- There is no general modal component visible in the audited design-system files. Existing dismissible surfaces are calling cards/toasts, not full modal/dialog components.

### Smallest recommended migration path

1. Build Season One narrative surfaces as reusable app components first, not design-system primitives, unless they become broadly reusable.
2. Reuse design-system tokens and components inside those surfaces.
3. Only promote components to `packages/design-system` after repeated use proves the abstraction.
4. Avoid adding a modal unless a ritual truly needs blocking focus management.

### Likely database/schema migrations

- None for UI components directly.

### Technical risks or ambiguities

- Ritual presentation must stay accessible without motion or sound.
- Red is already carefully reserved; new narrative surfaces must not overuse it.

## Cross-System Migration Path

The smallest safe path is:

1. Add Season One config first: season metadata, 13 weeks, evidence IDs, Intercept Clue IDs, weekly complication metadata, outcome-specific closing copy, and next-city teasers.
2. Add tests validating the config: unique weeks, locked route order, closing messages, evidence references, and no missing Week 1 content.
3. Add Chase Calculation service and unit tests before changing rollover.
4. Add weekly outcome persistence while keeping existing `target_hit` temporarily.
5. Add group-season evidence tables and unlock standard evidence/intercept clues from finalized outcomes.
6. Add a weekly phase service and expose phase through `/api/weeks/current`.
7. Build Week 1 narrative surfaces around the existing map, Field Ops, prediction, and nemesis screens.
8. Expand beat rules only after data confidence exists.
9. Align demo fixtures to Week 1 Chicago and static export.
10. Only then scale Weeks 2-13 from configuration.

## Required Or Likely Migrations

Likely minimum set:

- `seasons`
- `season_weeks`
- `evidence_cards`
- `group_season_states`
- `group_week_results` or expanded `weeks` columns
- `group_evidence_unlocks`
- `week_participants`
- `week_reconciliations` or `week_result_revisions`, if recalculation history is required

Likely `weeks` additions if not using `group_week_results`:

- `season_id`
- `season_week_id`
- `phase`
- `base_progress`
- `field_ops_bonus`
- `special_operation_bonus`
- `nemesis_participation_bonus`
- `prediction_participation_bonus`
- `final_progress`
- `remaining_lead`
- `projected_outcome`
- `final_outcome`
- `data_confidence`
- `finalized_at`

Likely content migration:

- Replace or extend seeded `cities`/`landmarks` to support the locked Season One route:
  1. Chicago
  2. Detroit
  3. Pittsburgh
  4. Washington, D.C.
  5. Philadelphia
  6. New York City
  7. Boston
  8. Savannah
  9. New Orleans
  10. Austin
  11. Santa Fe
  12. Los Angeles
  13. San Francisco

## Highest-Risk Technical Areas

- Rollover and late sync: changing close behavior can double-award rewards or finalize wrong outcomes if not tested carefully.
- Route migration: existing groups may have active weeks on old route data.
- Eligibility: Season One target math depends on active-player snapshots that do not exist yet.
- Evidence vs intel naming: reusing intel tables for canonical evidence would blur two different concepts.
- Prediction lock timing: changing from Monday-only prediction submission to Friday lock affects API behavior and UI expectations.
- Data confidence: Selena copy must not shame users or claim facts from stale tracker data.
- Static demo export: new narrative pages/components must avoid dynamic Next.js APIs outside Suspense/client components.

## Recommended First Implementation Target

Week 1 should not start by changing every screen. The safest first implementation target is:

1. Add Season One config with only Week 1 fully polished and Weeks 2-13 structurally present.
2. Add Chase Calculation service with tests and use it read-only in `/api/weeks/current`.
3. Add Week 1 narrative surface components that consume existing map/Field Ops/prediction/nemesis data.
4. Add evidence persistence after the outcome calculation is stable.

That path preserves the current game while baking in the narrative layer exactly where the existing systems already produce trustworthy facts.
