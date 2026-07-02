-- The Last Cold Beer — Supabase Schema
-- Run this in your Supabase SQL editor to set up the database.

-- ==========================================
-- GAMES
-- ==========================================
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_player_id UUID,
  offer_definition TEXT NOT NULL DEFAULT 'half a drink or 5 sips',
  status TEXT NOT NULL DEFAULT 'lobby'
    CHECK (status IN ('lobby', 'active', 'complete')),
  current_chapter_id TEXT NOT NULL DEFAULT 'act-1',
  team_a_name TEXT NOT NULL DEFAULT 'Team A',
  team_b_name TEXT NOT NULL DEFAULT 'Team B',
  chapter_1_winner TEXT, -- 'team-a' | 'team-b' | null
  chapter_2_winner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- PLAYERS
-- ==========================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  team_id TEXT CHECK (team_id IN ('team-a', 'team-b')),
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_culprit BOOLEAN NOT NULL DEFAULT false,       -- one player per game, randomly assigned at game creation
  player_status TEXT NOT NULL DEFAULT 'normal'
    CHECK (player_status IN ('normal', 'scared_silent')), -- set on bunk room completion, cleared on living room
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- TEAM PROGRESS
-- High-level summary per team per game
-- ==========================================
CREATE TABLE IF NOT EXISTS team_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL CHECK (team_id IN ('team-a', 'team-b')),
  current_chapter_id TEXT NOT NULL DEFAULT 'act-1',
  current_room_id TEXT,
  status TEXT NOT NULL DEFAULT 'exploring'
    CHECK (status IN ('exploring', 'solving', 'at_boss', 'waiting', 'chapter_complete')),
  rooms_completed INTEGER NOT NULL DEFAULT 0,
  clues_found INTEGER NOT NULL DEFAULT 0,
  offer_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(game_id, team_id)
);

-- ==========================================
-- ROOM PROGRESS
-- Per-room state for each team
-- ==========================================
CREATE TABLE IF NOT EXISTS room_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL CHECK (team_id IN ('team-a', 'team-b')),
  room_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked', 'unlocked', 'active', 'complete', 'occupied')),
    -- 'occupied' = single-occupancy bedroom claimed by a teammate; others cannot enter
  occupant_player_id TEXT,  -- set when a player claims a single-occupancy room
  unlocked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(game_id, team_id, room_id)
);

-- ==========================================
-- QUEST PROGRESS
-- Individual quest completion state
-- ==========================================
CREATE TABLE IF NOT EXISTS quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL CHECK (team_id IN ('team-a', 'team-b')),
  quest_id TEXT NOT NULL,
  room_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'failed', 'skipped')),
  answer_submitted TEXT,
  hints_used INTEGER NOT NULL DEFAULT 0,
  offer_spent INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(game_id, team_id, quest_id)
);

-- ==========================================
-- TEAM CLUES
-- Which clues each team has discovered
-- ==========================================
CREATE TABLE IF NOT EXISTS team_clues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL CHECK (team_id IN ('team-a', 'team-b')),
  clue_id TEXT NOT NULL,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ, -- team-wide: set when ANY player opens the clue in the Case File
  UNIQUE(game_id, team_id, clue_id)
);

-- ==========================================
-- TEAM OFFER LOG
-- Ledger of all Offer payments
-- ==========================================
CREATE TABLE IF NOT EXISTS team_offer_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL CHECK (team_id IN ('team-a', 'team-b')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  context_id TEXT, -- quest_id, room_id, or boss_id
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- BOSS PROGRESS
-- HP and phase tracking per boss per team
-- ==========================================
CREATE TABLE IF NOT EXISTS boss_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL CHECK (team_id IN ('team-a', 'team-b')),
  boss_id TEXT NOT NULL,
  current_hp INTEGER NOT NULL,
  max_hp INTEGER NOT NULL,
  current_phase INTEGER NOT NULL DEFAULT 1,
  damage_dealt INTEGER NOT NULL DEFAULT 0,
  offer_spent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('locked', 'active', 'defeated')),
  defeated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(game_id, team_id, boss_id)
);

-- ==========================================
-- GAME EVENTS
-- Append-only event log for the activity feed
-- ==========================================
CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id TEXT CHECK (team_id IN ('team-a', 'team-b')),
  event_type TEXT NOT NULL,
    -- room_unlocked | room_completed | clue_found | quest_completed
    -- boss_damaged | boss_phase_changed | boss_defeated
    -- chapter_complete | offer_paid | game_started | chapter_advanced
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_team_progress_game_id ON team_progress(game_id);
CREATE INDEX IF NOT EXISTS idx_room_progress_game_team ON room_progress(game_id, team_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_game_team ON quest_progress(game_id, team_id);
CREATE INDEX IF NOT EXISTS idx_team_clues_game_team ON team_clues(game_id, team_id);
CREATE INDEX IF NOT EXISTS idx_boss_progress_game_team ON boss_progress(game_id, team_id);
CREATE INDEX IF NOT EXISTS idx_game_events_game_id ON game_events(game_id);
CREATE INDEX IF NOT EXISTS idx_game_events_created ON game_events(game_id, created_at DESC);

-- ==========================================
-- NOTE: Supabase-specific REALTIME and RLS sections removed.
-- This schema targets Neon (standard Postgres).
-- Access control is handled at the application layer.
-- ==========================================

-- ==========================================
-- UPDATED_AT TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_games
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_team_progress
  BEFORE UPDATE ON team_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_boss_progress
  BEFORE UPDATE ON boss_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- TEAM PHOTOS (the Ritual Record)
-- One row per team. The "witness" (photographer) is secretly the team's culprit.
-- Photo stored as a downscaled base64 JPEG data-URL (~150-300 KB).
-- ==========================================
CREATE TABLE IF NOT EXISTS team_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL CHECK (team_id IN ('team-a', 'team-b')),
  witness_player_id TEXT,
  photo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(game_id, team_id)
);
