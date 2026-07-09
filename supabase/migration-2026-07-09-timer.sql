-- ============================================================
-- MIGRATION: add 'started_at' to games.
-- Run ONCE in the Neon SQL editor (console.neon.tech → SQL Editor).
--
-- Why: adds a persistent game-start timestamp so a live elapsed-time
-- timer (HH:MM:SS) can be shown in the top UI once the GM starts the
-- game. Set once by startGame() and never touched again — the timer
-- itself just ticks client-side from this fixed origin.
-- ============================================================

ALTER TABLE games ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
