"use server";

// Server Actions — all mutations go through here.
// Uses Neon SQL tagged template literals.

import { sql } from "@/lib/db";
import { generateRoomCode, checkAnswer, isRoomComplete } from "@/lib/game/helpers";
import { getRoom, getQuest, getBoss, getChapter } from "@/content/index";
import type { TeamId } from "@/types/content";
import type { ActionResult, CreateGameResult, JoinGameResult } from "@/types/game";
import type { DbTeamProgress, DbBossProgress, DbQuestProgress } from "@/types/database";

// ==========================================
// CREATE GAME
// ==========================================

export async function createGame(
  hostName: string,
  offerDefinition: string,
  teamAName = "Team A",
  teamBName = "Team B"
): Promise<ActionResult<CreateGameResult>> {
  // Generate a unique room code
  let code = generateRoomCode();
  for (let i = 0; i < 10; i++) {
    const existing = await sql`SELECT id FROM games WHERE code = ${code} LIMIT 1`;
    if (existing.length === 0) break;
    code = generateRoomCode();
  }

  const gameRows = await sql`
    INSERT INTO games (code, offer_definition, team_a_name, team_b_name, status, current_chapter_id)
    VALUES (${code}, ${offerDefinition}, ${teamAName}, ${teamBName}, 'lobby', 'chapter-1')
    RETURNING *
  `;
  const game = gameRows[0];
  if (!game) return { success: false, error: "Failed to create game." };

  const playerRows = await sql`
    INSERT INTO players (game_id, name, team_id, is_host)
    VALUES (${game.id}, ${hostName}, NULL, TRUE)
    RETURNING *
  `;
  const player = playerRows[0];
  if (!player) return { success: false, error: "Failed to create host player." };

  await sql`UPDATE games SET host_player_id = ${player.id} WHERE id = ${game.id}`;

  await sql`
    INSERT INTO team_progress (game_id, team_id, current_chapter_id, status)
    VALUES
      (${game.id}, 'team-a', 'chapter-1', 'exploring'),
      (${game.id}, 'team-b', 'chapter-1', 'exploring')
  `;

  return {
    success: true,
    data: { gameId: game.id, gameCode: game.code, hostPlayerId: player.id },
  };
}

// ==========================================
// JOIN GAME
// ==========================================

export async function joinGame(
  code: string,
  playerName: string
): Promise<ActionResult<JoinGameResult>> {
  const gameRows = await sql`SELECT * FROM games WHERE code = ${code.toUpperCase()} LIMIT 1`;
  const game = gameRows[0];
  if (!game) return { success: false, error: "Game not found. Check the room code." };
  if (game.status === "complete") return { success: false, error: "This game is already complete." };

  // Atomic team assignment: the CASE subqueries run inside the INSERT statement,
  // giving a much narrower race window than a separate SELECT + INSERT. Two players
  // joining within the same millisecond can still race, but normal manual joins are safe.
  const playerRows = await sql`
    INSERT INTO players (game_id, name, team_id, is_host)
    SELECT
      ${game.id},
      ${playerName},
      CASE
        WHEN (SELECT COUNT(*) FROM players p2 WHERE p2.game_id = ${game.id} AND p2.team_id = 'team-a')
          <= (SELECT COUNT(*) FROM players p3 WHERE p3.game_id = ${game.id} AND p3.team_id = 'team-b')
        THEN 'team-a'
        ELSE 'team-b'
      END,
      FALSE
    RETURNING *
  `;
  const player = playerRows[0];
  if (!player) return { success: false, error: "Failed to join game." };

  return {
    success: true,
    data: { gameId: game.id, playerId: player.id, teamId: player.team_id as TeamId },
  };
}

// ==========================================
// START GAME
// ==========================================

export async function startGame(gameId: string): Promise<ActionResult> {
  const gameRows = await sql`SELECT * FROM games WHERE id = ${gameId} LIMIT 1`;
  const game = gameRows[0];
  if (!game) return { success: false, error: "Game not found." };
  if (game.status !== "lobby") return { success: false, error: "Game already started." };

  const chapter = getChapter("chapter-1");
  if (!chapter) return { success: false, error: "Chapter 1 not found." };

  const now = new Date().toISOString();

  // Unlock starting rooms for both teams
  for (const teamId of ["team-a", "team-b"] as TeamId[]) {
    for (const roomId of chapter.startingRoomIds) {
      await sql`
        INSERT INTO room_progress (game_id, team_id, room_id, status, unlocked_at)
        VALUES (${gameId}, ${teamId}, ${roomId}, 'unlocked', ${now})
        ON CONFLICT (game_id, team_id, room_id) DO NOTHING
      `;
    }
  }

  await sql`UPDATE games SET status = 'active', updated_at = ${now} WHERE id = ${gameId}`;

  await sql`
    INSERT INTO game_events (game_id, event_type, event_data)
    VALUES (${gameId}, 'game_started', ${JSON.stringify({ chapter_id: "chapter-1" })}::jsonb)
  `;

  return { success: true, data: undefined };
}

// ==========================================
// UNLOCK ROOM
// ==========================================

export async function unlockRoom(
  gameId: string,
  teamId: TeamId,
  roomId: string
): Promise<ActionResult<{ offerCost: number }>> {
  const room = getRoom(roomId);
  if (!room) return { success: false, error: "Room not found." };

  // Check current status
  const existing = await sql`
    SELECT status FROM room_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND room_id = ${roomId}
    LIMIT 1
  `;
  if (existing[0] && existing[0].status !== "locked") {
    return { success: false, error: "Room already unlocked." };
  }

  // Check prerequisites
  if (room.unlockRequires.length > 0) {
    const prereqs = await sql`
      SELECT room_id, status FROM room_progress
      WHERE game_id = ${gameId} AND team_id = ${teamId}
        AND room_id = ANY(${room.unlockRequires}::text[])
    `;
    const completedSet = new Set(
      (prereqs as { room_id: string; status: string }[]).filter((r) => r.status === "complete").map((r) => r.room_id)
    );
    const missing = room.unlockRequires.filter((r) => !completedSet.has(r));
    if (missing.length > 0) {
      return { success: false, error: `Complete these rooms first: ${missing.join(", ")}.` };
    }
  }

  if (room.unlockCost > 0) {
    await _logOffer(gameId, teamId, room.unlockCost, `Unlocked room: ${room.title}`, roomId);
  }

  const now = new Date().toISOString();
  await sql`
    INSERT INTO room_progress (game_id, team_id, room_id, status, unlocked_at)
    VALUES (${gameId}, ${teamId}, ${roomId}, 'unlocked', ${now})
    ON CONFLICT (game_id, team_id, room_id)
    DO UPDATE SET status = 'unlocked', unlocked_at = ${now}
  `;

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'room_unlocked',
            ${JSON.stringify({ room_id: roomId, offer_cost: room.unlockCost })}::jsonb)
  `;

  return { success: true, data: { offerCost: room.unlockCost } };
}

// ==========================================
// SUBMIT QUEST ANSWER
// ==========================================

export async function submitQuestAnswer(
  gameId: string,
  teamId: TeamId,
  questId: string,
  answer: string
): Promise<ActionResult<{ correct: boolean; rewardText?: string; failureText?: string; clueId?: string }>> {
  const quest = getQuest(questId);
  if (!quest) return { success: false, error: "Quest not found." };
  if (!quest.answer) return { success: false, error: "This quest has no answer to check." };

  const isCorrect = checkAnswer(answer, quest.answer.correct, quest.answer.normalized);

  if (!isCorrect) {
    await sql`
      INSERT INTO quest_progress (game_id, team_id, quest_id, room_id, status, answer_submitted)
      VALUES (${gameId}, ${teamId}, ${questId}, ${quest.roomId}, 'active', ${answer})
      ON CONFLICT (game_id, team_id, quest_id)
      DO UPDATE SET answer_submitted = ${answer}
    `;
    return { success: true, data: { correct: false, failureText: quest.failureText } };
  }

  const now = new Date().toISOString();
  await sql`
    INSERT INTO quest_progress (game_id, team_id, quest_id, room_id, status, answer_submitted, completed_at)
    VALUES (${gameId}, ${teamId}, ${questId}, ${quest.roomId}, 'completed', ${answer}, ${now})
    ON CONFLICT (game_id, team_id, quest_id)
    DO UPDATE SET status = 'completed', answer_submitted = ${answer}, completed_at = ${now}
  `;

  if (quest.rewardClueId) await _awardClue(gameId, teamId, quest.rewardClueId);

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'quest_completed',
            ${JSON.stringify({ quest_id: questId, room_id: quest.roomId })}::jsonb)
  `;

  await _checkAndCompleteRoom(gameId, teamId, quest.roomId);

  return {
    success: true,
    data: { correct: true, rewardText: quest.rewardText, clueId: quest.rewardClueId },
  };
}

// ==========================================
// COMPLETE QUEST (choice / social / unlock)
// ==========================================

export async function completeQuest(
  gameId: string,
  teamId: TeamId,
  questId: string,
  choiceId?: string
): Promise<ActionResult<{ rewardText?: string; clueId?: string; offerCost?: number }>> {
  const quest = getQuest(questId);
  if (!quest) return { success: false, error: "Quest not found." };

  let offerCost = 0;
  let consequence: string | undefined;

  if (quest.type === "choice" && choiceId) {
    const choice = quest.choices?.find((c) => c.id === choiceId);
    if (!choice) return { success: false, error: "Invalid choice." };
    if (choice.offerCost) {
      offerCost = choice.offerCost;
      await _logOffer(gameId, teamId, offerCost, `Choice in quest: ${quest.title}`, questId);
    }
    consequence = choice.consequence;
  }

  if (quest.type === "unlock" && quest.offerCost) {
    offerCost = quest.offerCost;
    await _logOffer(gameId, teamId, offerCost, `Unlocked: ${quest.title}`, questId);
  }

  const now = new Date().toISOString();
  await sql`
    INSERT INTO quest_progress (game_id, team_id, quest_id, room_id, status, offer_spent, completed_at)
    VALUES (${gameId}, ${teamId}, ${questId}, ${quest.roomId}, 'completed', ${offerCost}, ${now})
    ON CONFLICT (game_id, team_id, quest_id)
    DO UPDATE SET status = 'completed', offer_spent = ${offerCost}, completed_at = ${now}
  `;

  if (quest.rewardClueId) await _awardClue(gameId, teamId, quest.rewardClueId);

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'quest_completed',
            ${JSON.stringify({ quest_id: questId, room_id: quest.roomId, choice_id: choiceId })}::jsonb)
  `;

  await _checkAndCompleteRoom(gameId, teamId, quest.roomId);

  return {
    success: true,
    data: { rewardText: consequence ?? quest.rewardText, clueId: quest.rewardClueId, offerCost },
  };
}

// ==========================================
// USE HINT
// ==========================================

export async function useHint(
  gameId: string,
  teamId: TeamId,
  questId: string,
  hintOrder: number
): Promise<ActionResult<{ hintText: string; offerCost: number }>> {
  const quest = getQuest(questId);
  if (!quest) return { success: false, error: "Quest not found." };

  const hint = quest.hints.find((h) => h.order === hintOrder);
  if (!hint) return { success: false, error: "Hint not found." };

  await _logOffer(gameId, teamId, hint.offerCost, `Hint ${hintOrder} for: ${quest.title}`, questId);

  const existingRows = await sql`
    SELECT hints_used, offer_spent FROM quest_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND quest_id = ${questId}
    LIMIT 1
  `;
  const existing = existingRows[0] as Pick<DbQuestProgress, "hints_used" | "offer_spent"> | undefined;

  await sql`
    INSERT INTO quest_progress (game_id, team_id, quest_id, room_id, status, hints_used, offer_spent)
    VALUES (${gameId}, ${teamId}, ${questId}, ${quest.roomId}, 'active',
            ${Math.max(existing?.hints_used ?? 0, hintOrder)},
            ${(existing?.offer_spent ?? 0) + hint.offerCost})
    ON CONFLICT (game_id, team_id, quest_id)
    DO UPDATE SET
      hints_used = GREATEST(quest_progress.hints_used, ${hintOrder}),
      offer_spent = quest_progress.offer_spent + ${hint.offerCost}
  `;

  return { success: true, data: { hintText: hint.text, offerCost: hint.offerCost } };
}

// ==========================================
// BOSS DAMAGE
// ==========================================

export async function dealBossDamage(
  gameId: string,
  teamId: TeamId,
  bossId: string,
  actionId: string,
  answer?: string
): Promise<ActionResult<{ damage: number; newHp: number; defeated: boolean; rewardText?: string; failureText?: string }>> {
  const boss = getBoss(bossId);
  if (!boss) return { success: false, error: "Boss not found." };

  // Get or initialize boss progress
  let bpRows = await sql`
    SELECT * FROM boss_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND boss_id = ${bossId}
    LIMIT 1
  `;

  if (bpRows.length === 0) {
    bpRows = await sql`
      INSERT INTO boss_progress
        (game_id, team_id, boss_id, current_hp, max_hp, current_phase, damage_dealt, offer_spent, status)
      VALUES
        (${gameId}, ${teamId}, ${bossId}, ${boss.maxHp}, ${boss.maxHp}, 1, 0, 0, 'active')
      RETURNING *
    `;
  }

  const bp = bpRows[0] as DbBossProgress;
  if (bp.status === "defeated") return { success: false, error: "Boss is already defeated." };

  // Find the action across all phases
  let foundAction = null;
  for (const phase of boss.phases) {
    foundAction = phase.actions.find((a) => a.id === actionId) ?? null;
    if (foundAction) break;
  }
  if (!foundAction) return { success: false, error: "Boss action not found." };

  // Clue check
  if (foundAction.type === "clue_check" && foundAction.requiredClueId) {
    const clueRows = await sql`
      SELECT id FROM team_clues
      WHERE game_id = ${gameId} AND team_id = ${teamId} AND clue_id = ${foundAction.requiredClueId}
      LIMIT 1
    `;
    if (clueRows.length === 0) {
      return {
        success: true,
        data: { damage: 0, newHp: bp.current_hp, defeated: false, failureText: foundAction.failureText ?? "You don't have the required clue." },
      };
    }
  }

  // Puzzle check
  if (foundAction.type === "puzzle" && foundAction.puzzle && answer) {
    const correct = checkAnswer(answer, foundAction.puzzle.answer, true);
    if (!correct) {
      return {
        success: true,
        data: { damage: 0, newHp: bp.current_hp, defeated: false, failureText: foundAction.failureText ?? "Wrong answer. Try again." },
      };
    }
  }

  // Offer boost
  if (foundAction.type === "offer_boost" && foundAction.offerCost) {
    await _logOffer(gameId, teamId, foundAction.offerCost, `Boss boost: ${foundAction.label}`, bossId);
  }

  const damage = foundAction.damage;
  const newHp = Math.max(0, bp.current_hp - damage);
  const defeated = newHp === 0;
  const hpPercent = (newHp / boss.maxHp) * 100;

  // Determine new phase
  let newPhase = bp.current_phase;
  for (const phase of boss.phases) {
    if (hpPercent <= phase.hpThreshold) {
      newPhase = phase.phase;
      break;
    }
  }

  const now = new Date().toISOString();
  await sql`
    UPDATE boss_progress SET
      current_hp = ${newHp},
      current_phase = ${newPhase},
      damage_dealt = damage_dealt + ${damage},
      offer_spent = offer_spent + ${foundAction.offerCost ?? 0},
      status = ${defeated ? "defeated" : "active"},
      defeated_at = ${defeated ? now : null},
      updated_at = ${now}
    WHERE id = ${bp.id}
  `;

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'boss_damaged',
            ${JSON.stringify({ boss_id: bossId, damage, new_hp: newHp, action_id: actionId })}::jsonb)
  `;

  if (defeated) {
    await sql`
      INSERT INTO game_events (game_id, team_id, event_type, event_data)
      VALUES (${gameId}, ${teamId}, 'boss_defeated', ${JSON.stringify({ boss_id: bossId })}::jsonb)
    `;
    // Record chapter 1 winner if not already set
    const bossContent = getBoss(bossId);
    if (bossContent?.chapterId === "chapter-1") {
      await sql`
        UPDATE games SET chapter_1_winner = ${teamId}
        WHERE id = ${gameId} AND chapter_1_winner IS NULL
      `;
    }
  }

  return {
    success: true,
    data: { damage, newHp, defeated, rewardText: foundAction.rewardText },
  };
}

// ==========================================
// TEAM MANAGEMENT
// ==========================================

// ==========================================
// ROLE ASSIGNMENT (strawman, etc.)
// ==========================================

const ROLES = [
  { id: "strawman", label: "🥤 Strawman", effect: "Must drink double for the next round" },
  { id: "bartender", label: "🍹 Bartender", effect: "Must serve everyone's next drink" },
  { id: "silent-one", label: "🤫 The Silent One", effect: "Cannot speak for 3 minutes — communicate by gestures only" },
  { id: "truth-teller", label: "🪞 Truth Teller", effect: "Must answer the next question from the game with complete honesty, out loud" },
  { id: "challenger", label: "⚔️ The Challenger", effect: "Must challenge someone to a mini-duel of the group's choosing" },
] as const;

export async function assignRandomRole(
  gameId: string,
  playerId: string,
  playerName: string
): Promise<ActionResult<{ role: string; effect: string }>> {
  const role = ROLES[Math.floor(Math.random() * ROLES.length)];

  await sql`
    INSERT INTO game_events (game_id, event_type, event_data)
    VALUES (${gameId}, 'role_assigned',
            ${JSON.stringify({ player_id: playerId, player_name: playerName, role: role.id, label: role.label, effect: role.effect })}::jsonb)
  `;

  return { success: true, data: { role: role.label, effect: role.effect } };
}

export async function assignPlayerToTeam(playerId: string, teamId: TeamId): Promise<ActionResult> {
  await sql`UPDATE players SET team_id = ${teamId} WHERE id = ${playerId}`;
  return { success: true, data: undefined };
}

// Rebalance all non-host players across teams by join order: 0→A, 1→B, 2→A, ...
// Host calls this from the lobby to fix any race-condition imbalances.
export async function rebalanceTeams(gameId: string): Promise<ActionResult> {
  const players = await sql`
    SELECT id FROM players
    WHERE game_id = ${gameId} AND is_host = FALSE
    ORDER BY created_at ASC
  `;
  for (let i = 0; i < players.length; i++) {
    const teamId = i % 2 === 0 ? "team-a" : "team-b";
    await sql`UPDATE players SET team_id = ${teamId} WHERE id = ${players[i].id}`;
  }
  return { success: true, data: undefined };
}

export async function renameTeam(gameId: string, teamId: TeamId, newName: string): Promise<ActionResult> {
  if (teamId === "team-a") {
    await sql`UPDATE games SET team_a_name = ${newName}, updated_at = NOW() WHERE id = ${gameId}`;
  } else {
    await sql`UPDATE games SET team_b_name = ${newName}, updated_at = NOW() WHERE id = ${gameId}`;
  }
  return { success: true, data: undefined };
}

// ==========================================
// HOST ADMIN ACTIONS
// ==========================================

export async function hostForceRoomStatus(
  gameId: string,
  teamId: TeamId,
  roomId: string,
  status: "unlocked" | "complete"
): Promise<ActionResult> {
  const now = new Date().toISOString();
  await sql`
    INSERT INTO room_progress (game_id, team_id, room_id, status, unlocked_at, completed_at)
    VALUES (
      ${gameId}, ${teamId}, ${roomId}, ${status},
      ${now},
      ${status === "complete" ? now : null}
    )
    ON CONFLICT (game_id, team_id, room_id)
    DO UPDATE SET
      status = ${status},
      unlocked_at = COALESCE(room_progress.unlocked_at, ${now}),
      completed_at = ${status === "complete" ? now : null}
  `;
  return { success: true, data: undefined };
}

export async function hostResetBoss(
  gameId: string,
  teamId: TeamId,
  bossId: string,
  maxHp: number
): Promise<ActionResult> {
  const existing = await sql`
    SELECT id FROM boss_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND boss_id = ${bossId}
    LIMIT 1
  `;

  if (existing.length === 0) {
    await sql`
      INSERT INTO boss_progress
        (game_id, team_id, boss_id, current_hp, max_hp, current_phase, damage_dealt, offer_spent, status)
      VALUES
        (${gameId}, ${teamId}, ${bossId}, ${maxHp}, ${maxHp}, 1, 0, 0, 'active')
    `;
  } else {
    await sql`
      UPDATE boss_progress SET
        current_hp = ${maxHp},
        current_phase = 1,
        status = 'active',
        defeated_at = NULL,
        updated_at = NOW()
      WHERE game_id = ${gameId} AND team_id = ${teamId} AND boss_id = ${bossId}
    `;
  }
  return { success: true, data: undefined };
}

// ==========================================
// INTERNAL HELPERS
// ==========================================

async function _logOffer(
  gameId: string,
  teamId: TeamId,
  amount: number,
  reason: string,
  contextId?: string
) {
  await sql`
    INSERT INTO team_offer_log (game_id, team_id, amount, reason, context_id)
    VALUES (${gameId}, ${teamId}, ${amount}, ${reason}, ${contextId ?? null})
  `;

  await sql`
    UPDATE team_progress SET offer_spent = offer_spent + ${amount}, updated_at = NOW()
    WHERE game_id = ${gameId} AND team_id = ${teamId}
  `;

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'offer_paid',
            ${JSON.stringify({ amount, reason })}::jsonb)
  `;
}

async function _awardClue(gameId: string, teamId: TeamId, clueId: string) {
  const existing = await sql`
    SELECT id FROM team_clues
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND clue_id = ${clueId}
    LIMIT 1
  `;
  if (existing.length > 0) return;

  await sql`
    INSERT INTO team_clues (game_id, team_id, clue_id)
    VALUES (${gameId}, ${teamId}, ${clueId})
    ON CONFLICT (game_id, team_id, clue_id) DO NOTHING
  `;

  await sql`
    UPDATE team_progress SET clues_found = clues_found + 1, updated_at = NOW()
    WHERE game_id = ${gameId} AND team_id = ${teamId}
  `;

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'clue_found',
            ${JSON.stringify({ clue_id: clueId })}::jsonb)
  `;
}

async function _checkAndCompleteRoom(gameId: string, teamId: TeamId, roomId: string) {
  const questRows = await sql`
    SELECT quest_id, status FROM quest_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND room_id = ${roomId}
  `;

  const asDbRows = questRows.map((r) => ({
    quest_id: r.quest_id,
    status: r.status,
    // fill required fields with defaults for type compat
    id: "", game_id: gameId, team_id: teamId, room_id: roomId,
    answer_submitted: null, hints_used: 0, offer_spent: 0, completed_at: null,
  }));

  if (!isRoomComplete(roomId, asDbRows)) return;

  const now = new Date().toISOString();
  await sql`
    INSERT INTO room_progress (game_id, team_id, room_id, status, completed_at)
    VALUES (${gameId}, ${teamId}, ${roomId}, 'complete', ${now})
    ON CONFLICT (game_id, team_id, room_id)
    DO UPDATE SET status = 'complete', completed_at = ${now}
  `;

  await sql`
    UPDATE team_progress SET rooms_completed = rooms_completed + 1, updated_at = ${now}
    WHERE game_id = ${gameId} AND team_id = ${teamId}
      AND NOT EXISTS (
        SELECT 1 FROM room_progress
        WHERE game_id = ${gameId} AND team_id = ${teamId}
          AND room_id = ${roomId} AND status = 'complete'
          AND completed_at < ${now}
      )
  `;

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'room_completed',
            ${JSON.stringify({ room_id: roomId })}::jsonb)
  `;

  // Award room clues
  const room = getRoom(roomId);
  if (room) {
    for (const clueId of room.rewardClueIds) {
      await _awardClue(gameId, teamId, clueId);
    }
  }
}
