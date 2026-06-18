"use client";

import { useEffect, useState, useCallback } from "react";
import { submitQuestAnswer, completeQuest, useHint } from "@/lib/game/actions";
import { GameLayout } from "@/components/layout/GameLayout";
import { Button } from "@/components/ui/Button";
import { ClueCard } from "@/components/game/ClueCard";
import { RoomScene } from "@/components/game/RoomScene";
import { getRoom, getQuestsByRoom, getClue } from "@/content/index";
import { localizeRoom, localizeQuests } from "@/lib/content/localize";
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
  const { t, lang } = useLanguage();

  const [game, setGame] = useState<DbGame | null>(null);
  const [questProgress, setQuestProgress] = useState<DbQuestProgress[]>([]);
  const [teamClues, setTeamClues] = useState<DbTeamClue[]>([]);
  const [newClues, setNewClues] = useState<string[]>([]);

  // Entry animation — triggers once on mount
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 30);
    return () => clearTimeout(t);
  }, []);

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

  const rawRoom = roomId ? getRoom(roomId) : null;
  const room = rawRoom ? localizeRoom(rawRoom, lang) : null;
  const allQuests = rawRoom ? localizeQuests(getQuestsByRoom(rawRoom.id, teamId), lang) : [];

  // Sequential logic: show only the active quest (first incomplete required quest).
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
      title=""
    >
      {/* ── Entry animation wrapper ── */}
      <div
        className={cn(
          "transition-all duration-500 ease-out",
          entered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-1 scale-[1.015]"
        )}
      >
        {/* ── Room Scene — full-bleed atmospheric header ── */}
        <div className="mb-5 rounded-xl overflow-hidden shadow-2xl">
          <RoomScene room={room} />
        </div>

        {/* ── Quest progress trail — map-node style ── */}
        {requiredQuests.length > 1 && (
          <div className="flex items-center gap-2 mb-5 px-1">
            {requiredQuests.map((q, i) => {
              const done = questProgress.find((qp) => qp.quest_id === q.id)?.status === "completed";
              const isActive = !allRequiredDone && i === firstIncompleteRequiredIndex;
              return (
                <div key={q.id} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300",
                      done
                        ? "bg-amber-800 border-amber-600 text-amber-200"
                        : isActive
                        ? "bg-stone-900 border-amber-600 text-amber-400 shadow-[0_0_8px_rgba(217,119,6,0.3)]"
                        : "bg-stone-900 border-stone-700 text-stone-600"
                    )}
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  {i < requiredQuests.length - 1 && (
                    <div className={cn("h-px w-6 transition-all duration-500", done ? "bg-amber-800/60" : "bg-stone-800")} />
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
        )}

        {/* New clue notification */}
        {newClues.map((clueId) => {
          const clue = getClue(clueId);
          if (!clue) return null;
          return (
            <div
              key={clueId}
              className="rounded-xl bg-amber-950/80 border-2 border-amber-600/70 p-4 mb-4 animate-quest-in"
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

        {/* ── Quest artifacts — cascade in with stagger ── */}
        <div className="space-y-5">
          {quests.map((quest, idx) => (
            <div
              key={quest.id}
              className="animate-quest-in"
              style={{ animationDelay: `${idx * 90 + 120}ms` }}
            >
              <QuestBlock
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
            </div>
          ))}
        </div>

        {/* All required quests done — CTA to return */}
        {allRequiredDone && (
          <div
            className="mt-6 rounded-xl border border-amber-800/50 bg-stone-950 p-5 text-center animate-quest-in"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <div className="text-2xl mb-2 animate-flame inline-block">✦</div>
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
                return <ClueCard key={clueId} clue={clue} discoveredAt={discovered.discovered_at} />;
              })}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}

// ============================================================
// QUEST BLOCK — styled as in-world physical artifacts
// Each quest type gets its own look: sticky note, ballot,
// wax-seal document, or pinned flyer.
// ============================================================

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

  // Dismissed social challenge
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

  // ── PUZZLE → sticky note ──
  if (quest.type === "puzzle") {
    return (
      <StickyNoteArtifact
        quest={quest}
        isComplete={isComplete}
        feedback={feedback}
        shownHints={shownHints}
        answer={answer}
        loading={loading}
        isReadOnly={isReadOnly}
        hintsUsed={hintsUsed}
        onAnswerChange={setAnswer}
        onSubmit={handleSubmitAnswer}
        onHint={handleUseHint}
        t={t}
      />
    );
  }

  // ── CHOICE → ballot / options sheet ──
  if (quest.type === "choice") {
    return (
      <BallotArtifact
        quest={quest}
        isComplete={isComplete}
        feedback={feedback}
        loading={loading}
        isReadOnly={isReadOnly}
        onChoose={handleCompleteChoice}
        t={t}
      />
    );
  }

  // ── UNLOCK → wax-seal document ──
  if (quest.type === "unlock") {
    return (
      <SealedDocArtifact
        quest={quest}
        isComplete={isComplete}
        feedback={feedback}
        loading={loading}
        isReadOnly={isReadOnly}
        offerDefinition={offerDefinition}
        onUnlock={handleCompleteUnlock}
        t={t}
      />
    );
  }

  // ── SOCIAL CHALLENGE → pinned torn flyer ──
  if (quest.type === "social_challenge") {
    return (
      <TornFlyerArtifact
        quest={quest}
        isComplete={isComplete}
        feedback={feedback}
        loading={loading}
        isReadOnly={isReadOnly}
        onComplete={handleUseSocial}
        onSkip={() => setSkipped(true)}
        t={t}
      />
    );
  }

  // ── FALLBACK for other quest types (clue_check, boss_phase) ──
  return (
    <FallbackArtifact
      quest={quest}
      isComplete={isComplete}
      feedback={feedback}
      t={t}
    />
  );
}

// ============================================================
// ARTIFACT COMPONENTS
// ============================================================

// ── Sticky Note — puzzle quests ──
function StickyNoteArtifact({
  quest, isComplete, feedback, shownHints, answer, loading, isReadOnly,
  hintsUsed, onAnswerChange, onSubmit, onHint, t,
}: {
  quest: Quest;
  isComplete: boolean;
  feedback: { type: "success" | "error"; text: string } | null;
  shownHints: { order: number; text: string }[];
  answer: string;
  loading: boolean;
  isReadOnly: boolean;
  hintsUsed: number;
  onAnswerChange: (v: string) => void;
  onSubmit: () => void;
  onHint: (order: number) => void;
  t: (key: string) => string;
}) {
  // Slight random rotation — feels physical, not digital
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
          : "0 4px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4)",
      }}
    >
      {/* Tape strip at top */}
      {!isComplete && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 rounded-sm"
          style={{ background: "rgba(220,200,140,0.35)", border: "1px solid rgba(220,200,140,0.2)" }}
        />
      )}

      {/* Note body */}
      <div className="p-4 pt-5">
        {/* Ruled lines behind text */}
        {!isComplete && (
          <div className="absolute inset-0 pt-9 px-4 pb-4 pointer-events-none overflow-hidden rounded-sm">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-5 border-b border-amber-700/20" />
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-2 mb-2 relative">
          {isComplete && <span className="text-amber-600 text-lg">✓</span>}
          <span
            className="text-xs uppercase tracking-widest"
            style={{
              fontFamily: "Georgia, serif",
              color: isComplete ? "rgb(120,80,20)" : "rgba(60,35,5,0.7)",
            }}
          >
            {isComplete ? t("room.done") : (quest.isRequired ? t("room.required") : "Bonus")}
          </span>
        </div>

        <h3
          className="font-bold mb-2 leading-tight relative"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "1rem",
            color: isComplete ? "rgba(180,130,50,0.8)" : "rgba(40,20,0,0.95)",
          }}
        >
          {quest.title}
        </h3>

        <p
          className="text-sm mb-3 leading-relaxed relative"
          style={{
            fontFamily: "Georgia, serif",
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
              style={{ fontFamily: "Georgia, serif", color: "rgba(30,15,0,0.9)", fontWeight: 600 }}
            >
              {quest.prompt}
            </p>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div
            className={cn(
              "rounded-sm px-3 py-2 text-sm mb-3 relative",
              feedback.type === "success"
                ? "bg-green-950/40 border border-green-800/40 text-green-300"
                : "bg-red-950/30 border border-red-900/40 text-red-300"
            )}
            style={{ fontFamily: "Georgia, serif" }}
          >
            {feedback.text}
          </div>
        )}

        {/* Hints revealed */}
        {shownHints.map((h) => (
          <div
            key={h.order}
            className="rounded-sm px-3 py-2 text-sm mb-2 relative"
            style={{
              background: "rgba(0,0,0,0.15)",
              border: "1px solid rgba(0,0,0,0.1)",
              fontFamily: "Georgia, serif",
              color: "rgba(30,15,0,0.8)",
            }}
          >
            <span className="font-bold text-xs mr-1">{t("room.hint")} {h.order}:</span>
            {h.text}
          </div>
        ))}

        {/* Answer input */}
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
                fontFamily: "Georgia, serif",
              }}
            />
            <Button size="sm" onClick={onSubmit} loading={loading}
              className="!bg-stone-900/60 !text-amber-200 !border-stone-700 hover:!bg-stone-800"
            >
              {t("room.submit")}
            </Button>
          </div>
        )}

        {/* Hint buttons */}
        {!isComplete && !isReadOnly && quest.hints.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 relative">
            {quest.hints.map((hint) => {
              const alreadyShown = shownHints.find((h) => h.order === hint.order);
              if (alreadyShown) return null;
              if (hint.order <= hintsUsed) return null;
              const maxUsed = Math.max(hintsUsed, shownHints.length > 0 ? Math.max(...shownHints.map(h => h.order)) : 0);
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
                    fontFamily: "Georgia, serif",
                  }}
                >
                  🍺 {t("room.hint")} {hint.order} ({hint.offerCost} Offer)
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Paper curl bottom-right corner */}
      {!isComplete && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none"
          style={{
            background: "linear-gradient(225deg, rgba(0,0,0,0.25) 45%, transparent 55%)",
            borderRadius: "0 0 2px 0",
          }}
        />
      )}
    </div>
  );
}

// ── Ballot / options sheet — choice quests ──
function BallotArtifact({
  quest, isComplete, feedback, loading, isReadOnly, onChoose, t,
}: {
  quest: Quest;
  isComplete: boolean;
  feedback: { type: "success" | "error"; text: string } | null;
  loading: boolean;
  isReadOnly: boolean;
  onChoose: (id: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div
      className={cn(
        "rounded-sm shadow-lg overflow-hidden transition-all duration-300",
        isComplete ? "opacity-70" : ""
      )}
      style={{
        background: "linear-gradient(160deg, #1a1410 0%, #141008 100%)",
        border: "1px solid rgba(180,130,50,0.25)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(180,130,50,0.08)",
      }}
    >
      {/* Top header bar */}
      <div
        className="px-4 py-2 flex items-center gap-2 border-b"
        style={{ borderColor: "rgba(180,130,50,0.15)", background: "rgba(180,130,50,0.05)" }}
      >
        <span className="text-amber-700 text-sm">📋</span>
        <span
          className="text-xs uppercase tracking-widest text-amber-700/70"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {isComplete ? t("room.done") : t("room.quest_type.choice")}
        </span>
        {quest.isRequired && !isComplete && (
          <span
            className="ml-auto text-xs bg-amber-900/40 text-amber-600 px-1.5 py-0.5 rounded border border-amber-800/50"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {t("room.required")}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3
          className="font-bold text-amber-100 leading-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {quest.title}
        </h3>
        <p className="text-sm text-stone-300 leading-relaxed">{quest.description}</p>

        {!isComplete && (
          <div
            className="rounded-sm px-3 py-2.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(180,130,50,0.12)" }}
          >
            <p className="text-sm text-amber-100/80 italic" style={{ fontFamily: "Georgia, serif" }}>
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
            style={{ fontFamily: "Georgia, serif" }}
          >
            {feedback.text}
          </div>
        )}

        {!isComplete && !isReadOnly && quest.choices && (
          <div className="space-y-2">
            {quest.choices.map((choice, i) => (
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
                  {/* Ballot checkbox */}
                  <div
                    className="mt-0.5 w-4 h-4 rounded-sm flex-shrink-0 group-hover:border-amber-600/60 transition-colors"
                    style={{ border: "1px solid rgba(180,130,50,0.4)", background: "rgba(0,0,0,0.3)" }}
                  >
                    <div className="w-full h-full rounded-sm group-hover:bg-amber-800/20 transition-colors" />
                  </div>
                  <div>
                    <div
                      className="text-sm font-medium text-amber-100 group-hover:text-amber-200 transition-colors"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {choice.label}
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">{choice.description}</div>
                    {choice.offerCost && (
                      <div className="text-xs text-amber-700 mt-0.5">🍺 {choice.offerCost} Offer</div>
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

// ── Sealed document — unlock quests ──
function SealedDocArtifact({
  quest, isComplete, feedback, loading, isReadOnly, offerDefinition, onUnlock, t,
}: {
  quest: Quest;
  isComplete: boolean;
  feedback: { type: "success" | "error"; text: string } | null;
  loading: boolean;
  isReadOnly: boolean;
  offerDefinition: string;
  onUnlock: () => void;
  t: (key: string) => string;
}) {
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
          : "0 6px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(180,130,50,0.15)",
      }}
    >
      {/* Decorative top border line */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(180,130,50,0.4), transparent)" }}
      />

      <div className="p-5">
        {/* Wax seal motif — centered top */}
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg",
              isComplete ? "opacity-50" : "animate-cold-pulse"
            )}
            style={{
              background: "radial-gradient(circle, #7c2d12 0%, #450a00 70%)",
              border: "2px solid rgba(220,100,30,0.4)",
              boxShadow: "0 2px 8px rgba(180,50,0,0.4), inset 0 1px 0 rgba(255,150,50,0.2)",
            }}
          >
            {isComplete ? "✓" : "🔒"}
          </div>
        </div>

        {/* Decorative rule */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.2)" }} />
          <span className="text-amber-900/60 text-xs" style={{ fontFamily: "Georgia, serif" }}>✦</span>
          <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.2)" }} />
        </div>

        <h3
          className="font-bold text-center mb-2 leading-tight"
          style={{ fontFamily: "Georgia, serif", color: isComplete ? "rgba(180,130,50,0.6)" : "rgb(251,191,36)" }}
        >
          {quest.title}
        </h3>

        <p
          className="text-sm text-center mb-3 leading-relaxed"
          style={{ color: isComplete ? "rgba(120,90,40,0.7)" : "rgba(200,160,80,0.8)", fontFamily: "Georgia, serif" }}
        >
          {quest.description}
        </p>

        {!isComplete && (
          <p
            className="text-xs text-center italic mb-4"
            style={{ color: "rgba(180,120,40,0.6)", fontFamily: "Georgia, serif" }}
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
            style={{ fontFamily: "Georgia, serif" }}
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

      {/* Decorative bottom border line */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(180,130,50,0.4), transparent)" }}
      />
    </div>
  );
}

// ── Torn flyer — social challenge quests ──
function TornFlyerArtifact({
  quest, isComplete, feedback, loading, isReadOnly, onComplete, onSkip, t,
}: {
  quest: Quest;
  isComplete: boolean;
  feedback: { type: "success" | "error"; text: string } | null;
  loading: boolean;
  isReadOnly: boolean;
  onComplete: () => void;
  onSkip: () => void;
  t: (key: string) => string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-sm shadow-lg overflow-visible transition-all duration-300",
        isComplete ? "opacity-70" : ""
      )}
    >
      {/* Pin at top */}
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

      {/* Torn top edge */}
      <div
        className="relative artifact-torn overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1e1410 0%, #181008 100%)",
          border: "1px solid rgba(180,130,50,0.2)",
          borderRadius: "2px",
        }}
      >
        {/* Slight paper texture bands */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          {[10, 25, 40, 55, 70, 85].map(y => (
            <div key={y} className="absolute left-0 right-0 h-px bg-amber-400" style={{ top: `${y}%` }} />
          ))}
        </div>

        <div className="p-4 pt-6">
          {/* Group challenge badge */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="text-xs px-2 py-1 rounded-sm"
              style={{
                background: "rgba(180,50,50,0.2)",
                border: "1px solid rgba(180,50,50,0.3)",
                color: "rgb(252,165,165)",
                fontFamily: "Georgia, serif",
              }}
            >
              👥 {t("room.quest_type.social_challenge")}
            </div>
            {isComplete && (
              <span className="text-xs text-amber-700 ml-auto" style={{ fontFamily: "Georgia, serif" }}>
                {t("room.done")}
              </span>
            )}
          </div>

          <h3
            className="font-bold text-amber-100 mb-2 leading-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {quest.title}
          </h3>

          <p className="text-sm text-stone-300 leading-relaxed mb-3">{quest.description}</p>

          {!isComplete && (
            <div
              className="rounded-sm px-3 py-2.5 mb-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(180,130,50,0.12)" }}
            >
              <p className="text-sm text-amber-100/80 italic" style={{ fontFamily: "Georgia, serif" }}>
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
              style={{ fontFamily: "Georgia, serif" }}
            >
              {feedback.text}
            </div>
          )}

          {!isComplete && !isReadOnly && (
            <div className="space-y-2">
              <Button variant="secondary" className="w-full" onClick={onComplete} loading={loading}>
                {t("room.challenge_done")}
              </Button>
              <button
                onClick={onSkip}
                className="w-full text-xs text-amber-900 hover:text-amber-700 transition-colors py-1.5"
                style={{ fontFamily: "Georgia, serif" }}
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

// ── Generic fallback ──
function FallbackArtifact({
  quest, isComplete, feedback, t,
}: {
  quest: Quest;
  isComplete: boolean;
  feedback: { type: "success" | "error"; text: string } | null;
  t: (key: string) => string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-3",
        isComplete
          ? "bg-stone-950 border-amber-900/30 opacity-75"
          : "bg-stone-950 border-amber-800/50"
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <h3 className="font-bold text-amber-100 text-sm" style={{ fontFamily: "Georgia, serif" }}>
            {quest.title}
          </h3>
          {isComplete && (
            <span className="text-xs text-amber-700" style={{ fontFamily: "Georgia, serif" }}>
              {t("room.done")}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-stone-300 leading-relaxed">{quest.description}</p>
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
    </div>
  );
}
