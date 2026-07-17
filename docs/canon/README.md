# Canon — Narrative Source of Truth

This folder is the authoritative memory for **story, copy, and scope**. When a
chat, an agent, or an older doc contradicts these files, **these files win.**
(Engineering state — current branch, migrations, tests — lives elsewhere;
see `HANDOFF.md` / `AGENTS.md`.)

## The files, in reading order

| File | What it is | Authority |
|---|---|---|
| [`season-scope.md`](season-scope.md) | **Start here.** What we build vs. what we don't. The 2026-07-17 scope decision. | Governs everything |
| [`season-one-route.md`](season-one-route.md) | The 13-week shipping table — city, chapter, complication, artifact, closing lines. The roadmap for Weeks 2–13. | Target-of-record for content |
| [`selena-voice-guide.md`](selena-voice-guide.md) | How Selena sounds. Voice rules, vocabulary, scenario copy, data-trust rule. | Binding for all her copy |
| [`cities/`](cities/) | One content pack per city. `_template.md` is the scaffold. | Per-city detail |
| [`PARKED-LORE.md`](PARKED-LORE.md) | ⛔ The deeper vision that was scoped OUT. Recorded, never built. | Governs nothing — do not reference in shipped copy |

## City packs

| Pack | Status |
|---|---|
| [`cities/week-01-chicago.md`](cities/week-01-chicago.md) | SHIPPED — reference implementation |
| [`cities/week-02-detroit.md`](cities/week-02-detroit.md) | DRAFT — pending audit reconciliation (see below) |
| Weeks 3–13 | Not yet authored. Use `_template.md`, pull from the route table. |

## Workflow

1. Owner + Claude author a city's content pack from `_template.md`, guided by the
   route table and voice guide.
2. Owner reviews and approves the pack.
3. Codex implements the approved pack into `packages/shared/src/season-one/seasonOne.ts`
   (replacing that week's `structuralWeek(...)` stub) plus demo fixtures.
4. Verify (typecheck, API suite, static export build, browser smoke), then it ships.

Narrative decisions live in these files, not in chat. Chats are disposable; the
repo is the memory.

## Open reconciliation items (for the narrative/copy audit)

1. Weeks 3–13 closing lines are cleaned targets — finalize exact wording when
   each week's content pack is authored.

### Resolved in the 2026-07-17 audit

- **Week 2 Detroit naming:** chapter *"The Machine Restarted"* / complication
  *"Assembly Line"* (owner decision). Detroit pack, route table, and
  `seasonOne.ts` all aligned.
- **Detroit landmarks:** resolved to the five most well-known sites — Michigan
  Central Station, Detroit Institute of Arts, Guardian Building, Motown Museum,
  Renaissance Center. Content pack and demo fixture (`apps/web/lib/demo.ts`) now
  match.
- **Week 11 chapter title:** "The Missing Meridian" → **"True North"** in the
  route table and `seasonOne.ts`.
- Synced all 12 structural stubs (weeks 2–13) in `seasonOne.ts` to the route
  table's chapter titles + complication labels; stripped parked lore.
- Removed player-facing "Meridian" from the map evidence card and the structural
  next-city teaser.
- Week 1 shipped copy lore-softened (see `cities/week-01-chicago.md`).
