# Week 1 MVP QA — usability & copy findings

**Date:** 2026-07-18 · **Scope:** the live Week 1 Chicago demo experience (not architecture).
**Verdict:** The MVP experience is coherent, on-voice, and fun. No blocking problems.
Findings below are polish, ranked. Nothing here adds a system.

I did **not** auto-apply changes to shipped Week 1 copy — it's merged and the copy
is strong. These are recommendations for you to approve. Each is tagged
**[copy]** (safe wording tweak), **[layout]** (component/structure), or
**[future]** (nice-to-have, not MVP-blocking).

---

## The seven questions

| Question | Verdict | Notes |
|---|---|---|
| Is the weekly loop understandable? | ✅ Yes | Briefing teaches it; the "SHE VANISHES IN 2D 1H" clock + "SELENA IS 435 STEPS AHEAD" hero make the goal obvious. |
| Does the Map show the most important action immediately? | ⚠️ Mostly | The hero and the "FINAL PUSH" banner land first; the actual **Priority Directive** action card sits below the sighting card. See F1. |
| Does the briefing feel fun rather than overlong? | ✅ Yes | 3 tight paragraphs + clear stakes (210,000) + 3 system cards. Intriguing, not bloated. |
| Are Field Ops / Nemesis / Prediction / Platform Sweep discoverable? | ✅ Yes | All four appear as Map cards, plus the briefing intro and the nav rail. Minor: nav rail is icon-only (F3). |
| Does the Case Closed report feel rewarding? | ✅ Yes | Distinct per outcome, evidence recovered, Selena sign-off, next-city lead. Interception ("The Calling Card") is a strong payoff. |
| Is Selena's voice memorable? | ✅ Strong | "close enough to become inconvenient," "checking over her shoulder," "You are faster than they told me." Consistent dry/clipped register. |
| Can a user understand what their steps did? | ⚠️ Mostly | Group-level is clear (435 ahead, 99.8%, group steps, leaderboard delta). Personal agency is thinner. See F2. |

---

## Findings (ranked)

### F1 — The Map repeats "FINAL PUSH" and Selena's line twice **[layout]**
On the Map in the final-push state, two separate blocks both say **FINAL PUSH**
and both print *"You are close enough to become inconvenient."* — the ritual
banner at the top and the "[ FIELD REPORT ]" primary-beat card below. Seeing the
identical Selena line twice on one screen dilutes it.
- **Recommend:** when the ritual banner is showing a phase (final push), suppress
  the duplicate line in the primary-beat card, or give the card a different beat.
  This is `primaryBeat` vs. the ritual overlay both surfacing the same phase —
  worth a look in the Map composition, not a pure copy change.

### F2 — Personal "what MY steps did" is thinner than group framing **[future]**
The hero answers the *group* question well (435 ahead, 99.8%, 196,965 group
steps) and the leaderboard shows your delta (▲6,310). But the strongest
personal-agency line — *"A 3,000-step lunch walk closes the gap to …"* — only
appears in some states. A persistent one-liner like *"Your 50,058 steps closed
X% of this week's gap"* would make individual effort legible every day.
- **Recommend:** a small personal-contribution line under the hero. Uses existing
  data (your steps ÷ group target); no new system.

### F3 — Nav rail is icon-only **[future]**
The left rail shows icons (map / field ops / prediction / home) with no labels
until interaction. First-timers may not know what each is. The Map cards carry
the load, so this is minor.
- **Recommend:** labels on first session, or a one-time tooltip. Low priority.

### F4 — "incl. +6% from field systems" is slightly opaque **[copy]**
"Field systems" is mild jargon. Players may not connect it to Field Ops +
Platform Sweep + Prediction. Consider *"incl. +6% from Field Ops & bonuses"* or a
tap-to-expand breakdown. Very minor — the number itself is the point.

### F5 — Bonus math now reads consistently ✅ (regression fixed)
Cross-checked: hero "+6% from field systems" == Field Ops "+3.5%" + Platform
Sweep "+2%" + participation. The earlier fixture drift (sweep +2% vs chase +1.5%)
is gone now that the demo derives chase numbers from `calculateChase`. No action.

---

## What's already strong (keep)
- The **vanish clock** ("SHE VANISHES IN …") is a clean single urgency device.
- **Case Closed** outcomes are genuinely differentiated and the evidence reward
  lands.
- **Selena's voice** is the standout — memorable and consistent.
- The **briefing-as-onboarding** (3 system cards) is an efficient teach.
- The **Bureau Vector** route strip communicates the 13-city arc at a glance.

## Suggested priority for a copy/polish pass
1. F1 (dedupe the double FINAL PUSH) — highest visible-polish win.
2. F2 (personal contribution line) — biggest "my steps matter" gain.
3. F4 (bonus wording), F3 (nav labels) — minor.
