# Season Scope — What We Build and What We Don't

**Status:** AUTHORITATIVE — this is the single source of truth for scope.  
**Decided:** 2026-07-17 (owner).  
**Referenced by:** `AGENTS.md` hard rule #6, `CODEX-HANDOFF.md §3`.

> When any other document, spec, or code comment contradicts this file,
> **this file wins.** Older material (the ChatGPT bible, the season-one
> implementation spec, the reference-experience doc) predates this decision
> and is background only.

---

## The one-sentence scope

**One Step Ahead is a weekly step competition between friends. Selena Chicago
is a recurring villain framing device. The narrative is a flavor skin on an
identical weekly loop — not a season-long mystery.**

---

## NOT building (do not start, do not plan, do not foreshadow)

- ❌ A 13-piece evidence arc or any escalating Brass Dial / Meridian mystery
- ❌ A season finale — depth tiers, Bureau-insider reveal, multi-outcome endgame
- ❌ City-specific beat copy beyond what the existing beat engine produces
- ❌ New lore layered on the intercept-clue system (it is built — leave it)
- ❌ A distinctive visual world per city
- ❌ A recurring cast (handler, antagonist, reformer, city contacts)
- ❌ Bureau internal factions
- ❌ Any deepening conspiracy that pays off across weeks

All of the above is recorded — in full, and only — in
[`PARKED-LORE.md`](PARKED-LORE.md). Nothing in shipped copy may reference,
foreshadow, or depend on anything in that file.

---

## Building / keeping (repeats cleanly week to week)

- ✅ City name + chapter title + complication
- ✅ Bingo card with city-flavored items
- ✅ Field Ops intel landmarks (5 per city, same format)
- ✅ Beat engine (deterministic, reusable — already shipped)
- ✅ Nemesis, predictions, Platform Sweep
- ✅ Case Closed report — four outcomes, mostly generic copy + one city closing line
- ✅ Evidence board — **one standalone artifact per week**, no connective lore

---

## The design principle

Weeks 2–13 get the same weekly rhythm Chicago has. **Cities are flavor skins
on an identical loop.** Per-city content is *data entry* — names, bingo items,
landmarks, complication text, one artifact, closing lines — **not feature work.**

A city's complication ships as **flavor text + parameters on existing
beat-engine mechanics.** If a complication as written needs a new feature, it
ships simplified (see the ⚠️ rows in [`season-one-route.md`](season-one-route.md)).

---

## The weekly rhythm (identical all 13 weeks)

1. City name + chapter title + complication
2. Bingo card with city-flavored items
3. Field Ops intel landmarks (5 per city, same format)
4. Beat-engine output
5. Nemesis, predictions, Platform Sweep
6. Case Closed report — four outcomes, generic copy + city closing line
7. Evidence board — one standalone artifact

---

## Premise (background flavor only — never escalates)

Selena steals a small brass object from a private Chicago collection. The
Bureau calls it stolen property; her trail hints at something more. This
justifies the chase and gives Selena voice material. **It does not escalate,
resolve, or pay off in-game this season.**

---

## Owner exception — the Week 13 send-off (2026-10-17)

**Decided by the owner, 2026-10-17.** The season now **loops**: after Week 13
(San Francisco) the chase returns to Week 1 Chicago and all player data
(history, badges, dossier, streaks, group) is kept.

The owner approved **one** exception to the "no season finale" line: a short
(~15 s), skippable, replayable pixel-art send-off shown once when a player first
reaches the Week 13 case-closed moment (`apps/web/lib/finale/`, route `/finale`
for replay). In it the player's pixel avatar catches up to Selena Chicago on the
San Francisco waterfront; she says, in her voice, that she loved the chase,
signs off "— S.C.", and escapes on a cable car; an end card says the chase
begins again in Chicago.

**Limits — this exception is exactly this and nothing more:**

- ❌ No lore, no Meridian, no conspiracy or evidence payoff, no Bureau-insider
  reveal, nothing from [`PARKED-LORE.md`](PARKED-LORE.md).
- ❌ No new characters, no cliffhanger, no promise of a "next mystery".
- ❌ No depth tiers or multi-outcome endgame; every Week 13 outcome gets the
  same send-off, and Selena's lines make no claim about performance.
- ✅ It is a playful goodbye + restart. Copy lives in
  `apps/web/lib/finale/copy.ts` and must stay on-voice
  (see [`selena-voice-guide.md`](selena-voice-guide.md)).
- The Week 13 season-close card header is "ONE LAP COMPLETE" (replaces
  "THE CASE IS CLOSED" / "SEASON ONE COMPLETE"); the line "Whatever comes next,
  you are ready for it." was cut.
