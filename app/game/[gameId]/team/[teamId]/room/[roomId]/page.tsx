"use client";

import { useEffect, useState, useCallback } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { submitQuestAnswer, completeQuest, useHint } from "@/lib/game/actions";
import { GameLayout } from "@/components/layout/GameLayout";
import { Button } from "@/components/ui/Button";
import { ClueCard } from "@/components/game/ClueCard";
import { getRoom, getQuestsByRoom, getClue } from "@/content/index";
import type { DbGame, DbQuestProgress, DbTeamClue } from "@/types/database";
import type { TeamId, Quest } from "@/types/content";
import { cn } from "@/lib/utils";

interface Props {
  params: { gameId: string; teamId: TeamId; roomId: string };
}

export default function RoomPage({ params }: Props) {
  const gameId = params.gameId;
  const teamId = params.teamId;
  const roomId = params.roomId;

  const { session } = usePlayer();

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
      {/* Room header */}
      <div
        className={cn(
          "rounded-xl p-5 mb-5 border bg-gradient-to-br",
          room.look.colorFrom,
          room.look.colorTo,
          "border-white/10"
        )}
      >
        <div className="text-4xl mb-2">{room.look.icon}</div>
        <h1 className="text-2xl font-bold text-white font-game mb-2">{room.title}</h1>
        <p className="text-sm text-stone-300 leading-relaxed">{room.description}</p>
        <p className="text-xs text-stone-400 mt-3 italic">{room.look.atmosphere}</p>
      </div>

      {/* New clue notification */}
      {newClues.map((clueId) => {
        const clue = getClue(clueId);
        if (!clue) return null;
        return (
          <div
            key={clueId}
            className="rounded-xl bg-amber-950 border-2 border-amber-500 p-4 mb-4 animate-pulse-slow"
          >
            <div className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-1">
              🔍 New Clue Found!
            </div>
            <div className="font-bold text-amber-300">{clue.title}</div>
            <div className="text-xs text-amber-200 italic mt-1">{clue.flavor}</div>
            <button
              onClick={() => setNewClues((prev) => prev.filter((id) => id !== clueId))}
              className="text-xs text-amber-500 mt-2 hover:text-amber-300"
            >
              Dismiss
            </button>
          </div>
        );
      })}

      {/* Quest progress indicator */}
      <div className="flex items-center gap-2 mb-4">
        {requiredQuests.map((q, i) => {
          const done = questProgress.find((qp) => qp.quest_id === q.id)?.status === "completed";
          const isActive = !allRequiredDone && i === firstIncompleteRequiredIndex;
          return (
            <div key={q.id} className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border",
                done ? "bg-green-700 border-green-500 text-white" :
                isActive ? "bg-amber-600 border-amber-400 text-white" :
                "bg-stone-800 border-stone-600 text-stone-500"
              )}>
                {done ? "✓" : i + 1}
              </div>
              {i < requiredQuests.length - 1 && (
                <div className={cn("h-px w-6", done ? "bg-green-700" : "bg-stone-700")} />
              )}
            </div>
          );
        })}
        {bonusQuests.length > 0 && (
          <span className="text-xs text-stone-500 ml-1">
            {allRequiredDone ? "+ bonus unlocked" : `+ ${bonusQuests.length} bonus after`}
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
            isReadOnly={session?.teamId != null && session.teamId !== teamId}
            onComplete={(clueId) => {
              if (clueId) setNewClues((prev) => [...prev, clueId]);
              fetchData();
            }}
          />
        ))}
      </div>

      {/* Discovered clues from this room */}
      {room.rewardClueIds.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs text-stone-500 uppercase tracking-widest mb-2 font-medium">
            Room Clues
          </h3>
          <div className="space-y-3">
            {room.rewardClueIds.map((clueId) => {
              const clue = getClue(clueId);
              const discovered = teamClues.find((tc) => tc.clue_id === clueId);
              if (!clue) return null;
              if (!discovered) {
                return (
                  <div key={clueId} className="rounded-xl bg-stone-900 border border-stone-700 p-4 opacity-40">
                    <div className="text-stone-500 text-sm italic">🔒 Clue not yet found</div>
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
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [shownHints, setShownHints] = useState<{ order: number; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-3 transition-all",
        isComplete
          ? "bg-green-950/30 border-green-800/50"
          : quest.isRequired
          ? "bg-stone-800 border-stone-600"
          : "bg-stone-800/50 border-stone-700"
      )}
    >
      {/* Quest header */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-white text-sm">{quest.title}</h3>
            {quest.isRequired && !isComplete && (
              <span className="text-xs bg-amber-800/50 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700/50">
                Required
              </span>
            )}
            {isComplete && (
              <span className="text-xs bg-green-800/50 text-green-300 px-1.5 py-0.5 rounded border border-green-700/50">
                ✓ Done
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 capitalize">{quest.type.replace("_", " ")}</p>
        </div>
      </div>

      <p className="text-sm text-stone-300 leading-relaxed">{quest.description}</p>

      {!isComplete && (
        <div className="rounded-lg bg-black/20 border border-white/10 px-3 py-2">
          <p className="text-sm text-stone-200 italic">{quest.prompt}</p>
        </div>
      )}

      {feedback && (
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm border",
            feedback.type === "success"
              ? "bg-green-950/50 border-green-700 text-green-300"
              : "bg-red-950/50 border-red-700 text-red-300"
          )}
        >
          {feedback.text}
        </div>
      )}

      {shownHints.map((h) => (
        <div key={h.order} className="rounded-lg bg-amber-950/30 border border-amber-800/50 px-3 py-2 text-sm text-amber-200">
          <span className="text-xs text-amber-500 font-medium mr-1">Hint {h.order}:</span>
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
                placeholder="Your answer…"
                className="flex-1 bg-stone-700 border border-stone-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <Button size="sm" onClick={handleSubmitAnswer} loading={loading}>
                Submit
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
                  className="w-full rounded-lg bg-stone-700 hover:bg-stone-600 border border-stone-500 px-3 py-2 text-left text-sm text-white transition-colors disabled:opacity-50"
                >
                  <div className="font-medium">{choice.label}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{choice.description}</div>
                  {choice.offerCost && (
                    <div className="text-xs text-amber-400 mt-0.5">🍺 {choice.offerCost} Offer if chosen</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {quest.type === "unlock" && quest.offerCost && (
            <Button variant="offer" className="w-full" onClick={handleCompleteUnlock} loading={loading}>
              🍺 Pay {quest.offerCost} Offer ({offerDefinition})
            </Button>
          )}

          {quest.type === "social_challenge" && (
            <Button variant="secondary" className="w-full" onClick={handleUseSocial} loading={loading}>
              ✓ Challenge Complete (Group Approved)
            </Button>
          )}

          {quest.hints.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {quest.hints.map((hint) => {
                const alreadyShown = shownHints.find((h) => h.order === hint.order);
                // Hide if already shown in this session
                if (alreadyShown) return null;
                // Hide if already purchased (from DB)
                if (hint.order <= hintsUsed) return null;
                // Only show the NEXT hint (order = max already used + 1).
                // This enforces sequential hint use: can't skip to hint 2 before hint 1.
                const maxUsed = Math.max(hintsUsed, shownHints.length > 0 ? Math.max(...shownHints.map(h => h.order)) : 0);
                if (hint.order > maxUsed + 1) return null;
                return (
                  <button
                    key={hint.order}
                    onClick={() => handleUseHint(hint.order)}
                    disabled={loading}
                    className="text-xs bg-stone-700/60 hover:bg-stone-700 text-amber-400 border border-amber-800/50 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                  >
                    🍺 Hint {hint.order} ({hint.offerCost} Offer)
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
