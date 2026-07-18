# One Step Ahead: Season One Implementation Specification

**Working title:** *One Step Ahead: The Search for Selena Chicago*  
**Season One title:** *The Lakefront Job*  
**Document purpose:** Canonical product and implementation specification for Codex  
**Recommended repository path:** `docs/season-one-implementation-spec.md`  
**Status:** Initial implementation baseline  
**Last updated:** July 2026

---

> ## ⚠ SCOPE NOTICE — 2026-07-17
>
> **This document describes a deeper narrative vision that has been
> intentionally scoped out. Do not use it as a build specification.**
>
> The Meridian network backstory, Bureau-insider conspiracy, escalating
> evidence arc, and season finale described in this document **will not be
> built**. That decision is final.
>
> Use this document as **background context only** — for understanding
> the origin of design choices already in the codebase. Do not implement
> anything in this document that is not already shipped.
>
> The authoritative scope definition is in `CODEX-HANDOFF.md §3` and
> `AGENTS.md` hard rule #6.

---

## 1. How to Use This Document

This document is the current single source of truth for implementing the first seasonal narrative layer of **One Step Ahead**.

Codex should use it to:

- understand the product vision and narrative canon;
- preserve the existing gameplay systems;
- implement Season One as configuration-driven content;
- centralize chase calculations and weekly state;
- build a deterministic narrative beat engine;
- avoid introducing unsupported mechanics or additional characters;
- preserve data trust and accessibility.

When this document conflicts with older narrative notes, handoff documents, demo copy, or experimental implementations, this document governs the Season One direction unless a later explicitly approved specification supersedes it.

### Decision labels

This document uses three categories:

- **LOCKED:** Approved product direction. Implement as written unless technically impossible.
- **RECOMMENDED V1:** Preferred implementation for the first version. May be simplified only when necessary.
- **DEFERRED:** Explicitly outside the current implementation scope.

---

## 2. Product Definition

### 2.1 Core premise — LOCKED

**One Step Ahead** is a social fitness game wrapped in a serialized spy chase.

Players form a private group of operatives pursuing **Selena Chicago**, a clever globe-hopping fugitive who is always just ahead of them. Real-world steps power the pursuit. Each week becomes a new chapter in a larger seasonal case involving:

- a new US city;
- a team chase target;
- Field Ops;
- nemesis duels;
- group predictions;
- weekly evidence;
- Selena story beats;
- a possible interception.

The game is not primarily a fitness dashboard. It is a **serialized social pursuit game whose underlying engine is real movement data**.

### 2.2 Core fantasy — LOCKED

Players should feel:

> We nearly caught Selena because of what we did today.

They should not primarily feel:

> I logged a number of steps, completed some tasks, and advanced a progress bar.

### 2.3 Product principles — LOCKED

1. **Never show a number when you can show a story.**
2. **Never add a mechanic unless it changes or enriches the chase.**
3. **Never tell a story the underlying data cannot support.**
4. **Real-world effort must create visible fictional consequences.**
5. **The group is cooperating against Selena while competing within the group.**
6. **Selena must feel responsive, observant, and alive—not like a scoreboard marker.**
7. **Weak or incomplete tracker data must never be dramatized as player failure.**
8. **The experience should remain buildable by a solo vibe-coding workflow.**
9. **Configuration and reusable templates are preferred over complex branching systems.**
10. **A completed week must feel like a chapter closing, not a database resetting.**

---

## 3. Scope and Complexity Guardrails

### 3.1 Narrative entities — LOCKED

The game currently needs only three narrative entities:

1. **Selena Chicago**
2. **The Bureau**, represented as an impersonal institutional interface
3. **The player group**

Do not introduce a supporting cast of recurring named NPCs in Season One.

The Bureau may issue briefings, status messages, redactions, warnings, and reports, but it should not require individually authored handlers, directors, villains, or city contacts.

### 3.2 Explicit non-goals — DEFERRED

Do not implement the following as part of this specification:

- recurring named supporting characters;
- open-ended chat;
- public multiplayer matchmaking;
- permanent branching routes;
- deeply branching plots;
- unrestricted generative narrative;
- AI-created factual game outcomes;
- complex inventory or equipment systems;
- player-versus-player sabotage;
- real-time GPS route tracking;
- real-time synchronous multiplayer requirements;
- large public leagues;
- elaborate 3D maps;
- different primary plots for different groups;
- dynamically generated cities;
- city-specific full visual design systems;
- a distinct UI theme for each city;
- elaborate drag-and-drop conspiracy boards;
- a virtual currency economy;
- additional physical-activity conversion systems beyond existing supported health inputs.

---

## 4. Locked Narrative Canon

### 4.1 Selena Chicago — LOCKED

Selena is:

- from Chicago;
- a brilliant systems investigator and fugitive;
- publicly framed by the Bureau as a thief and threat;
- privately attempting to stop a compromised Bureau faction from controlling the Meridian;
- ultimately closer to a covert good actor than a traditional villain;
- morally complicated because she lies, steals, trespasses, manipulates information, and withholds the full truth;
- consistently one step ahead of both the players and the compromised faction.

She is not secretly innocent. She is a **principled outlaw** whose ends are often justified but whose methods create legitimate risk.

### 4.2 The Meridian — LOCKED

The Meridian is:

> A distributed analog-digital network activated through physical geographic nodes.

It is not a single computer, satellite, or machine.

Its components include combinations of:

- physical infrastructure;
- analog records;
- mechanical devices;
- coded signals;
- geographic alignments;
- historic communications systems;
- transportation routes;
- modern digital overlays;
- patterns of verified human participation and movement.

The Meridian was designed to remain distributed so no single institution or person could control it.

### 4.3 The Bureau — LOCKED

The Bureau is compromised but not uniformly corrupt.

The game should not reduce the Bureau to a cartoonishly evil organization. Institutionally, it contains:

- sincere personnel who reasonably believe Selena is dangerous;
- compromised actors attempting to centralize the Meridian;
- people who suspect the truth but cannot or will not act openly.

Season One does not require named representatives of these internal positions.

### 4.4 Why Selena allows the team to follow her — LOCKED

Selena is intelligent enough to disappear. She permits and encourages the pursuit because the players provide:

#### Independent verification

Evidence discovered only by Selena could be dismissed as stolen, fabricated, or manipulated. Evidence uncovered through active Bureau operatives is harder to suppress.

#### Distributed activation

Some Meridian nodes require separate people, devices, contributions, or verified patterns. Selena can open the route, but the player group helps complete parts of the activation or verification sequence.

#### Protection through visibility

Once enough operatives have independently seen the evidence, the compromised Bureau faction cannot quietly erase it.

The chase is therefore partly Selena's plan, even though the players initially believe they are simply hunting her.

### 4.5 Seasonal capture rule — LOCKED

At the end of each season:

1. The players genuinely reach or catch Selena.
2. The season's central threat is genuinely resolved.
3. Selena escapes through a plausible final contingency.
4. Her escape opens the next mystery without nullifying the players' victory.

The players must win something real each season. Selena's escape cannot make the preceding twelve or thirteen weeks feel pointless.

### 4.6 Season One ending — LOCKED DIRECTION

In Week 13, the team reaches Selena at the final US node in San Francisco.

The team prevents the compromised faction from obtaining exclusive control of the Meridian and exposes the network's hidden history.

Selena is briefly apprehended or physically cornered.

She escapes after revealing that the thirteen US nodes are only one regional layer of a larger global system.

The precise final escape animation and copy may be refined later, but the structural outcome is locked.

---

## 5. Selena Chicago Character Bible

### 5.1 One-sentence character definition — LOCKED

> Selena Chicago is a brilliant Chicago-born fugitive who stays one step ahead of the Bureau while secretly leading its operatives through the Meridian network to expose the people corrupting it.

### 5.2 Character function — LOCKED

Selena serves five simultaneous roles:

1. **Antagonist:** creates distance, uncertainty, pressure, and stakes.
2. **Game master:** introduces complications, timed windows, and strategic prompts.
3. **Performance mirror:** reacts to verified player and group behavior.
4. **Reward:** new transmissions, appearances, clues, and acknowledgments are desirable.
5. **Mystery:** her motive and relationship to the Meridian sustain the season.

### 5.3 Desired player reaction — LOCKED

Players should simultaneously feel:

- I want to catch her.
- I want her respect.
- I am not sure she is wrong.

### 5.4 Personality pillars — LOCKED

#### Playfully superior

Selena believes she is ahead because she sees systems more clearly than her pursuers. She is amused, not theatrical.

Good:

> You found the station. Eventually.

Avoid:

> You fools will never catch me!

#### Highly observant

She notices and remembers:

- unusually strong or weak team days;
- comebacks;
- recurring nemesis results;
- prediction accuracy;
- teammate assists;
- inactive players returning;
- the group's strategic tendencies.

#### Selectively respectful

She respects:

- persistence;
- recovery;
- pattern recognition;
- loyalty;
- independent judgment;
- helping teammates at personal cost.

She does not respect:

- blind institutional obedience;
- empty bravado;
- obvious assumptions;
- abandoning teammates;
- mistaking raw speed for understanding.

#### Controlled

She rarely appears rushed or enraged.

When pressure increases, her language becomes shorter rather than louder.

Normal:

> You have improved. I adjusted.

Under pressure:

> That was close.

#### Morally ambiguous

Selena's larger objective is protective, but her methods are not harmless. She decides unilaterally what others should risk and know.

### 5.5 Core internal contradiction — LOCKED

> Selena opposes concentrated control while concentrating knowledge in herself.

She wants people to question systems but manipulates the operatives instead of initially trusting them with the full truth.

### 5.6 What Selena wants — LOCKED

#### Surface objective

Escape the Bureau and complete the Meridian route.

#### Season One objective

Activate, verify, or expose the thirteen-node US network before the compromised Bureau faction can centralize it.

#### Emotional objective

Find operatives capable of understanding what she discovered and acting independently.

#### Private fear

The players will remain obedient to the Bureau even after seeing contradictory evidence.

#### Deeper need

She wants to believe people and institutions can behave better, but repeatedly designs tests that confirm her cynicism.

### 5.7 Moral boundaries — LOCKED

Selena may:

- steal;
- trespass;
- misdirect;
- plant decoys;
- manipulate information;
- expose institutional wrongdoing;
- activate systems without authorization;
- create nonviolent obstacles;
- withhold the full truth.

Selena must not:

- intentionally harm civilians;
- threaten players physically;
- mock disability, age, weight, health, family obligations, or physical capacity;
- pressure players to walk in unsafe circumstances;
- recommend unsafe nighttime or isolated walking;
- shame inactivity;
- treat device failures as moral failures;
- use discriminatory or sexualized insults;
- become cruel solely to establish villainy.

### 5.8 Voice — LOCKED

Selena sounds:

- intelligent;
- economical;
- observant;
- amused;
- stylish without being ornate;
- contemporary without being slang-heavy;
- specific;
- controlled;
- occasionally sincere.

Selena does not sound like:

- a comic-book supervillain;
- a wellness coach;
- a motivational speaker;
- a drill sergeant;
- a customer-support bot;
- an abusive bully;
- a stream of generic spy clichés.

### 5.9 Sentence rules — RECOMMENDED V1

- Usually one to three sentences.
- Favor short declarative construction.
- Fragments may be used for emphasis.
- Use questions sparingly.
- Prefer concrete references to vague threats.
- Avoid exclamation points in normal Selena dialogue.
- Selena should not use emojis.
- Do not overuse words such as “classified,” “mission,” “agent,” or “surveillance.”

### 5.10 Preferred vocabulary

Preferred:

- trail;
- signal;
- route;
- intercepted;
- observed;
- expected;
- pursuit;
- evidence;
- decoy;
- pattern;
- threshold;
- operative;
- Bureau;
- consequence;
- arrival;
- departure;
- node.

Avoid:

- crush your goals;
- fitness journey;
- hustle;
- beast mode;
- epic;
- awesome;
- fools;
- minions;
- evil laugh;
- get moving;
- steps challenge.

### 5.11 Humor — LOCKED

Selena's humor is dry and precise.

Examples:

> The Bureau estimated your arrival for Thursday. I told them Friday.

> Your nemesis is 214 steps ahead. A tragedy in miniature.

> Three decoys, and you selected the only one wearing sensible shoes.

Her humor may target:

- bureaucracy;
- overconfidence;
- obvious deductions;
- the absurdity of the chase;
- herself, occasionally.

It may not target protected traits, health limitations, or genuine life constraints.

### 5.12 Relationship to different player behaviors

High-step player:

> You move quickly. I wonder whether you ever stop to check the direction.

Strategist:

> Your prediction was closer than the Bureau's. Keep that to yourself.

Comeback player:

> Most people disappear after falling behind. You did not.

Supportive player:

> You surrendered your advantage to help another operative. Inefficient. Unexpected.

Returning player:

> Back in the field? Good. Your trail had gone cold.

### 5.13 Chicago identity — LOCKED

Selena is genuinely from Chicago.

Chicago shapes her through:

- familiarity with the grid;
- transit intelligence;
- neighborhood awareness;
- lakefront geography;
- layered visible and invisible infrastructure;
- skepticism toward official maps and boundaries;
- loyalty to people and places over institutions.

Avoid shallow Chicago clichés. Do not define her through constant references to deep-dish pizza, hot dogs, sports teams, or “the Windy City.”

### 5.14 Visual identity — LOCKED

Selena's essential silhouette:

- wide-brimmed sky-blue hat;
- long sky-blue coat;
- long curly hair visible beyond the hat;
- red gloves;
- red boots;
- confident forward posture;
- strong directional movement.

Her core palette remains stable across all cities. Do not create a new city palette for Selena each week.

Movement grammar:

- turning a corner;
- boarding a train, bus, car, boat, or aircraft;
- descending stairs;
- stepping through a doorway;
- looking back;
- standing just out of reach;
- leaving the frame.

Her primary visual grammar is **departure**.

Face visibility may increase across the season:

- early: silhouette, profile, partial views;
- middle: clearer expressions and direct eye contact;
- late: closer and more emotionally legible scenes.

### 5.15 Season One emotional arc

Weeks 1–3: **The untouchable thief**  
She treats the team as Bureau instruments.

Weeks 4–6: **The attentive rival**  
She begins reacting to specific group behavior and directing the team toward contradictions.

Weeks 7–9: **The reluctant guide**  
Her clues become increasingly useful. She appears to need the players to continue.

Weeks 10–11: **The exposed strategist**  
The team discovers that some parts of her plan are uncertain and that the Bureau moved first.

Week 12: **The apparent defeat**  
Los Angeles presents a manufactured version of events in which Selena appears guilty and cornered.

Week 13: **The choice and escape**  
She provides evidence, the team prevents exclusive control of the Meridian, catches her, and then loses her again.

---

## 6. Season Structure

### 6.1 Duration — LOCKED

Season One contains **13 active weekly chapters**, aligning the season with a calendar quarter.

A separate preseason onboarding period or post-season recap may occur outside the thirteen active weeks, but the core season itself is thirteen weeks.

### 6.2 Season title — LOCKED

**Season One: The Lakefront Job**

### 6.3 Core season mystery — LOCKED

Selena steals a brass component from a hidden Meridian node in Chicago.

The Bureau tells the players it is a dangerous control device.

Across thirteen US cities, Selena activates or investigates physical nodes tied to transportation, communication, geographic infrastructure, civic continuity, and verified human movement.

The players gradually discover:

1. The Meridian is distributed, not centralized.
2. It predates the Bureau's official account of its origin.
3. It was not designed for exclusive institutional control.
4. Someone within the Bureau accessed the system before Selena's theft.
5. A compromised faction is attempting remote control and synthetic participation.
6. Selena is trying to prevent the network from being centralized.
7. The players' verified movement helps authenticate the network.
8. The thirteen US nodes are only one regional layer of a global system.

### 6.4 Seasonal act structure

#### Act I — Follow the object, Weeks 1–3

The team believes Selena stole a dangerous artifact and is fleeing.

The first clues reveal that the object is only one part of a distributed system.

#### Act II — Follow the signal, Weeks 4–6

The team discovers altered records, conflicting orders, and identity-classification problems.

Selena begins directing them toward information the Bureau omitted.

#### Act III — Follow the pattern, Weeks 7–10

The team learns that the Meridian was built to preserve decentralized trust and continuity.

The Bureau's compromised faction is attempting to simulate and centralize participation.

#### Act IV — Decide what the chase means, Weeks 11–13

The thirteen nodes form only one regional pattern.

The team learns that evidence against Selena has been manufactured.

The final week becomes a struggle to prevent exclusive control of the network, not merely arrest Selena.

---

## 7. Season One Route — LOCKED

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

### 7.1 Visual-system constraint — LOCKED

The cities do **not** require unique visual themes or separate full visual systems.

The application should retain one cohesive game identity across the season.

City differentiation should be lightweight and configuration-driven through combinations of:

- city name;
- chapter title;
- map position;
- one landmark or skyline illustration/icon where available;
- evidence-card art or icon;
- short briefing copy;
- optional background image already supported by the product;
- localized Field Ops labels;
- chapter-specific complication treatment.

Do not create separate color systems, font systems, page templates, or full art directions for each city.

---

## 8. Complete Thirteen-Week Season Table

### Week 1 — Chicago

**Chapter title:** The Lakefront Job

**What Selena is doing:**  
Selena removes a brass Meridian component from a sealed infrastructure chamber beneath Chicago and begins moving east.

**What players believe:**  
She stole a dangerous Bureau artifact and is escaping her hometown using routes prepared in advance.

**What is actually happening:**  
Selena detected an unauthorized activation of the Chicago node. She removed the component before the compromised Bureau faction could secure it.

**Weekly complication — Cold Start:**  
The team begins with incomplete surveillance. Completing the first qualifying Field Ops line identifies Selena's real departure route and reduces the initial pursuit gap or awards the first Field Ops bonus.

**Standard evidence — The Brass Dial:**  
A mechanical dial marked with thirteen positions. One position is engraved with Chicago's geographic coordinates.

**Intercept clue:**  
The team briefly corners Selena on an elevated train platform. She leaves a photograph showing a Bureau operative or credentialed figure accessing the node before the theft. The person's identity is obscured.

**Closing copy:**

- Trail Lost: “You searched the streets. You should have searched beneath them.”
- Pursuit Maintained: “You found the route. Not the reason.”
- Close Encounter: “Another platform. Another minute. That was the difference.”
- Interception: “Someone opened the Chicago node before I did. Ask your Bureau why.”

---

### Week 2 — Detroit

**Chapter title:** The Assembly Line

**What Selena is doing:**  
She accesses an industrial Meridian node embedded in a decommissioned manufacturing system.

**What players believe:**  
She is modifying or duplicating the stolen component using old machinery.

**What is actually happening:**  
The Detroit node confirms that the Meridian was built from interchangeable physical components distributed across cities.

**Weekly complication — Moving Parts:**  
The group must complete more than one category of Field Ops. Movement, social, and consistency operations each contribute. Repeating only high-step objectives is not sufficient to earn the full special-operation bonus.

**Standard evidence — Interchangeability Diagram:**  
A technical drawing showing that Meridian components were designed to function in multiple locations.

**Intercept clue:**  
Selena leaves a damaged punch card. When decoded, it contains a date decades earlier than the Bureau's claimed creation date for the Meridian.

**Closing copy:**

- Trail Lost: “The machine did not stop. You did.”
- Pursuit Maintained: “Every part can be replaced. That includes people.”
- Close Encounter: “You reached the line before it went dark.”
- Interception: “The Bureau did not build the Meridian. It inherited it.”

---

### Week 3 — Pittsburgh

**Chapter title:** Three Rivers, Two Trails

**What Selena is doing:**  
She moves between two possible Meridian access points near intersecting waterways and rail corridors.

**What players believe:**  
One location is real and the other is a decoy.

**What is actually happening:**  
Both locations are parts of the same node. The Meridian depends on linked physical routes rather than isolated terminals.

**Weekly complication — Split Trail:**  
The group selects one of two presented trails. The choice may change the order of clue presentation, wording, or one Field Ops objective, but both trails converge before the end of the week. This must not create a permanent story branch.

**Standard evidence — Convergence Map:**  
A layered map showing rivers, freight lines, and buried communications channels intersecting at the same point.

**Intercept clue:**  
Selena leaves a transparent map overlay. When placed over the Chicago and Detroit evidence, the three cities begin forming a larger geometric pattern.

**Closing copy:**

- Trail Lost: “You chose a trail and forgot to ask where it joined the other.”
- Pursuit Maintained: “Two paths can serve one system.”
- Close Encounter: “You reached the convergence just after I left.”
- Interception: “Stop reading the cities as destinations. Read them as coordinates.”

---

### Week 4 — Washington, D.C.

**Chapter title:** The Monument Cipher

**What Selena is doing:**  
She searches federal archives and activates a Meridian node concealed within older civic infrastructure.

**What players believe:**  
She is stealing classified information about the network.

**What is actually happening:**  
She is recovering documents proving that the Bureau altered the Meridian's historical record.

**Weekly complication — Redacted Orders:**  
Some Field Ops or briefing descriptions appear partially redacted. Intel tokens or progress reveal the full text and expose contradictions in the Bureau briefing.

**Standard evidence — The Redacted Charter:**  
A founding document referring to “distributed civic continuity infrastructure,” not surveillance technology.

**Intercept clue:**  
Selena provides a page bearing a valid Bureau seal. Its authorization code belongs to a currently active internal unit.

**Closing copy:**

- Trail Lost: “The Bureau counted on you reading only what it left visible.”
- Pursuit Maintained: “Redaction does not destroy the truth. It only delays it.”
- Close Encounter: “You opened the archive. I had already removed the missing page.”
- Interception: “Your orders and mine were signed by the same office.”

---

### Week 5 — Philadelphia

**Chapter title:** The Liberty Exchange

**What Selena is doing:**  
She retrieves a coded ledger hidden within an old exchange and courier network.

**What players believe:**  
The ledger identifies former Meridian operators or conspirators.

**What is actually happening:**  
It records a decentralized custodial system. No single institution was originally intended to control the Meridian.

**Weekly complication — Shared Custody:**  
Individual performance alone cannot earn the entire special-operation bonus. At least three players, or a defined percentage of the active group, must contribute to designated team objectives.

**Standard evidence — Custodian Ledger:**  
Entries assigned to cities, organizations, and unnamed civilian stewards rather than one central authority.

**Intercept clue:**  
Selena reveals that several ledger entries were recently overwritten with Bureau identifiers.

**Closing copy:**

- Trail Lost: “You worked as individuals. The system was designed not to.”
- Pursuit Maintained: “No one was supposed to own the Meridian.”
- Close Encounter: “The ledger was still warm when you reached it.”
- Interception: “Someone has been rewriting the list of custodians.”

---

### Week 6 — New York City

**Chapter title:** Five Borough Decoy

**What Selena is doing:**  
She triggers multiple sightings while accessing a communications node beneath the city's transit and media systems.

**What players believe:**  
Four sightings are decoys and one is real.

**What is actually happening:**  
Every sighting is partially real. She uses synchronized recordings, proxies, and timed transmissions to test how Bureau surveillance classifies identity.

**Weekly complication — False Positives:**  
The group receives several possible leads. Field Ops completion and prediction participation improve route certainty. The system should vary presentation, not create permanent story branches.

**Standard evidence — Identity Cascade:**  
A record showing that the Meridian can authenticate patterns of movement and communication, not merely named individuals.

**Intercept clue:**  
The group reaches Selena at an abandoned platform. She shows a live Bureau interface incorrectly labeling five different people as her.

**Closing copy:**

- Trail Lost: “You chased the face the system selected for you.”
- Pursuit Maintained: “A network that recognizes everyone can misidentify anyone.”
- Close Encounter: “Five sightings. One platform. You chose almost correctly.”
- Interception: “The Bureau no longer needs to know who you are. It only needs to recognize how you move.”

---

### Week 7 — Boston

**Chapter title:** The Midnight Signal

**What Selena is doing:**  
She follows a historic signaling route to activate an early Meridian relay.

**What players believe:**  
The network began as a military or espionage communications system.

**What is actually happening:**  
The earliest version was designed to preserve trusted communication when centralized institutions failed.

**Weekly complication — Signal Window:**  
A limited group operation becomes available during a broad evening window. Players do not need to be active simultaneously, but enough members must contribute before the window closes.

**Standard evidence — Continuity Protocol:**  
Instructions for maintaining trusted communication during institutional breakdown.

**Intercept clue:**  
Selena leaves a handwritten annotation: “A system built for emergencies becomes dangerous when emergency powers never end.”

**Closing copy:**

- Trail Lost: “The signal was sent. Your unit was not listening.”
- Pursuit Maintained: “The Meridian was built for the moment authority failed.”
- Close Encounter: “You caught the final signal before it disappeared.”
- Interception: “The Bureau decided the emergency should never end.”

---

### Week 8 — Savannah

**Chapter title:** The Garden of Shadows

**What Selena is doing:**  
She searches public squares and port records for a node that appears on no official map.

**What players believe:**  
Selena has lost the trail and is searching blindly.

**What is actually happening:**  
The node survives through oral instructions, physical markers, and community memory rather than centralized records.

**Weekly complication — Unwritten Route:**  
Normal map progress appears incomplete. Players reveal the route through varied Field Ops and intel rather than raw steps alone. Real steps remain the dominant chase input.

**Standard evidence — The Missing Square:**  
A map with one intentionally blank location, accompanied by instructions passed through generations of custodians.

**Intercept clue:**  
Selena shares an audio fragment from a former custodian warning that Bureau personnel had begun cataloging communities connected to the node.

**Closing copy:**

- Trail Lost: “You trusted the map more than the people who lived there.”
- Pursuit Maintained: “Not every system leaves a paper trail.”
- Close Encounter: “You found the missing square after the signal moved.”
- Interception: “The Bureau called it preservation. The custodians called it a list.”

---

### Week 9 — New Orleans

**Chapter title:** The Second Line

**What Selena is doing:**  
She decodes a Meridian sequence embedded in rhythm, procession routes, and river timing.

**What players believe:**  
She is using cultural signals as a cipher to hide her next destination.

**What is actually happening:**  
Some nodes were intentionally encoded in living practices so they could not be controlled through a central database.

**Weekly complication — Changing Rhythm:**  
Daily suggested targets or progress prompts vary modestly based on recent group performance. Consistency and recovery matter more than one enormous day. Do not make the underlying weekly group target unstable or opaque.

**Standard evidence — Rhythmic Key:**  
A sequence showing that node activation depends on intervals and participation patterns, not only total volume.

**Intercept clue:**  
Selena reveals that the compromised Bureau faction has been attempting to simulate human participation patterns using synthetic data.

**Closing copy:**

- Trail Lost: “You counted the steps and missed the rhythm.”
- Pursuit Maintained: “The Meridian recognizes participation, not obedience.”
- Close Encounter: “Your timing was right. Your arrival was not.”
- Interception: “Someone inside the Bureau is teaching machines to imitate a crowd.”

---

### Week 10 — Austin

**Chapter title:** Dead Air

**What Selena is doing:**  
She tracks an unauthorized signal broadcast through a hybrid analog-digital Meridian relay.

**What players believe:**  
Selena is transmitting commands to collaborators.

**What is actually happening:**  
She is tracing the compromised Bureau faction's attempt to remotely override physical nodes.

**Weekly complication — Signal Interference:**  
Some progress temporarily appears uncertain when tracker data is delayed. The UI must distinguish verified progress from estimated progress. The complication should reinforce trust rules rather than fabricate missing data.

**Standard evidence — Override Frequency:**  
A waveform and access protocol proving an external party attempted remote node control.

**Intercept clue:**  
Selena provides a timestamp showing that the override began before she stole the Chicago component.

**Closing copy:**

- Trail Lost: “You followed my transmission. It was not mine.”
- Pursuit Maintained: “Someone is trying to make a distributed system obey a single voice.”
- Close Encounter: “You isolated the signal after the transmitter moved.”
- Interception: “The first override began six hours before the Lakefront Job.”

---

### Week 11 — Santa Fe

**Chapter title:** The Missing Meridian

**What Selena is doing:**  
She aligns the collected coordinates with an astronomical and geographic reference point.

**What players believe:**  
She is identifying the final Meridian node.

**What is actually happening:**  
She discovers that the thirteen known US nodes are one regional layer of a larger global network.

**Weekly complication — Alignment:**  
Previously decoded evidence may provide a modest bonus or additional clue context. Groups with incomplete evidence can still complete the week and understand the core story.

**Standard evidence — The Continental Overlay:**  
The thirteen US nodes form one segment of a larger pattern extending beyond the visible map.

**Intercept clue:**  
Selena shows the players a fourteenth pulse appearing outside the United States, then disappearing.

**Closing copy:**

- Trail Lost: “You were looking for an endpoint.”
- Pursuit Maintained: “Thirteen nodes. One region.”
- Close Encounter: “The alignment held for less than a minute. You saw enough.”
- Interception: “The Meridian does not end at the coast.”

---

### Week 12 — Los Angeles

**Chapter title:** The Moving Picture

**What Selena is doing:**  
She stages an apparent final activation while broadcasting evidence that implicates her.

**What players believe:**  
Selena intends to seize control of the Meridian and is finally exposing her plan.

**What is actually happening:**  
The compromised Bureau faction fabricated evidence against her. Selena stages a counter-deception to reveal how the record was manufactured.

**Weekly complication — Edited Reality:**  
Players receive contradictory clips, reports, or case-file fragments. Field Ops and intel reveal metadata establishing which evidence is authentic.

**Standard evidence — The Composite Record:**  
Proof that images, timestamps, and access logs were combined to create a false account of Selena's actions.

**Intercept clue:**  
The group catches Selena on a soundstage and recovers the supposed Chicago component. It is revealed to be a decoy created or substituted by the Bureau.

**Closing copy:**

- Trail Lost: “You watched the version they edited for you.”
- Pursuit Maintained: “A convincing record is not the same as a true one.”
- Close Encounter: “You reached the set before they struck it.”
- Interception: “You caught me holding the evidence they manufactured.”

---

### Week 13 — San Francisco

**Chapter title:** One Step Ahead

**What Selena is doing:**  
She reaches the final US node and prepares to expose the Meridian before the compromised Bureau faction can centralize it.

**What players believe:**  
The final decision is whether to stop Selena from activating the network.

**What is actually happening:**  
The node is already partially compromised. Selena needs the players' independently verified movement and accumulated evidence to prevent exclusive control and force the truth into the open.

**Weekly complication — Final Convergence:**  
Steps, Field Ops, prediction participation, nemesis participation, special operations, and season evidence all contribute modestly to the final operation. Real steps remain dominant.

**Standard evidence — The Meridian Record:**  
The complete Season One file explaining the network's original purpose, distributed design, and attempted Bureau takeover.

**Intercept clue and canonical best ending:**  
The players catch Selena and briefly take her into custody or physically contain her. Before escaping, she reveals another active Meridian region and leaves one location encrypted for Season Two.

**Closing copy:**

- Trail Lost: “You reached the node too late—but not too late to know what happened.”
- Pursuit Maintained: “You stopped them from owning it. That matters more than catching me.”
- Close Encounter: “You secured the node. I remained one door ahead.”
- Interception: “You caught me. Now decide whether that was ever the point.”

---

## 9. Weekly Lifecycle and Ritual

### 9.1 Weekly cadence — RECOMMENDED V1

The weekly experience should have a recognizable dramatic shape.

#### Monday — New Case Briefing

- Open the new city and chapter.
- Display a briefing.
- Establish Selena's current lead.
- Reset or create Field Ops.
- Create nemesis pairings.
- Open predictions.
- Introduce the weekly complication.
- Show the primary recommended action.

#### Tuesday — Early Trail

- Accumulate verified steps.
- Allow Field Ops progress.
- Surface early beats sparingly.
- Avoid overreacting to incomplete data.

#### Wednesday — Midweek Field Update

- Trigger one primary midweek narrative beat.
- Selena reacts to verified group performance when appropriate.
- Reveal or escalate the weekly complication.
- Provide one clear next action.

#### Thursday — Pressure Build

- Continue pursuit and Field Ops.
- Highlight near-term social dynamics:
  - nemesis reversals;
  - team contribution;
  - missing participation;
  - special-operation status.
- Avoid generic reminders.

#### Friday — Final Push

- Lock predictions at the approved time.
- Show projected outcome if data confidence is sufficient.
- Clearly show what remains achievable.
- Escalate the presentation without changing core math.

#### Saturday — Sudden Death and Special Operation

- Activate nemesis sudden death when required.
- Run the city-specific special operation or broad chase window.
- Emphasize group coordination without requiring players to be physically together.

#### Sunday — Case Close

- Continue verified progress until the official cutoff.
- Reconcile delayed tracker data.
- Determine the weekly outcome.
- Award:
  - city result;
  - badges;
  - Oracle;
  - nemesis outcomes;
  - Field Ops outcomes;
  - evidence;
  - Intercept Clue if applicable.
- Play a Case Closed sequence.
- Show Selena's outcome-specific closing line.
- Tease the next city.

### 9.2 Week phases — RECOMMENDED V1

```ts
export type WeekPhase =
  | "briefing"
  | "active"
  | "midweek_update"
  | "final_push"
  | "sudden_death"
  | "case_closing"
  | "case_closed";
```

Do not infer narrative phase independently in multiple components. Centralize phase calculation.

### 9.3 Ritual requirement — LOCKED

The transitions should feel like events, not background state changes.

At minimum, distinct reusable presentation components should exist for:

- Monday briefing;
- midweek field update;
- final push;
- sudden death;
- case close;
- evidence reveal;
- next-city teaser.

---

## 10. Chase Math

### 10.1 Design goals — LOCKED

The chase model must:

- scale across different group sizes;
- preserve verified real steps as the dominant input;
- allow Field Ops and social systems to matter;
- remain understandable;
- avoid punishing groups solely because one player disappears;
- resist deliberate goal manipulation;
- avoid opaque city-specific arithmetic;
- produce a meaningful interception state.

### 10.2 Weekly group target — RECOMMENDED V1

Each eligible player contributes a weekly target.

Initial V1:

```text
group_weekly_target =
sum(player_selected_weekly_target for eligible active players)
```

Future adaptive version:

```text
effective_player_target =
clamp(
  player_selected_weekly_target,
  0.85 × recent_weekly_baseline,
  1.15 × recent_weekly_baseline
)
```

Then:

```text
group_weekly_target =
sum(effective_player_target for eligible active players)
```

### 10.3 Eligible active player — RECOMMENDED V1

A player counts toward the weekly target if the player:

- joined before the weekly participation cutoff;
- connected a valid supported tracker or approved input mode;
- was not formally paused before the week began.

Do not remove a player retroactively because the player had a weak week. That would allow groups to manipulate targets after seeing outcomes.

### 10.4 Base progress

```text
base_progress =
verified_group_steps / group_weekly_target
```

Examples:

- `0.72` means 72% of the target.
- `0.96` means 96%.
- `1.08` means 108%.

### 10.5 Bonus cap — LOCKED

Non-step systems may contribute no more than **10 percentage points** to final progress.

```text
total_non_step_bonus <= 0.10
```

Recommended allocation:

| Source | Maximum |
|---|---:|
| Field Ops | +5% |
| Weekly special operation | +3% |
| Nemesis participation | +1% |
| Prediction participation | +1% |
| **Total** | **+10%** |

Steps should normally account for approximately 90% or more of the required pursuit progress.

### 10.6 Final progress

```text
final_progress =
base_progress
+ field_ops_bonus
+ special_operation_bonus
+ nemesis_participation_bonus
+ prediction_participation_bonus
```

Final progress may exceed 100% for scoring or recap purposes, but the visible remaining lead cannot fall below zero.

### 10.7 Field Ops bonus — RECOMMENDED V1

Preferred group-normalized milestone model:

- Average of at least 1 qualifying line per active player: +2%
- Average of at least 2 qualifying lines per active player: +3.5%
- Average of at least 3 qualifying lines per active player: +5%

Maximum: +5%

If the current implementation supports a different board structure, preserve the maximum and normalize by group size.

### 10.8 Weekly special-operation bonus — RECOMMENDED V1

Each week has one chapter-specific group operation worth up to +3%.

The operation may involve:

- contribution by a minimum number or percentage of players;
- completing multiple categories of Field Ops;
- contributing within a broad time window;
- decoding enough intel;
- combining evidence;
- completing a team recovery requirement.

Do not require exact synchronous activity.

### 10.9 Nemesis bonus — RECOMMENDED V1

The team chase bonus should reward participation, not only nemesis winners.

Suggested:

- At least 70% of active players record qualifying nemesis activity: +0.5%
- All matchups resolve without missing required data: additional +0.5%

Maximum: +1%

Individual winners still receive personal rivalry rewards.

### 10.10 Prediction bonus — RECOMMENDED V1

Prediction accuracy should determine Oracle, not group pursuit progress.

For group progress:

- At least 70% of active players submit before lock: +0.5%
- All active players submit before lock: +1%

Maximum: +1%

### 10.11 Remaining Selena lead

At the start of the week:

```text
selena_starting_lead = group_weekly_target
```

During the week:

```text
remaining_lead =
max(
  0,
  group_weekly_target × (1 - final_progress)
)
```

This lets the UI say:

> Selena is 24,180 steps ahead.

The detailed progress percentage may remain visible in secondary views for transparency.

### 10.12 Goal manipulation — RECOMMENDED V1

Once baseline data exists, constrain target selection:

```text
minimum_selectable_target = 80% of recent weekly baseline
maximum_selectable_target = 130% of recent weekly baseline
```

New players may use a broader onboarding range and be recalibrated after approximately two completed weeks.

Do not make target controls punitive. The purpose is to prevent deliberate under-targeting, not to force aggressive goals.

---

## 11. Weekly Outcomes

Use four primary weekly outcomes.

### 11.1 Trail Lost

**Threshold:** final progress below 70%

Narrative:

- Selena meaningfully increases or preserves her lead.
- The group does not have a direct encounter.
- The season still advances.

Rewards:

- participation credit;
- basic city stamp;
- individually earned badges;
- standard evidence in basic form;
- no Intercept Clue.

The next week may open with recovery-oriented framing but must not impose a severe permanent penalty.

### 11.2 Pursuit Maintained

**Threshold:** 70% through 89.99%

Narrative:

- The group keeps Selena within operational range.
- She escapes without a direct encounter.

Rewards:

- full city stamp;
- standard evidence card;
- normal individual awards;
- no Intercept Clue.

### 11.3 Close Encounter

**Threshold:** 90% through 99.99%

Narrative:

- The group nearly corners Selena.
- They recover enhanced evidence, a personal artifact, or a more direct message.
- Selena explicitly acknowledges how close they came.

Rewards:

- standard evidence;
- enhanced story fragment;
- near-capture case ending;
- stronger city result marker;
- no full Intercept Clue unless explicitly configured otherwise.

### 11.4 Interception

**Threshold:** 100% or greater

Narrative:

- The team physically reaches, corners, or briefly contains Selena.
- A short encounter sequence plays.
- Selena escapes through a plausible contingency.
- She leaves or deliberately shares an Intercept Clue.

Rewards:

- standard evidence;
- Intercept Clue;
- premium interception marker on the season record;
- unique Selena transmission;
- stronger next-city teaser;
- optional cosmetic reward if supported.

### 11.5 Important outcome rule — LOCKED

Interception does not permanently branch the route.

All groups proceed through the same thirteen cities and understand the same core season story.

Interception provides deeper, earlier, or more personal access to the mystery.

---

## 12. Evidence and Intercept Clues

### 12.1 Standard evidence — LOCKED

Each week unlocks one standard evidence card.

Each card should contain:

- week number;
- city;
- chapter title;
- evidence title;
- icon or lightweight visual;
- two or three concise sentences;
- one highlighted clue fragment;
- unlocked state;
- optional enhanced state for Close Encounter or Interception.

The evidence system may initially be a responsive grid or ordered list. It does not require drag-and-drop interaction.

### 12.2 Intercept Clues — LOCKED

Interception earns a special clue about the hidden Meridian mystery.

Intercept Clues may provide:

- earlier confirmation of a later reveal;
- more precise evidence;
- Selena's private perspective;
- hidden visual or textual connections;
- stronger foreshadowing;
- Season Two hints.

They must not contain information required to understand the basic Season One plot.

Casual or lower-performing groups must still receive a coherent story through standard evidence.

### 12.3 Interception-depth model — RECOMMENDED V1

At the finale:

| Season interceptions | Finale treatment |
|---|---|
| 0–3 | Standard Meridian reveal |
| 4–7 | Enhanced reveal with Selena's private notes |
| 8–10 | Additional explanation of the compromised override |
| 11–13 | Post-credit encrypted Season Two location |

Do not create completely different endings. Create deeper layers of the same ending.

### 12.4 Evidence persistence — LOCKED

Track evidence and interceptions at the group-season level.

At minimum:

- unlocked standard evidence IDs;
- unlocked Intercept Clue IDs;
- weekly outcome;
- evidence unlock timestamp;
- total season interceptions;
- finale depth tier.

---

## 13. Deterministic Beat Engine

### 13.1 Definition — LOCKED

A deterministic beat engine is a rules-based system that converts verified game events into authored story moments.

It must not invent factual outcomes.

The same inputs and rules should lead to the same beat selection, subject to approved template variants and cooldowns.

### 13.2 Engine pipeline

```text
Game data
  ↓
Event detection
  ↓
Rule evaluation
  ↓
Beat prioritization
  ↓
Template selection
  ↓
Story message and recommended action
```

### 13.3 Initial role — RECOMMENDED V1

V1 should primarily **narrate verified events**.

It may also return a call to action.

It should not yet make complex autonomous decisions about permanent routes, plot branches, or economic rewards.

Over time, the Beat Engine may expand into a broader Chase Engine that also selects limited tactical choices.

### 13.4 Beat inputs

Potential inputs include:

- current week and phase;
- group target;
- verified group steps;
- remaining Selena lead;
- recent pace;
- projected outcome;
- player personal targets;
- player baseline comparisons;
- leaderboard changes;
- Field Ops state;
- weekly special-operation state;
- nemesis state;
- prediction state;
- tracker freshness;
- previously shown beats;
- weekly outcome;
- season evidence count;
- season interception count.

### 13.5 Beat output

```ts
export type NarrativeBeat = {
  id: string;
  category: BeatCategory;
  priority: number;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  displayTreatment: BeatDisplayTreatment;
  subjectPlayerId?: string;
  generatedAt: string;
  expiresAt?: string;
  dataConfidence: DataConfidence;
};
```

### 13.6 Beat configuration

```ts
export type BeatRule = {
  id: string;
  category: BeatCategory;
  trigger: BeatTrigger;
  conditions?: BeatCondition[];
  priority: number;
  cooldownHours?: number;
  maxPerWeek?: number;
  requiredConfidence: DataConfidence[];
  templates: BeatTemplate[];
  cta?: BeatCtaConfig;
};
```

### 13.7 Beat categories — RECOMMENDED V1

#### Pursuit beats

- gaining ground;
- losing ground;
- threshold crossing;
- near interception;
- route recovery;
- city arrival;
- projected outcome change.

#### Selena beats

- taunt;
- acknowledgment;
- decoy;
- warning;
- invitation;
- clue.

#### Player beats

- comeback;
- breakout day;
- personal-best day;
- consistent streak;
- return after inactivity;
- assist;
- unusually high contribution.

#### Social beats

- leaderboard change;
- nemesis reversal;
- group rally;
- teammate rescue;
- broad simultaneous contribution;
- contribution imbalance.

#### Ritual beats

- Monday briefing;
- midweek update;
- final push;
- sudden death;
- case close;
- evidence reveal;
- season milestone;
- finale.

#### Trust beats

- sync delayed;
- incomplete data;
- result pending;
- result recalculated;
- tracker reconnected;
- manual review required.

### 13.8 Example beat rule

```ts
const teamComebackRule: BeatRule = {
  id: "team_comeback",
  category: "pursuit",
  trigger: {
    metric: "gapClosedPercent24h",
    operator: ">=",
    value: 0.25,
  },
  conditions: [
    { metric: "syncedPlayerRatio", operator: ">=", value: 0.7 },
    { metric: "maxDataAgeHours", operator: "<=", value: 6 },
  ],
  priority: 70,
  cooldownHours: 72,
  maxPerWeek: 1,
  requiredConfidence: ["verified"],
  templates: [
    {
      headline: "THE TRAIL IS WARM AGAIN",
      body:
        "The team recovered {{stepsClosed}} steps in the last 24 hours. Selena changed course.",
    },
  ],
  cta: {
    label: "View the pursuit",
    href: "/map",
  },
};
```

### 13.9 Beat selection rules — RECOMMENDED V1

- Show one primary beat at a time on the main chase surface.
- Allow a small supporting activity feed for lower-priority events.
- Do not show multiple beats that communicate the same underlying event.
- Respect cooldowns.
- Ritual beats may override ordinary performance beats.
- Trust beats override Selena performance commentary when data is incomplete.
- Avoid repetitive Selena taunts.
- Favor actionability.
- Do not shame low activity.
- Do not expose sensitive comparisons beyond existing social visibility rules.

### 13.10 AI use — DEFERRED / OPTIONAL

Do not use unrestricted generative AI to decide:

- what happened;
- who won;
- whether a team intercepted Selena;
- what evidence unlocked;
- what a player physically did;
- which story event is canon.

A language model may later produce tightly constrained wording variants from structured facts, but authored templates should be sufficient for V1.

---

## 14. Data Confidence and Trust

### 14.1 Trust principle — LOCKED

The narrative must never claim more than the data supports.

A Selena message based on incorrect or stale step data is a narrative failure, not merely a minor analytics bug.

### 14.2 Data-confidence enum

```ts
export type DataConfidence =
  | "verified"
  | "estimated"
  | "incomplete"
  | "recalculating";
```

### 14.3 Suggested interpretation

#### Verified

Most required active-player data is recent and internally consistent.

Specific Selena performance beats may be shown.

#### Estimated

Some data is delayed, but current progress may be approximated.

Use cautious language. Do not state final conclusions.

#### Incomplete

Too much tracker data is stale or missing.

Do not show Selena taunts about poor performance. Use Bureau system copy.

Example:

> Field reports incomplete. Pursuit analysis suspended until trackers respond.

#### Recalculating

Late data or corrections changed an apparent outcome.

Pause final results until reconciliation is complete.

### 14.4 Suggested freshness windows — RECOMMENDED V1

- Current: synced within 6 hours
- Delayed: more than 6 and up to 24 hours
- Stale: more than 24 hours

These thresholds may be adjusted to match actual health-integration behavior.

### 14.5 Projection requirements

Do not show a projected outcome until:

- at least 24 hours of the week have elapsed; and
- minimum data-confidence requirements are met.

Suggested projection:

```text
projected_week_steps =
verified_steps_so_far / elapsed_fraction_of_week
```

Projection labels:

- Falling off the trail
- Pursuit maintained
- Close encounter projected
- Interception projected

### 14.6 Result reconciliation — LOCKED

Before finalizing Sunday results:

- retrieve available late data;
- detect duplicates;
- handle time zones consistently;
- prevent double counting;
- determine whether unresolved data materially changes the outcome;
- use `recalculating` when necessary;
- persist one authoritative result.

---

## 15. Existing Gameplay Systems and Their Role in the Chase

### 15.1 Team steps — LOCKED

Primary source of chase progress.

### 15.2 Field Ops — LOCKED

Field Ops should:

- provide varied movement, social, consistency, and narrative objectives;
- earn intel;
- contribute up to 5% chase bonus;
- support the weekly complication;
- create opportunities for assists;
- avoid allowing self-reported tiles to determine major competitive outcomes.

Where possible, distinguish:

- verified tiles;
- self-reported tiles;
- team tiles;
- choice tiles.

### 15.3 Prediction — LOCKED

Players predict the team's weekly performance or distance.

- Predictions remain hidden until the approved reveal condition.
- Participation may contribute up to 1% to group chase progress.
- Accuracy determines Oracle.
- Oracle may later preview a small next-week detail, but that is not required for initial implementation.

### 15.4 Nemesis — LOCKED

Players are paired in weekly personal step duels.

Current core structure:

- Monday through Friday daily points;
- best of five;
- Saturday sudden death when tied.

Nemesis contributes to:

- personal rivalry;
- individual badges;
- social stakes;
- up to 1% group participation bonus.

The team chase bonus should not require one player to fail.

### 15.5 Badges and profile — PRESERVE

Continue tracking long-term accomplishments including, where supported:

- city results;
- prediction wins;
- Field Ops;
- blackout;
- nemesis victories;
- streaks;
- total steps;
- avatar settings;
- interceptions.

### 15.6 Assists — PRESERVE / RECOMMENDED

Where existing tile assists are implemented, preserve them.

Future assists may include:

- gifting a tile assist;
- reviving a mission;
- helping a teammate return;
- contributing to a team objective;
- sending a constrained “walk with me” prompt.

Do not require a complex inventory system.

---

## 16. UI and Experience Direction

### 16.1 Core visual direction — LOCKED

Maintain a cohesive visual system across the entire season.

Do not create a different full visual theme for every city.

The existing case-file / field-terminal identity may be used for:

- briefings;
- reports;
- intel;
- evidence;
- sync states;
- stamps;
- case close.

The chase world may use:

- a consistent map;
- route lines;
- Selena art;
- city pins;
- lightweight city illustrations;
- progress motion;
- consistent destination cards.

### 16.2 Diegetic language — RECOMMENDED V1

Examples:

- tracker sync → “Field report incoming”
- loading → radio static or terminal processing
- badge award → stamp treatment
- weekly close → case closed report
- stale data → incomplete field reports
- prediction reveal → sealed estimates opened
- nemesis pairing → rival assignment

Do not obscure essential product information for the sake of fiction.

### 16.3 Accessibility — LOCKED

Preserve:

- WCAG-conscious contrast;
- keyboard accessibility;
- reduced motion support;
- clear text alternatives;
- sound-off operation;
- readable sync and error states;
- semantic status announcements.

Optional CRT effects, sounds, scanlines, and animations must not impair usability.

### 16.4 Sound — DEFERRED / OPTIONAL

Optional:

- teletype;
- stamp impact;
- radio static;
- subtle CRT hum;
- alert cue.

All sound must be muteable and nonessential.

---

## 17. Recommended Data Model

The exact schema may be adapted to the existing application, but the following concepts should exist.

### 17.1 Season configuration

```ts
export type SeasonConfig = {
  id: string;
  title: string;
  seasonNumber: number;
  startsAt: string;
  endsAt: string;
  route: SeasonWeekConfig[];
  finaleThresholds: FinaleDepthThreshold[];
};
```

### 17.2 Week configuration

```ts
export type SeasonWeekConfig = {
  id: string;
  seasonId: string;
  weekNumber: number;
  cityId: string;
  cityName: string;
  chapterTitle: string;

  briefing: {
    publicSummary: string;
    playerBelief: string;
  };

  hiddenStory: {
    selenaAction: string;
    actualTruth: string;
  };

  complication: WeeklyComplicationConfig;

  evidence: {
    standardEvidenceId: string;
    interceptClueId: string;
  };

  closeMessages: {
    trailLost: string;
    pursuitMaintained: string;
    closeEncounter: string;
    interception: string;
  };

  nextCityTeaser?: string;
};
```

### 17.3 Weekly state

```ts
export type GroupWeekState = {
  id: string;
  groupId: string;
  seasonId: string;
  weekId: string;
  phase: WeekPhase;

  activePlayerIds: string[];
  groupWeeklyTarget: number;
  verifiedGroupSteps: number;

  bonuses: {
    fieldOps: number;
    specialOperation: number;
    nemesisParticipation: number;
    predictionParticipation: number;
  };

  baseProgress: number;
  finalProgress: number;
  remainingLead: number;
  projectedOutcome?: WeeklyOutcome;
  finalOutcome?: WeeklyOutcome;

  dataConfidence: DataConfidence;
  evidenceUnlocked: boolean;
  interceptClueUnlocked: boolean;

  openedAt: string;
  closesAt: string;
  finalizedAt?: string;
};
```

### 17.4 Outcomes

```ts
export type WeeklyOutcome =
  | "trail_lost"
  | "pursuit_maintained"
  | "close_encounter"
  | "interception";
```

### 17.5 Evidence

```ts
export type EvidenceCard = {
  id: string;
  seasonId: string;
  weekNumber: number;
  cityId: string;
  kind: "standard" | "intercept";
  title: string;
  body: string;
  highlightedFragment?: string;
  iconKey?: string;
  imagePath?: string;
};
```

### 17.6 Group season state

```ts
export type GroupSeasonState = {
  groupId: string;
  seasonId: string;
  currentWeekNumber: number;
  completedWeekIds: string[];
  weeklyOutcomes: Record<string, WeeklyOutcome>;
  unlockedStandardEvidenceIds: string[];
  unlockedInterceptClueIds: string[];
  interceptionCount: number;
  finaleDepthTier: 1 | 2 | 3 | 4;
  completedAt?: string;
};
```

---

## 18. Centralized Services

### 18.1 Chase calculation service — REQUIRED

Create one authoritative calculation layer responsible for:

- active-player eligibility;
- group weekly target;
- verified steps;
- bonuses;
- base progress;
- final progress;
- remaining lead;
- outcome classification;
- projected outcome;
- data confidence.

Do not duplicate chase arithmetic across UI components.

Suggested interface:

```ts
export type ChaseCalculationInput = {
  activePlayers: ActivePlayerInput[];
  verifiedGroupSteps: number;
  fieldOpsState: FieldOpsGroupState;
  specialOperationState: SpecialOperationState;
  nemesisState: NemesisGroupState;
  predictionState: PredictionGroupState;
  elapsedFractionOfWeek: number;
  trackerSyncState: TrackerSyncState[];
};

export type ChaseCalculationResult = {
  groupWeeklyTarget: number;
  baseProgress: number;
  bonuses: {
    fieldOps: number;
    specialOperation: number;
    nemesisParticipation: number;
    predictionParticipation: number;
    total: number;
  };
  finalProgress: number;
  remainingLead: number;
  projectedOutcome?: WeeklyOutcome;
  dataConfidence: DataConfidence;
};
```

### 18.2 Weekly state service — REQUIRED

Centralize:

- phase transitions;
- week opening;
- week closing;
- prediction lock;
- sudden death activation;
- final reconciliation;
- outcome persistence;
- evidence unlock;
- next-week activation.

### 18.3 Beat service — REQUIRED

Centralize:

- event detection;
- rule evaluation;
- cooldown checks;
- prioritization;
- template rendering;
- beat persistence;
- CTA selection.

### 18.4 Season progression service — REQUIRED

Centralize:

- current season and week;
- evidence history;
- interceptions;
- finale tier;
- completion state;
- next-city teaser.

---

## 19. Reusable Narrative Surfaces

Build or refactor reusable components instead of hardcoding each city screen.

Recommended components:

- `MondayBriefing`
- `CurrentChaseState`
- `SelenaTransmission`
- `FieldUpdate`
- `WeeklyComplicationCard`
- `FinalPushAlert`
- `SuddenDeathAlert`
- `CaseClosingState`
- `CaseClosedReport`
- `EvidenceCard`
- `EvidenceBoard`
- `InterceptClueReveal`
- `NextCityTeaser`
- `DataConfidenceNotice`

Each component should consume configuration and calculated state.

---

## 20. Implementation Epics

### Epic 1 — Canonical Season Configuration

**Goal:** Represent all thirteen weeks in data rather than page-level hardcoding.

Tasks:

- create Season One configuration;
- create thirteen week entries;
- create standard evidence configuration;
- create Intercept Clue configuration;
- create outcome-specific closing copy;
- validate unique IDs and week order;
- add configuration tests.

Acceptance criteria:

- the entire route can be loaded from one season config;
- no city chapter requires a unique page implementation;
- all four closing messages exist for every week;
- all evidence references resolve.

### Epic 2 — Central Chase Calculation

**Goal:** Create one tested source of truth for pursuit math.

Tasks:

- implement target calculation;
- implement step progress;
- implement capped bonuses;
- implement remaining lead;
- implement outcome thresholds;
- implement projection;
- implement data-confidence result;
- add unit tests for boundary conditions.

Acceptance criteria:

- bonuses never exceed 10%;
- outcome boundaries are deterministic;
- remaining lead never falls below zero;
- the same input produces the same result;
- stale data cannot generate a verified result.

### Epic 3 — Weekly State Machine

**Goal:** Make weekly rhythm explicit and reliable.

Tasks:

- define week phases;
- calculate phase from authoritative time and state;
- open new cases;
- lock predictions;
- activate midweek update;
- activate final push;
- activate sudden death;
- reconcile Sunday data;
- finalize outcome exactly once;
- unlock evidence;
- advance to the next week.

Acceptance criteria:

- transitions are idempotent;
- rollover cannot double-award rewards;
- case-close result persists;
- late data enters a controlled recalculation state.

### Epic 4 — Deterministic Beat Engine V1

**Goal:** Translate verified data into responsive story moments.

Initial rule set should include approximately 20–30 beats across:

- pursuit;
- player performance;
- nemesis;
- Field Ops;
- rituals;
- trust states.

Tasks:

- create config-driven beat rules;
- implement priority;
- implement cooldown;
- implement per-week caps;
- implement confidence requirements;
- render authored templates;
- persist shown beats;
- return one primary beat and optional supporting items.

Acceptance criteria:

- no beat invents an unsupported event;
- trust beats suppress inappropriate Selena taunts;
- duplicate beats are controlled;
- ritual beats can take priority;
- every beat can be traced to source data.

### Epic 5 — Narrative Ritual Surfaces

**Goal:** Make the week feel shaped and ceremonial.

Tasks:

- build Monday briefing;
- build midweek update;
- build final push;
- build sudden death treatment;
- build case close;
- build evidence reveal;
- build interception reveal;
- build next-city teaser.

Acceptance criteria:

- all surfaces work with every week config;
- reduced-motion mode remains functional;
- the interface presents one dominant action;
- users can recover all critical information without animation or sound.

### Epic 6 — Evidence Board

**Goal:** Give the season visible memory.

Tasks:

- build ordered evidence grid/list;
- show locked and unlocked states;
- distinguish standard evidence from Intercept Clues;
- show group interception count;
- calculate finale depth tier;
- support Season One final reveal.

Acceptance criteria:

- evidence persists at group-season level;
- missed Intercept Clues do not block the core story;
- finale content changes in depth, not primary outcome.

### Epic 7 — Trust and Sync States

**Goal:** Ensure the fiction never outruns the data.

Tasks:

- show last synced time;
- classify current, delayed, and stale sources;
- surface incomplete field report messaging;
- implement recalculation state;
- block final-result claims when data is unresolved;
- prevent performance taunts from incomplete data.

Acceptance criteria:

- stale data is plainly visible;
- final results cannot silently change without a recorded reconciliation;
- low-confidence data never triggers accusatory Selena copy.

### Epic 8 — Season Finale

**Goal:** Resolve the US Meridian arc while preserving the chase.

Tasks:

- calculate finale depth tier;
- reveal the Meridian Record;
- show enhanced notes based on interceptions;
- play the capture/interception scene;
- resolve the immediate Meridian threat;
- show Selena's escape;
- reveal the global-network continuation;
- persist season completion.

Acceptance criteria:

- all groups understand the same core resolution;
- high-interception groups receive deeper context;
- the player victory remains meaningful;
- Selena escapes without erasing the outcome.

---

## 21. Recommended Build Sequence

Implement in this order:

1. Add this specification to the repository.
2. Audit existing season, week, rollover, Field Ops, prediction, nemesis, and demo structures.
3. Build the Season One configuration model.
4. Enter all thirteen weeks and evidence records.
5. Centralize chase calculations.
6. Add outcome thresholds and evidence unlocking.
7. Implement authoritative weekly state phases.
8. Build minimum reusable narrative surfaces.
9. Implement trust and data-confidence states.
10. Implement the first deterministic beat rules.
11. Fully polish Week 1 as the reference implementation.
12. Confirm Weeks 2–13 run from configuration without custom code.
13. Build the evidence board.
14. Build the Week 13 finale.
15. Add additional beat templates and copy refinement.
16. Test season rollover and replay behavior.

---

## 22. Reference Week Requirement

Before polishing all thirteen weeks, make **Week 1: Chicago — The Lakefront Job** the reference implementation.

Week 1 should demonstrate:

- Monday briefing;
- current Selena lead;
- Field Ops complication;
- at least one verified beat;
- one trust-state beat;
- final-push state;
- all four weekly outcomes;
- standard evidence reveal;
- Intercept Clue reveal;
- case close;
- next-city teaser.

Once Week 1 works end to end, the other weeks should primarily require configuration and content, not new architecture.

---

## 23. Testing Requirements

### 23.1 Calculation tests

Test:

- zero steps;
- exact 70% boundary;
- exact 90% boundary;
- exact 100% boundary;
- bonus cap;
- progress over 100%;
- no active players;
- paused player;
- late-joining player;
- incomplete sync;
- recalculated result;
- changing group size;
- target manipulation constraints.

### 23.2 State-machine tests

Test:

- Monday open;
- Wednesday update;
- Friday lock;
- Saturday sudden death;
- Sunday close;
- duplicate close job;
- late sync before finalize;
- late sync after finalize;
- advancing from Week 13;
- idempotent reward awarding.

### 23.3 Beat-engine tests

Test:

- priority collision;
- cooldown;
- per-week cap;
- missing template variables;
- low-confidence suppression;
- ritual override;
- repeat taunt prevention;
- player-specific privacy;
- deterministic selection.

### 23.4 Content validation

Validate:

- thirteen unique cities;
- thirteen unique chapter titles;
- four closing messages per week;
- one standard evidence item per week;
- one Intercept Clue per week;
- no missing next-week references;
- no city-specific full visual-theme dependencies.

### 23.5 Accessibility tests

Confirm:

- keyboard operation;
- reduced-motion behavior;
- no sound dependency;
- semantic status messaging;
- readable contrast;
- understandable error and sync states.

---

## 24. Analytics and Product Measurement

### 24.1 Primary early metric — RECOMMENDED

> Percentage of active groups that complete a second consecutive weekly case with at least three contributing members.

This measures whether the social chase survives beyond first-week novelty.

### 24.2 Supporting metrics

Track:

- Week 2 and Week 4 group retention;
- contributing members per group;
- percentage of players completing at least one action beyond syncing;
- Field Ops participation;
- prediction participation;
- nemesis participation;
- assist usage;
- case-close view rate;
- evidence-board view rate;
- interception rate;
- outcome distribution;
- reactivation after inactivity;
- concentration of awards among highest-step players;
- tracker-staleness rate;
- result-recalculation rate;
- percentage of groups reaching Week 13.

### 24.3 Balance target — RECOMMENDED

Do not tune the game so nearly every group intercepts Selena every week.

Initial desired distribution may be approximately:

- Trail Lost: 10–20%
- Pursuit Maintained: 25–35%
- Close Encounter: 25–35%
- Interception: 20–30%

This is only an initial tuning hypothesis. Adjust using actual group data.

---

## 25. Open Decisions for Later

The following are intentionally not resolved in this version:

- final Season Two location;
- exact global Meridian map;
- precise animation of Selena's Week 13 escape;
- whether Oracle previews a next-week detail;
- cosmetic rewards for interceptions;
- exact sound design;
- additional health-input equivalencies;
- whether groups may start a season off-cycle;
- season replay rules;
- handling midseason group membership changes beyond minimum eligibility rules;
- whether a Close Encounter provides a partial Intercept Clue;
- exact group-size minimum and maximum;
- final target-baseline calibration period;
- exact city art assets;
- long-term group reputation labels.

Codex should not invent major product behavior for these items. Use neutral placeholders or preserve current behavior until they are explicitly decided.

---

## 26. Codex Operating Instructions

When implementing from this specification:

1. Inspect the existing repository before creating new parallel systems.
2. Reuse current onboarding, rollover, Field Ops, prediction, nemesis, badges, and demo structures where sound.
3. Prefer migration and refactoring to duplicate implementations.
4. Keep story content in configuration files.
5. Keep calculations in centralized services.
6. Keep UI components reusable across all weeks.
7. Add tests before changing rollover or reward behavior.
8. Do not introduce named NPCs.
9. Do not create separate full city themes.
10. Do not use generative AI to determine facts or outcomes.
11. Do not make missing tracker data sound like player failure.
12. Preserve accessibility and reduced-motion support.
13. Document any deviation from this specification.
14. Flag genuine ambiguities rather than silently inventing permanent product decisions.
15. Implement Week 1 end to end before scaling content polish across the season.

---

## 27. Compact Implementation Summary

### Locked route

Chicago → Detroit → Pittsburgh → Washington, D.C. → Philadelphia → New York City → Boston → Savannah → New Orleans → Austin → Santa Fe → Los Angeles → San Francisco

### Locked outcome thresholds

```text
final_progress < 0.70       → trail_lost
0.70–0.8999                 → pursuit_maintained
0.90–0.9999                 → close_encounter
final_progress >= 1.00      → interception
```

### Locked bonus ceiling

```text
field_ops_bonus                <= 0.05
special_operation_bonus        <= 0.03
nemesis_participation_bonus    <= 0.01
prediction_participation_bonus <= 0.01
total_non_step_bonus           <= 0.10
```

### Locked narrative result

- Every week advances.
- Every week unlocks standard evidence.
- Interception unlocks an additional mystery clue.
- Interception does not permanently branch the route.
- Week 13 resolves the US Meridian threat.
- The players catch Selena.
- Selena escapes.
- The larger global chase continues.

---

## 28. Final Product Standard

The Season One implementation succeeds when:

- players understand what is happening in the chase;
- real movement creates visible story consequences;
- Selena reacts only to supported facts;
- each week feels like a chapter;
- interception feels materially better than ordinary completion;
- lower-performing groups still receive a coherent story;
- the entire season runs from configuration rather than thirteen custom builds;
- the Bureau, Selena, and the group are sufficient to carry the narrative;
- the game remains practical for a solo vibe-coded project;
- the end of the season feels like a victory and a new mystery, not an arbitrary reset.

> The steps are real. Everything they touch should feel like fiction closing around Selena Chicago.
