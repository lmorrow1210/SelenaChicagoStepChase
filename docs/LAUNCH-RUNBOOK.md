# Launch runbook - One Step Ahead (Selena's Chase)

For Lindsey. Plain language, do the steps in order. Written 2026-10-17 from the
code on `main` plus Google's current Health API docs (links in Appendix A).
Anything marked **UNCONFIRMED** is something the docs did not settle - the smoke
test (Part 2) is how you find out.

**Time pressure:** Google turns off the old Fitbit Web API on **Oct 30, 2026**
(support already ended Sep 30). This app only uses the new Google Health API, but
it means every player's Fitbit data must live in a Google account.

**Read this first - the 5 things most likely to bite you**

1. **Two different domains will break login.** The API sets a `SameSite=Lax`
   cookie. If the web app is `something.vercel.app` and the API is
   `something.railway.app`, the browser never sends that cookie on the web app's
   calls, so you "log in" and are instantly logged out. **Fix: put both on one
   domain you own** (`app.yourdomain.com` + `api.yourdomain.com`). See Part 6.
2. **Set `NODE_ENV=production` on Railway yourself.** If it is missing, cookies
   are not `Secure` and the `/api/auth/dev-login` back door is open to anyone.
3. **Set `HEALTH_API_MODE` explicitly.** With `NODE_ENV=production` and no
   `HEALTH_API_MODE`, the app defaults to **real**. Start with `mock`.
4. **Run exactly one API instance.** The hourly sync is a timer inside the API
   process. Two instances = every sync runs twice. Details in Part 4.
5. **Google "Testing" mode kills refresh tokens after 7 days.** Fine for the
   smoke test; before real players you must publish the OAuth app (Part 1).

---

## Part 1 - Google Cloud setup (about 30 min)

Use a **new, dedicated Google Cloud project** for production (Google recommends
separate projects per environment).

1. Go to <https://console.cloud.google.com>, create a project (e.g. `one-step-ahead-prod`).
2. **Enable the API:** APIs & Services > Library > search "Google Health API" > Enable.
3. **OAuth consent screen** (APIs & Services > OAuth consent screen / "Audience"):
   - User type: **External**. App name: "One Step Ahead". Support email: yours.
   - Authorized domain: your domain (e.g. `yourdomain.com`).
   - You will likely need a homepage and **privacy policy URL** to publish
     (UNCONFIRMED for these scopes - the console tells you). Have a simple
     privacy page ready that says what step/sleep/workout data you read and that
     you do not sell it.
4. **Scopes** (Data Access page > Add scopes > filter "Google Health API").
   The code requests exactly these (`apps/api/src/routes/auth.ts`):
   - `openid`, `email`, `profile`
   - `https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly` (steps, active zone minutes, exercise)
   - `https://www.googleapis.com/auth/googlehealth.sleep.readonly` (sleep)
   - `https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly` (heart-rate data; **the current code never reads anything that needs this one** - see Appendix A; removing it is optional and would reduce what Google reviews)
5. **Create the OAuth client:** Credentials > Create credentials > OAuth client ID >
   type **Web application**.
   - Authorized redirect URI (exact, no trailing slash):
     `https://api.yourdomain.com/api/auth/google/callback`
   - While smoke-testing also add `https://developers.google.com/oauthplayground`
     (remove it before launch).
   - Copy the Client ID and Client Secret somewhere safe (password manager).
6. **Test users:** Audience page > Test users > add the Google email of **every
   person who will sign in** (you, your sandbox account, QA friends). Limit: 100.
7. **Before real players: Publish app** (Audience > "Publish app" > In production).
   - Why: in Testing mode "refresh tokens issued are time-based and expire after
     7 days" (Google setup doc). The cron would then mark everyone disconnected weekly.
   - What happens: an unverified production app shows players a "Google hasn't
     verified this app" warning (Advanced > Continue). Fine for a friends game.
   - Limit: Google says supporting **more than 100 users requires a third-party
     security review**. Under 100 you can stay unverified.
8. Players must sign in with the **Google account their Fitbit data lives in**.

---

## Part 2 - Run the smoke test (about 15 min)

This is the one thing that has never been run against the real API. It prints
only HTTP status codes, field names/types and record counts - never step
numbers, tokens or email - so it is safe to paste the output to Claude/Codex.

**Get a short-lived access token (OAuth Playground):**

1. Open <https://developers.google.com/oauthplayground>.
2. Gear icon (top right) > tick **Use your own OAuth credentials** > paste your Client ID and Secret.
3. In the left box, scroll to the bottom, **Input your own scopes**, paste these three separated by spaces, click **Authorize APIs**:
   ```
   https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly https://www.googleapis.com/auth/googlehealth.sleep.readonly https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly
   ```
4. Sign in with a Google account that is in the **Test users** list and has Fitbit data for yesterday. Approve.
5. Click **Exchange authorization code for tokens**, copy the **Access token** (starts `ya29.`). It lasts ~1 hour.

**Run it** (from the repo root, after `npm ci`):

```bash
HEALTH_ACCESS_TOKEN='paste-token-here' npx tsx apps/api/scripts/health-smoke.ts
# or for a specific day:  ... health-smoke.ts 2026-10-16
```

(`npm run smoke:health -w apps/api` also works.) Then clear your terminal history / close the window.

**Read the result:**

| You see | Meaning | Do this |
|---|---|---|
| Last line `READY` and all `200` | The 4 calls the app makes all work | Go to Part 3 |
| `401` | Token expired/typo | Re-do the token steps |
| `403 PERMISSION_DENIED` | Account not a test user, API not enabled, or scope not granted | Re-check Part 1 steps 2, 4, 6 |
| `400 INVALID_ARGUMENT` on a `list` call | Filter or data-type name wrong | Send the output to Claude to fix `realFitbitClient.ts` |
| `429` | Rate limited (limit is 300 req/min/user) | Wait a minute, rerun |
| `fetchDay result` shows `steps: ZERO` | Wrong date, no data, or the parser missed the field | Try a date you know you walked; if still zero, send output to Claude |
| `active_zone_minutes: null` | The guessed AZM field names are wrong | Look at the `[shape: active-zone-minutes ...]` block and send it to Claude |
| `sleep_minutes: null` / `bedtime: null` | No sleep that morning, or field mismatch | Look at the `[shape: sleep list]` block |

**Things the test is specifically meant to settle (UNCONFIRMED in the docs):**
- AZM roll-up field names (the code guesses `sumInFatBurnHeartZone` etc.).
- Whether the `time-in-heart-rate-zone` roll-up is a better source for heart-rate zones (it is the documented type; the code uses active-zone-minutes).
- Whether the **hourly roll-up** probe (`windowSize: "3600s"`) returns 24ish buckets - needed to turn on intraday bingo (`steps_by_hour` is `null` today on purpose).
- Whether interval objects carry `startUtcOffset` (needed for the timezone problem in Part 7, "Known issue").

Send the whole output (it is safe) back to Claude/Codex before flipping to real.

---

## Part 3 - Environment variables (only what the code reads)

Generate secrets in any terminal:

```bash
openssl rand -hex 32     # run twice: once for JWT_SECRET, once for TOKEN_ENC_KEY
```

- `TOKEN_ENC_KEY` must be **exactly 64 hex characters** (that command gives that). **Back it up.** If it is lost or changed, every stored Google refresh token becomes unreadable and every player has to reconnect.
- Changing `JWT_SECRET` just logs everyone out.
- Never commit either. Never reuse your local dev values.

### Railway (API service)

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | **Required.** Turns on Secure cookies, disables dev-login. |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Use Railway's reference to the Postgres plugin (internal URL). |
| `JWT_SECRET` | 64-hex secret | |
| `TOKEN_ENC_KEY` | 64-hex secret | |
| `GOOGLE_CLIENT_ID` | from Part 1 | |
| `GOOGLE_CLIENT_SECRET` | from Part 1 | |
| `GOOGLE_REDIRECT_URI` | `https://api.yourdomain.com/api/auth/google/callback` | Must match Google console **exactly**. |
| `WEB_ORIGIN` | `https://app.yourdomain.com` | No trailing slash. Used for CORS **and** post-login redirects. |
| `HEALTH_API_MODE` | `mock` first, later `real` | Do not leave unset in production. |
| `HEALTH_API_BASE` | (leave unset) | Defaults to `https://health.googleapis.com/v4`. |
| `PORT` | (Railway sets it) | |
| `DISABLE_CRON` | (leave unset) | Set to `1` to turn off the hourly sync (kill switch, or any second service). |

`.env.example` also lists `CRON_TZ_STRATEGY` and `SENTRY_DSN`: **the code does not read them**; ignore.

### Vercel (web project)

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` | No trailing slash. **Baked in at build time** - changing it needs a redeploy. |
| `NEXT_PUBLIC_DEMO` | **unset** | `1` = fake-data demo mode, no backend. |
| `NEXT_PUBLIC_ENABLE_WEEK_SIMULATOR` | **unset** | `1` exposes `/dev/week-simulator`. |
| `NEXT_PUBLIC_BASE_PATH`, `NEXT_OUTPUT` | **unset** | GitHub Pages demo only; setting them breaks the Vercel build. |

(`TEST_DATABASE_URL` is for local/CI tests only.)

---

## Part 4 - Railway (API)

1. railway.app > New Project > **Deploy from GitHub repo** > this repo.
2. Add **PostgreSQL**: New > Database > PostgreSQL. Reference its URL from the API service (`DATABASE_URL` above).
3. API service > Settings:
   - **Root directory:** leave as repo root (the workspaces need the root `package.json`).
   - **Build command:** `npm run build -w apps/api`
   - **Start command:** `npm run start -w apps/api`
   - **Pre-deploy command:** `npm run migrate -w apps/api` (runs `node-pg-migrate up` against `DATABASE_URL` before each deploy; it only applies new migrations, so repeating it is safe). Prefer this over running migrations from your laptop: the laptop would need Railway's public database URL, which may need SSL settings this code does not set.
   - **Healthcheck path:** `/healthz`
   - **Node version:** must be **22.18 or newer** (the repo's root `package.json` now says so in `engines`). Reason: `@one-step-ahead/shared` ships as TypeScript source and the compiled API imports it at runtime; Node 22.18+ can run that, Node 20 cannot (reasoned from the code, not tested on Node 20; verified on Node 22.22). If the deploy log shows Node 20, set the variable `RAILPACK_NODE_VERSION=22` (or `NIXPACKS_NODE_VERSION=22` on the older builder).
   - **Replicas: exactly 1.** **Serverless / app sleeping: OFF.**
   - **Custom domain:** Settings > Networking > add `api.yourdomain.com`, create the CNAME Railway shows at your DNS provider.
4. Check: open `https://api.yourdomain.com/healthz` - expect `{"ok":true}`. Logs should show `cron: scheduler armed`.

**How the hourly sync runs (important):** it is a plain timer **inside the API process**
(`apps/api/src/index.ts:62-64`, `apps/api/src/services/cron.ts:221-236`), not Railway Cron.
It ticks at the top of every hour and syncs each group whose *local* hour is 0, 12 or 18
(noon / 6pm / midnight), plus Sunday nemesis reveal, Monday-noon reconcile and Monday-midnight week rollover.
Consequences:

- **One instance only.** Two instances both fire every tick (double syncs, double notifications). Railway also briefly runs old and new together during a deploy; harmless unless it spans a tick.
- **A tick that is missed is not replayed.** If the API is down/redeploying at the top of the hour, that sync does not happen later. The worst case is **Monday 00:00 Chicago** (week rollover only runs in that exact hour; there is no catch-up in `cron.ts:186`). **Do not deploy or restart around Sun 11:30 PM - Mon 12:30 AM Chicago**, and not around noon/6 PM if you can help it. Players can still hit "Sync now" (limited to once per 10 minutes) to cover missed steps, but not the rollover.
- The app must stay awake 24/7 (no sleeping plan).
- Optional later hardening (ask Claude/Codex): add a catch-up on boot, or move to Railway Cron hitting an authenticated endpoint.

---

## Part 5 - Vercel (web)

1. vercel.com > Add New > Project > import the repo.
2. **Root Directory:** `apps/web`. Keep **"Include source files outside of the Root Directory"** ON (the app imports `packages/design-system` and `packages/shared`).
3. Framework preset: Next.js (auto). Build/install/output: leave defaults (`next build`; Vercel installs from the repo root workspace).
4. Environment variables: only `NEXT_PUBLIC_API_URL` (Part 3). Confirm `NEXT_PUBLIC_DEMO` is **not** set.
5. Domains: add `app.yourdomain.com`, add the DNS record Vercel shows.
6. Deploy. The build downloads Google Fonts, which works on Vercel.
7. Check: `https://app.yourdomain.com/login` shows the real "Connect" button, **no** dev-login form (it is hidden in production builds, and the API also rejects it).

If you change `NEXT_PUBLIC_API_URL` later, trigger a redeploy.

---

## Part 6 - Cross-domain checklist (read the code facts)

What the code does today:
- Session cookie `sc_session`: `httpOnly`, `Secure` (only if `NODE_ENV=production`), **`SameSite=Lax`**, path `/`, **no `Domain`** (host-only) - `apps/api/src/lib/session.ts:33-41`.
- Login-state cookie `sc_oauth_state`: same flags, path `/api/auth/google` - `apps/api/src/routes/auth.ts:76-83`.
- CORS: one allowed origin = `WEB_ORIGIN`, credentials on, headers `Content-Type` only - `apps/api/src/index.ts:29-39`.
- Web calls: `fetch(API_BASE + path, { credentials: "include" })` - `apps/web/lib/api.ts:34`. Login is a full-page jump to `API/api/auth/google`.

What that means:

1. **`*.vercel.app` + `*.railway.app` = broken.** They are different "sites". A `Lax` cookie is not sent on cross-site `fetch` calls, so every call after login is a 401 and the app bounces you to login. Switching to `SameSite=None` is *not* a real fix: iOS Safari and other browsers block third-party cookies anyway.
2. **Fix (recommended): one registrable domain.** `app.yourdomain.com` (Vercel) + `api.yourdomain.com` (Railway). Same site, so `Lax` works, no code change. Then:
   - `WEB_ORIGIN=https://app.yourdomain.com`
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
   - `GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/auth/google/callback` (and the same string in the Google console)
3. **OAuth redirect** goes to the *API* callback, which sets the cookie on `api.yourdomain.com` then redirects to `WEB_ORIGIN/onboarding` (new user) or `/map`. That works as above. The state cookie is set by the same API host on the way out and read on the way back, so it is fine.
4. **Not recommended:** proxying `/api` through Vercel rewrites. `next.config.mjs` sets `trailingSlash: true`, which would 308-redirect API paths. Needs code work.
5. CORS has no `Vary: Origin` and allows a single origin - fine for one web domain. A Vercel *preview* URL will be blocked by CORS (expected; test on the production domain).
6. No `trust proxy` is set. Nothing breaks (cookies do not need it); you may see a harmless rate-limit warning in the logs from `express-rate-limit`.

**Decision for you:** which domain do you own/want to use? Without one, don't launch to real users.

---

## Part 7 - Flip to real data

Do this only after Part 2 passed and Parts 4-6 work with `HEALTH_API_MODE=mock`.

1. Railway > API service > Variables > `HEALTH_API_MODE=real`. Railway redeploys (do it at a quiet time, see Part 4 timing warning).
2. Sign in on your phone, connect Google, approve all three Health permissions.
3. In the app press **Sync now** (don't wait for noon). Confirm: last-synced time updates; your step total looks right vs. the Fitbit/Google Health app on your phone.
4. Watch **Railway > Deployments > Logs** for these lines (they contain ids only, never steps/tokens/email):
   - `cron: scheduler armed` - good.
   - `cron: sync failed for user ...` - an API/parse error for that person. Copy the line to Claude.
   - `cron: invalid_grant for user ...; marked disconnected` - that person's Google refresh token is dead (Testing-mode 7-day expiry, or they revoked). They must reconnect.
5. After the first scheduled tick (noon/6 PM/midnight Chicago), check the database for **silent zeros**: if the Google response shape ever changes, the client records `0` steps instead of failing (`realFitbitClient.ts:224`, `?? 0`). In Railway > Postgres > Data/Query:
   ```sql
   SELECT count(*) AS rows_today,
          count(*) FILTER (WHERE steps = 0) AS zero_rows,
          max(synced_at) AS last_sync
   FROM step_logs WHERE log_date = current_date;
   ```
   Many `zero_rows` right after a sync = parser problem; flip back to `mock` (Part 9) and send Claude the smoke output.
6. Know the **limits of real data today**:
   - `steps_by_hour` is `null`, so the two intraday bingo tiles (steps before/after a time) stay incomplete. Expected.
   - **Known issue - time zones:** the real API returns UTC timestamps for workouts and bedtime, but the bingo checks (`apps/api/src/services/bingo.ts:212` and `:269`) read the **UTC hour** as if it were local. For Chicago players "in bed before 11 PM" and time-of-day workout tiles will mostly evaluate wrong. Needs a code fix (convert using each interval's `startUtcOffset`) before those tiles are trusted; see smoke output for whether the offset field exists. Tell Claude/Codex.
   - Sleep takes the first returned session as the main sleep (`realFitbitClient.ts:277`); a nap logged later could be picked up instead. Minor.
   - Heart-rate zones come from the active-zone-minutes roll-up, not the documented zone types. If `hr_zones` is `null` in the smoke output, that is why.

---

## Part 8 - Physical-device QA checklist

Test on a real iPhone (Safari) and a real Android phone (Chrome), on cellular as well as Wi-Fi, against the **production** URLs. Items come from `AGENTS.md`.

**Login and session (the cross-domain risk)**
- [ ] Tap Connect > Google consent > land on onboarding (new) or Map (returning).
- [ ] Pull to reload / close and reopen the tab: still signed in (not bounced to login).
- [ ] iOS: repeat once in a **Private** tab and once with "Prevent Cross-Site Tracking" on (default) - still works.
- [ ] Log out, log in again. Disconnect Fitbit on Profile, reconnect.
- [ ] No dev-login form anywhere.

**Layout and touch (AGENTS "Mobile" rules)**
- [ ] Tapping any text field does **not** zoom the page on iPhone (inputs >= 16px).
- [ ] Every button/tab is easy to hit with a thumb (>= 44px targets).
- [ ] Bottom tab bar clears the iPhone home indicator / Android gesture bar (safe-area); nothing hidden behind it, in portrait and landscape.
- [ ] No sideways scrolling on any screen (check at phone width and rotated): login, onboarding, map, city, field ops, prediction, bingo, nemesis, evidence, profile.
- [ ] Browser top bar color matches the theme; "Add to Home Screen" gives the right name, icon (apple-touch icon on iOS) and opens full-screen.

**Design rules**
- [ ] Square corners everywhere (no rounded buttons/cards).
- [ ] Green phosphor text is readable outdoors in sunlight; muted gray-green text still legible.
- [ ] Red appears rarely (Selena/threat/urgency/stamps only); team progress is bright green, not red.
- [ ] Tan "printout" cards have no glow on their text.
- [ ] Only one "She vanishes in ..." countdown appears (Sunday 11:59 PM).
- [ ] Turn on OS "Reduce Motion": animations calm down.

**Game rules (spoilers)**
- [ ] Locked Field Ops intel shows no fun-fact text anywhere; unlocked shows it after decoding.
- [ ] Dossier shows blank slots for cities not yet reached.
- [ ] Only one player's data visible per group member; can't open another group's dossier.

**Sync**
- [ ] "Sync now" works once, second tap within 10 minutes shows the "once every 10 minutes" message.
- [ ] Step total matches the Fitbit/Google Health app.
- [ ] A second phone in the same group sees your updated totals after a refresh.

---

## Part 9 - Rollback

| Problem | Fast fix |
|---|---|
| Bad numbers/parse errors after going real | Railway > Variables > `HEALTH_API_MODE=mock` (redeploys, ~1 min). Real rows already saved stay; re-sync later overwrites them (upsert per user per day). |
| Syncs misbehaving / double-running | Set `DISABLE_CRON=1` (stops the timer; "Sync now" still works), confirm replicas = 1. |
| Bad web release | Vercel > Deployments > previous good one > **Promote to Production** (instant). |
| Bad API release | Railway > Deployments > previous > **Redeploy/Rollback**. |
| Bad migration | Migrations here are forward-only SQL (no down). Before the **first** migration that touches real player data, take a database backup (Railway Postgres backup if your plan has it, or `pg_dump` with the public URL). Fix forward with a **new** numbered migration; never edit a shipped one. |
| Leaked secret | Rotate `JWT_SECRET` (logs everyone out). For `GOOGLE_CLIENT_SECRET`, reset it in Google console and update Railway. `TOKEN_ENC_KEY` can't be rotated without everyone reconnecting. |
| Everything on fire | Make the API return nothing: pause the Railway service; the Vercel site just shows errors. The GitHub Pages demo (fake data) stays up independently. |

---

## Appendix A - Health API: what the code does vs. what the docs say

Checked 2026-10-17 against Google's pages (could reach all of them; none of the pages I could read gave full roll-up field schemas, so those are marked UNCONFIRMED). Confidence = how sure I am the **code is correct**.

| Area | Code does | Docs say | Match / confidence | Source |
|---|---|---|---|---|
| Base URL | `https://health.googleapis.com/v4` | same | Match, high | developers.google.com/health/endpoints |
| Steps daily | `POST /users/me/dataTypes/steps/dataPoints:dailyRollUp`, body `range.start/end.date{year,month,day}`, `windowSizeDays:1`; reads `rollupDataPoints[0].steps.countSum` | Same path/body; response example `steps.countSum: "3822"` (a string; code parses strings) | Match, high | .../aggregate-data, .../dataPoints/dailyRollUp |
| Active zone minutes | `dailyRollUp` on `active-zone-minutes`; reads `activeZoneMinutes.sumInFatBurnHeartZone / sumInCardioHeartZone / sumInPeakHeartZone` | Type and method exist; **field names not published** on pages reachable | Path OK; field names UNCONFIRMED, low | .../data-types, .../rollUp |
| Heart-rate zones | Derived from the AZM roll-up | Documented zone types are `time-in-heart-rate-zone` (list/rollUp/dailyRollUp) and `calories-in-heart-rate-zone`; migration page maps "heart rate zones" to the latter | Different source than docs; low | .../migration/api-specifications |
| Exercise | `GET .../exercise/dataPoints?pageSize=25&filter=exercise.interval.civil_start_time >= "D" AND ... < "D+1"` | Filter field and `YYYY-MM-DDTHH:mm:ss` format documented; page size max 25; AND only | Match, high. Reads `exercise.interval.startTime/endTime`, `exerciseType`, `metricsSummary.activeZoneMinutes` - all exist in the schema | .../dataPoints/list, .../filters |
| Sleep | Same, with `sleep.interval.civil_end_time`; first result = main sleep; reads `sleep.summary.minutesAsleep`, `interval.startTime` | `civil_end_time` filter and `summary.minutesAsleep` documented. Results sorted by start time, newest first, so "first" may be a nap | Match, high (nap caveat) | .../filters, .../dataPoints |
| Intraday / hourly steps | Not called (`steps_by_hour: null`) | `rollUp` supports `windowSize` (seconds string, min 1s) with UTC `range.startTime/endTime`; raw intervals via `list` with `steps.interval.civil_start_time`. A `3600s` hourly example is not shown | Not implemented; hourly feasibility likely but UNCONFIRMED. Smoke test probes both | .../aggregate-data, .../rollUp |
| Scopes | `activity_and_fitness.readonly`, `sleep.readonly`, `health_metrics_and_measurements.readonly` (+ openid/email/profile) | AZM, steps, exercise, time-in-HR-zone = `activity_and_fitness`; sleep = `sleep`; `health_metrics_and_measurements` covers `heart-rate`, `daily-heart-rate-zones` which the code does not read | Third scope looks unnecessary, medium | .../scopes, .../data-types |
| Token endpoint / refresh | `google-auth-library` OAuth2Client (Google standard token endpoint); `invalid_grant` => reconnect | Docs: Testing-mode refresh tokens expire in 7 days; production tokens last until revoked or ~6 months unused | Behavior OK; **7-day expiry is a launch blocker for Testing mode**, high | developers.google.com/health/setup |
| Rate limits | Backoff on 429/503, sync button 1 per 10 min | 300 req/min per user; 5 QPS/user standard; unverified apps 250 QPS total; docs say retry **429 and 504** | Fine. Minor: 504 not retried (`lib/backoff.ts:11`), low impact | .../rate-limits, .../endpoints |
| App verification / test users | n/a | New clients are unverified, capped at 100 users, test users must be added manually; >100 users needs third-party security review. Sensitive/restricted classification of the scopes: **not stated on pages I could read** | Process item; classification UNCONFIRMED - check the console Data Access page | .../setup |
| Sandbox | n/a | No separate sandbox environment found; testing = a Testing-mode project with test users and real Google accounts | Medium | .../setup |

Request-per-sync cost: 4 calls per user per date (steps, AZM, exercise, sleep), well inside the limits.

## Appendix B - Source links

- <https://developers.google.com/health/endpoints>
- <https://developers.google.com/health/aggregate-data>
- <https://developers.google.com/health/filters>
- <https://developers.google.com/health/scopes>
- <https://developers.google.com/health/data-types>
- <https://developers.google.com/health/setup>
- <https://developers.google.com/health/rate-limits>
- <https://developers.google.com/health/migration/api-specifications>
- <https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints>
- <https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints/list>
- <https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints/dailyRollUp>
- <https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints/rollUp>
