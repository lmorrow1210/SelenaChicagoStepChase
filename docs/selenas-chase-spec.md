# Selena's Chase — Product Spec v1

A web-first (mobile-responsive) fitness social game powered by the Google Health API (Fitbit data). Players chase the villain Selena Chicago around the world, competing and collaborating on weekly fitness goals.

---

## Concept

Selena Chicago — a mysterious, globe-trotting figure in a sky blue trench coat — is always one city ahead of your crew. Your group chases her across the world using real Fitbit data. Every week you travel to a new city, compete for the city badge, unlock landmarks together, and settle rivalries along the way.

---

## Tech Stack

- **Frontend:** React / Next.js (web-first, mobile-responsive)
- **Backend:** Node.js / Express
- **Database:** PostgreSQL
- **Auth:** Google OAuth 2.0
- **Fitness Data:** Google Health API (Fitbit) — `health.googleapis.com/v4/`
- **Hosting:** TBD (Vercel + Railway recommended)

---

## Design System

### Colors
| Token | Name | Hex | Use |
|---|---|---|---|
| `--navy` | Midnight Navy | `#0A1628` | Base background |
| `--card` | Card Navy | `#0F2240` | Cards, panels |
| `--blue` | Chicago Blue | `#41B6E6` | Primary UI, Selena's world |
| `--red` | Chicago Red | `#CC0000` | Competition, rivalry, action |
| `--gold` | Achievement Gold | `#D4A820` | Unlocks, badges, wins |
| `--cream` | Warm Cream | `#F0E8DC` | Primary text |
| `--muted` | Muted Blue-Grey | `#4A6080` | Secondary text, disabled |

### Typography
- **Display / headers:** `Barlow Condensed`, weight 700 — bold, game-title energy
- **Body:** `DM Sans`, weight 400/500 — clean, readable
- **Numbers / data:** `DM Mono` — all step counts, stats, timers

### Motion
- Route traces draw on page load (path animation)
- Landmark reveals: silhouette dissolve to color
- Skyscraper heights: animate upward on load
- City arrival: screen transition with confetti burst
- Keep motion subtle on mobile (respect reduced-motion)

---

## Avatar System

Every player gets a mini trench coat figure — same character base as Selena Chicago — customized across three axes. Chosen at onboarding, editable in Profile.

### Skin Tone (6 options)
| # | Name | Hex |
|---|---|---|
| 1 | Porcelain | `#F5E6D3` |
| 2 | Warm Beige | `#E8C99A` |
| 3 | Golden Tan | `#C89460` |
| 4 | Caramel | `#A0652A` |
| 5 | Warm Brown | `#7D4A25` |
| 6 | Deep Espresso | `#3D1F0A` |

### Hair Color (8 options)
| # | Name | Hex |
|---|---|---|
| 1 | Jet Black | `#0D0500` |
| 2 | Deep Brown | `#2C1208` |
| 3 | Auburn | `#7A2E10` |
| 4 | Dirty Blonde | `#A07840` |
| 5 | Golden Blonde | `#C8A030` |
| 6 | Silver | `#A0A8B0` |
| 7 | Warm Red | `#B02010` |
| 8 | Midnight Blue | `#0A1845` |

### Colorway (6 preset outfit schemes — coat + boots/gloves)
| # | Name | Coat/Hat | Boots/Gloves |
|---|---|---|---|
| 1 | Chicago (default) | `#41B6E6` sky blue | `#CC0000` red |
| 2 | Midnight | `#1A1A2E` black | `#D4A820` gold |
| 3 | Emerald | `#1E4D2B` forest green | `#F0E8DC` ivory |
| 4 | Crimson | `#8B0000` deep red | `#1A1A1A` black |
| 5 | Desert | `#C4956A` camel | `#8B3A0F` rust |
| 6 | Violet | `#3D1A6B` deep purple | `#A8A8B8` silver |

---

## User Flows

### Onboarding (new user)
1. Landing / login page → **Sign in with Google**
2. **Connect Fitbit** — Google Health API OAuth consent screen
3. **Set weekly step target** — default pre-filled at 70,000 (10k/day). Slider input, range 35,000–140,000.
4. **Customize avatar** — skin tone → hair color → colorway (3 steps, live preview of figure)
5. **Create or join a group** — two paths:
   - Create: enter group name → get shareable invite code/link
   - Join: enter 6-character invite code
6. **Land on Map screen** — onboarding complete

### Returning user
- Sign in with Google → land on Map screen

### Weekly loop
| Day | Event |
|---|---|
| Monday 12:00am | New week begins. New city unlocked. Prediction window opens. Nemesis assigned. Fresh Bingo card generated. |
| Mon–Sun | Steps accumulate. Each day: workout unlock window for City Depth. |
| Sunday 11:59pm | Week closes. Steps tallied. City badge awarded. Nemesis result final. Bingo card frozen. Prediction scored. |
| Monday 12:00am | Repeat — group moves to next city on route |

---

## Navigation

### Desktop
Left sidebar (fixed, 60px wide collapsed / 200px expanded on hover):
- Top: Selena logo / game name
- Nav items in order: Map, Prediction, City, Bingo, Nemesis
- Bottom: Player avatar (opens Profile)

### Mobile
Bottom tab bar (5 icons, labels below):
- Map | Prediction | City | Bingo | Nemesis
- Profile accessible via avatar tap on Map screen (top right)

---

## Screen 1 — Map

The home screen. Full viewport. The gravitational center of the app.

### Layout (top to bottom)
1. **Map hero** (~55% of viewport height)
   - Dark, atmospheric world map — latitude/longitude grid lines, subtle
   - Illustrated route showing path already traveled (dotted line trailing behind)
   - Current city pin (glowing) and next city pin (dimmer, with Selena's icon)
   - Selena's mini figure at next city, always ahead
   - Tapping Selena shows tooltip: *"Selena is 24,320 steps ahead of your group"*
   - Tapping current city pin → navigates to City screen

2. **Progress strip** (~20% viewport)
   - City A icon (left) → **straight horizontal line** → City B icon (right)
   - Straight line (not winding) — exists purely for comparison, not aesthetics
   - Each player's mini avatar sitting on the line at their step position
   - Position = (player's steps this week) / (player's weekly step target) × line length
   - Player name + step count on tap/hover
   - Note: the world map above uses a winding illustrated route for travel feel; this strip is the clean competitive view

3. **Weekly leaderboard** (~25% viewport)
   - Compact list: rank, avatar, name, steps this week, delta vs. last week
   - Current user row highlighted
   - Sorted by steps descending
   - Scroll if group > 5

### States
| State | Display |
|---|---|
| Week in progress | Default view above |
| Monday (new week start) | Animated city transition: arrival confetti, "You've arrived in [City]!" card |
| Sunday evening | Countdown timer visible: "X hours until week closes" |
| No group yet | Overlay prompt: "Create or join a group to start chasing Selena" |

---

## Screen 2 — Prediction

Globe-centric screen. Slightly mystical, low-key dramatic.

### Layout
- Full-bleed globe illustration as background (slow rotation or parallax scroll)
- Center card (semi-transparent dark panel):
  - Headline: *"Where will your crew land this week?"*
  - Subtext: Group's combined step total for the current week (live)
  - **Your prediction input:** large numeric input / scroll wheel
  - Submit button: *"Lock it in"*
- After submission: other players' predictions revealed (or "Waiting for X players…")
- Countdown to Sunday midnight

### Mechanics
- One prediction per player per week, submitted before Monday midnight
- Predictions hidden until all submitted OR Monday noon — whichever comes first
- End of week: closest prediction to actual group total wins
- Prediction history and win count tracked on Profile

### States
| State | Display |
|---|---|
| Pre-submission | Input your prediction |
| Submitted, awaiting others | Your prediction confirmed, waiting count shown |
| All in (or noon Monday) | All predictions revealed, ranked by closeness to actual |
| Week closed | Final result — who won, actual total, delta from each prediction |

---

## Screen 3 — City

The landmark unlock screen. One week = one city.

### Layout
- Full-bleed background: atmospheric photo or illustrated artwork of current city
- City name + country at top (large display type)
- **7 landmark slots** in a grid layout: 3 across top, 2 middle, 2 bottom (or 3-2-2)
- Each slot:
  - **Locked:** dark silhouette of the landmark
  - **Unlocked:** full-color illustration or photo + landmark name + one-line fun fact
  - **Today's slot:** glowing border if today's workout goal not yet hit; celebration state if hit
- Below grid: group workout status for today
  - Mini avatars of each player — green checkmark if they've logged a workout today, empty if not
  - Progress: "3 of 5 worked out today — 1 more to unlock!"

### Mechanics
- Landmarks unlock Mon–Sun (Day 1 = Day 7 of the week)
- Unlock condition: **every player in the group** must log a workout that day
- Walking counts as a workout (Fitbit logs it automatically) — threshold is intentionally easy to hit
- If even one player has zero activity logged by end of day, that day's landmark stays locked
- Day 1 = most iconic/famous landmark
- Day 7 = hidden gem / local secret
- Completed city → badge added to Profile, fully revealed, read-only

### Unlock animation
- Silhouette dissolves with a color fill bloom effect
- Toast notification: *"[Player] logged a workout — [Landmark Name] unlocked!"*

### Landmark data structure (per city)
```
city: {
  name: "Tokyo",
  country: "Japan",
  background_image: url,
  landmarks: [
    { day: 1, name: "Senso-ji Temple", fun_fact: "...", image: url },
    { day: 2, name: "Shibuya Crossing", fun_fact: "...", image: url },
    ...
    { day: 7, name: "Yanaka Cemetery", fun_fact: "Tokyo's best-kept secret...", image: url }
  ]
}
```

### States
| State | Display |
|---|---|
| Current city | Active — shows today's unlock challenge |
| Past city (badge earned) | Fully revealed, read-only trophy view |
| Future city | Blurred/hidden — "Coming soon" |

---

## Screen 4 — Bingo

A 5×5 bingo card styled as a top-down city block grid. Personal — not directly competitive, but visible to friends.

### Layout
- 5×5 grid of "city block" tiles (25 squares)
- Center square: FREE SPACE (auto-complete, Selena illustration)
- Each tile shows:
  - Challenge icon + short label
  - Completion indicator (filled block vs. outline)
- Below grid: current bingo count ("1 Bingo — keep going!") and streak to blackout
- Friend progress: compact row showing how many bingos each friend has this week

### Challenge tile types
Mixed across all data types available from Fitbit:

**Steps**
- 10,000 steps in a single day
- 7,000 steps before noon
- Hit your daily target 5 days in a row
- Group collectively hits 200,000 steps

**Workouts**
- Log any workout today
- 3 workouts this week
- 30+ active zone minutes
- Log a workout before 8am

**Sleep**
- 7+ hours of sleep
- In bed before 11pm two nights in a row
- 8+ hours on a weekend night

**Heart rate**
- Hit cardio zone during a workout
- 20 min in fat burn zone

**Social / competitive**
- Beat your nemesis today
- Be #1 on the leaderboard for any single day
- Log a workout on a day the whole group does (Hot Pursuit)

**Wildcard**
- Take a full rest day (0 logged workouts, still hit steps)
- Log steps in 3 different countries/cities (via GPS, optional)
- Hit your step target on a Monday

### Mechanics
- New card generated each Monday
- Tiles auto-complete when Fitbit data confirms the challenge
- Bingo (row/column/diagonal) = weekly Bingo badge
- Full blackout = rare Blackout badge
- No manual input — all auto-detected

### Visual states
- Incomplete: outlined grey tile, muted icon
- In progress (partial): outlined with blue glow
- Complete: filled tile, color, checkmark
- Bingo line: animated highlight sweep across completed row/column/diagonal

---

## Screen 5 — Nemesis

Head-to-head. Dramatic. Best of 5 daily steps.

### Layout
- Dark full screen — most intense visual in the app
- **Top:** Score bar — "[Your name] 3 — 2 [Nemesis name]" with avatars on each side
- **Center:** Skyline visualization
  - 5 side-by-side building pairs (Mon–Fri, or current week's days)
  - Left building = your steps that day
  - Right building = nemesis steps that day
  - Building height proportional to step count (normalized to max across both)
  - Taller building gets gold crown icon
  - Buildings styled after current city's architecture aesthetic
  - Future days: grayed-out foundation outlines
  - Current day (if in progress): building animates/pulses
- **Bottom:** Context strip — today's step count for each, percentage to daily target

### Mechanics
- Nemesis assigned Monday at random within group (can re-roll once)
- Best of 5 on highest daily steps (Mon–Fri)
- Ties broken by whoever hit the step count earlier in the day
- Winner gets Nemesis Victory badge for the week
- Saturday/Sunday not counted — 5 weekdays only
- Rematch or new nemesis option on Monday

### States
| State | Display |
|---|---|
| No nemesis yet | Prompt: "Get your nemesis" button — auto-assign or challenge specific friend |
| Week in progress | Buildings shown for completed days, outlines for future days |
| Tie after 5 days | Sudden death: next day (Saturday) used as tiebreaker |
| Week complete | Final score, winner banner, crown animation, rematch prompt |

---

## Profile Screen

Accessible via avatar icon in nav.

### Layout
- Large avatar display (animated idle loop if possible — figure sways slightly)
- Display name + group name
- **Stats row:** Cities earned | Current win streak | All-time steps (formatted as miles/km)
- **Badge collection:** grid of earned badges — city badges + special badges
  - City badges: labeled with city name, quality reflects landmark unlocks (bronze/silver/gold border)
  - Special badges: Bingo, Blackout, Nemesis Victor, Prediction winner, Hot Pursuit, Perfect Week
- **Edit avatar:** opens avatar customization (skin tone → hair → colorway)
- **Settings:** step target, notifications, disconnect Fitbit, sign out

---

## Badge System

### City Badges (weekly, winner only)
Earned by having the most steps in the group for the week.

Badge quality based on landmark unlocks that week:
- **Bronze border:** 0–2 landmarks unlocked
- **Silver border:** 3–5 landmarks unlocked
- **Gold border:** 6–7 landmarks unlocked

### Special Badges
| Badge | Trigger |
|---|---|
| Prediction Win | Closest group step prediction for the week |
| Nemesis Victor | Won best-of-5 Nemesis matchup |
| Bingo | Completed one bingo line on the weekly card |
| Blackout | Completed all 25 squares on the weekly card |
| Hot Pursuit | Whole group logged a workout on the same day |
| Perfect Week | Hit personal step target every single day |
| 3-Win Streak | Won city badge 3 weeks in a row |
| 6-Win Streak | Won city badge 6 weeks in a row |
| 12-Win Streak | Won city badge 12 weeks in a row — rare |

---

## Group Management

- **Max group size:** 8 players (keeps competition intimate and readable)
- **Group name:** set by creator at onboarding
- **Invite:** shareable 6-character code + link
- **Admin powers:** remove player, rename group
- **One group per account** (v1)
- **No group?** Map screen shows onboarding prompt until joined

---

## City Route

The world travel route is pre-defined — Selena's itinerary. Suggest 30–40 cities to start, covering all continents. Examples:

Chicago (start) → New York → Reykjavik → London → Paris → Berlin → Rome → Istanbul → Cairo → Nairobi → Cape Town → Dubai → Mumbai → Bangkok → Tokyo → Seoul → Sydney → Lima → Buenos Aires → São Paulo → Havana → Mexico City → Los Angeles → Chicago (loop)

Each city requires 7 pre-written landmarks. City order is fixed for all groups — everyone is chasing Selena on the same route.

---

## Distance Mechanics

### Total distance per city leg
Sum of all players' weekly step targets.

Example: 5 players × 70,000 steps = **350,000 group target steps**

This equals the total "distance" between City A and City B.

### Individual position on progress strip
`position = (player's steps this week) / (player's weekly step target)`

Displayed as position on the road between cities (0% = City A, 100% = City B).

### Group arrival
Group "arrives" when collective total steps ≥ group target. On a perfect week where everyone hits their target, you land exactly at the next city.

A short week = you fall short and carry over (or optionally: arrival is guaranteed weekly and the step performance just determines badge quality).

> **Design decision — resolved:** Group always advances to the next city each week regardless of step totals. However, the city badge is only awarded if the group collectively hits the target. A week where the group falls short = they move to the next city but no badge is earned for that leg. Badge quality (bronze/silver/gold) is based on landmark unlocks.

---

## Data Summary

### From Google Health API (per user, with consent)
| Data | Endpoint | Used For |
|---|---|---|
| Daily steps | `steps` | Map position, leaderboard, Nemesis, Bingo |
| Workout logs | `activities` | City Depth unlock, Bingo |
| Active zone minutes | `active-zone-minutes` | Bingo |
| Sleep duration + stages | `sleep` | Bingo |
| Heart rate zones | `heart-rate` | Bingo |

### Stored in app database
| Table | Contents |
|---|---|
| `users` | Profile, avatar config, step target, Google/Fitbit tokens |
| `groups` | Group name, invite code, member list, admin |
| `weeks` | Start/end dates, current city, group target steps |
| `step_logs` | Daily step cache per user (synced from Fitbit) |
| `predictions` | Player, week, predicted value, actual delta |
| `nemesis_matchups` | Week, player A, player B, daily results |
| `bingo_cards` | Week, player, 25-tile state |
| `city_unlocks` | City, day, unlocked boolean, triggering player |
| `badges` | Player, badge type, week earned, city |

---

## Open Questions

1. **Group arrival mechanics:** Always advance weekly; no badge if group target not hit. ✅ Resolved.
2. **Workout unlock threshold:** Everyone must log activity (walking counts). ✅ Resolved.
3. **Nemesis weekend tiebreaker:** Use Saturday or go straight to next Monday?
4. **City landmark content:** Source from a curated database, Unsplash, or illustrated originals?
5. **Notifications:** In-app only (v1) or push/email for milestone moments?
6. **Step sync frequency:** 3x daily — noon, 6pm, midnight (user's local time). Show "last synced" timestamp on Map screen. ✅ Resolved.

---

*Spec version 1.0 — ready for Claude Code handoff*
