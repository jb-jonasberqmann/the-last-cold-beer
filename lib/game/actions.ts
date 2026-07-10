"use server";

// Server Actions — all mutations go through here.
// Uses Neon SQL tagged template literals.

import { sql } from "@/lib/db";
import { generateRoomCode, checkAnswer, isRoomComplete } from "@/lib/game/helpers";
import { getRoom, getQuest, getBoss, getChapter, getClue } from "@/content/index";
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
    VALUES (${code}, ${offerDefinition}, ${teamAName}, ${teamBName}, 'lobby', 'act-1')
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
      (${game.id}, 'team-a', 'act-1', 'exploring'),
      (${game.id}, 'team-b', 'act-1', 'exploring')
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

  // Lobby join: no team yet — startGame assigns teams in order when host kicks off.
  // Active game join (late joiner): assign immediately via atomic subquery (one-at-a-time, no race risk).
  const isActive = game.status === "active";
  const playerRows = isActive
    ? await sql`
        INSERT INTO players (game_id, name, team_id, is_host)
        SELECT
          ${game.id}, ${playerName},
          CASE
            WHEN (SELECT COUNT(*) FROM players p2 WHERE p2.game_id = ${game.id} AND p2.team_id = 'team-a')
              <= (SELECT COUNT(*) FROM players p3 WHERE p3.game_id = ${game.id} AND p3.team_id = 'team-b')
            THEN 'team-a'
            ELSE 'team-b'
          END,
          FALSE
        RETURNING *
      `
    : await sql`
        INSERT INTO players (game_id, name, team_id, is_host)
        VALUES (${game.id}, ${playerName}, NULL, FALSE)
        RETURNING *
      `;
  const player = playerRows[0];
  if (!player) return { success: false, error: "Failed to join game." };

  return {
    success: true,
    data: { gameId: game.id, playerId: player.id, teamId: player.team_id as TeamId | null },
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

  // Assign teams to all unassigned non-host players by join order: 0→A, 1→B, 2→A, …
  // This runs once, atomically, at start time — no race condition possible.
  const unassigned = await sql`
    SELECT id FROM players
    WHERE game_id = ${gameId} AND is_host = FALSE AND team_id IS NULL
    ORDER BY created_at ASC
  `;
  for (let i = 0; i < unassigned.length; i++) {
    const teamId = i % 2 === 0 ? "team-a" : "team-b";
    await sql`UPDATE players SET team_id = ${teamId} WHERE id = ${unassigned[i].id}`;
  }

  const chapter = getChapter("act-1");
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

  await sql`UPDATE games SET status = 'active', started_at = ${now}, updated_at = ${now} WHERE id = ${gameId}`;

  // Randomly assign culprit (one non-host player)
  await _assignCulprit(gameId);

  await sql`
    INSERT INTO game_events (game_id, event_type, event_data)
    VALUES (${gameId}, 'game_started', ${JSON.stringify({ chapter_id: "act-1" })}::jsonb)
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

  // Check artifact prerequisites
  if (room.unlockRequiresArtifacts && room.unlockRequiresArtifacts.length > 0) {
    const teamClueRows = await sql`
      SELECT clue_id FROM team_clues
      WHERE game_id = ${gameId} AND team_id = ${teamId}
        AND clue_id = ANY(${room.unlockRequiresArtifacts}::text[])
    `;
    const heldArtifacts = new Set((teamClueRows as { clue_id: string }[]).map((r) => r.clue_id));
    const missingArtifacts = room.unlockRequiresArtifacts.filter((a) => !heldArtifacts.has(a));
    if (missingArtifacts.length > 0) {
      return { success: false, error: `Missing artifact(s): ${missingArtifacts.join(", ")}.` };
    }
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

  let isCorrect = checkAnswer(answer, quest.answer.correct, quest.answer.normalized);

  // Gimmick quests (e.g. Sunroom plant count): the first N attempts are
  // always wrong regardless of value, no matter what's typed. Once past
  // that threshold, fall through to the normal answer check above.
  if (quest.forceWrongForFirstNAttempts) {
    const rows = await sql`
      SELECT wrong_attempts FROM quest_progress
      WHERE game_id = ${gameId} AND team_id = ${teamId} AND quest_id = ${questId}
      LIMIT 1
    `;
    const priorWrongAttempts = (rows[0]?.wrong_attempts as number | undefined) ?? 0;
    if (isCorrect && priorWrongAttempts < quest.forceWrongForFirstNAttempts) {
      isCorrect = false;
    }
  }

  if (!isCorrect) {
    await sql`
      INSERT INTO quest_progress (game_id, team_id, quest_id, room_id, status, answer_submitted, wrong_attempts)
      VALUES (${gameId}, ${teamId}, ${questId}, ${quest.roomId}, 'active', ${answer}, 1)
      ON CONFLICT (game_id, team_id, quest_id)
      DO UPDATE SET answer_submitted = ${answer}, wrong_attempts = quest_progress.wrong_attempts + 1
    `;
    // Some puzzles (e.g. the foosball bent-rod angle guess) charge a fixed
    // sip penalty per wrong attempt, mirroring the boss's punishWrongAnswers.
    if (quest.wrongAnswerSips) {
      await _logOffer(gameId, teamId, quest.wrongAnswerSips, `Wrong answer: ${quest.title}`, questId);
    }
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

  // Complete the room FIRST — side effects below must never block room completion.
  await _checkAndCompleteRoom(gameId, teamId, quest.roomId);

  // Scared Silent side effects — non-fatal: a failure here (e.g. missing DB column
  // on an un-migrated database) must not break quest/room completion.
  try {
    // Scared Silent: the bunk-room quest sets the answering player's flag
    if (quest.setsScaredSilent) {
      // We don't have playerId here — the flag will be set by the UI layer when it calls
      // a dedicated setScaredSilent(gameId, playerId) helper below. Flag on quest for reference.
      await sql`
        INSERT INTO game_events (game_id, team_id, event_type, event_data)
        VALUES (${gameId}, ${teamId}, 'scared_silent_set',
                ${JSON.stringify({ quest_id: questId })}::jsonb)
      `;
    }

    // Scared Silent cleared: living-room quest completion clears the whole team
    if (quest.clearsScaredSilent) {
      await sql`
        UPDATE players SET player_status = 'normal'
        WHERE game_id = ${gameId} AND team_id = ${teamId} AND player_status = 'scared_silent'
      `;
      await sql`
        INSERT INTO game_events (game_id, team_id, event_type, event_data)
        VALUES (${gameId}, ${teamId}, 'scared_silent_cleared',
                ${JSON.stringify({ quest_id: questId })}::jsonb)
      `;
    }
  } catch (e) {
    console.error("Scared-silent side effect failed (non-fatal):", e);
  }

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

  // Any other quest type can also carry a flat Offer cost (e.g. a social
  // challenge that ends in a mandatory toast) — covers cases beyond the
  // choice/unlock branches above.
  if (quest.type !== "choice" && quest.type !== "unlock" && quest.offerCost) {
    offerCost = quest.offerCost;
    await _logOffer(gameId, teamId, offerCost, `Completed: ${quest.title}`, questId);
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

  // Complete the room FIRST — side effects below must never block room completion.
  await _checkAndCompleteRoom(gameId, teamId, quest.roomId);

  // Scared Silent: social/choice quests can also set or clear the flag (non-fatal)
  try {
    if (quest.setsScaredSilent) {
      await sql`
        INSERT INTO game_events (game_id, team_id, event_type, event_data)
        VALUES (${gameId}, ${teamId}, 'scared_silent_set',
                ${JSON.stringify({ quest_id: questId })}::jsonb)
      `;
    }
    if (quest.clearsScaredSilent) {
      await sql`
        UPDATE players SET player_status = 'normal'
        WHERE game_id = ${gameId} AND team_id = ${teamId} AND player_status = 'scared_silent'
      `;
      await sql`
        INSERT INTO game_events (game_id, team_id, event_type, event_data)
        VALUES (${gameId}, ${teamId}, 'scared_silent_cleared',
                ${JSON.stringify({ quest_id: questId })}::jsonb)
      `;
    }
  } catch (e) {
    console.error("Scared-silent side effect failed (non-fatal):", e);
  }

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
  answer?: string,
  bypassOfferCost?: boolean
): Promise<ActionResult<{ damage: number; newHp: number; defeated: boolean; rewardText?: string; failureText?: string; repeatToll?: number; counterAttack?: { move: string; label: string; description: string; defense_multiplier?: number; team_offer_damage?: number; heal_amount?: number } | null }>> {
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

  // Choice actions arrive from the UI as "<actionId>:<choiceId>" — split off the choice.
  const [baseActionId, chosenChoiceId] = actionId.split(":");
  actionId = baseActionId;

  // Find the action across all phases
  let foundAction = null;
  for (const phase of boss.phases) {
    foundAction = phase.actions.find((a) => a.id === actionId) ?? null;
    if (foundAction) break;
  }
  if (!foundAction) return { success: false, error: "Boss action not found." };

  // Choice actions are one-time: once a choice has dealt damage, the action locks.
  if (foundAction.type === "choice") {
    const priorChoiceUse = await sql`
      SELECT id FROM game_events
      WHERE game_id = ${gameId}
        AND team_id = ${teamId}
        AND event_type = 'boss_damaged'
        AND event_data->>'action_id' = ${actionId}
      LIMIT 1
    `;
    if (priorChoiceUse.length > 0) {
      return { success: false, error: "The house has already registered your answer. It only asks once." };
    }
  }

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
    // Idempotency — clue actions can only deal damage once per team
    const priorClueUse = await sql`
      SELECT id FROM game_events
      WHERE game_id = ${gameId}
        AND team_id = ${teamId}
        AND event_type = 'boss_damaged'
        AND event_data->>'action_id' = ${actionId}
      LIMIT 1
    `;
    if (priorClueUse.length > 0) {
      return {
        success: true,
        data: { damage: 0, newHp: bp.current_hp, defeated: false, failureText: "This clue has already been applied — damage already dealt." },
      };
    }
  }

  // Puzzle check
  if (foundAction.type === "puzzle" && foundAction.puzzle) {
    // Puzzles are one-time use — once they deal damage they're locked
    const priorUse = await sql`
      SELECT id FROM game_events
      WHERE game_id = ${gameId}
        AND team_id = ${teamId}
        AND event_type = 'boss_damaged'
        AND event_data->>'action_id' = ${actionId}
      LIMIT 1
    `;
    if (priorUse.length > 0) {
      return {
        success: false,
        error: "This puzzle has already been solved. Each puzzle can only deal damage once.",
      };
    }
    if (!answer) {
      return {
        success: true,
        data: { damage: 0, newHp: bp.current_hp, defeated: false, failureText: "Enter your answer first." },
      };
    }
    const correct = checkAnswer(answer, foundAction.puzzle.answer, true);
    if (!correct) {
      // Some bosses (e.g. the Act 3 finale) punish wrong answers with a
      // random 1-3 sip penalty on top of the miss, making guessing costly.
      let wrongSips: number | undefined;
      if (boss.punishWrongAnswers) {
        wrongSips = Math.floor(Math.random() * 3) + 1;
        await _logOffer(gameId, teamId, wrongSips, `Wrong answer: ${foundAction.label}`, bossId);
      }
      return {
        success: true,
        data: {
          damage: 0,
          newHp: bp.current_hp,
          defeated: false,
          failureText: wrongSips
            ? `${foundAction.failureText ?? "Wrong answer."} Take ${wrongSips} sip${wrongSips > 1 ? "s" : ""} — the house doesn't forgive mistakes here.`
            : (foundAction.failureText ?? "Wrong answer. Try again."),
        },
      };
    }
  }

  // ── One-time use check for offer_boost actions only ─────────────────────
  // Social actions are repeatable; only the bribe (offer_boost) is locked after first use.
  // The free (advantage) use and the paid use are tracked separately:
  // free uses are logged as "<actionId>-free", paid uses as "<actionId>".
  if (foundAction.type === "offer_boost") {
    const usageId = bypassOfferCost ? `${actionId}-free` : actionId;
    const priorUse = await sql`
      SELECT id FROM game_events
      WHERE game_id = ${gameId}
        AND team_id = ${teamId}
        AND event_type = 'boss_damaged'
        AND event_data->>'action_id' = ${usageId}
      LIMIT 1
    `;
    if (priorUse.length > 0) {
      return {
        success: false,
        error: bypassOfferCost
          ? "The advantage has already been used this fight."
          : "This one won't work twice. The boost is one-time only.",
      };
    }
  }

  // Offer boost cost
  if (foundAction.type === "offer_boost" && foundAction.offerCost && !bypassOfferCost) {
    await _logOffer(gameId, teamId, foundAction.offerCost, `Boss boost: ${foundAction.label}`, bossId);
  }

  // ── Escalating cost for repeated "Strike!" moves ─────────────────────────
  // Social actions are free and repeatable — spamming the same one over and
  // over used to be the path of least resistance. If the SAME social move
  // was used the last 2 times in a row, this use and every one after it in
  // the streak costs an escalating sip toll (3rd in a row = 1 sip, 4th = 2, …).
  let repeatToll = 0;
  if (foundAction.type === "social") {
    const recentRows = await sql`
      SELECT event_data->>'action_id' AS action_id FROM game_events
      WHERE game_id = ${gameId} AND team_id = ${teamId} AND event_type = 'boss_damaged'
        AND event_data->>'boss_id' = ${bossId}
      ORDER BY created_at DESC
      LIMIT 10
    `;
    let streak = 0;
    for (const r of recentRows as { action_id: string }[]) {
      if (r.action_id === actionId) streak++;
      else break;
    }
    if (streak >= 2) {
      repeatToll = streak - 1;
      await _logOffer(gameId, teamId, repeatToll, `Repeated move: ${foundAction.label}`, bossId);
    }
  }

  // ── Defense modifier ──────────────────────────────────────────────────────
  // Active if last boss_counter_attacked for this fight was "defend" and no
  // boss_damaged event has occurred since (meaning the buff hasn't been consumed yet).
  let damageMultiplier = 1.0;
  const lastCounterEvRows = await sql`
    SELECT id, event_data, created_at FROM game_events
    WHERE game_id = ${gameId}
      AND team_id = ${teamId}
      AND event_type = 'boss_counter_attacked'
      AND event_data->>'boss_id' = ${bossId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  if (lastCounterEvRows.length > 0) {
    const lastCtr = lastCounterEvRows[0] as { id: string; event_data: { move: string; defense_multiplier?: number }; created_at: string };
    if (lastCtr.event_data.move === "defend") {
      // Check if any damage happened AFTER this defense event
      const damagedAfter = await sql`
        SELECT id FROM game_events
        WHERE game_id = ${gameId}
          AND team_id = ${teamId}
          AND event_type = 'boss_damaged'
          AND event_data->>'boss_id' = ${bossId}
          AND created_at > ${lastCtr.created_at}
        LIMIT 1
      `;
      if (damagedAfter.length === 0) {
        damageMultiplier = lastCtr.event_data.defense_multiplier ?? 0.75;
      }
    }
  }

  const rawDamage = foundAction.damage;
  const damage = Math.round(rawDamage * damageMultiplier);
  let newHp = Math.max(0, bp.current_hp - damage);
  const defeated = newHp === 0;
  const hpPercent = (newHp / boss.maxHp) * 100;

  // Determine new phase — phases are listed in ascending order with
  // DESCENDING hpThresholds (e.g. 100, 60, 20). We want the deepest phase
  // whose threshold the current HP% has dropped to, so we keep overwriting
  // as we walk the list rather than stopping at the first (always-true,
  // since hpPercent is never above phase 1's 100% threshold) match — that
  // early `break` was a bug that pinned every boss fight to phase 1 forever,
  // hiding phase 2 / phase 3 actions no matter how much damage was dealt.
  let newPhase = bp.current_phase;
  for (const phase of boss.phases) {
    if (hpPercent <= phase.hpThreshold) {
      newPhase = phase.phase;
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

  // Free actions (bypassOfferCost) are logged with a "-free" suffix so they don't
  // consume the one-time slot for the same action used normally later.
  const logActionId = bypassOfferCost ? `${actionId}-free` : actionId;

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'boss_damaged',
            ${JSON.stringify({ boss_id: bossId, damage, raw_damage: rawDamage, defense_multiplier: damageMultiplier < 1 ? damageMultiplier : undefined, new_hp: newHp, action_id: logActionId, choice_id: chosenChoiceId })}::jsonb)
  `;

  // ── Boss counter-attack (only when boss survives) ─────────────────────────
  let chosenCounter: { move: string; label: string; description: string; defense_multiplier?: number; team_offer_damage?: number; heal_amount?: number } | null = null;

  // ~40% of hits draw NO counter at all — keeps the rhythm unpredictable
  // instead of a strict buff/attack alternation.
  const counterRoll = Math.random();

  if (!defeated && counterRoll >= 0.4 && boss.counterAttacks && boss.counterAttacks.length > 0) {
    // Determine last used move (to prevent immediate repeats)
    const lastMove = lastCounterEvRows.length > 0
      ? (lastCounterEvRows[0] as { event_data: { move: string } }).event_data.move
      : null;

    // Moves already used this fight, for `isOnce` gating. Generalized to any
    // counterattack id (not just heal) so per-boss content controls whether a
    // move can recur — e.g. the Act 3 boss's heal is deliberately repeatable
    // (isOnce: false) so it can punish the team every time they drag it below
    // 50% HP, not just the first time.
    const usedMoveRows = await sql`
      SELECT event_data->>'move' AS move FROM game_events
      WHERE game_id = ${gameId}
        AND team_id = ${teamId}
        AND event_type = 'boss_counter_attacked'
        AND event_data->>'boss_id' = ${bossId}
    `;
    const usedMoveIds = new Set(usedMoveRows.map((r) => (r as { move: string }).move));

    // Heal is a late-fight desperation move: only eligible when the boss is
    // below 50% HP AND the strike that just landed was heavy (≥20 damage).
    // Combined with the no-counter roll above, some fights it triggers —
    // many fights it never does.
    const hpPercentAfterHit = (newHp / boss.maxHp) * 100;
    const healEligible = hpPercentAfterHit < 50 && damage >= 20;

    // Filter eligible attacks: no immediate repeat, isOnce moves already
    // used this fight are excluded, heal only fires when desperate.
    const eligible = boss.counterAttacks.filter((ca) => {
      if (ca.id === lastMove) return false;
      if (ca.effect.isOnce === true && usedMoveIds.has(ca.id)) return false;
      if (ca.effect.type === "heal" && !healEligible) return false;
      return true;
    });

    if (eligible.length > 0) {
      // Weighted random selection
      const totalWeight = eligible.reduce((s, ca) => s + ca.weight, 0);
      let rand = Math.random() * totalWeight;
      let chosen = eligible[eligible.length - 1];
      for (const ca of eligible) {
        rand -= ca.weight;
        if (rand <= 0) { chosen = ca; break; }
      }

      // Apply counter-attack effect
      let healAmount = 0;
      if (chosen.effect.type === "heal" && chosen.effect.healPercent) {
        healAmount = Math.round(boss.maxHp * chosen.effect.healPercent);
        const healedHp = Math.min(boss.maxHp, newHp + healAmount);
        newHp = healedHp;
        await sql`UPDATE boss_progress SET current_hp = ${healedHp}, updated_at = NOW() WHERE id = ${bp.id}`;
      }
      if (chosen.effect.type === "attack" && chosen.effect.teamOfferDamage) {
        await _logOffer(gameId, teamId, chosen.effect.teamOfferDamage, `Boss attack: ${chosen.label}`, bossId);
      }

      chosenCounter = {
        move: chosen.id,
        label: chosen.label,
        description: chosen.description,
        defense_multiplier: chosen.effect.defenseMultiplier,
        team_offer_damage: chosen.effect.teamOfferDamage,
        heal_amount: healAmount > 0 ? healAmount : undefined,
      };

      await sql`
        INSERT INTO game_events (game_id, team_id, event_type, event_data)
        VALUES (${gameId}, ${teamId}, 'boss_counter_attacked',
                ${JSON.stringify({
                  boss_id: bossId,
                  ...chosenCounter,
                })}::jsonb)
      `;
    }
  }

  if (defeated) {
    await sql`
      INSERT INTO game_events (game_id, team_id, event_type, event_data)
      VALUES (${gameId}, ${teamId}, 'boss_defeated', ${JSON.stringify({ boss_id: bossId })}::jsonb)
    `;
    const bossContent = getBoss(bossId);

    // Act 1 boss (Mads) defeated → record chapter winner + clear the way to the front door
    if (bossContent?.chapterId === "act-1") {
      await sql`
        UPDATE games SET chapter_1_winner = ${teamId}
        WHERE id = ${gameId} AND chapter_1_winner IS NULL
      `;
      await _awardClue(gameId, teamId, "mads-unloaded");
    }

    // Act 2 boss (The Radio) defeated → trigger Act 2→3 transition for THIS team only
    if (bossContent?.chapterId === "act-2") {
      await advanceAct(gameId, "act-2", "act-3", teamId);
    }

    // Act 3 boss (YOURSELVES) defeated → per-team culprit reveal.
    // The game only ends when BOTH teams have defeated their final boss.
    if (bossContent?.chapterId === "act-3") {
      await sql`
        INSERT INTO game_events (game_id, team_id, event_type, event_data)
        VALUES (${gameId}, ${teamId}, 'culprit_revealed', ${JSON.stringify({ boss_id: bossId, team_id: teamId })}::jsonb)
      `;
      const defeatedRows = await sql`
        SELECT COUNT(*)::int AS n FROM boss_progress
        WHERE game_id = ${gameId} AND boss_id = ${bossId} AND status = 'defeated'
      `;
      const defeatedTeams = (defeatedRows[0] as { n: number } | undefined)?.n ?? 0;
      if (defeatedTeams >= 2) {
        await sql`UPDATE games SET status = 'complete', updated_at = ${now} WHERE id = ${gameId}`;
      }
    }
  }

  return {
    success: true,
    data: {
      damage, newHp, defeated,
      rewardText: foundAction.rewardText,
      repeatToll: repeatToll > 0 ? repeatToll : undefined,
      counterAttack: chosenCounter,
    },
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
  status: "locked" | "unlocked" | "complete"
): Promise<ActionResult> {
  const now = new Date().toISOString();

  // "locked" = full reset: wipe the team's quest progress for the room and lock it again.
  if (status === "locked") {
    await sql`
      DELETE FROM quest_progress
      WHERE game_id = ${gameId} AND team_id = ${teamId} AND room_id = ${roomId}
    `;
    await sql`
      INSERT INTO room_progress (game_id, team_id, room_id, status)
      VALUES (${gameId}, ${teamId}, ${roomId}, 'locked')
      ON CONFLICT (game_id, team_id, room_id)
      DO UPDATE SET
        status = 'locked',
        unlocked_at = NULL,
        completed_at = NULL,
        occupant_player_id = NULL
    `;
    return { success: true, data: undefined };
  }

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
  // Wipe this boss's fight history for the team so one-time actions
  // (puzzles, boosts, clue checks, choices) become usable again.
  await sql`
    DELETE FROM game_events
    WHERE game_id = ${gameId} AND team_id = ${teamId}
      AND event_type IN ('boss_damaged', 'boss_counter_attacked', 'boss_defeated')
      AND event_data->>'boss_id' = ${bossId}
  `;

  // Resetting the final boss also un-completes the game and clears the reveal event
  if (bossId === "yourselves") {
    await sql`
      DELETE FROM game_events
      WHERE game_id = ${gameId} AND team_id = ${teamId} AND event_type = 'culprit_revealed'
    `;
    await sql`
      UPDATE games SET status = 'active', updated_at = NOW()
      WHERE id = ${gameId} AND status = 'complete'
    `;
  }

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
// DRUNK GAMBLE — variable damage from the team's offer pool
// ==========================================

/**
 * Apply a variable amount of boss damage for the "Beruse Bossen" drunk-gamble mechanic.
 * The random outcome is decided by the caller; this action just records the damage
 * and updates boss HP when the gamble succeeds.
 */
export async function applyBossDamage(
  gameId: string,
  teamId: TeamId,
  bossId: string,
  sips: number,    // wagered sips (what the team risked)
  damage?: number  // actual damage to apply; defaults to sips; caller passes sips*3
): Promise<ActionResult<{ newHp: number; defeated: boolean }>> {
  // Allow up to however many sips the team has spent on their expedition (no artificial cap)
  const safeSips = Math.max(1, Math.floor(sips));
  const actualDamage = damage != null ? Math.max(1, Math.floor(damage)) : safeSips;

  // Fetch or initialise boss progress
  let bpRows = await sql`
    SELECT * FROM boss_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND boss_id = ${bossId}
    LIMIT 1
  `;

  const boss = getBoss(bossId);
  if (!boss) return { success: false, error: "Boss not found." };

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

  const newHp = Math.max(0, bp.current_hp - actualDamage);
  const defeated = newHp <= 0;
  // Avoid nested sql`` literals — use conditional value (null when not defeated)
  const defeatTime = defeated ? new Date().toISOString() : null;

  await sql`
    UPDATE boss_progress SET
      current_hp   = ${newHp},
      damage_dealt = damage_dealt + ${actualDamage},
      status       = ${defeated ? "defeated" : "active"},
      defeated_at  = ${defeatTime},
      updated_at   = NOW()
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND boss_id = ${bossId}
  `;

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (
      ${gameId}, ${teamId}, 'boss_damaged',
      ${JSON.stringify({ action_id: "drunk-gamble", wagered: safeSips, damage: actualDamage, method: "drunk" })}::jsonb
    )
  `;

  if (defeated) {
    await sql`
      INSERT INTO game_events (game_id, team_id, event_type, event_data)
      VALUES (${gameId}, ${teamId}, 'boss_defeated', ${JSON.stringify({ boss_id: bossId })}::jsonb)
    `;
    if (boss.chapterId === "act-1") {
      await sql`UPDATE games SET chapter_1_winner = ${teamId} WHERE id = ${gameId} AND chapter_1_winner IS NULL`;
    }
  }

  return { success: true, data: { newHp, defeated } };
}


// ==========================================
// SET SCARED SILENT
// Called by UI right after the bunk-room answer quest succeeds —
// marks the specific answering player so only THEY are silenced.
// ==========================================

export async function setScaredSilent(gameId: string, playerId: string): Promise<ActionResult> {
  try {
    await sql`
      UPDATE players SET player_status = 'scared_silent'
      WHERE id = ${playerId} AND game_id = ${gameId}
    `;
    return { success: true, data: undefined };
  } catch (e) {
    console.error("setScaredSilent failed (non-fatal):", e);
    return { success: false, error: "Could not set scared-silent status." };
  }
}

// ==========================================
// SET / CLEAR SUN BLIND
// Called by UI right after the sunroom dare succeeds — marks the specific
// player who took it. Cleared team-wide the moment the team reaches the
// Act 2 boss (the house going dark levels the playing field again).
// Non-fatal: requires the sun_blind migration on the live DB — if it
// hasn't been run yet, this fails quietly rather than breaking the quest.
// ==========================================

export async function setSunBlind(gameId: string, playerId: string): Promise<ActionResult> {
  const setBlind = () => sql`
    UPDATE players SET player_status = 'sun_blind'
    WHERE id = ${playerId} AND game_id = ${gameId}
  `;
  try {
    await setBlind();
    return { success: true, data: undefined };
  } catch (e) {
    // Most likely the DB's CHECK constraint hasn't been migrated to allow
    // 'sun_blind' yet (see supabase/migration-2026-07-03-sunblind.sql).
    // Self-heal it here so this never depends on someone remembering to run
    // a manual Neon migration — relax the constraint once and retry.
    console.error("setSunBlind: first attempt failed, relaxing player_status constraint:", e);
    try {
      await sql`ALTER TABLE players DROP CONSTRAINT IF EXISTS players_player_status_check`;
      await sql`
        ALTER TABLE players ADD CONSTRAINT players_player_status_check
          CHECK (player_status IN ('normal', 'scared_silent', 'sun_blind'))
      `;
      await setBlind();
      return { success: true, data: undefined };
    } catch (e2) {
      console.error("setSunBlind failed (non-fatal):", e2);
      return { success: false, error: "Could not set sun-blind status." };
    }
  }
}

export async function clearSunBlindForTeam(gameId: string, teamId: TeamId): Promise<ActionResult> {
  try {
    await sql`
      UPDATE players SET player_status = 'normal'
      WHERE game_id = ${gameId} AND team_id = ${teamId} AND player_status = 'sun_blind'
    `;
    return { success: true, data: undefined };
  } catch (e) {
    console.error("clearSunBlindForTeam failed (non-fatal):", e);
    return { success: false, error: "Could not clear sun-blind status." };
  }
}

// ==========================================
// ENTER SINGLE-OCCUPANCY BEDROOM
// First player to call this claims the room; all other team members are locked out.
// ==========================================

export async function enterBedroom(
  gameId: string,
  teamId: TeamId,
  playerId: string,
  roomId: string
): Promise<ActionResult<{ claimed: boolean; occupantName?: string }>> {
  const room = getRoom(roomId);
  if (!room?.isSingleOccupancy) return { success: false, error: "Not a single-occupancy room." };

  const existing = await sql`
    SELECT status, occupant_player_id FROM room_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND room_id = ${roomId}
    LIMIT 1
  `;

  if (existing.length > 0) {
    const row = existing[0] as { status: string; occupant_player_id: string | null };
    if (row.status === "occupied" || row.status === "active" || row.status === "complete") {
      // Room is already claimed — find occupant name
      if (row.occupant_player_id && row.occupant_player_id !== playerId) {
        const playerRows = await sql`
          SELECT name FROM players WHERE id = ${row.occupant_player_id} LIMIT 1
        `;
        const occupantName = (playerRows[0] as { name: string } | undefined)?.name ?? "a teammate";
        return { success: true, data: { claimed: false, occupantName } };
      }
      // This player already occupies it
      return { success: true, data: { claimed: true } };
    }
  }

  // Claim the room atomically
  const now = new Date().toISOString();
  const result = await sql`
    INSERT INTO room_progress
      (game_id, team_id, room_id, status, occupant_player_id, unlocked_at)
    VALUES
      (${gameId}, ${teamId}, ${roomId}, 'occupied', ${playerId}, ${now})
    ON CONFLICT (game_id, team_id, room_id) DO UPDATE
      SET status = CASE
            WHEN room_progress.status = 'locked' THEN 'occupied'
            ELSE room_progress.status
          END,
          occupant_player_id = CASE
            WHEN room_progress.occupant_player_id IS NULL THEN ${playerId}
            ELSE room_progress.occupant_player_id
          END,
          unlocked_at = COALESCE(room_progress.unlocked_at, ${now})
    RETURNING occupant_player_id
  `;

  const claimedBy = (result[0] as { occupant_player_id: string })?.occupant_player_id;
  if (claimedBy !== playerId) {
    const playerRows = await sql`SELECT name FROM players WHERE id = ${claimedBy} LIMIT 1`;
    const occupantName = (playerRows[0] as { name: string } | undefined)?.name ?? "a teammate";
    return { success: true, data: { claimed: false, occupantName } };
  }

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'room_occupied',
            ${ JSON.stringify({ room_id: roomId, player_id: playerId }) }::jsonb)
  `;

  return { success: true, data: { claimed: true } };
}

// ==========================================
// ASSIGN CULPRIT (per team)
// Called at game start once all players are assigned to teams.
// ONE player PER TEAM becomes the "witness" — publicly they're asked to take
// the ritual team photo; secretly they are that team's culprit (the one
// missing from the photo is the one who took the last cold beer).
// ==========================================

async function _assignCulprit(gameId: string) {
  for (const teamId of ["team-a", "team-b"] as TeamId[]) {
    const players = await sql`
      SELECT id FROM players
      WHERE game_id = ${gameId} AND is_host = FALSE AND team_id = ${teamId}
      ORDER BY random()
      LIMIT 1
    `;
    if (players.length === 0) continue;
    const witnessId = players[0].id as string;
    await sql`UPDATE players SET is_culprit = TRUE WHERE id = ${witnessId}`;

    // Record the witness for the ritual photo flow (self-heals missing table)
    const insertWitness = async () => {
      await sql`
        INSERT INTO team_photos (game_id, team_id, witness_player_id)
        VALUES (${gameId}, ${teamId}, ${witnessId})
        ON CONFLICT (game_id, team_id)
        DO UPDATE SET witness_player_id = ${witnessId}
      `;
    };
    try {
      await insertWitness();
    } catch {
      try {
        await _ensureTeamPhotosTable();
        await insertWitness();
      } catch (e) {
        console.error("team_photos insert failed (non-fatal):", e);
      }
    }
  }
}

// ==========================================
// RITUAL PHOTO (the disguised culprit mechanic)
// ==========================================

/**
 * Self-healing DDL: creates the team_photos table if it doesn't exist yet.
 * This removes the dependency on running the migration manually in Neon.
 */
async function _ensureTeamPhotosTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS team_photos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      team_id TEXT NOT NULL CHECK (team_id IN ('team-a', 'team-b')),
      witness_player_id TEXT,
      photo TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(game_id, team_id)
    )
  `;
}

/** Witness/photo metadata for a team. Photo payload only included when requested. */
export async function getTeamPhoto(
  gameId: string,
  teamId: TeamId,
  includePhoto = false
): Promise<ActionResult<{ witnessPlayerId: string | null; hasPhoto: boolean; photo: string | null }>> {
  try {
    const rows = await sql`
      SELECT witness_player_id, (photo IS NOT NULL) AS has_photo,
             CASE WHEN ${includePhoto} THEN photo ELSE NULL END AS photo
      FROM team_photos
      WHERE game_id = ${gameId} AND team_id = ${teamId}
      LIMIT 1
    `;
    const row = rows[0] as { witness_player_id: string | null; has_photo: boolean; photo: string | null } | undefined;
    return {
      success: true,
      data: {
        witnessPlayerId: row?.witness_player_id ?? null,
        hasPhoto: row?.has_photo ?? false,
        photo: row?.photo ?? null,
      },
    };
  } catch {
    // Table missing (un-migrated DB) — behave as if no photo flow exists
    return { success: true, data: { witnessPlayerId: null, hasPhoto: false, photo: null } };
  }
}

/**
 * Save the ritual photo (driveway quest).
 * The player who takes the photo becomes the team's witness — and, secretly,
 * the team's culprit: the reveal points at "the one missing from the photo",
 * which is by definition the photographer. Never hint at this in UI copy.
 */
export async function saveRitualPhoto(
  gameId: string,
  teamId: TeamId,
  playerId: string,
  photoDataUrl: string
): Promise<ActionResult> {
  if (!photoDataUrl.startsWith("data:image/")) {
    return { success: false, error: "Invalid image data." };
  }
  if (photoDataUrl.length > 900_000) {
    return { success: false, error: "Photo too large — try again." };
  }

  // Hosts are spectators — they can't be the witness/culprit.
  const playerRows = await sql`
    SELECT is_host FROM players WHERE id = ${playerId} AND game_id = ${gameId} LIMIT 1
  `;
  const player = playerRows[0] as { is_host: boolean } | undefined;
  if (!player) return { success: false, error: "Player not found." };
  if (player.is_host) return { success: false, error: "The host cannot take the ritual photo — hand the phone to a team member." };

  const persist = async () => {
    await sql`
      INSERT INTO team_photos (game_id, team_id, witness_player_id, photo)
      VALUES (${gameId}, ${teamId}, ${playerId}, ${photoDataUrl})
      ON CONFLICT (game_id, team_id)
      DO UPDATE SET witness_player_id = ${playerId}, photo = ${photoDataUrl}
    `;
  };

  try {
    try {
      await persist();
    } catch (e) {
      // Most likely the table doesn't exist yet — create it and retry once.
      console.error("saveRitualPhoto: first attempt failed, ensuring table exists:", e);
      await _ensureTeamPhotosTable();
      await persist();
    }

    // Reassign the team's culprit to the actual photographer (non-fatal)
    try {
      await sql`
        UPDATE players SET is_culprit = FALSE
        WHERE game_id = ${gameId} AND team_id = ${teamId}
      `;
      await sql`
        UPDATE players SET is_culprit = TRUE
        WHERE id = ${playerId} AND game_id = ${gameId}
      `;
    } catch (e) {
      console.error("saveRitualPhoto: culprit reassignment failed (non-fatal):", e);
    }

    await sql`
      INSERT INTO game_events (game_id, team_id, event_type, event_data)
      VALUES (${gameId}, ${teamId}, 'ritual_photo_taken', ${JSON.stringify({ team_id: teamId })}::jsonb)
    `;
    return { success: true, data: undefined };
  } catch (e) {
    console.error("saveRitualPhoto failed:", e);
    return { success: false, error: "Could not save the photo." };
  }
}

// ==========================================
// MARK CLUES READ (team-wide)
// A clue counts as "read" for the whole team once ANY player opens it
// in the Case File. Self-heals the read_at column on older databases.
// ==========================================

export async function markCluesRead(
  gameId: string,
  teamId: TeamId,
  clueIds: string[]
): Promise<ActionResult> {
  if (clueIds.length === 0) return { success: true, data: undefined };
  const doUpdate = async () => {
    await sql`
      UPDATE team_clues SET read_at = NOW()
      WHERE game_id = ${gameId} AND team_id = ${teamId}
        AND clue_id = ANY(${clueIds}::text[])
        AND read_at IS NULL
    `;
  };
  try {
    await doUpdate();
  } catch {
    try {
      await sql`ALTER TABLE team_clues ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ`;
      await doUpdate();
    } catch (e) {
      console.error("markCluesRead failed (non-fatal):", e);
      return { success: false, error: "Could not mark clues read." };
    }
  }
  return { success: true, data: undefined };
}

// ==========================================
// HOST: FORCE FINALE
// Ends the game (e.g. if one team never finishes Act 3).
// ==========================================

export async function hostForceGameComplete(gameId: string): Promise<ActionResult> {
  await sql`UPDATE games SET status = 'complete', updated_at = NOW() WHERE id = ${gameId}`;
  await sql`
    INSERT INTO game_events (game_id, event_type, event_data)
    VALUES (${gameId}, 'game_completed', ${JSON.stringify({ forced_by_host: true })}::jsonb)
  `;
  return { success: true, data: undefined };
}

// ==========================================
// ADVANCE ACT
// Act 1→2: triggered after front-door key box solved.
// Act 2→3: triggered automatically after radio boss defeated (called from dealBossDamage).
// ==========================================

export async function advanceAct(
  gameId: string,
  fromActId: string,
  toActId: string,
  teamId: TeamId
): Promise<ActionResult> {
  const now = new Date().toISOString();
  const nextAct = getChapter(toActId);
  if (!nextAct) return { success: false, error: `Act ${toActId} not found.` };

  // PER-TEAM advance: only the triggering team moves to the new act.
  // The other team keeps playing its current act until it earns its own transition.
  await sql`
    UPDATE team_progress SET current_chapter_id = ${toActId}, updated_at = ${now}
    WHERE game_id = ${gameId} AND team_id = ${teamId}
  `;

  // games.current_chapter_id tracks the FURTHEST act reached by any team
  // (used for the host overview only — never for a team's own view).
  const gameRows = await sql`SELECT current_chapter_id FROM games WHERE id = ${gameId} LIMIT 1`;
  const currentOrder = getChapter((gameRows[0] as { current_chapter_id: string } | undefined)?.current_chapter_id ?? "act-1")?.order ?? 1;
  if (nextAct.order > currentOrder) {
    await sql`UPDATE games SET current_chapter_id = ${toActId}, updated_at = ${now} WHERE id = ${gameId}`;
  }

  // Unlock starting rooms for THIS team only
  for (const roomId of nextAct.startingRoomIds) {
    await sql`
      INSERT INTO room_progress (game_id, team_id, room_id, status, unlocked_at)
      VALUES (${gameId}, ${teamId}, ${roomId}, 'unlocked', ${now})
      ON CONFLICT (game_id, team_id, room_id) DO NOTHING
    `;
  }

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'act_advanced',
            ${ JSON.stringify({ from: fromActId, to: toActId, team_id: teamId }) }::jsonb)
  `;

  return { success: true, data: undefined };
}

// ==========================================
// GET CULPRIT REVEAL (per team)
// Only returns data after THAT team's YOURSELVES boss is defeated.
// Includes the team's ritual photo — the culprit is the one not in it.
// ==========================================

export async function getCulpritReveal(
  gameId: string,
  teamId: TeamId
): Promise<ActionResult<{ culpritName: string; culpritPlayerId: string; photo: string | null } | null>> {
  // Check THIS team's boss is defeated
  const bossRows = await sql`
    SELECT status FROM boss_progress
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND boss_id = 'yourselves' AND status = 'defeated'
    LIMIT 1
  `;
  if (bossRows.length === 0) {
    return { success: true, data: null }; // Boss not defeated yet — no reveal
  }

  const culpritRows = await sql`
    SELECT id, name FROM players
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND is_culprit = TRUE
    LIMIT 1
  `;
  if (culpritRows.length === 0) return { success: false, error: "No culprit assigned for this team." };

  let photo: string | null = null;
  try {
    const photoRows = await sql`
      SELECT photo FROM team_photos
      WHERE game_id = ${gameId} AND team_id = ${teamId}
      LIMIT 1
    `;
    photo = (photoRows[0] as { photo: string | null } | undefined)?.photo ?? null;
  } catch {
    // team_photos table missing — reveal works without the photo
  }

  const culprit = culpritRows[0] as { id: string; name: string };
  return { success: true, data: { culpritName: culprit.name, culpritPlayerId: culprit.id, photo } };
}

// ==========================================
// TOAST / CHEERS ENDING
// ==========================================

/**
 * The revealed culprit's final choice: drink the last cold beer alone
 * ("corrupted" — an extra full drink for them, plus their team each takes
 * a sip) or share a toast with the whole game (both teams get a notified,
 * game-styled cheers moment — no extra cost). One choice per team, logged
 * as a game_event so every player's client picks it up on the next poll
 * (see the toll-banner detection in the team map / room pages, which watch
 * for this event_type game-wide, not just for their own team).
 */
export async function getEndingChoice(
  gameId: string,
  teamId: TeamId
): Promise<ActionResult<{ choice: "alone" | "toast"; playerName: string } | null>> {
  const rows = await sql`
    SELECT event_data FROM game_events
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND event_type = 'ending_choice_made'
    ORDER BY created_at ASC
    LIMIT 1
  `;
  if (rows.length === 0) return { success: true, data: null };
  const data = (rows[0] as { event_data: { choice: "alone" | "toast"; player_name: string } }).event_data;
  return { success: true, data: { choice: data.choice, playerName: data.player_name } };
}

export async function submitEndingChoice(
  gameId: string,
  teamId: TeamId,
  playerId: string,
  playerName: string,
  choice: "alone" | "toast"
): Promise<ActionResult<{ choice: "alone" | "toast" }>> {
  // Only the culprit may make this choice.
  const culpritRows = await sql`
    SELECT id FROM players WHERE id = ${playerId} AND game_id = ${gameId} AND is_culprit = TRUE LIMIT 1
  `;
  if (culpritRows.length === 0) return { success: false, error: "Only the culprit makes this choice." };

  // One choice per team — idempotent against double-submits/refreshes.
  const existing = await sql`
    SELECT id FROM game_events
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND event_type = 'ending_choice_made'
    LIMIT 1
  `;
  if (existing.length > 0) return { success: false, error: "The choice has already been made." };

  if (choice === "alone") {
    // Teammates (everyone but the culprit) each take a sip.
    const teammateRows = await sql`
      SELECT COUNT(*)::int AS n FROM players
      WHERE game_id = ${gameId} AND team_id = ${teamId} AND id != ${playerId}
    `;
    const teammateCount = (teammateRows[0] as { n: number } | undefined)?.n ?? 0;
    const EXTRA_DRINK_SIPS = 4; // flavor sip-count for "an extra full drink"
    const totalSips = EXTRA_DRINK_SIPS + teammateCount;
    await _logOffer(
      gameId,
      teamId,
      totalSips,
      `${playerName} drank alone — corrupted (1 extra full drink + ${teammateCount} team sip${teammateCount === 1 ? "" : "s"})`,
      "ending-choice"
    );
  }

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'ending_choice_made',
            ${JSON.stringify({ choice, player_id: playerId, player_name: playerName })}::jsonb)
  `;

  return { success: true, data: { choice } };
}

// ==========================================
// CONTACT THE GM
// ==========================================

/**
 * A team can flag down the GM after getting genuinely stuck — gated in the
 * UI to 2+ hints used and at least one wrong answer on the same quest.
 * Costs the team 2 sips and posts an alert (with the exact riddle + correct
 * answer for THIS team's quest variant) to the GM dashboard.
 */
export async function contactGM(
  gameId: string,
  teamId: TeamId,
  questId: string,
  playerName: string
): Promise<ActionResult<{ ok: true }>> {
  const quest = getQuest(questId);
  if (!quest) return { success: false, error: "Quest not found." };

  const CONTACT_GM_SIPS = 2;
  await _logOffer(gameId, teamId, CONTACT_GM_SIPS, `Contacted the GM: ${quest.title}`, questId);

  const correctAnswer = quest.answer
    ? (Array.isArray(quest.answer.correct) ? quest.answer.correct[0] : quest.answer.correct)
    : quest.type === "letter_tiles" && quest.letterTiles
    ? quest.letterTiles.targetWord
    : null;

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'gm_contacted',
            ${JSON.stringify({
              quest_id: quest.id,
              quest_title: quest.title,
              room_id: quest.roomId,
              player_name: playerName,
              prompt: quest.prompt,
              correct_answer: correctAnswer,
            })}::jsonb)
  `;

  return { success: true, data: { ok: true } };
}

/**
 * Dedicated fetch for GM alert events — deliberately NOT sourced from the
 * general 20-event activity feed (getRecentGameEvents), which can roll an
 * alert off-window during a busy stretch. The GM dashboard polls this
 * directly so a "contact the GM" request is never silently missed.
 */
export async function getGmAlerts(gameId: string): Promise<ActionResult<import("@/types/database").DbGameEvent[]>> {
  const rows = await sql`
    SELECT * FROM game_events
    WHERE game_id = ${gameId} AND event_type = 'gm_contacted'
    ORDER BY created_at DESC
    LIMIT 50
  `;
  return { success: true, data: rows as import("@/types/database").DbGameEvent[] };
}

// ==========================================
// INTERMISSION — story beat + dice roll between acts
// Shown after a team defeats Mads (Act 1→2) or the Radio (Act 2→3), before
// they walk into the next act. Purely a fun "attack": roll a flat 1-6, the
// OTHER team drinks that many sips. One roll per team per transition.
// ==========================================

export async function getIntermissionRoll(
  gameId: string,
  teamId: TeamId,
  bossId: string
): Promise<ActionResult<{ roll: number } | null>> {
  const rows = await sql`
    SELECT event_data FROM game_events
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND event_type = 'intermission_roll'
      AND event_data->>'boss_id' = ${bossId}
    LIMIT 1
  `;
  if (rows.length === 0) return { success: true, data: null };
  const data = (rows[0] as { event_data: { roll: number } }).event_data;
  return { success: true, data: { roll: data.roll } };
}

export async function rollIntermissionAttack(
  gameId: string,
  teamId: TeamId,
  bossId: string
): Promise<ActionResult<{ roll: number; otherTeam: TeamId }>> {
  // One roll per team per boss transition — idempotent against double-taps/refreshes.
  const existing = await sql`
    SELECT id FROM game_events
    WHERE game_id = ${gameId} AND team_id = ${teamId} AND event_type = 'intermission_roll'
      AND event_data->>'boss_id' = ${bossId}
    LIMIT 1
  `;
  if (existing.length > 0) return { success: false, error: "Already rolled for this transition." };

  const roll = Math.floor(Math.random() * 6) + 1; // flat 1-6, no scaling
  const otherTeam: TeamId = teamId === "team-a" ? "team-b" : "team-a";

  await _logOffer(gameId, otherTeam, roll, "Hit by the other team's toast roll", bossId);

  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (${gameId}, ${teamId}, 'intermission_roll',
            ${JSON.stringify({ boss_id: bossId, roll, target_team: otherTeam })}::jsonb)
  `;

  return { success: true, data: { roll, otherTeam } };
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
    answer_submitted: null, hints_used: 0, offer_spent: 0, completed_at: null, wrong_attempts: 0,
  }));

  if (!isRoomComplete(roomId, asDbRows, teamId)) return;

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

  // Award room clues. Some clues are per-team variants (revealedTo) — a
  // room can list both variants (e.g. fragment-driveway-a/-b) for display
  // purposes, but only the one matching this team should actually award.
  const room = getRoom(roomId);
  if (room) {
    for (const clueId of room.rewardClueIds) {
      const clue = getClue(clueId);
      if (clue?.revealedTo && clue.revealedTo !== teamId) continue;
      await _awardClue(gameId, teamId, clueId);
    }
  }
}

// ── Physical challenge broadcast ──────────────────────────────────────────────
// Inserts a game_event so all polling team members see the countdown timer.
export async function startPhysicalChallenge(
  gameId: string,
  teamId: TeamId,
  questId: string
): Promise<ActionResult<Record<string, never>>> {
  await sql`
    INSERT INTO game_events (game_id, team_id, event_type, event_data)
    VALUES (
      ${gameId}, ${teamId}, 'physical_challenge_started',
      ${JSON.stringify({ quest_id: questId, started_at: new Date().toISOString() })}::jsonb
    )
  `;
  return { success: true, data: {} };
}

// ==========================================
// SUBMIT PRECISION STOP (Darts — stop the stopwatch as close to the target as possible)
// ==========================================

const PRECISION_STOP_TIERS: { maxDelta: number; sips: number }[] = [
  { maxDelta: 2,  sips: 0 },
  { maxDelta: 5,  sips: 1 },
  { maxDelta: 10, sips: 2 },
  { maxDelta: 15, sips: 3 },
];

export async function submitPrecisionStop(
  gameId: string,
  teamId: TeamId,
  questId: string,
  elapsedSeconds: number
): Promise<ActionResult<{ completed: boolean; deltaSeconds: number; sips: number; rewardText?: string }>> {
  const quest = getQuest(questId);
  if (!quest) return { success: false, error: "Quest not found." };
  const target = quest.physicalChallenge?.targetStopSeconds;
  if (target == null) return { success: false, error: "This quest has no stop target." };

  const deltaSeconds = Math.abs(elapsedSeconds - target);
  const tier = PRECISION_STOP_TIERS.find((t) => deltaSeconds <= t.maxDelta);

  if (!tier) {
    // Too far off — no penalty, no progress, just try again.
    return { success: true, data: { completed: false, deltaSeconds, sips: 0 } };
  }

  if (tier.sips > 0) {
    await _logOffer(gameId, teamId, tier.sips, `Off target on: ${quest.title}`, questId);
  }

  const now = new Date().toISOString();
  await sql`
    INSERT INTO quest_progress (game_id, team_id, quest_id, room_id, status, answer_submitted, offer_spent, completed_at)
    VALUES (${gameId}, ${teamId}, ${questId}, ${quest.roomId}, 'completed', ${String(elapsedSeconds)}, ${tier.sips}, ${now})
    ON CONFLICT (game_id, team_id, quest_id)
    DO UPDATE SET status = 'completed', answer_submitted = ${String(elapsedSeconds)}, offer_spent = ${tier.sips}, completed_at = ${now}
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
    data: { completed: true, deltaSeconds, sips: tier.sips, rewardText: quest.rewardText },
  };
}
