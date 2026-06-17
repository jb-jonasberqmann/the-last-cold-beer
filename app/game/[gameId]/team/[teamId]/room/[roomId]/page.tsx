"use client";

import { useEffect, useState, useCallback } from "react";
import { submitQuestAnswer, completeQuest, useHint } from "@/lib/game/actions";
import { GameLayout } from "@/components/layout/GameLayout";
import { Button } from "@/components/ui/Button";
import { ClueCard } from "@/components/game/ClueCard";
import { getRoom, getQuestsByRoom, getClue } from "@/content/index";
import type { DbGame, DbQuestProgress, DbTeamClue } from "@/types/database";
import type { TeamId, Quest } from "@/types/content";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  params: { gameId: string; teamId: TeamId; roomId: string };
}

export default function RoomPage({ params }: Props) {
  const gameId = params.gameId;
  const teamId = params.teamId;
  const roomId = params.roomId;
  const { t } = useLanguage();

  const [game, setGame] = useState<DbGame | null>(null);
  const [questProgress, setQuestProgress] = useState<DbQuestProgress[]>([]);
  const [teamClues, setTeamClues] = useState<DbTeamClue[]>([]);
  const [newClues, setNewClues] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    if (!gameId || !teamId) return;
    const res = await fetch(`/api/game/${gameId}/progress?teamId=${teamId}`);
    if (!res.ok) return;
    const data = await res.json();
    setGame(data.game);
    setQuestProgress(
      roomId
        ? (data.questProgress ?? []).filter((qp: DbQuestProgress) => qp.room_id === roomId)
        : (data.questProgress ?? [])
    );
    setTeamClues(data.clues ?? []);
  }, [gameId, teamId, roomId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const room = roomId ? getRoom(roomId) : null;
  const allQuests = room ? getQuestsByRoom(room.id, teamId) : [];

  // Sequential logic: show only the active quest (first incomplete required quest).
  // Bonus (non-required) quests become visible after all required quests are done.
  const requiredQuests = allQuests.filter((q) => q.isRequired);
  const bonusQuests = allQuests.filter((q) => !q.isRequired);

  const firstIncompleteRequiredIndex = requiredQuests.findIndex(
    (q) => questProgress.find((qp) => qp.quest_id === q.id)?.status !== "completed"
  );
  const allRequiredDone = firstIncompleteRequiredIndex === -1;

  // Quests visible to the player right now
  const visibleRequiredQuests = allRequiredDone
    ? requiredQuests
    : requiredQuests.slice(0, firstIncompleteRequiredIndex + 1);
  const visibleBonusQuests = allRequiredDone ? bonusQuests : [];
  const quests = [...visibleRequiredQuests, ...visibleBonusQuests];

  if (!room || !game || !gameId || !teamId) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400">
        {gameId ? "Room not found." : "Loading…"}
      </div>
    );
  }

  const getQuestState = (questId: string) =>
    questProgress.find((qp) => qp.quest_id === questId);

  const isComplete = (questId: string) =>
    getQuestState(questId)?.status === "completed";

  const offerDef = game.offer_definition;

  return (
    <GameLayout
      gameId={gameId}
      teamId={teamId}
      backHref={`/game/${gameId}/team/${teamId}`}
      backLabel="Quest Board"
      title={room.title}
    >
      {/* ── Room header — parchment frame ── */}
      <div className="rounded-xl mb-5 border border-amber-800/40 bg-stone-950 overflow-hidden relative">
        {/* Subtle room-tinted glow */}
        <div className={cn("absolute inset-0 opacity-8 bg-gradient-to-br pointer-events-none", room.look.colorFrom, room.look.colorTo)} />
        {/* Top accent bar */}
        <div className={cn("h-1 w-full bg-gradient-to-r", room.look.colorFrom, room.look.colorTo, "opacity-60")} />
        <div className="relative p-5">
          {/* Icon + title row */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-lg border border-amber-800/40 bg-stone-900 flex items-center justify-center text-2xl flex-shrink-0"
            >
              {room.look.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-xs text-amber-700 uppercase tracking-[0.2em] mb-0.5"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {room.type === "mystery_room" ? "~ undersøg rum ~" : room.type}
              </div>
              <h1
                className="text-xl font-bold text-amber-100 leading-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {room.title}
              </h1>
            </div>
          </div>
          <p className="text-sm text-stone-300 leading-relaxed mb-2">{room.description}</p>
          <p
            className="text-xs text-amber-800/90 italic border-t border-amber-900/30 pt-2 mt-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {room.look.atmosphere}
          </p>
        </div>
      </div>

      {/* New clue notification */}
      {newClues.map((clueId) => {
        const clue = getClue(clueId);
        if (!clue) return null;
        return (
          <div
            key={clueId}
            className="rounded-xl bg-amber-950/80 border-2 border-amber-600/70 p-4 mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <div className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">
              {t("room.clue_found")}
            </div>
            <div className="font-bold text-amber-200">{clue.title}</div>
            <div className="text-xs text-amber-300/80 italic mt-1">{clue.flavor}</div>
            <button
              onClick={() => setNewClues((prev) => prev.filter((id) => id !== clueId))}
              className="text-xs text-amber-700 mt-2 hover:text-amber-400 transition-colors"
            >
              {t("room.clue_dismiss")}
            </button>
          </div>
        );
      })}

      {/* Quest progress indicator — map-node style */}
      <div className="flex items-center gap-2 mb-5 px-1">
        {requiredQuests.map((q, i) => {
          const done = questProgress.find((qp) => qp.quest_id === q.id)?.status === "completed";
          const isActive = !allRequiredDone && i === firstIncompleteRequiredIndex;
          return (
            <div key={q.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border",
                  done
                    ? "bg-amber-800 border-amber-600 text-amber-200"
                    : isActive
                    ? "bg-stone-900 border-amber-600 text-amber-400"
                    : "bg-stone-900 border-stone-700 text-stone-600"
                )}
                style={{ fontFamily: "Georgia, serif" }}
              >
                {done ? "✓" : i + 1}
              </div>
              {i < requiredQuests.length - 1 && (
                <div className={cn("h-px w-6", done ? "bg-amber-800/60" : "bg-stone-800")} />
              )}
            </div>
          );
        })}
        {bonusQuests.length > 0 && (
          <span className="text-xs text-amber-900 ml-1" style={{ fontFamily: "Georgia, serif" }}>
            {allRequiredDone ? t("room.bonus_unlocked") : `+ ${bonusQuests.length} ${t("room.bonus_after")}`}
          </span>
        )}
      </div>

      {/* Quests */}
      <div className="space-y-4">
        {quests.map((quest) => (
          <QuestBlock
            key={quest.id}
            quest={quest}
            isComplete={isComplete(quest.id)}
            questState={getQuestState(quest.id) ?? null}
            offerDefinition={offerDef}
            gameId={gameId}
            teamId={teamId}
            isReadOnly={false}
            onComplete={(clueId) => {
              if (clueId) setNewClues((prev) => [...prev, clueId]);
              fetchData();
            }}
          />
        ))}
      </div>

      {/* All required quests done — CTA to return */}
      {allRequiredDone && (
        <div
          className="mt-5 rounded-xl border border-amber-800/50 bg-stone-950 p-5 text-center"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <div className="text-2xl mb-2">✦</div>
          <div className="font-bold text-amber-200 mb-1 tracking-wide">{t("room.all_done")}</div>
          <p className="text-xs text-amber-800/80 mb-4 italic">{t("room.all_done_sub")}</p>
          <a
            href={`/game/${gameId}/team/${teamId}`}
            className="inline-block bg-amber-900 hover:bg-amber-800 text-amber-200 font-bold px-6 py-2.5 rounded-lg transition-colors text-sm border border-amber-700/60"
          >
            {t("room.back_to_board")}
          </a>
        </div>
      )}

      {/* Discovered clues from this room */}
      {room.rewardClueIds.length > 0 && (
        <div className="mt-6">
          <h3
            className="text-xs text-amber-800 uppercase tracking-[0.2em] mb-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {t("room.room_clues")}
          </h3>
          <div className="space-y-3">
            {room.rewardClueIds.map((clueId) => {
              const clue = getClue(clueId);
              const discovered = teamClues.find((tc) => tc.clue_id === clueId);
              if (!clue) return null;
              if (!discovered) {
                return (
                  <div
                    key={clueId}
                    className="rounded-xl bg-stone-950 border border-amber-900/20 p-4 opacity-40"
                  >
                    <div className="text-amber-900 text-sm italic" style={{ fontFamily: "Georgia, serif" }}>
                      {t("room.clue_locked")}
                    </div>
                  </div>
                );
              }
              return (
                <ClueCard key={clueId} clue={clue} discoveredAt={discovered.discovered_at} />
              );
            })}
          </div>
        </div>
      )}
    </GameLayout>
  );
}

// ==========================================
// QUEST BLOCK COMPONENT
// ==========================================

function QuestBlock({
  quest,
  isComplete,
  questState,
  offerDefinition,
  gameId,
  teamId,
  isReadOnly,
  onComplete,
}: {
  quest: Quest;
  isComplete: boolean;
  questState: DbQuestProgress | null;
  offerDefinition: string;
  gameId: string;
  teamId: TeamId;
  isReadOnly: boolean;
  onComplete: (clueId?: string) => void;
}) {
  const { t } = useLanguage();
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [shownHints, setShownHints] = useState<{ order: number; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const hintsUsed = questState?.hints_used ?? 0;

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    const result = await submitQuestAnswer(gameId, teamId, quest.id, answer);
    setLoading(false);
    if (result.success) {
      if (result.data.correct) {
        setFeedback({ type: "success", text: result.data.rewardText ?? "Correct!" });
        onComplete(result.data.clueId);
      } else {
        setFeedback({ type: "error", text: result.data.failureText ?? "Wrong answer. Try again." });
      }
    }
  };

  const handleCompleteChoice = async (choiceId: string) => {
    setLoading(true);
    const result = await completeQuest(gameId, teamId, quest.id, choiceId);
    setLoading(false);
    if (result.success) {
      setFeedback({ type: "success", text: result.data.rewardText ?? "Choice recorded." });
      onComplete(result.data.clueId);
    }
  };

  const handleCompleteUnlock = async () => {
    setLoading(true);
    const result = await completeQuest(gameId, teamId, quest.id);
    setLoading(false);
    if (result.success) {
      setFeedback({ type: "success", text: result.data.rewardText ?? "Unlocked!" });
      onComplete(result.data.clueId);
    }
  };

  const handleUseSocial = async () => {
    setLoading(true);
    const result = await completeQuest(gameId, teamId, quest.id);
    setLoading(false);
    if (result.success) {
      setFeedback({ type: "success", text: result.data.rewardText ?? "Challenge accepted!" });
      onComplete(result.data.clueId);
    }
  };

  const handleUseHint = async (hintOrder: number) => {
    setLoading(true);
    const result = await useHint(gameId, teamId, quest.id, hintOrder);
    setLoading(false);
    if (result.success) {
      setShownHints((prev) => [...prev, { order: hintOrder, text: result.data.hintText }]);
    }
  };

  // Quest type label
  const questTypeLabel = t(`room.quest_type.${quest.type}`) ?? quest.type.replace("_", " ");

  // Social challenges are optional bonus quests — can be dismissed
  if (!isComplete && quest.type === "social_challenge" && skipped) {
    return (
      <div
        className="rounded-xl border border-amber-900/20 px-4 py-2 flex items-center justify-between bg-stone-950/50"
        style={{ fontFamily: "Georgia, serif" }}
      >
        <span className="text-xs text-amber-900 italic">{quest.title} — {t("room.skipped")}</span>
        <button
          onClick={() => setSkipped(false)}
          className="text-xs text-amber-800 hover:text-amber-500 transition-colors"
        >
          {t("room.show")}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-3 transition-all",
        isComplete
          ? "bg-stone-950 border-amber-900/30 opacity-75"
          : quest.isRequired
          ? "bg-stone-950 border-amber-800/50"
          : "bg-stone-950/60 border-stone-800"
      )}
    >
      {/* Quest header — parchment dossier style */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3
              className="font-bold text-amber-100 text-sm"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {quest.title}
            </h3>
            {quest.isRequired && !isComplete && (
              <span
                className="text-xs bg-amber-900/40 text-amber-600 px-1.5 py-0.5 rounded border border-amber-800/50"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {t("room.required")}
              </span>
            )}
            {isComplete && (
              <span
                className="text-xs bg-stone-900 text-amber-700 px-1.5 py-0.5 rounded border border-amber-900/30"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {t("room.done")}
              </span>
            )}
          </div>
          <p
            className="text-xs text-amber-900 capitalize"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {questTypeLabel}
          </p>
        </div>
      </div>

      <p className="text-sm text-stone-300 leading-relaxed">{quest.description}</p>

      {!isComplete && (
        <div className="rounded-lg bg-stone-900 border border-amber-900/30 px-3 py-2.5">
          <p className="text-sm text-amber-100/80 italic" style={{ fontFamily: "Georgia, serif" }}>
            {quest.prompt}
          </p>
        </div>
      )}

      {feedback && (
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm border",
            feedback.type === "success"
              ? "bg-stone-950 border-amber-800/50 text-amber-300"
              : "bg-red-950/30 border-red-900/50 text-red-300"
          )}
          style={{ fontFamily: "Georgia, serif" }}
        >
          {feedback.text}
        </div>
      )}

      {shownHints.map((h) => (
        <div
          key={h.order}
          className="rounded-lg bg-amber-950/20 border border-amber-900/40 px-3 py-2 text-sm text-amber-200"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <span className="text-xs text-amber-700 font-medium mr-1">{t("room.hint")} {h.order}:</span>
          {h.text}
        </div>
      ))}

      {!isComplete && !isReadOnly && (
        <div className="space-y-2">
          {quest.type === "puzzle" && quest.answer && (
            <div className="flex gap-2">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                placeholder={t("room.answer_placeholder")}
                className="flex-1 bg-stone-900 border border-amber-900/40 rounded-lg px-3 py-2 text-amber-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700 placeholder-amber-900"
              />
              <Button size="sm" onClick={handleSubmitAnswer} loading={loading}>
                {t("room.submit")}
              </Button>
            </div>
          )}

          {quest.type === "choice" && quest.choices && (
            <div className="space-y-2">
              {quest.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleCompleteChoice(choice.id)}
                  disabled={loading}
                  className="w-full rounded-lg bg-stone-900 hover:bg-stone-800 border border-amber-900/30 hover:border-amber-800/50 px-3 py-2 text-left text-sm text-stone-200 transition-colors disabled:opacity-50"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  <div className="font-medium text-amber-100">{choice.label}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{choice.description}</div>
                  {choice.offerCost && (
                    <div className="text-xs text-amber-700 mt-0.5">🍺 {choice.offerCost} Offer</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {quest.type === "unlock" && quest.offerCost && (
            <Button variant="offer" className="w-full" onClick={handleCompleteUnlock} loading={loading}>
              {t("room.pay_offer")} {quest.offerCost} {t("room.offer_label")} ({offerDefinition})
            </Button>
          )}

          {quest.type === "social_challenge" && (
            <div className="space-y-2">
              <Button variant="secondary" className="w-full" onClick={handleUseSocial} loading={loading}>
                {t("room.challenge_done")}
              </Button>
              <button
                onClick={() => setSkipped(true)}
                className="w-full text-xs text-amber-900 hover:text-amber-700 transition-colors py-1.5"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {t("room.skip")}
              </button>
            </div>
          )}

          {quest.hints.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {quest.hints.map((hint) => {
                const alreadyShown = shownHints.find((h) => h.order === hint.order);
                if (alreadyShown) return null;
                if (hint.order <= hintsUsed) return null;
                const maxUsed = Math.max(hintsUsed, shownHints.length > 0 ? Math.max(...shownHints.map(h => h.order)) : 0);
                if (hint.order > maxUsed + 1) return null;
                return (
                  <button
                    key={hint.order}
                    onClick={() => handleUseHint(hint.order)}
                    disabled={loading}
                    className="text-xs bg-stone-900 hover:bg-stone-800 text-amber-700 border border-amber-900/40 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    🍺 {t("room.hint")} {hint.order} ({hint.offerCost} Offer)
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
