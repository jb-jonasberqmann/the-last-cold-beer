// Database types — mirror the Supabase schema rows exactly
// Used with the Supabase JS client

import type { TeamId } from "./content";

export type GameStatus = "lobby" | "active" | "complete";
export type TeamStatus = "exploring" | "solving" | "at_boss" | "waiting" | "chapter_complete";
export type RoomStatus = "locked" | "unlocked" | "active" | "complete" | "occupied";
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
  started_at: string | null; // set once by startGame() — origin for the live elapsed-time timer
  created_at: string;
  updated_at: string;
}

export type PlayerStatus = "normal" | "scared_silent" | "sun_blind";

export interface DbPlayer {
  id: string;
  game_id: string;
  name: string;
  team_id: TeamId | null;
  is_host: boolean;
  is_culprit: boolean;
  player_status: PlayerStatus;
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
  occupant_player_id: string | null; // for single-occupancy rooms
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
  read_at?: string | null; // team-wide: set when ANY player opens the clue in the Case File
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
  | "room_occupied"           // single-occupancy bedroom claimed
  | "clue_found"
  | "quest_completed"
  | "boss_damaged"
  | "boss_counter_attacked"
  | "boss_phase_changed"
  | "boss_defeated"
  | "chapter_complete"
  | "act_advanced"            // act transition (1→2 via key box, 2→3 via radio defeat)
  | "offer_paid"
  | "game_started"
  | "chapter_advanced"
  | "scared_silent_set"       // bunk room complete — player can't type in living room
  | "scared_silent_cleared"   // living room complete — player speaks again
  | "culprit_revealed"        // YOURSELVES boss defeated — culprit shown
  | "role_assigned"
  | "physical_challenge_started";

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
