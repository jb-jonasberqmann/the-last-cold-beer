# The Last Cold Beer

A 2-team mystery quest party game for cabin trips.

## Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in Supabase credentials
cp .env.local.example .env.local

# 3. Run the Supabase schema
# Open supabase/schema.sql in your Supabase SQL editor and run it.

# 4. Start the dev server
npm run dev
```

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the contents of `supabase/schema.sql`
3. Run it — this creates all tables, indexes, RLS policies, and enables realtime
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Paste both into `.env.local`

## Deploy to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## How to Play

1. **Host creates a game** at `/create` — sets team names, defines what "1 Offer" means for your group
2. **Share the room code** — players visit `/join/CODE` or enter the code on the homepage
3. **In the lobby** — host assigns players to teams, then starts the game
4. **Quest Board** — each team explores rooms, completes quests, finds clues
5. **Boss Fight** — after exploring, fight "The Locked Cooler" at `/game/[id]/boss/locked-cooler`
6. **Case File** — collected clues live at `/game/[id]/case-file`
7. **Host Controls** — at `/game/[id]/host` — override/repair state, force-unlock rooms

## Project Structure

```
app/                    # Next.js App Router pages
  page.tsx              # Landing page
  create/               # Host game creation
  join/[code]/          # Player join
  game/[gameId]/
    lobby/              # Pre-game lobby with team assignment
    dashboard/          # Main game overview with activity feed
    team/[teamId]/      # Quest board
      room/[roomId]/    # Individual room with quests
    boss/[bossId]/      # Boss fight screen
    case-file/          # Discovered clues
    host/               # Host admin controls

content/                # Hardcoded game content (never in DB)
  chapters.ts           # Chapter definitions
  rooms.ts              # All rooms (Ch1 full, Ch2/3 stubs)
  quests.ts             # Quest content (Ch1 full)
  clues.ts              # Clue definitions (Ch1 full + stubs)
  bosses.ts             # Boss definitions (Ch1 full + stubs)

lib/
  supabase/             # Supabase client/server setup
  game/
    actions.ts          # All server actions (mutations)
    queries.ts          # Read-only DB fetches
    helpers.ts          # Pure logic helpers

types/
  content.ts            # Types for game content
  database.ts           # DB row types
  game.ts               # Runtime state types

hooks/
  usePlayer.ts          # localStorage player session
  useRealtimeGame.ts    # Supabase realtime subscriptions
```

## Adding Chapter 2 & 3 Content

Chapter 2 and 3 data structures exist but have placeholder content (`TODO`).

To implement:
1. Edit `content/rooms.ts` — replace `TODO` descriptions for Ch2/Ch3 rooms
2. Edit `content/quests.ts` — add quests with IDs matching the room IDs in Ch2/Ch3
3. Edit `content/clues.ts` — fill in clue descriptions
4. Edit `content/bosses.ts` — add boss phases for `fake-bottle-opener` and `last-cold-beer`

No database changes needed — content is fully hardcoded.

## Game Content (Chapter 1)

**Rooms:** Kitchen → Fridge → Coffee Table → Terrace → Shed

**Boss:** The Locked Cooler (100 HP, 4 phases)

**Clues:** 8 clues, including 5 key clues required for the boss combination

**Offer costs:**
- Hints: 1–3 Offer
- Room unlocks: 1–2 Offer
- Boss boosts: 3–6 Offer
- Special quest actions: 1–2 Offer
