// Game queries — read-only DB fetches using Neon SQL

import { sql } from "@/lib/db";
import type {
  DbGame,
  DbPlayer,
  DbTeamProgress,
  DbRoomProgress,
  DbQuestProgress,
  DbTeamClue,
  DbBossProgress,
  DbGameEvent,
} from "@/types/database";
import type { TeamId } from "@/types/content";

// ==========================================
// GAME
// ==========================================

export async function getGameById(gameId: string): Promise<DbGame | null> {
  const rows = await sql`SELECT * FROM games WHERE id = ${gameId} LIMIT 1`;
  return (rows[0] as DbGame) ?? null;
}

export async function getGameByCode(code: string): Promise<DbGame | null> {
  const rows = await sql`SELECT * FROM games WHERE code = ${code.toUpperCase()} LIMIT 1`;
  return (rows[0] as DbGame) ?? null;
}

// ==========================================
// PLAYERS
// ==========================================

export async function getPlayersForGame(gameId: string): Promise<DbPlayer[]> {
  const rows = await sql`SELECT * FROM players WHERE game_id = ${gameId} ORDER BY created_at ASC`;
  return rows as DbPlayer[];
}

export async function getPlayer(playerId: string): Promise<DbPlayer | null> {
  const rows = await sql`SELECT * FROM players WHERE id = ${playerId} LIMIT 1`;
  return (rows[0] as DbPlayer) ?? null;
}

// ==========================================
// TEAM PROGRESS
// ==========================================

export async function getTeamProgress(gameId: string, teamId: TeamId): Promise<DbTeamProgress | null> {
  const rows = await sql`
    SELECT * FROM team_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId}
    LIMIT 1
  `;
  return (rows[0] as DbTeamProgress) ?? null;
}

export async function getAllTeamProgress(gameId: string): Promise<DbTeamProgress[]> {
  const rows = await sql`SELECT * FROM team_progress WHERE game_id = ${gameId}`;
  return rows as DbTeamProgress[];
}

// ==========================================
// ROOM PROGRESS
// ==========================================

export async function getRoomProgressForTeam(gameId: string, teamId: TeamId): Promise<DbRoomProgress[]> {
  const rows = await sql`
    SELECT * FROM room_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId}
  `;
  return rows as DbRoomProgress[];
}

export async function getRoomProgressEntry(
  gameId: string,
  teamId: TeamId,
  roomId: string
): Promise<DbRoomProgress | null> {
  const rows = await sql`
    SELECT * FROM room_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND room_id = ${roomId}
    LIMIT 1
  `;
  return (rows[0] as DbRoomProgress) ?? null;
}

// ==========================================
// QUEST PROGRESS
// ==========================================

export async function getQuestProgressForTeam(
  gameId: string,
  teamId: TeamId,
  roomId?: string
): Promise<DbQuestProgress[]> {
  if (roomId) {
    const rows = await sql`
      SELECT * FROM quest_progress
      WHERE game_id = ${gameId} AND team_id = ${teamId} AND room_id = ${roomId}
    `;
    return rows as DbQuestProgress[];
  }
  const rows = await sql`
    SELECT * FROM quest_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId}
  `;
  return rows as DbQuestProgress[];
}

// ==========================================
// CLUES
// ==========================================

export async function getTeamClues(gameId: string, teamId: TeamId): Promise<DbTeamClue[]> {
  const rows = await sql`
    SELECT * FROM team_clues
    WHERE game_id = ${gameId} AND team_id = ${teamId}
    ORDER BY discovered_at ASC
  `;
  return rows as DbTeamClue[];
}

// ==========================================
// BOSS PROGRESS
// ==========================================

export async function getBossProgress(
  gameId: string,
  teamId: TeamId,
  bossId: string
): Promise<DbBossProgress | null> {
  const rows = await sql`
    SELECT * FROM boss_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND boss_id = ${bossId}
    LIMIT 1
  `;
  return (rows[0] as DbBossProgress) ?? null;
}

export async function getAllBossProgress(gameId: string): Promise<DbBossProgress[]> {
  const rows = await sql`SELECT * FROM boss_progress WHERE game_id = ${gameId}`;
  return rows as DbBossProgress[];
}

// ==========================================
// EVENTS
// ==========================================

export async function getRecentGameEvents(gameId: string, limit = 20): Promise<DbGameEvent[]> {
  const rows = await sql`
    SELECT * FROM game_events
    WHERE game_id = ${gameId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return (rows as DbGameEvent[]).reverse();
}

/** Returns action IDs for all boss_damaged events for a given team, used to mark puzzles as already solved. */
export async function getUsedBossActionIds(gameId: string, teamId: string): Promise<string[]> {
  const rows = await sql`
    SELECT event_data->>'action_id' AS action_id
    FROM game_events
    WHERE game_id = ${gameId}
      AND team_id = ${teamId}
      AND event_type = 'boss_damaged'
  `;
  return rows.map((r) => (r as { action_id: string }).action_id).filter(Boolean);
}
