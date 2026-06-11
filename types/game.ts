// Game state types — runtime state combining DB rows with content lookups

import type { TeamId } from "./content";
import type {
  DbGame,
  DbPlayer,
  DbTeamProgress,
  DbRoomProgress,
  DbBossProgress,
  DbTeamClue,
  DbQuestProgress,
} from "./database";

// ==========================================
// PLAYER SESSION
// Stored in localStorage
// ==========================================
export interface PlayerSession {
  playerId: string;
  gameId: string;
  gameCode: string;
  teamId: TeamId | null;
  playerName: string;
  isHost: boolean;
}

// ==========================================
// FULL GAME STATE
// Assembled from DB + content lookups
// ==========================================
export interface GameState {
  game: DbGame;
  players: DbPlayer[];
  teamProgress: {
    "team-a": DbTeamProgress | null;
    "team-b": DbTeamProgress | null;
  };
  roomProgress: {
    "team-a": DbRoomProgress[];
    "team-b": DbRoomProgress[];
  };
  bossProgress: {
    "team-a": DbBossProgress | null;
    "team-b": DbBossProgress | null;
  };
  teamClues: {
    "team-a": DbTeamClue[];
    "team-b": DbTeamClue[];
  };
}

// ==========================================
// TEAM VIEW
// What a team sees about themselves and the other team
// ==========================================
export interface TeamView {
  myTeam: TeamSummary;
  otherTeam: TeamSummary;
  mySession: PlayerSession;
}

export interface TeamSummary {
  teamId: TeamId;
  name: string;
  progress: DbTeamProgress | null;
  roomProgress: DbRoomProgress[];
  bossProgress: DbBossProgress | null;
  clueCount: number; // number of clues found (not contents)
  players: DbPlayer[];
}

// ==========================================
// ROOM VIEW STATE
// Enriched room info for the room page
// ==========================================
export interface RoomViewState {
  roomId: string;
  isUnlocked: boolean;
  isComplete: boolean;
  quests: QuestViewState[];
  discoveredClueIds: string[];
}

export interface QuestViewState {
  questId: string;
  status: DbQuestProgress["status"];
  hintsUsed: number;
  offerSpent: number;
  answerSubmitted: string | null;
}

// ==========================================
// ACTION RESULTS
// Returned from server actions
// ==========================================
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CreateGameResult {
  gameId: string;
  gameCode: string;
  hostPlayerId: string;
}

export interface JoinGameResult {
  gameId: string;
  playerId: string;
  teamId: TeamId | null;
}
