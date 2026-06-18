"use client";

import { useEffect, useState, useCallback } from "react";
import { submitQuestAnswer, completeQuest, useHint } from "@/lib/game/actions";
import { Button } from "@/components/ui/Button";
import { ClueCard } from "@/components/game/ClueCard";
import { RoomSceneFullscreen } from "@/components/game/RoomSceneFullscreen";
import { getRoom, getQuestsByRoom, getClue } from "@/content/index";
import { localizeRoom, localizeQuests } from "@/lib/content/localize";
import type { DbGame, DbQuestProgress, DbTeamClue } from "@/types/database";
import type { TeamId, Quest } from "@/types/content";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  params: { gameId: string; teamId: TeamId; roomId: string };
}

type CombatState = "idle" | "hit" | "miss";

export default function RoomPage({ params }: Props) {
  const { gameId, teamId, roomId } = params;
  const { t, lang } = useLanguage();

  const [game, setGame] = useState<DbGame | null>(null);
  const [questProgress, setQuestProgress] = useState<DbQuestProgress[]>([]);
  const [teamClues, setTeamClues] = useState<DbTeamClue[]>([]);
  const [newClues, setNewClues] = useState<string[]>([]);
  const [entered, setEntered] = useState(false);
  const [showCluesPanel, setShowCluesPanel] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(id);
  }, []);

  // Combat state
  const [combatState, setCombatState] = useState<CombatState>("idle");
  const [damageKey, setDamageKey] = useState(0);

  const triggerHit = () => {
    setCombatState("hit");
    setDamageKey((k) => k + 1);
    setTimeout(() => setCombatState("idle"), 900);
  };
  const triggerMiss = () => {
    setCombatState("miss");
    setTimeout(() => setCombatState("idle"), 550);
  };

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

  // Auto-dismiss new clue notifications
  useEffect(() => {
    if (newClues.length === 0) return;
    const id = setTimeout(() => {
      setNewClues((prev) => prev.slice(1));
    }, 5000);
    return () => clearTimeout(id);
  }, [newClues]);

  const rawRoom = roomId ? getRoom(roomId) : null;
  const room = rawRoom ? localizeRoom(rawRoom, lang) : null;
  const allQuests = rawRoom ? localizeQuests(getQuestsByRoom(rawRoom.id, teamId), lang) : [];

  const requiredQuests = allQuests.filter((q) => q.isRequired);
  const bonusQuests = allQuests.filter((q) => !q.isRequired);

  const firstIncompleteRequiredIndex = requiredQuests.findIndex(
    (q) => questProgress.find((qp) => qp.quest_id === q.id)?.status !== "completed"
  );
  const allRequiredDone = firstIncompleteRequiredIndex === -1;

  const visibleRequiredQuests = allRequiredDone
    ? requiredQuests
    : requiredQuests.slice(0, firstIncompleteRequiredIndex + 1);
  const visibleBonusQuests = allRequiredDone ? bonusQuests : [];
  const quests = [...visibleRequiredQuests, ...visibleBonusQuests];

  if (!room || !game || !gameId || !teamId) {
    return (
      <div className="fixed inset-0 bg-stone-950 flex items-center justify-center text-stone-500 text-sm">
        {gameId ? "Room not found." : "Loading…"}
      </div>
    );
  }

  const getQuestState = (questId: string) =>
    questProgress.find((qp) => qp.quest_id === questId);
  const isComplete = (questId: string) =>
    getQuestState(questId)?.status === "completed";

  const completedRequired = requiredQuests.filter((q) => isComplete(q.id)).length;
  const totalRequired = requiredQuests.length;
  const completedQuestsList = quests.filter((q) => isComplete(q.id));
  const activeQuest = quests.find((q) => !isComplete(q.id));
  const offerDef = game.offer_definition;

  // Clues for this room that team has found
  const roomClueCount = room.rewardClueIds.filter(
    (id) => teamClues.find((tc) => tc.clue_id === id)
  ).length;

  return (
    <div
      className={cn(
        "fixed inset-0 overflow-hidden",
        combatState === "miss" && "animate-scene-shake"
      )}
    >
      {/* ── Layer 1: Full-screen room scene ── */}
      <RoomSceneFullscreen
        room={room}
        combatState={combatState}
        className="absolute inset-0"
      />

      {/* ── Layer 2: Vignette overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 22%, transparent 45%, rgba(0,0,0,0.5) 68%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* ── Layer 3: Combat flash overlays ── */}
      {combatState === "hit" && (
        <div
          key={`flash-${damageKey}`}
          className="absolute inset-0 bg-green-500/25 animate-hit-flash pointer-events-none z-[2]"
        />
      )}
      {combatState === "miss" && (
        <div className="absolute inset-0 bg-red-500/20 animate-miss-flash pointer-events-none z-[2]" />
      )}

      {/* Combat damage text */}
      {combatState === "hit" && (
        <div
          key={`dmg-${damageKey}`}
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none animate-damage-float select-none z-[15]"
          style={{
            top: "22%",
            fontFamily: "Georgia, serif",
            fontSize: "1.25rem",
            fontWeight: "bold",
            color: "#86efac",
            textShadow: "0 2px 10px rgba(0,0,0,0.95), 0 0 20px rgba(34,197,94,0.6)",
            whiteSpace: "nowrap",
          }}
        >
          ⚔️ Cracked!
        </div>
      )}
      {combatState === "miss" && (
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none animate-damage-float select-none z-[15]"
          style={{
            top: "22%",
            fontFamily: "Georgia, serif",
            fontSize: "1.1rem",
            fontWeight: "bold",
            color: "#fca5a5",
            textShadow: "0 2px 10px rgba(0,0,0,0.95)",
            whiteSpace: "nowrap",
          }}
        >
          🛡 Resists!
        </div>
      )}

      {/* ── Layer 4: Top HUD ── */}
      <div
        className="absolute top-0 left-0 right-0 z-[20]"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        {/* Resistance strip — 4px across the very top */}
        {totalRequired > 0 && (
          <div
            className="w-full h-1"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <div
              className={cn(
                "h-full transition-all duration-700 ease-out",
                combatState === "hit" && "animate-hp-crack"
              )}
              style={{
                width: `${(completedRequired / totalRequired) * 100}%`,
                background: allRequiredDone
                  ? "linear-gradient(90deg, #f59e0b, #fbbf24, #fde68a)"
                  : "linear-gradient(90deg, #78350f, #d97706)",
                boxShadow:
                  completedRequired > 0
                    ? `0 0 6px rgba(217,119,6,${allRequiredDone ? 0.8 : 0.5})`
                    : "none",
              }}
            />
          </div>
        )}

        {/* HUD bar */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)",
          }}
        >
          {/* Back button */}
          <a
            href={`/game/${gameId}/team/${teamId}`}
            className="flex items-center gap-1 text-xs rounded-md px-2.5 py-1.5 transition-colors"
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(180,130,50,0.2)",
              color: "rgba(180,130,50,0.8)",
              fontFamily: "Georgia,serif",
            }}
          >
            ←
          </a>

          {/* Room name */}
          <div className="flex-1 text-center">
            <span
              className="text-sm font-bold tracking-wide"
              style={{
                fontFamily: "Georgia,serif",
                color: "rgba(245,235,200,0.95)",
                textShadow: "0 1px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)",
              }}
            >
              {room.title}
            </span>
          </div>

          {/* Clue badge — always shown if room has clues */}
          {room.rewardClueIds.length > 0 ? (
            <button
              onClick={() => setShowCluesPanel(true)}
              className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold active:scale-95 transition-transform"
              style={{
                background: roomClueCount > 0 ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.35)",
                border: roomClueCount > 0
                  ? "1px solid rgba(180,130,50,0.45)"
                  : "1px solid rgba(180,130,50,0.15)",
                color: roomClueCount > 0 ? "rgb(251,191,36)" : "rgba(180,130,50,0.4)",
                fontFamily: "Georgia,serif",
              }}
            >
              🔍 {roomClueCount > 0 ? roomClueCount : "?"}
            </button>
          ) : (
            <div className="w-14" />
          )}
        </div>
      </div>

      {/* ── Layer 5: Clue pop notifications — top-right ── */}
      {newClues.slice(0, 1).map((clueId) => {
        const clue = getClue(clueId);
        if (!clue) return null;
        return (
          <div
            key={clueId}
            className="absolute right-4 z-[30] animate-clue-pop"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 72px)", maxWidth: "56vw" }}
          >
            <div
              className="rounded-xl p-3 shadow-2xl"
              style={{
                background: "rgba(20,14,6,0.95)",
                border: "1.5px solid rgba(180,130,50,0.5)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                className="text-[9px] uppercase tracking-[0.2em] mb-0.5"
                style={{ color: "rgba(180,130,50,0.7)", fontFamily: "Georgia,serif" }}
              >
                {t("room.clue_found")}
              </div>
              <div
                className="text-xs font-bold leading-tight"
                style={{ fontFamily: "Georgia,serif", color: "rgb(251,191,36)" }}
              >
                {clue.title}
              </div>
              <button
                onClick={() => setNewClues((prev) => prev.filter((id) => id !== clueId))}
                className="text-[10px] mt-1.5"
                style={{ color: "rgba(180,130,50,0.5)", fontFamily: "Georgia,serif" }}
              >
                {t("room.clue_dismiss")} ✕
              </button>
            </div>
          </div>
        );
      })}

      {/* ── Layer 6b: Clue panel overlay ── */}
      {showCluesPanel && (
        <div
          className="absolute inset-0 z-[35]"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }}
          onClick={() => setShowCluesPanel(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 animate-sheet-up rounded-t-2xl"
            style={{
              background: "rgba(12,10,6,0.98)",
              backdropFilter: "blur(16px)",
              borderTop: "1px solid rgba(180,130,50,0.25)",
              maxHeight: "72vh",
              overflowY: "auto",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-8 h-[3px] rounded-full" style={{ background: "rgba(180,130,50,0.22)" }} />
            </div>
            <div className="px-4 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div
                    className="text-[9px] uppercase tracking-[0.25em] mb-0.5"
                    style={{ color: "rgba(180,130,50,0.45)", fontFamily: "Georgia,serif" }}
                  >
                    {room.title}
                  </div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: "rgba(245,225,170,0.9)", fontFamily: "Georgia,serif" }}
                  >
                    Clues
                  </div>
                </div>
                <button
                  onClick={() => setShowCluesPanel(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: "rgba(180,130,50,0.1)", color: "rgba(180,130,50,0.6)" }}
                >
                  ✕
                </button>
              </div>

              {/* Clues list */}
              <div className="space-y-3">
                {room.rewardClueIds.map((clueId) => {
                  const clue = getClue(clueId);
                  const discovered = teamClues.find((tc) => tc.clue_id === clueId);
                  if (!clue) return null;
                  if (!discovered) {
                    return (
                      <div
                        key={clueId}
                        className="rounded-xl p-4"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(180,130,50,0.08)",
                        }}
                      >
                        <div
                          className="text-sm italic"
                          style={{ color: "rgba(120,80,20,0.5)", fontFamily: "Georgia,serif" }}
                        >
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
          </div>
        </div>
      )}

      {/* ── Layer 6: Bottom quest sheet ── */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-[20]",
          entered ? "animate-sheet-up" : "translate-y-full opacity-60"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div
          className="rounded-t-2xl"
          style={{
            background: "rgba(10,8,5,0.93)",
            backdropFilter: "blur(14px)",
            borderTop: "1px solid rgba(180,130,50,0.18)",
            borderLeft: "1px solid rgba(180,130,50,0.08)",
            borderRight: "1px solid rgba(180,130,50,0.08)",
            maxHeight: "62vh",
            overflowY: "auto",
            overscrollBehavior: "contain",
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-2.5 pb-1">
            <div
              className="w-8 h-[3px] rounded-full"
              style={{ background: "rgba(180,130,50,0.22)" }}
            />
          </div>

          <div className="px-4 pt-1 pb-8">
            {/* ── Active quest ── */}
            {activeQuest && !allRequiredDone && (
              <div className="mb-3 animate-quest-fade">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="h-px flex-1"
                    style={{ background: "rgba(180,130,50,0.15)" }}
                  />
                  <span
                    className="text-[10px] uppercase tracking-[0.22em]"
                    style={{
                      fontFamily: "Georgia,serif",
                      color: "rgba(180,130,50,0.5)",
                    }}
                  >
                    Your Move
                  </span>
                  <div
                    className="h-px flex-1"
                    style={{ background: "rgba(180,130,50,0.15)" }}
                  />
                </div>
                <QuestBlock
                  quest={activeQuest}
                  isComplete={false}
                  questState={getQuestState(activeQuest.id) ?? null}
                  offerDefinition={offerDef}
                  gameId={gameId}
                  teamId={teamId}
                  isReadOnly={false}
                  onComplete={(clueId) => {
                    triggerHit();
                    if (clueId) setNewClues((prev) => [...prev, clueId]);
                    fetchData();
                  }}
                  onMiss={triggerMiss}
                />
              </div>
            )}

            {/* ── Bonus quests (after required done) ── */}
            {allRequiredDone && bonusQuests.length > 0 && (
              <div className="mb-3 space-y-3 animate-quest-fade">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1" style={{ background: "rgba(180,130,50,0.15)" }} />
                  <span
                    className="text-[10px] uppercase tracking-[0.22em]"
                    style={{ fontFamily: "Georgia,serif", color: "rgba(180,130,50,0.5)" }}
                  >
                    {t("room.bonus_unlocked")}
                  </span>
                  <div className="h-px flex-1" style={{ background: "rgba(180,130,50,0.15)" }} />
                </div>
                {bonusQuests.map((quest, idx) => (
                  <div key={quest.id} className="animate-quest-in" style={{ animationDelay: `${idx * 80}ms` }}>
                    <QuestBlock
                      quest={quest}
                      isComplete={isComplete(quest.id)}
                      questState={getQuestState(quest.id) ?? null}
                      offerDefinition={offerDef}
                      gameId={gameId}
                      teamId={teamId}
                      isReadOnly={false}
                      onComplete={(clueId) => {
                        triggerHit();
                        if (clueId) setNewClues((prev) => [...prev, clueId]);
                        fetchData();
                      }}
                      onMiss={triggerMiss}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── Completed quests — small chips ── */}
            {completedQuestsList.length > 0 && (
              <div className="mb-3">
                <div
                  className="text-[9px] uppercase tracking-[0.2em] mb-1.5 px-0.5"
                  style={{ fontFamily: "Georgia,serif", color: "rgba(120,80,20,0.6)" }}
                >
                  Solved
                </div>
                <div className="space-y-1">
                  {completedQuestsList.map((quest) => (
                    <div
                      key={quest.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-sm"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(120,80,20,0.12)",
                      }}
                    >
                      <span style={{ color: "rgba(180,130,50,0.6)", fontSize: "10px" }}>✓</span>
                      <span
                        className="text-xs italic flex-1"
                        style={{
                          fontFamily: "Georgia,serif",
                          color: "rgba(120,90,40,0.7)",
                        }}
                      >
                        {quest.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Room cleared — victory ── */}
            {allRequiredDone && (
              <div
                className="mt-1 rounded-xl border p-4 text-center animate-victory-in"
                style={{
                  background: "linear-gradient(160deg, #1c1208 0%, #0c0a05 100%)",
                  borderColor: "rgba(180,130,50,0.3)",
                  boxShadow: "0 0 24px rgba(180,130,40,0.1)",
                  fontFamily: "Georgia,serif",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.2)" }} />
                  <span
                    className="text-amber-600 text-base animate-flame inline-block"
                  >
                    ✦
                  </span>
                  <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.2)" }} />
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.22em] mb-0.5"
                  style={{ color: "rgba(180,130,50,0.5)" }}
                >
                  Room Cleared
                </div>
                <div
                  className="font-bold text-amber-200 text-base mb-0.5"
                >
                  {t("room.all_done")}
                </div>
                <p
                  className="text-xs italic mb-4"
                  style={{ color: "rgba(180,130,50,0.4)" }}
                >
                  {t("room.all_done_sub")}
                </p>
                <a
                  href={`/game/${gameId}/team/${teamId}`}
                  className="inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded-lg text-sm border transition-colors"
                  style={{
                    background: "rgba(120,80,20,0.3)",
                    borderColor: "rgba(180,130,50,0.35)",
                    color: "rgb(251,191,36)",
                    fontFamily: "Georgia,serif",
                  }}
                >
                  ← {t("room.back_to_board")}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// QUEST BLOCK — dispatches to artifact components
// ============================================================

function QuestBlock({
  quest, isComplete, questState, offerDefinition, gameId, teamId,
  isReadOnly, onComplete, onMiss,
}: {
  quest: Quest;
  isComplete: boolean;
  questState: DbQuestProgress | null;
  offerDefinition: string;
  gameId: string;
  teamId: TeamId;
  isReadOnly: boolean;
  onComplete: (clueId?: string) => void;
  onMiss?: () => void;
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
        onMiss?.();
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
    } else {
      onMiss?.();
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

  if (!isComplete && quest.type === "social_challenge" && skipped) {
    return (
      <div
        className="rounded-xl border px-4 py-2 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "rgba(180,130,50,0.12)",
          fontFamily: "Georgia,serif",
        }}
      >
        <span className="text-xs italic" style={{ color: "rgba(180,130,50,0.5)" }}>
          {quest.title} — {t("room.skipped")}
        </span>
        <button
          onClick={() => setSkipped(false)}
          className="text-xs"
          style={{ color: "rgba(180,130,50,0.5)" }}
        >
          {t("room.show")}
        </button>
      </div>
    );
  }

  const sharedProps = { quest, isComplete, feedback, loading, isReadOnly, shownHints, hintsUsed, t };

  if (quest.type === "puzzle") {
    return (
      <StickyNoteArtifact
        {...sharedProps}
        answer={answer}
        onAnswerChange={setAnswer}
        onSubmit={handleSubmitAnswer}
        onHint={handleUseHint}
      />
    );
  }
  if (quest.type === "choice") {
    return <BallotArtifact {...sharedProps} onChoose={handleCompleteChoice} />;
  }
  if (quest.type === "unlock") {
    return (
      <SealedDocArtifact
        {...sharedProps}
        offerDefinition={offerDefinition}
        onUnlock={handleCompleteUnlock}
      />
    );
  }
  if (quest.type === "social_challenge") {
    return (
      <TornFlyerArtifact
        {...sharedProps}
        onComplete={handleUseSocial}
        onSkip={() => setSkipped(true)}
      />
    );
  }

  return (
    <div
      className="rounded-xl border p-4 space-y-2"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: "rgba(180,130,50,0.2)",
      }}
    >
      <h3
        className="font-bold text-amber-100 text-sm"
        style={{ fontFamily: "Georgia,serif" }}
      >
        {quest.title}
      </h3>
      <p className="text-sm text-stone-300 leading-relaxed">{quest.description}</p>
    </div>
  );
}

// ─── Shared artifact prop bundle ───
interface ArtifactProps {
  quest: Quest;
  isComplete: boolean;
  feedback: { type: "success" | "error"; text: string } | null;
  loading: boolean;
  isReadOnly: boolean;
  shownHints: { order: number; text: string }[];
  hintsUsed: number;
  t: (key: string) => string;
}

// ─── Sticky Note — puzzle ──────────────────────────────────
function StickyNoteArtifact({
  quest, isComplete, feedback, shownHints, answer, loading, isReadOnly,
  hintsUsed, onAnswerChange, onSubmit, onHint, t,
}: ArtifactProps & {
  answer: string;
  onAnswerChange: (v: string) => void;
  onSubmit: () => void;
  onHint: (order: number) => void;
}) {
  const rotate = quest.id.charCodeAt(0) % 2 === 0 ? "-0.8deg" : "0.6deg";
  return (
    <div
      className={cn(
        "relative rounded-sm shadow-xl transition-all duration-300",
        isComplete ? "opacity-70 scale-[0.99]" : ""
      )}
      style={{
        transform: `rotate(${rotate})`,
        background: isComplete
          ? "linear-gradient(135deg, #3d2e10 0%, #2d2008 100%)"
          : "linear-gradient(135deg, #c8982a 0%, #b8891f 40%, #a87c18 100%)",
        boxShadow: isComplete
          ? "0 2px 8px rgba(0,0,0,0.5)"
          : "0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.1)",
      }}
    >
      {!isComplete && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 rounded-sm"
          style={{
            background: "rgba(220,200,140,0.35)",
            border: "1px solid rgba(220,200,140,0.2)",
          }}
        />
      )}
      <div className="p-4 pt-5">
        {!isComplete && (
          <div className="absolute inset-0 pt-9 px-4 pb-4 pointer-events-none overflow-hidden rounded-sm">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-5 border-b border-amber-700/20" />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 mb-2 relative">
          {isComplete && <span className="text-amber-600 text-lg">✓</span>}
          <span
            className="text-xs uppercase tracking-widest"
            style={{
              fontFamily: "Georgia,serif",
              color: isComplete ? "rgb(120,80,20)" : "rgba(60,35,5,0.7)",
            }}
          >
            {isComplete ? t("room.done") : quest.isRequired ? t("room.required") : "Bonus"}
          </span>
        </div>
        <h3
          className="font-bold mb-2 leading-tight relative"
          style={{
            fontFamily: "Georgia,serif",
            fontSize: "1rem",
            color: isComplete ? "rgba(180,130,50,0.8)" : "rgba(40,20,0,0.95)",
          }}
        >
          {quest.title}
        </h3>
        <p
          className="text-sm mb-3 leading-relaxed relative"
          style={{
            fontFamily: "Georgia,serif",
            color: isComplete ? "rgba(160,120,50,0.7)" : "rgba(50,30,5,0.85)",
          }}
        >
          {quest.description}
        </p>
        {!isComplete && (
          <div
            className="rounded-sm px-3 py-2.5 mb-3 relative"
            style={{ background: "rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <p
              className="text-sm italic leading-relaxed"
              style={{
                fontFamily: "Georgia,serif",
                color: "rgba(30,15,0,0.9)",
                fontWeight: 600,
              }}
            >
              {quest.prompt}
            </p>
          </div>
        )}
        {feedback && (
          <div
            className={cn(
              "rounded-sm px-3 py-2 text-sm mb-3 relative",
              feedback.type === "success"
                ? "bg-green-950/40 border border-green-800/40 text-green-300"
                : "bg-red-950/30 border border-red-900/40 text-red-300"
            )}
            style={{ fontFamily: "Georgia,serif" }}
          >
            {feedback.text}
          </div>
        )}
        {shownHints.map((h) => (
          <div
            key={h.order}
            className="rounded-sm px-3 py-2 text-sm mb-2 relative"
            style={{
              background: "rgba(0,0,0,0.15)",
              border: "1px solid rgba(0,0,0,0.1)",
              fontFamily: "Georgia,serif",
              color: "rgba(30,15,0,0.8)",
            }}
          >
            <span className="font-bold text-xs mr-1">
              {t("room.hint")} {h.order}:
            </span>
            {h.text}
          </div>
        ))}
        {!isComplete && !isReadOnly && quest.answer && (
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder={t("room.answer_placeholder")}
              className="flex-1 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700/50"
              style={{
                background: "rgba(0,0,0,0.15)",
                border: "1px solid rgba(0,0,0,0.2)",
                color: "rgba(30,15,0,0.9)",
                fontFamily: "Georgia,serif",
              }}
            />
            <button
              onClick={onSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm font-bold rounded-sm transition-colors disabled:opacity-50"
              style={{
                background: "rgba(0,0,0,0.25)",
                color: "rgba(20,10,0,0.85)",
                fontFamily: "Georgia,serif",
                border: "1px solid rgba(0,0,0,0.2)",
              }}
            >
              {loading ? "…" : "⚔️ Strike"}
            </button>
          </div>
        )}
        {!isComplete && !isReadOnly && quest.hints.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 relative">
            {quest.hints.map((hint) => {
              const alreadyShown = shownHints.find((h) => h.order === hint.order);
              if (alreadyShown) return null;
              if (hint.order <= hintsUsed) return null;
              const maxUsed = Math.max(
                hintsUsed,
                shownHints.length > 0 ? Math.max(...shownHints.map((h) => h.order)) : 0
              );
              if (hint.order > maxUsed + 1) return null;
              return (
                <button
                  key={hint.order}
                  onClick={() => onHint(hint.order)}
                  disabled={loading}
                  className="text-xs rounded-sm px-3 py-1.5 transition-colors disabled:opacity-50"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(0,0,0,0.15)",
                    color: "rgba(30,15,0,0.75)",
                    fontFamily: "Georgia,serif",
                  }}
                >
                  🍺 {t("room.hint")} {hint.order} ({hint.offerCost} Offer)
                </button>
              );
            })}
          </div>
        )}
      </div>
      {!isComplete && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none"
          style={{
            background:
              "linear-gradient(225deg, rgba(0,0,0,0.25) 45%, transparent 55%)",
            borderRadius: "0 0 2px 0",
          }}
        />
      )}
    </div>
  );
}

// ─── Ballot — choice ──────────────────────────────────────
function BallotArtifact({
  quest, isComplete, feedback, loading, isReadOnly, t, onChoose,
}: ArtifactProps & { onChoose: (id: string) => void }) {
  return (
    <div
      className={cn(
        "rounded-sm shadow-lg overflow-hidden transition-all duration-300",
        isComplete ? "opacity-70" : ""
      )}
      style={{
        background: "linear-gradient(160deg, #1a1410 0%, #141008 100%)",
        border: "1px solid rgba(180,130,50,0.25)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="px-4 py-2 flex items-center gap-2 border-b"
        style={{
          borderColor: "rgba(180,130,50,0.15)",
          background: "rgba(180,130,50,0.05)",
        }}
      >
        <span className="text-amber-700 text-sm">📋</span>
        <span
          className="text-xs uppercase tracking-widest text-amber-700/70"
          style={{ fontFamily: "Georgia,serif" }}
        >
          {isComplete ? t("room.done") : t("room.quest_type.choice")}
        </span>
        {quest.isRequired && !isComplete && (
          <span
            className="ml-auto text-xs bg-amber-900/40 text-amber-600 px-1.5 py-0.5 rounded border border-amber-800/50"
            style={{ fontFamily: "Georgia,serif" }}
          >
            {t("room.required")}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <h3
          className="font-bold text-amber-100 leading-tight"
          style={{ fontFamily: "Georgia,serif" }}
        >
          {quest.title}
        </h3>
        <p className="text-sm text-stone-300 leading-relaxed">{quest.description}</p>
        {!isComplete && (
          <div
            className="rounded-sm px-3 py-2.5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(180,130,50,0.12)",
            }}
          >
            <p
              className="text-sm text-amber-100/80 italic"
              style={{ fontFamily: "Georgia,serif" }}
            >
              {quest.prompt}
            </p>
          </div>
        )}
        {feedback && (
          <div
            className={cn(
              "rounded-sm px-3 py-2 text-sm",
              feedback.type === "success"
                ? "bg-green-950/40 border border-green-800/40 text-green-300"
                : "bg-red-950/30 border border-red-900/40 text-red-300"
            )}
            style={{ fontFamily: "Georgia,serif" }}
          >
            {feedback.text}
          </div>
        )}
        {!isComplete && !isReadOnly && quest.choices && (
          <div className="space-y-2">
            {quest.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onChoose(choice.id)}
                disabled={loading}
                className="w-full rounded-sm text-left transition-all duration-150 disabled:opacity-50 group"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(180,130,50,0.15)",
                  padding: "10px 12px",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 w-4 h-4 rounded-sm flex-shrink-0 group-hover:border-amber-600/60 transition-colors"
                    style={{
                      border: "1px solid rgba(180,130,50,0.4)",
                      background: "rgba(0,0,0,0.3)",
                    }}
                  />
                  <div>
                    <div
                      className="text-sm font-medium text-amber-100 group-hover:text-amber-200 transition-colors"
                      style={{ fontFamily: "Georgia,serif" }}
                    >
                      {choice.label}
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">{choice.description}</div>
                    {choice.offerCost && (
                      <div className="text-xs text-amber-700 mt-0.5">
                        🍺 {choice.offerCost} Offer
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sealed doc — unlock ───────────────────────────────────
function SealedDocArtifact({
  quest, isComplete, feedback, loading, isReadOnly, offerDefinition, t, onUnlock,
}: ArtifactProps & { offerDefinition: string; onUnlock: () => void }) {
  return (
    <div
      className={cn(
        "relative rounded-sm shadow-xl overflow-hidden transition-all duration-300",
        isComplete ? "opacity-70" : ""
      )}
      style={{
        background: "linear-gradient(160deg, #1c1208 0%, #120d05 100%)",
        border: isComplete
          ? "1px solid rgba(120,80,20,0.3)"
          : "1px solid rgba(180,130,50,0.35)",
        boxShadow: isComplete
          ? "0 2px 8px rgba(0,0,0,0.4)"
          : "0 6px 20px rgba(0,0,0,0.6)",
      }}
    >
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(180,130,50,0.4), transparent)",
        }}
      />
      <div className="p-5">
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg",
              isComplete ? "opacity-50" : "animate-cold-pulse"
            )}
            style={{
              background: "radial-gradient(circle, #7c2d12 0%, #450a00 70%)",
              border: "2px solid rgba(220,100,30,0.4)",
              boxShadow: "0 2px 8px rgba(180,50,0,0.4)",
            }}
          >
            {isComplete ? "✓" : "🔒"}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.2)" }} />
          <span
            className="text-amber-900/60 text-xs"
            style={{ fontFamily: "Georgia,serif" }}
          >
            ✦
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.2)" }} />
        </div>
        <h3
          className="font-bold text-center mb-2 leading-tight"
          style={{
            fontFamily: "Georgia,serif",
            color: isComplete ? "rgba(180,130,50,0.6)" : "rgb(251,191,36)",
          }}
        >
          {quest.title}
        </h3>
        <p
          className="text-sm text-center mb-3 leading-relaxed"
          style={{
            color: isComplete ? "rgba(120,90,40,0.7)" : "rgba(200,160,80,0.8)",
            fontFamily: "Georgia,serif",
          }}
        >
          {quest.description}
        </p>
        {!isComplete && (
          <p
            className="text-xs text-center italic mb-4"
            style={{ color: "rgba(180,120,40,0.6)", fontFamily: "Georgia,serif" }}
          >
            {quest.prompt}
          </p>
        )}
        {feedback && (
          <div
            className={cn(
              "rounded-sm px-3 py-2 text-sm mb-3 text-center",
              feedback.type === "success"
                ? "bg-green-950/40 border border-green-800/40 text-green-300"
                : "bg-red-950/30 border border-red-900/40 text-red-300"
            )}
            style={{ fontFamily: "Georgia,serif" }}
          >
            {feedback.text}
          </div>
        )}
        {!isComplete && !isReadOnly && quest.offerCost && (
          <Button variant="offer" className="w-full" onClick={onUnlock} loading={loading}>
            {t("room.pay_offer")} {quest.offerCost} {t("room.offer_label")} ({offerDefinition})
          </Button>
        )}
      </div>
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(180,130,50,0.4), transparent)",
        }}
      />
    </div>
  );
}

// ─── Torn flyer — social challenge ─────────────────────────
function TornFlyerArtifact({
  quest, isComplete, feedback, loading, isReadOnly, t, onComplete, onSkip,
}: ArtifactProps & { onComplete: () => void; onSkip: () => void }) {
  return (
    <div
      className={cn(
        "relative rounded-sm shadow-lg overflow-visible transition-all duration-300",
        isComplete ? "opacity-70" : ""
      )}
    >
      {!isComplete && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
          <div
            className="w-4 h-4 rounded-full shadow-md"
            style={{
              background: "radial-gradient(circle at 35% 35%, #ef4444, #7f1d1d)",
              border: "1px solid rgba(239,68,68,0.5)",
            }}
          />
        </div>
      )}
      <div
        className="relative artifact-torn overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1e1410 0%, #181008 100%)",
          border: "1px solid rgba(180,130,50,0.2)",
          borderRadius: "2px",
        }}
      >
        <div className="p-4 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="text-xs px-2 py-1 rounded-sm"
              style={{
                background: "rgba(180,50,50,0.2)",
                border: "1px solid rgba(180,50,50,0.3)",
                color: "rgb(252,165,165)",
                fontFamily: "Georgia,serif",
              }}
            >
              👥 {t("room.quest_type.social_challenge")}
            </div>
            {isComplete && (
              <span
                className="text-xs text-amber-700 ml-auto"
                style={{ fontFamily: "Georgia,serif" }}
              >
                {t("room.done")}
              </span>
            )}
          </div>
          <h3
            className="font-bold text-amber-100 mb-2 leading-tight"
            style={{ fontFamily: "Georgia,serif" }}
          >
            {quest.title}
          </h3>
          <p className="text-sm text-stone-300 leading-relaxed mb-3">
            {quest.description}
          </p>
          {!isComplete && (
            <div
              className="rounded-sm px-3 py-2.5 mb-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(180,130,50,0.12)",
              }}
            >
              <p
                className="text-sm text-amber-100/80 italic"
                style={{ fontFamily: "Georgia,serif" }}
              >
                {quest.prompt}
              </p>
            </div>
          )}
          {feedback && (
            <div
              className={cn(
                "rounded-sm px-3 py-2 text-sm mb-3",
                feedback.type === "success"
                  ? "bg-green-950/40 border border-green-800/40 text-green-300"
                  : "bg-red-950/30 border border-red-900/40 text-red-300"
              )}
              style={{ fontFamily: "Georgia,serif" }}
            >
              {feedback.text}
            </div>
          )}
          {!isComplete && !isReadOnly && (
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={onComplete}
                loading={loading}
              >
                {t("room.challenge_done")}
              </Button>
              <button
                onClick={onSkip}
                className="w-full text-xs py-1.5 transition-colors"
                style={{
                  color: "rgba(180,130,50,0.4)",
                  fontFamily: "Georgia,serif",
                }}
              >
                {t("room.skip")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
