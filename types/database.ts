// Database types — mirror the Supabase schema rows exactly
// Used with the Supabase JS client

import type { TeamId } from "./content";

export type GameStatus = "lobby" | "active" | "complete";
export type TeamStatus = "exploring" | "solving" | "at_boss" | "waiting" | "chapter_complete";
export type RoomStatus = "locked" | "unlocked" | "active" | "complete";
export type QuestStatus = "active" | "completed" | "failed" | "skipped";
export type BossStatus = "locked" | "active" | "defeated";

export interface DbGame {
  id: string;
  code: string;
  host_player_id: string | null;
  offer_definition: string;
  status: GameStatus;
  current_chapter_id: string;
  team_a_name: string;
  team_b_name: string;
  chapter_1_winner: TeamId | null;
  chapter_2_winner: TeamId | null;
  created_at: string;
  updated_at: string;
}

export interface DbPlayer {
  id: string;
  game_id: string;
  name: string;
  team_id: TeamId | null;
  is_host: boolean;
  created_at: string;
}

export interface DbTeamProgress {
  id: string;
  game_id: string;
  team_id: TeamId;
  current_chapter_id: string;
  current_room_id: string | null;
  status: TeamStatus;
  rooms_completed: number;
  clues_found: number;
  offer_spent: number;
  created_at: string;
  updated_at: string;
}

export interface DbRoomProgress {
  id: string;
  game_id: string;
  team_id: TeamId;
  room_id: string;
  status: RoomStatus;
  unlocked_at: string | null;
  completed_at: string | null;
}

export interface DbQuestProgress {
  id: string;
  game_id: string;
  team_id: TeamId;
  quest_id: string;
  room_id: string;
  status: QuestStatus;
  answer_submitted: string | null;
  hints_used: number;
  offer_spent: number;
  completed_at: string | null;
}

export interface DbTeamClue {
  id: string;
  game_id: string;
  team_id: TeamId;
  clue_id: string;
  discovered_at: string;
}

export interface DbTeamOfferLog {
  id: string;
  game_id: string;
  team_id: TeamId;
  amount: number;
  reason: string;
  context_id: string | null;
  created_at: string;
}

export interface DbBossProgress {
  id: string;
  game_id: string;
  team_id: TeamId;
  boss_id: string;
  current_hp: number;
  max_hp: number;
  current_phase: number;
  damage_dealt: number;
  offer_spent: number;
  status: BossStatus;
  defeated_at: string | null;
  created_at: string;
  updated_at: string;
}

export type GameEventType =
  | "room_unlocked"
  | "room_completed"
  | "clue_found"
  | "quest_completed"
  | "boss_damaged"
  | "boss_phase_changed"
  | "boss_defeated"
  | "chapter_complete"
  | "offer_paid"
  | "game_started"
  | "chapter_advanced"
  | "role_assigned"; // strawman / special roles

export interface DbGameEvent {
  id: string;
  game_id: string;
  team_id: TeamId | null;
  event_type: GameEventType;
  event_data: Record<string, unknown> | null;
  created_at: string;
}

// Supabase Database type for typed client
export interface Database {
  public: {
    Tables: {
      games: { Row: DbGame; Insert: Partial<DbGame>; Update: Partial<DbGame> };
      players: { Row: DbPlayer; Insert: Partial<DbPlayer>; Update: Partial<DbPlayer> };
      team_progress: { Row: DbTeamProgress; Insert: Partial<DbTeamProgress>; Update: Partial<DbTeamProgress> };
      room_progress: { Row: DbRoomProgress; Insert: Partial<DbRoomProgress>; Update: Partial<DbRoomProgress> };
      quest_progress: { Row: DbQuestProgress; Insert: Partial<DbQuestProgress>; Update: Partial<DbQuestProgress> };
      team_clues: { Row: DbTeamClue; Insert: Partial<DbTeamClue>; Update: Partial<DbTeamClue> };
      team_offer_log: { Row: DbTeamOfferLog; Insert: Partial<DbTeamOfferLog>; Update: Partial<DbTeamOfferLog> };
      boss_progress: { Row: DbBossProgress; Insert: Partial<DbBossProgress>; Update: Partial<DbBossProgress> };
      game_events: { Row: DbGameEvent; Insert: Partial<DbGameEvent>; Update: Partial<DbGameEvent> };
    };
  };
}
