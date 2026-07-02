-- ============================================================
-- MIGRATION: sync live DB with current schema.sql
-- Run ONCE in the Neon SQL editor (console.neon.tech → SQL Editor).
--
-- Why: the live DB was created from the original schema.
-- "CREATE TABLE IF NOT EXISTS" never adds new columns to existing
-- tables, so columns added later (player_status, is_culprit,
-- occupant_player_id) are missing. That makes the living-room
-- quest crash AFTER completing the quest but BEFORE marking the
-- room complete — so kitchen/sunroom never unlock in Act 2.
-- ============================================================

-- players: culprit flag + scared-silent status
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_culprit BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS player_status TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_player_status_check;
ALTER TABLE players ADD CONSTRAINT players_player_status_check
  CHECK (player_status IN ('normal', 'scared_silent'));

-- room_progress: single-occupancy bedrooms ('occupied' status + occupant)
ALTER TABLE room_progress ADD COLUMN IF NOT EXISTS occupant_player_id TEXT;
ALTER TABLE room_progress DROP CONSTRAINT IF EXISTS room_progress_status_check;
ALTER TABLE room_progress ADD CONSTRAINT room_progress_status_check
  CHECK (status IN ('locked', 'unlocked', 'active', 'complete', 'occupied'));

-- defaults renamed chapter-1 → act-1 (harmless if already correct)
ALTER TABLE games ALTER COLUMN current_chapter_id SET DEFAULT 'act-1';
ALTER TABLE team_progress ALTER COLUMN current_chapter_id SET DEFAULT 'act-1';

-- ============================================================
-- REPAIR: retroactively complete any room whose required quests
-- were already solved but where the room got stuck (e.g. the
-- living room in your current game). Safe to re-run.
-- ============================================================
UPDATE room_progress rp
SET status = 'complete', completed_at = now()
FROM quest_progress qp
WHERE qp.game_id = rp.game_id
  AND qp.team_id = rp.team_id
  AND qp.quest_id = 'living-room-sentence'
  AND qp.status = 'completed'
  AND rp.room_id = 'living-room'
  AND rp.status <> 'complete';
