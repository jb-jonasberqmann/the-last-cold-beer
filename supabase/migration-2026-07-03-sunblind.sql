-- ============================================================
-- MIGRATION: add 'sun_blind' as a valid player_status value.
-- Run ONCE in the Neon SQL editor (console.neon.tech → SQL Editor).
--
-- Why: the Sunroom now has a dare that marks a player "sun_blind"
-- for the rest of Act 2 (mirrors how scared_silent already works
-- for the Bunk Room). The players table has a CHECK constraint
-- that only allowed ('normal', 'scared_silent') — without this
-- migration, setting sun_blind will fail (non-fatally — the app
-- swallows the error — but the status effect just won't apply).
-- ============================================================

ALTER TABLE players DROP CONSTRAINT IF EXISTS players_player_status_check;
ALTER TABLE players ADD CONSTRAINT players_player_status_check
  CHECK (player_status IN ('normal', 'scared_silent', 'sun_blind'));
