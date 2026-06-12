// Game logic helpers — pure functions, no DB calls

import type { TeamId } from "@/types/content";
import type { DbRoomProgress, DbQuestProgress, RoomStatus } from "@/types/database";
import { getRoom, getRequiredQuestsByRoom, getChapter } from "@/content/index";

// ==========================================
// ROOM UNLOCK LOGIC
// ==========================================

/**
 * Returns true if a room can be unlocked given the current room_progress state.
 * A room can be unlocked when:
 * - All prerequisite rooms are completed
 * - The room hasn't been unlocked already
 */
export function canUnlockRoom(
  roomId: string,
  roomProgress: DbRoomProgress[]
): boolean {
  const room = getRoom(roomId);
  if (!room) return false;

  // Already unlocked
  const existing = roomProgress.find((rp) => rp.room_id === roomId);
  if (existing && existing.status !== "locked") return false;

  // Check prerequisites
  const completedRooms = new Set(
    roomProgress
      .filter((rp) => rp.status === "complete")
      .map((rp) => rp.room_id)
  );

  return room.unlockRequires.every((req) => completedRooms.has(req));
}

/**
 * Returns true if a room is complete (all required quests done).
 */
export function isRoomComplete(
  roomId: string,
  questProgress: DbQuestProgress[],
  teamId?: TeamId
): boolean {
  // Must pass teamId when quests are team-specific; otherwise cross-team quests
  // prevent rooms from ever completing.
  const required = getRequiredQuestsByRoom(roomId, teamId);
  if (required.length === 0) return false;

  const completedQuestIds = new Set(
    questProgress
      .filter((qp) => qp.status === "completed")
      .map((qp) => qp.quest_id)
  );

  return required.every((q) => completedQuestIds.has(q.id));
}

// ==========================================
// ANSWER CHECKING
// ==========================================

/**
 * Normalizes an answer string for comparison.
 * Lowercases, strips extra whitespace, optionally removes punctuation.
 */
export function normalizeAnswer(answer: string, stripPunctuation = false): string {
  let normalized = answer.toLowerCase().trim().replace(/\s+/g, " ");
  if (stripPunctuation) {
    normalized = normalized.replace(/[^a-z0-9 ]/g, "");
  }
  return normalized;
}

/**
 * Checks if a submitted answer matches any of the accepted answers.
 */
export function checkAnswer(
  submitted: string,
  correct: string | string[],
  normalized = false
): boolean {
  const normalize = (s: string) =>
    normalized ? normalizeAnswer(s, true) : normalizeAnswer(s);

  const submittedNorm = normalize(submitted);
  const correctArr = Array.isArray(correct) ? correct : [correct];

  return correctArr.some((c) => normalize(c) === submittedNorm);
}

// ==========================================
// ROOM CODE GENERATION
// ==========================================

/**
 * Generates a random 6-character room code (uppercase letters and numbers).
 * Avoids ambiguous characters (0/O, 1/I/L).
 */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ==========================================
// TEAM ASSIGNMENT
// ==========================================

/**
 * Returns the team a new player should be assigned to for auto-balance.
 * Assigns to the team with fewer players.
 */
export function getAutoAssignTeam(
  teamACount: number,
  teamBCount: number
): TeamId {
  return teamACount <= teamBCount ? "team-a" : "team-b";
}

// ==========================================
// ROOM STATUS DISPLAY
// ==========================================

export function getRoomStatusLabel(status: RoomStatus): string {
  switch (status) {
    case "locked":
      return "Locked";
    case "unlocked":
      return "Available";
    case "active":
      return "In Progress";
    case "complete":
      return "Complete";
  }
}

export function getRoomStatusColor(status: RoomStatus): string {
  switch (status) {
    case "locked":
      return "text-gray-500";
    case "unlocked":
      return "text-amber-400";
    case "active":
      return "text-blue-400";
    case "complete":
      return "text-green-400";
  }
}

// ==========================================
// BOSS PHASE LOGIC
// ==========================================

/**
 * Returns the current boss phase index (0-based) based on current HP percentage.
 */
export function getBossPhaseIndex(currentHp: number, maxHp: number, phases: { hpThreshold: number }[]): number {
  const hpPercent = (currentHp / maxHp) * 100;
  // Phases are ordered from highest HP threshold to lowest
  // Find the last phase whose threshold >= current HP%
  let phaseIndex = phases.length - 1;
  for (let i = 0; i < phases.length; i++) {
    if (hpPercent <= phases[i].hpThreshold) {
      phaseIndex = i;
      break;
    }
  }
  return phaseIndex;
}

// ==========================================
// CHAPTER PROGRESS
// ==========================================

/**
 * Returns true if a chapter is unlocked for a team (prior chapter boss defeated, or chapter 1).
 */
export function isChapterUnlocked(
  chapterId: string,
  defeatedBossIds: string[]
): boolean {
  const chapter = getChapter(chapterId);
  if (!chapter) return false;
  if (chapter.order === 1) return true;

  // Need prior chapter's boss defeated
  const priorChapterOrder = chapter.order - 1;
  // Find the prior chapter's boss ID
  // This is a simplified check — in real usage we'd look up via chapter list
  // For now we just check if any boss from a prior chapter was defeated
  // This works for MVP where chapters unlock sequentially
  return defeatedBossIds.length >= priorChapterOrder;
}
