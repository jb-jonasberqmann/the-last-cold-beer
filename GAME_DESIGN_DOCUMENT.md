# THE LAST COLD BEER — Game Design Document
*Full story, structure, mechanics and implementation notes*
*Version: Post v0.5 redesign — June 2026*

---

## OVERVIEW

**The Last Cold Beer** is a mobile-first party game for 6–10 players split into two teams, played at a real Danish summerhouse. Both teams race through the same story map with different puzzles, collecting the same main clues but occasionally diverging on side clues. The game plays across one real evening — arriving, settling in, and surviving the night.

**The property:** Nørrestrand 48A, Hou, Hals, North Jutland. 8-person summerhouse, built 1960. Key access via key box with code.

---

## THE CENTRAL MYSTERY

The house has been visited before. Previous groups came to this exact summerhouse and went through the same ritual — none of them finished. Each one left a trace behind. The current group must complete what those before them could not.

Throughout the evening, the house reveals itself as slightly, wrongly *off* — odd notes, missing things, a radio that shouldn't be broadcasting. The atmosphere builds from cheerful to unsettling to genuinely eerie.

**The twist:** One player — assigned completely at random and invisibly at game start — is "the culprit." They took the last cold beer without replacing it. They don't know. Nobody knows. At the climax of Act 3, the game reveals who it was. That person must drink the last cold beer.

The culprit mechanic is purely a fun reveal — the game does not actively hunt for the culprit or build clues toward them. It's a final surprise layer on top of the story.

---

## THE THREE ACTS

---

### ACT 1 — "THE ARRIVAL"
*Setting: Outside the house, late afternoon, golden hour*
*Tone: Warm, chaotic, cheerful — with one wrong note*

#### Story
Everyone arrives at the summerhouse. Mads — the friend who always holds the key — is not here. He's not answering his phone. The group is stuck outside, exploring the garden and terrace, wondering where he is.

Midway through the act, someone discovers the front door has a key box with a code rather than a physical key. Nobody has the code. Mads has it. Mads is still not here.

Throughout the act, teams collect code fragments — hidden in different outdoor locations — that together form the key box code. When Mads finally arrives (the boss fight), he gives them the last fragment. The code is entered. Act 2 begins.

**The one wrong note:** Inside the shed, a list of dates is pinned to the wall. Every date is crossed out except one — today's. Easy to laugh off in Act 1 ("someone's been keeping track"). Impossible to forget by Act 3, when the YOURSELVES reveal reframes it: this group wrote it. Every year. They keep coming back and they keep not finishing.

#### Map Structure

**Main spine:**
1. **The Driveway** — arrival, cars, Mads is absent. First exploration.
2. **The Terrace** — meeting point for early arrivals. New wooden deck. You can see inside through the glass but cannot enter.
3. **The Garden** — 1,250m² fenced natural plot. Open, coastal, breezy.
4. **The Shed** — weathered outbuilding. Tools, grill equipment. *The first wrong note is here.*
   - Pinned to the inside wall: a handwritten list of dates, all crossed out except the last one.
   - All past dates fall in late July (weeks 28–30) — the usual window for the annual gathering.
   - The final entry is never crossed out. It is always today's date, rendered dynamically.
   - **Full list (all crossed out except the last):**
     ~~July 19th 2010~~
     ~~July 11th 2011~~
     ~~July 23rd 2012~~
     ~~July 15th 2013~~
     ~~July 14th 2014~~
     ~~July 20th 2015~~
     ~~July 18th 2016~~
     ~~July 10th 2017~~
     ~~July 16th 2018~~
     ~~July 22nd 2019~~
     ~~July 13th 2020~~
     ~~July 19th 2021~~
     ~~July 11th 2022~~
     ~~July 17th 2023~~
     ~~July 15th 2024~~
     ~~July 21st 2025~~
     **[today's date — dynamic, rendered from `new Date()` at runtime]**
   - **Implementation note:** This clue is a special rendered component, not a static string. The list of past dates is hardcoded; the final line is generated client-side. No database needed. Format: `"MMMM Do YYYY"` (e.g. "July 21st 2025").
5. **The Front Door** — key box mounted beside the door. No key. Code unknown.

**Branch nodes:**
- **The Petanque Court** — off the garden. Optional side quest.
- **The Carport** — off the driveway. Where Mads eventually arrives. Boss room.

#### Boss: MADS
- **Concept:** Not a monster — a friend. Late, chaotic, arms full. His "HP" is his stubbornness / how much unpacking is left.
- **Actions (examples):**
  - "Carry the heavy cooler" — deals damage
  - "Grab the beer cases from the boot" — deals damage
  - "Hold the door while he squeezes through" — deals damage
  - "Find a spot for the sleeping bag" — deals damage
  - "Help him remember where he put his phone" — deals damage
- **Defeat:** Mads is finally empty-handed. He grins. He pulls out his phone and gives them the last code fragment.
- **Reward:** Teams now have all fragments. They must combine them and enter the code at The Front Door to unlock Act 2.

#### Clue Flow (Act 1)
- Code fragments are the primary clues, hidden across outdoor rooms
- One clue from the shed plants the first seed of wrongness (not a code fragment — a separate, atmospheric clue)
- Mads's final fragment is always the last piece needed — players cannot brute-force the code early

---

### ACT 2 — "SETTLING IN"
*Setting: Inside the house, evening, warm lamplight*
*Tone: Cozy but gradually dimming — the radio is always in the background*

#### Story
The house is open. People find their rooms. Three players (one per team, per bedroom) explore the three bedrooms alone — a critical mechanic (see below). The bedrooms each tell a fragment of a story left by previous visitors. All three players reconvene in the living room.

The rest of the act explores the house room by room. The radio in the dining room has been crackling all evening — each room seems to pick up a fragment of what it's trying to say. Teams piece the signal together as they go.

At the dining room, teams attempt to fix the radio (the boss fight). They succeed. For one moment it broadcasts clearly: *"The last one to take it... will always be the one to finish it."* Then it overloads. The house goes dark. Act 3 begins.

#### CRITICAL MECHANIC: Single-Occupancy Bedrooms
🚩 **Requires dedicated implementation**

- Each bedroom can be entered by **exactly one player per team**
- First player to tap "Enter" claims the room — it locks immediately for all other team members
- The room shows as "Occupied" on the map for others (not locked, not unlocked — a third state)
- This must be enforced at the database level, not just client-side
- The player inside completes their quests alone
- **The Bunk Room exception:** the player who completes the bunk room receives the "Scared Silent" status for the Living Room

#### CRITICAL MECHANIC: The Scared Silent Player
🚩 **Requires dedicated implementation**

- The player who completed the Bunk Room cannot type or speak during **The Living Room only**
- The silence is a puzzle mechanic, not a lasting status — it is strictly scoped to the Living Room
- In-app: their text input is disabled, replaced with a "You are too scared to speak" message
- They can see everything, receive clues, but cannot contribute text answers in this room
- The Living Room puzzle requires their clue — they must communicate it via **charades** (physical, real-world)
- The Living Room puzzle is a sentence with three blanks — one word from each bedroom
- The Bunk Room word is the final, crucial blank
- Implementation note: "Scared Silent" is a player-level status flag set when the Bunk Room quest is completed, cleared automatically when the Living Room is completed. The player speaks normally for all of Act 3.

#### The Three Bedrooms

**The Double Room**
- *Previous visitor:* A couple. They left in a hurry — didn't mean to leave anything behind.
- *Trace:* Half-packed bag open on the bed. A note that is mid-sentence, never finished. Something still plugged in that nobody unpacked.
- *The note:*
  > *"We owed it to each other. We owed it to the house. I know we said we'd come back and finish what we—"*
- *Clue word for living room puzzle:* **owed** — warm and human, but carries weight. Appears twice in the note, unmistakable.
- *Tone:* Melancholy urgency. Not scary — sad.

**The Single Room**
- *Previous visitor:* One person, alone. They started deliberately, ended in panic.
- *Trace:* Some things placed with intention, some dropped mid-action. A note that started as an observation and ended as an existential crisis.
- *The note:*
  > *"This is not even my house... Borrowed it is... Not even my bed... Borrowed... This... life... borrowed?"*
  Escalates from house → bed → life. The question mark is where they lost it. The note didn't end because they finished — it ended because they stopped.
- *Clue word for living room puzzle:* **borrowed** — ambiguous. Borrowed time. Borrowed space. Borrowed identity.
- *Tone:* A mix of deliberate and scattered. Unsettling because you can't tell which parts were planned.

**The Bunk Room**
- *Previous visitor:* Someone who knew exactly what they were doing.
- *Trace:* A note on the underside of the top bunk mattress — only visible if you're lying on the bottom bunk looking up.
- *The note:* Written on the underside of the top bunk mattress — only visible lying on the bottom bunk looking up. Cold and minimal. This person wrote exactly what was needed and nothing more.
  > *"It was taken. It is always taken. The room where everyone gathers holds the rest."*
- *Clue word for living room puzzle:* **taken** — the word that locks the sentence. Easy to mime (grab something, pocket it). Echoes the radio directly: *"the last one to take it."*
- *Tone:* Cold and deliberate. This person knew.

**The Living Room Puzzle**
- The room displays a sentence with three blanks — one filled by each bedroom's word
- Template: *"Something _____, something _____, something _____."*
- Assembled: **"Something owed, something borrowed, something taken."**
- The Bunk Room word ("taken") is always the final piece — the Scared Silent player must mime it
- The wedding-vow echo makes it feel ritualistic and wrong. The house has its own ceremony.
- When the radio broadcasts its line clearly in Act 2 ("the last one to *take* it..."), the group feels the echo — they assembled the word "taken" themselves one room earlier
- After the YOURSELVES reveal in Act 3, the sentence reframes completely: they owed the house a finish, they borrowed the evening, one of them took the last cold beer

#### Map Structure

**Three parallel starting nodes:**
1. **The Double Room**
2. **The Single Room**
3. **The Bunk Room**

**All converge into:**
4. **The Living Room** — warmest room, wood-burning stove, the radio visible on a shelf crackling quietly

**Continuing spine:**
5. **The Dining Room** — the radio lives here. Boss room.
6. **The Kitchen** — functional, lived-in, clues in the everyday
7. **The Activity Room** — table tennis, darts, foosball, mini billiards. The fun room before everything goes wrong.

**Branch nodes:**
- **The Sunroom / Conservatory** — off the living room. First place you notice the wind. Slightly cooler.
- **The Darts Board** — off the activity room. Side quest.
- **The Foosball Table** — off the activity room. Side quest.

#### Boss: THE RADIO
- **Concept:** Old brown bakelite analog radio in the dining room. Green glowing tuner dial. Has been crackling all evening.
- **HP bar:** Styled as "Signal Strength" — builds as teams repair it
- **Actions (examples):**
  - "Adjust the antenna" — deals damage
  - "Replace the fuse" — deals damage
  - "Tune the frequency" — deals damage
  - "Reconnect the loose wire" — deals damage
  - "Clean the speaker grille" — deals damage
- **Defeat sequence:**
  1. Signal locks in. Green light blazes.
  2. The radio broadcasts clearly: *"The last one to take it... will always be the one to finish it."*
  3. Beat of silence.
  4. The light overloads — white flash.
  5. Screen goes black.
  6. Single line of text: *"The house goes dark."*
  7. Act 3 begins.

#### The Radio Thread (Act 2 clue design)
- Each room in Act 2 should contain a fragment of the radio's signal as part of its flavor/atmosphere
- These fragments are cryptic on their own, accumulate into something coherent by the Dining Room
- The radio is always audible in the background — room descriptions can reference "the static from the dining room"
- This thread is atmospheric, not mechanically separate from normal clue flow

---

### ACT 3 — "THE LATE NIGHT"
*Setting: The full property — house and garden — in darkness*
*Tone: Genuinely eerie. Stranger Things finale energy. Things that were funny in Acts 1 and 2 are no longer funny.*

#### Story
The house is dark. Teams work through the property — both inside and outside — repairing broken things, finding artifacts, using those artifacts to access the next broken thing. The house is the same property they arrived at in Act 1, but it means something completely different now.

Rooms from Acts 1 and 2 are revisited in darkness — familiar but wrong. New locations appear that were always there but never explored. A door nobody tried. A corner of the garden behind the shed.

At the end, teams return to the living room. The boss fight plays out here. And then — the reveal.

#### The Artifact Chain
Each artifact is found and used in order. Finding an artifact unlocks the next room.

1. **The Flashlight** — found in [early Act 3 room]. Lets you see the fuse box.
2. **The Wrench** — found in [mid Act 3 room]. Fixes the banging window latch. The silence after is louder.
3. **The Candle** — found somewhere unexpected. Reveals writing on a wall that was always there.
4. **The Fuse** — found after the fuse box is located. Restores partial power to one room only.
5. **Something from the shed** — requires going back outside in the dark. The shed from Act 1 yields one final object. This is the peak eeriness moment — back outside, alone, dark, the shed that had the wrong note in Act 1.

🚩 **Artifact mechanic needs implementation:** Artifacts are inventory items earned by completing rooms. They are required to unlock subsequent rooms. This is a new mechanic — current game has no inventory system.

#### New / Previously Undiscovered Locations
- **The Door Nobody Tried** — a door visible in Act 2 backgrounds but never interacted with. In Act 3 it becomes a room node. Old wood, no markings. When opened: not a room. A sealed wall — but you can see the ghost of what was there. The old frame outline, the seams, the traces of a threshold. Someone didn't lock this room. They deconstructed the entrance entirely, walled it up from the inside.
- **Behind the Shed** — a section of the garden that wasn't on the Act 1 map. Something is there. This is the peak eerie moment of Act 3.
- **The Fuse Box** — utility space, found with the flashlight. Under stairs or back corridor.
- **The Broken Window** — a specific window with a rattling latch. Fixed with the wrench.

#### Map Structure
Act 3 covers the full property in darkness. The map should feel like the same building drawn in shadow — familiar but deeply wrong. New locations appear; old ones are revisited with entirely different meaning.

Artifacts are not all on the main spine — teams that rush without exploring branches will hit locked rooms and have to backtrack.

**Spine:**
1. **The Dining Room** — starting point. Dark. Radio silent. The house goes dark here at the end of Act 2.
2. **The Back Corridor** — requires: Flashlight. Branching node.
3. **The Fuse Box** — yields: Fuse. Under the stairs. Found with the flashlight.
4. **The Kitchen** — requires: Fuse (partial power restored). Yields: Wrench.
5. **The Door Nobody Tried** — a door visible in Act 2 but never interacted with. Old wood, no markings. What's behind it connects to the house's history. Branching node.
6. **Behind the Shed** — back outside. Darkest moment of the game. Branching node.
7. **The Living Room** — requires: Final Artifact. Boss room: YOURSELVES.

**Branches:**
- Off The Dining Room → **The Utility Corner** — yields: Flashlight. First branch, sets the tone.
- Off The Kitchen → **The Broken Window** — requires: Wrench. Dead end, no artifact — but the silence after the rattling latch is fixed is louder than the rattle ever was.
- Off The Door Nobody Tried → **The Sealed Wall** — requires: Candle. The "Hidden Room" is not a room — it's the sealed doorway itself. Holding the candle up to the wall surface reveals text written directly on it. Three lines, written at different moments before the entrance was walled up:
  > *July 19th 2010*
  >
  > *"We locked it so we'd have to come back."*
  >
  > *"If you found this, you already know. You just haven't admitted it yet."*
  The date matches the oldest entry on the shed list. "We locked it" now means something more absolute — they didn't turn a key, they walled up the room entirely. After the YOURSELVES reveal: one of them wrote this, then sealed themselves out.
- Off Behind the Shed → **The Conservatory** — yields: Candle. Dark, cold, the wind audible. Must be found before The Hidden Room.
- Off Behind the Shed → **The Shed** — yields: Final Artifact. The date list is here. Tonight's date, still uncrossed. The final artifact is a handwritten note — left by this group on their previous visit, though none of them remember writing it.
  - **The note:** *"We came. We stayed. We failed... This time.. Finish it... Every last drop."*
  - **Signed with:** anagrammed versions of each player's in-game username (e.g. "dummyboy101" → "my buddy 101"), rendered dynamically from the player list at runtime.
  - In Act 1, the date list on the wall reads as something left by strangers. In Act 3, after the YOURSELVES reveal, the note reframes everything — they wrote this to themselves.

**Artifact chain summary:**
| Artifact | Found in (branch/spine) | Required for |
|----------|------------------------|--------------|
| Flashlight | The Utility Corner (branch) | The Back Corridor (spine) |
| Fuse | The Fuse Box (spine) | The Kitchen (spine) |
| Wrench | The Kitchen (spine) | The Broken Window (branch) |
| Candle | The Conservatory (branch) | The Hidden Room (branch) |
| Final Artifact | The Shed (branch) | The Living Room (boss) |

Each team finds their own artifacts. Artifact mechanic works identically to clues — collected by completing room quests, stored in the Case File, checked as unlock conditions.

#### Boss: YOURSELVES

- **Setting:** The living room. The radio is silent. The group is back where it all made sense.
- **Concept:** The previous visitors — the ones who left the half-written note, who arranged the Single Room with such intention, who wrote on the underside of the bunk mattress — were this group. They've been here before. They don't remember. The boss fight is the house forcing that recognition. Players aren't fighting a monster; they're fighting their own denial.
- **HP bar label:** *"Recognition"*
- **Total blackout:** Nobody in the group knows they've been here before, including the culprit. The reveal is collective.

**Phase 1 — Denial**
*"This can't be us."*
Actions establish uncomfortable familiarity — things they know without knowing why.
- *"Finish the sentence"* — the half-written note from the Double Room trails off mid-sentence. Someone in the group speaks the ending. (Social challenge — they must say something aloud, any ending. The house accepts it.)
- *"You knew the layout"* — choice action. Did you hesitate before any door tonight? Both answers register. The house is listening.
- *"Describe the shed note without looking at it"* — puzzle. They collected this clue in Act 1. Now they must recall it from memory.

**Phase 2 — Recognition**
*"We've done this before."*
Actions force specific acknowledgements — details only the previous visitors would know.
- *"Whose handwriting is in the Double Room?"* — the group must name a player. The correct answer is whoever holds the `is_culprit` flag, but any name is accepted. The tension is in the group debating it.
- *"What did the Bunk Room know?"* — the player who completed the Bunk Room reads the note aloud to the group. (Their Scared Silent status ended when the Living Room was cleared — they've been able to speak normally through all of Act 3.)
- *"Stand where you slept"* — physical challenge. Each player moves to the room they entered in Act 2. 30 seconds. Then return.
- *"Say nothing for 45 seconds"* — physical challenge timer. Full silence. The house waits.

**Phase 3 — Acceptance**
*"We are the ones who didn't finish."*
Actions are acts of completion — doing what they abandoned last time.
- *"Name what was taken"* — answer: the last cold beer.
- *"Say the radio's words together"* — the whole group must type (or speak aloud) the broadcast line: *"The last one to take it will always be the one to finish it."*
- *"Let the house finish what was started"* — the final action. No puzzle. No answer. Just a single button: **We're ready.**

**Defeat sequence:**

> The partial light steadies.
>
> *(beat)*
>
> *"You've been here before."*
>
> *(beat)*
>
> *"All of you."*
>
> *(beat)*
>
> *"Except one of you took something."*
>
> → Cuts to the culprit reveal screen.

#### The Two Reveals

**Reveal 1 — The Group** (woven into the boss fight)
By the time the boss is defeated, the recognition has fully landed: they were the previous visitors. The bedroom traces were theirs. The shed note was theirs. The radio was always talking to them.

**Reveal 2 — The Culprit** (end screen, after boss defeat)
One player, randomly assigned at game start, took the last cold beer on their previous visit.
1. The radio's line appears one final time: *"The last one to take it... will always be the one to finish it."*
2. The culprit's name appears.
3. They are handed the last cold beer. They must drink it.
4. The house is satisfied.

**Culprit mechanic implementation notes:**
- At game creation, one player is randomly assigned `is_culprit: true` in the database
- No gameplay affects this — it's purely a reveal
- The reveal happens as a special end-game event
- The culprit themselves does not know until the reveal
- 🚩 **Needs implementation:** culprit assignment, storage, and reveal screen

---

## KEY MECHANICS REQUIRING NEW IMPLEMENTATION

### 1. Single-Occupancy Rooms
- Database: `room_occupant` field or separate table linking player to room
- When player A enters, room is locked for all other team members
- Map shows three states: locked, occupied (by teammate), unlocked
- Only relevant for the three bedrooms in Act 2

### 2. Scared Silent Player
- Database: `player_status` flag — normal / scared_silent
- Set when Bunk Room quest completed
- During Living Room: text input disabled for this player
- Cleared when Living Room is completed
- Needs clear in-app communication ("You are too scared to speak")

### 3. Artifact Inventory
- **Artifacts work exactly like clues** — no new database table or inventory UI needed
- Each artifact is a clue with a special `type: "artifact"` flag
- Artifacts are earned per team by completing specific rooms (not shared between teams)
- A room that requires an artifact checks whether the team's clue collection includes it before unlocking — same pattern as existing clue-gated logic
- No new UI needed; artifacts appear in the Case File alongside regular clues

### 4. Culprit Assignment & Reveal
- At game creation: one player randomly flagged
- End-game screen shows the reveal dramatically
- Consider: does the culprit see any different UI during the game? (Recommendation: no — keep it pure.)

### 5. Act Transitions
- Act 1 → Act 2: triggered by entering the correct key box code at The Front Door
- Act 2 → Act 3: triggered by the radio boss defeat (automatic, cinematic)
- Act 3 → End: triggered by final boss defeat, leads to reveal screen

---

## STORY THREADS ACROSS ALL THREE ACTS

| Thread | Act 1 | Act 2 | Act 3 |
|--------|-------|-------|-------|
| Mads | Absent, then arrives | Settled in, present | Background |
| The house's history | First wrong note (shed) | Three bedroom stories | Full revelation |
| The radio | Not yet present | Crackling throughout, boss | Silent but significant |
| The previous visitors | Hinted (shed note) | Three bedroom traces | Behind-the-shed discovery |
| The culprit | Randomly assigned invisibly | No gameplay effect | Revealed at climax |
| The code | Fragments collected | Used to enter, complete | — |
| The last cold beer | Referenced in game title | Radio's final broadcast | Physically drunk at reveal |

---

## DIFFICULTY PROGRESSION

- **Act 1:** Introductory difficulty. Puzzles teach the mechanics. Physical challenges are warm-up social. Clues are relatively straightforward.
- **Act 2:** Medium difficulty. Puzzle complexity increases. Clue interdependency introduced (bedroom → living room). The radio thread requires holding multiple fragments simultaneously.
- **Act 3:** Hardest. Artifact dependencies add a new layer. Some clues from Acts 1 and 2 are needed again. Eerie atmosphere makes everything feel higher stakes. The final boss requires everything learned across the whole evening.

**Important principle:** Clues must always be obtained before they are needed. No puzzle should require a clue that comes from a later room. Map the full clue dependency graph before writing puzzle content.

---

## WHAT'S BUILT (as of v0.5)

The current codebase (backed up as TLCB_v0.5) contains a working Act 1 prototype with:
- Next.js 14 App Router, TypeScript, Supabase
- Two-team game with 5s polling via `useRealtimeGame`
- Quest types: puzzle, choice, social_challenge, unlock, clue_check, sliding_puzzle, physical_challenge
- Boss fight system with HP, phases, and actions
- Quest board map (SVG nodes + paths)
- Clue collection and Case File browser
- Physical challenge timer (broadcast via game_events)
- Offer/toll system
- Gamble mechanic on boss

The existing rooms (kitchen, fridge, terrace, shed, coffee-table, toolbox, hammock) will need to be **replaced** with the new three-act structure. The v0.5 backup preserves all of this.

---

## NEXT STEPS (for next chat session)

### ✅ Design Complete
1. ~~**Decide Act 3 boss**~~ ✅ Boss is **YOURSELVES** — three phases (denial → recognition → acceptance), two stacked reveals (group was here before, then culprit reveal)
2. ~~**Write the three bedroom clue words**~~ ✅ owed (Double) / borrowed (Single) / taken (Bunk) → *"Something owed, something borrowed, something taken."*
3. ~~**Write the shed's wrong note**~~ ✅ Dynamic date list (2010–present), all crossed out except today's. Rendered from `new Date()` at runtime.
4. ~~**Design the artifact chain**~~ ✅ Five artifacts across spine + branches. Each works like a clue.
5. ~~**Map Act 3 rooms**~~ ✅ 7 spine rooms + 5 branches. See Act 3 map structure above.
6. ~~**Write all bedroom notes**~~ ✅ Double Room ("We owed it..."), Single Room ("This is not even my house..."), Bunk Room ("It was taken...")
7. ~~**Write shed final artifact note**~~ ✅ "We came. We stayed. We failed... This time.. Finish it... Every last drop." Signed with anagrammed usernames.
8. ~~**Write Hidden Room / Sealed Wall content**~~ ✅ Three lines on the sealed wall, revealed by candle.
9. ~~**Write Door Nobody Tried**~~ ✅ Opens to a deconstructed entrance — visible ghost of a room, walled up from inside.

### 🚩 Implementation — Ready to Build
10. **Rewrite content files** — new rooms.ts, quests.ts, bosses.ts for all three acts using new artwork assets from `_artwork/` folder
11. **Redesign quest board maps** — new SVG layouts for each act
12. **Implement Single-Occupancy Rooms** — database + UI (Act 2 bedrooms)
13. **Implement Scared Silent mechanic** — player status flag, scoped to Living Room only, cleared on completion
14. **Implement Artifact system** — artifacts as clue type, unlock conditions on rooms, per-team
15. **Implement Culprit Assignment + Reveal** — random flag at game creation, dramatic end screen
16. **Implement Act Transitions** — key box code (Act 1→2), radio defeat cinematic (Act 2→3), boss defeat → reveal screen
17. **Implement dynamic clue components** — shed date list (renders today's date), shed note (anagrammed usernames)
18. **Remove backgrounds from artwork assets** — NodeBlob and similar assets need transparent backgrounds before use

### 📝 Asset Notes
- New artwork assets available in `_artwork/` folder — use for all UI elements except room artwork (room-specific art not yet generated)
- Strip backgrounds from NodeBlob and similar assets before integrating

---

## REFERENCE

**Property:** Nørrestrand 48A, Hou, 9370 Hals, Denmark
**Listing:** https://www.cofman.com/search/Y2Xhmf0kPetLrWvjDGGrPd_amHmYGC7tjaioVrZhYGDgYFD0Y2DoYAABAA/121-44-0484
**Feline listing (more detail):** https://www.feline.dk/katalog/Danmark/Hou/121-44-0484
**Codebase backup:** TLCB_v0.5 (same parent folder)
**Visual brief:** VISUAL_DESIGN_BRIEF.md (same folder)
