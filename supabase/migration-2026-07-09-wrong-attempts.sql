-- ============================================================
-- MIGRATION: add 'wrong_attempts' to quest_progress.
-- Run ONCE in the Neon SQL editor (console.neon.tech → SQL Editor).
--
-- Why: powers a per-quest gimmick where the first N submitted answers
-- are always marked wrong regardless of value, and only later attempts
-- are checked for real (used by the Sunroom "count the plants" riddle —
-- any number 1-9 is accepted, but only from the 3rd try onward). Also
-- generally useful groundwork for a future "contact the GM" feature that
-- gates on hints_used + a wrong attempt.
-- ============================================================

ALTER TABLE quest_progress ADD COLUMN IF NOT EXISTS wrong_attempts INTEGER NOT NULL DEFAULT 0;
