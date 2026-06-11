# The Last Cold Beer — Version 1 Design Document

## Concept

A 2-team mystery quest party game for cabin trips, played over 2–3 days or one long evening. The app acts as game master, serving narrative, puzzles, and tracking progress. One impossibly cold beer waits in the fridge. Only the worthy may open it.

## Tone

Absurd cabin-trip humor. Nerdy but approachable. Slightly spooky. Beer/drink themed without moralizing. Think: escape room meets campfire ghost story meets drunk trivia night.

---

## Core Loop

1. Host creates a game room and defines what "Offer" means for this trip.
2. Players join with a 6-character room code and enter their name.
3. Players are assigned to Team A or Team B (host can rename teams).
4. Host starts Chapter 1.
5. Each team gets a quest board showing available rooms.
6. Teams explore rooms — each room has a theme, puzzles, hints, and clues.
7. Completing quests earns clues and unlocks adjacent rooms.
8. Each chapter ends with a boss fight.
9. First team to defeat the boss gains an advantage in the next chapter.
10. Both teams continue regardless — no one is eliminated.
11. Chapter 3 culminates in the Final Boss and the mystery reveal.

---

## The Offer System

The primary resource is **Offer**. The host defines what one Offer means at game creation. Examples:
- "3 sips"
- "Half a drink"
- "One shared team toast"
- "One alcohol-free alternative"
- Custom text

The app never says "you must drink." It says "Pay 1 Offer." Players decide what that means based on the host's definition. The mechanic works equally for alcohol, soft drinks, or nothing at all.

### Offer Costs (Reference)
| Action | Cost |
|---|---|
| Hint (basic) | 1 Offer |
| Hint (deep) | 2 Offer |
| Unlock a room | 1–2 Offer |
| Special action | 2–3 Offer |
| Boss damage boost | 2–5 Offer |
| Final boss actions | 5+ Offer |

---

## Chapters

### Chapter 1 — Arrival
Something is wrong with the fridge. One impossibly cold beer waits inside with a note. Rooms: The Kitchen, The Fridge, The Coffee Table, The Terrace, The Shed. Boss: The Locked Cooler.

### Chapter 2 — Suspicion *(data structure only in v1)*
The cabin remembers what happened last year. A broken pact. Rooms: The Old Group Chat, The Garden Chair, The Store Receipt, The False Alibi, The Playlist from Hell. Boss: The Fake Bottle Opener.

### Chapter 3 — Judgement *(data structure only in v1)*
The final night. The truth must be uncovered. Rooms: The Rules of the Ritual, The Final Ballot, The Alphabet of Caps, The Missing Tradition, The Nightstand Secret. Boss: The Last Cold Beer.

---

## Teams & Visibility

Both teams always see:
- Their own room progress
- The other team's progress summary (rooms completed, clues found, Offer spent)
- Whether the other team is at a boss
- Boss HP/damage for the other team
- How many clues the other team found (not the contents, unless unlocked)

Teams do NOT see:
- The other team's clue contents
- The other team's puzzle answers
- The other team's hint text

This creates friendly pressure without spoiling the mystery.

---

## Database Architecture

Game content is **hardcoded** in TypeScript files. The database stores **only state**:
- What rooms are unlocked/completed
- Quest answers submitted
- Hints used
- Offer spent
- Clues discovered
- Boss HP
- Game events

This makes content iteration trivial and keeps the DB simple.

---

## MVP Feature List

### Must Have (v1)
- [x] Host creates game, sets Offer definition, gets room code
- [x] Players join by code + name, stored in localStorage
- [x] Team assignment in lobby (auto-balance + manual swap)
- [x] Host renames teams
- [x] Chapter 1 fully playable: 5 rooms, 2+ quests each, 8 clues, 1 boss (4 phases)
- [x] Room unlock flow (Offer cost + prerequisite rooms)
- [x] Quest types: puzzle (text answer), choice, social_challenge
- [x] Hint system (Offer cost, reveals hint text progressively)
- [x] Clue discovery and Case File page
- [x] Boss fight with HP, phases, Offer boosts
- [x] Live progress comparison panel (both teams)
- [x] Host override panel (repair state, advance chapter)
- [x] Realtime updates via Supabase subscriptions
- [x] Mobile-first UI

### Out of Scope (v1)
- Real authentication
- Chapter 2 and 3 content (structure exists, content TBD)
- Leaderboards or achievement tracking
- Custom room/quest creation
- Timer-based challenges
- Sound effects / music
- Animated transitions

---

## Component Plan

### Layout
- `GameLayout` — wraps game pages, includes nav and game info header
- `TeamHeader` — team name, chapter, status badge

### Game UI
- `LiveProgress` — side-by-side team comparison panel
- `RoomCard` — room tile on the quest board (locked/unlocked/complete states)
- `QuestCard` — a single quest item with answer input, hints, status
- `HintButton` — "Pay X Offer to reveal hint" button
- `OfferButton` — generic Offer payment button with cost display
- `BossHpBar` — segmented HP bar with phase indicators
- `ClueCard` — discovered clue with flavor text and icon
- `StatusBadge` — team status pill (Exploring / At Boss / Chapter Complete)

### Pages
- `/` — Landing: create or join
- `/create` — Host setup form
- `/join/[code]` — Player name entry
- `/game/[gameId]/lobby` — Team assignment, host starts game
- `/game/[gameId]/dashboard` — Overview: both teams, current chapter, live progress
- `/game/[gameId]/team/[teamId]` — Quest board with room grid
- `/game/[gameId]/team/[teamId]/room/[roomId]` — Room detail with quests
- `/game/[gameId]/boss/[bossId]` — Boss fight screen
- `/game/[gameId]/case-file` — Discovered clues collection
- `/game/[gameId]/host` — Host controls

---

## Folder Structure

```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── create/page.tsx
│   ├── join/[code]/page.tsx
│   └── game/[gameId]/
│       ├── lobby/page.tsx
│       ├── dashboard/page.tsx
│       ├── team/[teamId]/
│       │   ├── page.tsx
│       │   └── room/[roomId]/page.tsx
│       ├── boss/[bossId]/page.tsx
│       ├── case-file/page.tsx
│       └── host/page.tsx
├── components/
│   ├── ui/          (Button, Input, Card, Badge)
│   ├── game/        (LiveProgress, RoomCard, QuestCard, BossHpBar, ClueCard, OfferButton)
│   └── layout/      (GameLayout, TeamHeader)
├── content/
│   ├── chapters.ts
│   ├── rooms.ts
│   ├── quests.ts
│   ├── clues.ts
│   └── bosses.ts
├── hooks/
│   ├── usePlayer.ts
│   ├── useRealtimeGame.ts
│   └── useTeamProgress.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── game/
│       ├── actions.ts
│       ├── queries.ts
│       └── helpers.ts
└── types/
    ├── content.ts
    ├── game.ts
    └── database.ts
```

---

## Implementation Order

1. Types (`types/content.ts`, `types/game.ts`, `types/database.ts`)
2. Content files (`content/*.ts`) — Chapter 1 full, Chapters 2–3 stubs
3. Supabase schema (SQL migration)
4. Supabase client utilities (`lib/supabase/`)
5. Game logic helpers (`lib/game/`)
6. Server actions (`lib/game/actions.ts`)
7. Hooks (`hooks/`)
8. Shared UI components (`components/`)
9. Pages in dependency order: landing → create → join → lobby → dashboard → team → room → boss → case-file → host
10. Build and smoke test
