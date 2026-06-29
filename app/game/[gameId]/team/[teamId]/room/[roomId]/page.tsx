"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { submitQuestAnswer, completeQuest, useHint } from "@/lib/game/actions";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { Button } from "@/components/ui/Button";
import { ClueCard } from "@/components/game/ClueCard";
import { RoomSceneFullscreen } from "@/components/game/RoomSceneFullscreen";
import { getRoom, getQuestsByRoom, getClue } from "@/content/index";
import type { DbGame, DbQuestProgress, DbTeamClue, DbGameEvent } from "@/types/database";
import type { TeamId, Quest } from "@/types/content";
import { cn } from "@/lib/utils";

interface Props {
  params: { gameId: string; teamId: TeamId; roomId: string };
}

type CombatState = "idle" | "hit" | "miss";

import { formatOfferCost } from "@/lib/game/formatOffer";
import SlidingPuzzleQuest from "@/components/quests/SlidingPuzzleQuest";

export default function RoomPage({ params }: Props) {
  const { gameId, teamId, roomId } = params;

  const [game, setGame] = useState<DbGame | null>(null);
  const [questProgress, setQuestProgress] = useState<DbQuestProgress[]>([]);
  const [teamClues, setTeamClues] = useState<DbTeamClue[]>([]);
  // Clue banners: array of clue IDs to show in sequence
  const [clueBanners, setClueBanners] = useState<string[]>([]);
  // Toll banners: {msg, key}
  const [tollBanners, setTollBanners] = useState<{ msg: string; key: number }[]>([]);
  const tollKeyRef = useRef(0);
  const seenEventIdsRef = useRef<Set<string>>(new Set());
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

    // Detect new offer_paid events → toll banner
    const events: DbGameEvent[] = data.events ?? [];
    const g: DbGame = data.game;
    for (const ev of events) {
      if (ev.event_type === "offer_paid" && !seenEventIdsRef.current.has(ev.id)) {
        seenEventIdsRef.current.add(ev.id);
        if (seenEventIdsRef.current.size > 1) {
          // Only show after initial load
          const amount = (ev.event_data?.amount as number) ?? 1;
          const teamName =
            ev.team_id === "team-a" ? g.team_a_name : g.team_b_name;
          const offerDef = g.offer_definition;
          const label = formatOfferCost(amount, offerDef).replace(/^\d+ Offer[s]? /, "");
          const msg = `🍺 ${teamName ?? ev.team_id} paid ${amount} Offer${amount !== 1 ? "s" : ""} ${label}`;
          const key = ++tollKeyRef.current;
          setTollBanners((prev) => [...prev, { msg, key }]);
          setTimeout(() => setTollBanners((prev) => prev.filter((b) => b.key !== key)), 5000);
        }
      }
    }
    // Seed on first load
    if (seenEventIdsRef.current.size === 0) {
      events.forEach((ev) => seenEventIdsRef.current.add(ev.id));
    }
  }, [gameId, teamId, roomId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Poll every 5 seconds so all players see toll notifications
  useRealtimeGame(gameId, fetchData);

  // Auto-dismiss clue banners
  useEffect(() => {
    if (clueBanners.length === 0) return;
    const id = setTimeout(() => {
      setClueBanners((prev) => prev.slice(1));
    }, 6000);
    return () => clearTimeout(id);
  }, [clueBanners]);

  const rawRoom = roomId ? getRoom(roomId) : null;
  const room = rawRoom ?? null;
  const allQuests = rawRoom ? getQuestsByRoom(rawRoom.id, teamId) : [];

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
            "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.08) 22%, transparent 38%, rgba(0,0,0,0.2) 52%, rgba(0,0,0,0.72) 100%)",
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
        {/* Progress bar */}
        {totalRequired > 0 && (
          <div className="w-full h-1" style={{ background: "rgba(0,0,0,0.4)" }}>
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
            background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)",
          }}
        >
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

      {/* ── Layer 5a: Clue discovery banner — full-width drop from top ── */}
      {clueBanners.slice(0, 1).map((clueId) => {
        const clue = getClue(clueId);
        if (!clue) return null;
        return (
          <div
            key={clueId}
            className="absolute left-0 right-0 z-[40] animate-banner-drop"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 60px)" }}
          >
            <div
              className="mx-3 rounded-xl px-4 py-3 shadow-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(10,8,2,0.98), rgba(30,20,4,0.98))",
                border: "1.5px solid rgba(251,191,36,0.55)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.08)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="text-2xl flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}
                >
                  {clue.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[9px] uppercase tracking-[0.25em] mb-0.5"
                    style={{ color: "rgba(180,130,50,0.7)", fontFamily: "Georgia,serif" }}
                  >
                    🔍 New Clue Found!
                  </div>
                  <div
                    className="text-base font-bold leading-tight"
                    style={{ fontFamily: "Georgia,serif", color: "rgb(251,191,36)" }}
                  >
                    {clue.title}
                  </div>
                  <div
                    className="text-xs mt-0.5 italic leading-snug line-clamp-2"
                    style={{ color: "rgba(200,160,80,0.8)", fontFamily: "Georgia,serif" }}
                  >
                    {clue.flavor}
                  </div>
                </div>
                <button
                  onClick={() => setClueBanners((prev) => prev.filter((id) => id !== clueId))}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full"
                  style={{ background: "rgba(180,130,50,0.15)", color: "rgba(180,130,50,0.6)" }}
                >
                  ✕
                </button>
              </div>
              <button
                onClick={() => { setClueBanners([]); setShowCluesPanel(true); }}
                className="w-full mt-2.5 text-xs py-1.5 rounded text-center"
                style={{
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  color: "rgba(251,191,36,0.8)",
                  fontFamily: "Georgia,serif",
                }}
              >
                View Clue in Case File →
              </button>
            </div>
          </div>
        );
      })}

      {/* ── Layer 5b: Toll notification banners ── */}
      <div
        className="absolute left-0 right-0 z-[38] flex flex-col gap-2"
        style={{ top: clueBanners.length > 0 ? "calc(env(safe-area-inset-top, 0px) + 200px)" : "calc(env(safe-area-inset-top, 0px) + 68px)" }}
      >
        {tollBanners.slice(0, 2).map((banner) => (
          <div
            key={banner.key}
            className="mx-3 rounded-lg px-4 py-2.5 animate-banner-drop"
            style={{
              background: "rgba(10,4,2,0.92)",
              border: "1px solid rgba(180,80,20,0.4)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="text-sm font-medium"
              style={{ fontFamily: "Georgia,serif", color: "rgba(251,160,60,0.95)" }}
            >
              {banner.msg}
            </div>
          </div>
        ))}
      </div>

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
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-8 h-[3px] rounded-full" style={{ background: "rgba(180,130,50,0.22)" }} />
            </div>
            <div className="px-4 pb-8">
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
                          🔒 Clue not yet found
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

      {/* ── Layer 7: Room cleared — full-screen overlay ── */}
      {allRequiredDone && (
        <div
          className="absolute inset-0 z-[45] flex flex-col items-center justify-end animate-sheet-up"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(5,3,1,0.82) 45%, rgba(5,3,1,0.97) 100%)",
            backdropFilter: "blur(4px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="px-6 pb-10 w-full max-w-sm text-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.25)" }} />
              <span className="text-amber-600 text-lg animate-flame inline-block">✦</span>
              <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.25)" }} />
            </div>

            <div
              className="text-[10px] uppercase tracking-[0.3em] mb-2"
              style={{ color: "rgba(180,130,50,0.55)", fontFamily: "Georgia,serif" }}
            >
              Room Cleared
            </div>

            <div
              className="font-bold text-2xl mb-2 leading-tight"
              style={{
                fontFamily: "Georgia,serif",
                color: "rgb(251,191,36)",
                textShadow: "0 2px 16px rgba(180,120,0,0.4)",
              }}
            >
              {room.title}
            </div>

            <p
              className="text-sm italic mb-8"
              style={{ color: "rgba(180,150,80,0.55)", fontFamily: "Georgia,serif" }}
            >
              Head back to the Quest Board to see if new rooms have unlocked.
            </p>

            <a
              href={`/game/${gameId}/team/${teamId}`}
              className="flex items-center justify-center gap-2 w-full font-bold px-6 py-4 rounded-xl text-base transition-all active:scale-95"
              style={{
                background: "linear-gradient(160deg, rgba(140,90,15,0.6), rgba(80,50,5,0.55))",
                border: "1px solid rgba(180,130,50,0.5)",
                color: "rgb(251,191,36)",
                fontFamily: "Georgia,serif",
                boxShadow: "0 4px 24px rgba(120,80,0,0.25), inset 0 1px 0 rgba(255,220,80,0.1)",
              }}
            >
              ← Back to Quest Board
            </a>
          </div>
        </div>
      )}

      {/* ── Layer 6: Bottom quest sheet ── */}
      {!allRequiredDone && (
        <div
          className={cn(
            "absolute bottom-0 left-3 right-3 z-[20]",
            entered ? "animate-sheet-up" : "translate-y-full opacity-60"
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div
            className="rounded-t-2xl"
            style={{
              background: "rgba(8,6,4,0.55)",
              backdropFilter: "blur(24px)",
              borderTop: "1px solid rgba(180,130,50,0.18)",
              borderLeft: "1px solid rgba(180,130,50,0.08)",
              borderRight: "1px solid rgba(180,130,50,0.08)",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.7)",
              maxHeight: "52vh",
              overflowY: "auto",
              overscrollBehavior: "contain",
            }}
          >
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
                    <div className="h-px flex-1" style={{ background: "rgba(180,130,50,0.15)" }} />
                    <span
                      className="text-[10px] uppercase tracking-[0.22em]"
                      style={{ fontFamily: "Georgia,serif", color: "rgba(180,130,50,0.5)" }}
                    >
                      Your Move
                    </span>
                    <div className="h-px flex-1" style={{ background: "rgba(180,130,50,0.15)" }} />
                  </div>
                  <QuestBlock
                    key={activeQuest.id}
                    quest={activeQuest}
                    isComplete={false}
                    questState={getQuestState(activeQuest.id) ?? null}
                    offerDefinition={offerDef}
                    gameId={gameId}
                    teamId={teamId}
                    isReadOnly={false}
                    onComplete={(clueId) => {
                      triggerHit();
                      if (clueId) setClueBanners((prev) => [...prev, clueId]);
                      fetchData();
                    }}
                    onMiss={triggerMiss}
                  />
                </div>
              )}

              {/* ── Bonus quests ── */}
              {allRequiredDone && bonusQuests.length > 0 && (
                <div className="mb-3 space-y-3 animate-quest-fade">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1" style={{ background: "rgba(180,130,50,0.15)" }} />
                    <span
                      className="text-[10px] uppercase tracking-[0.22em]"
                      style={{ fontFamily: "Georgia,serif", color: "rgba(180,130,50,0.5)" }}
                    >
                      + bonus unlocked
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
                          if (clueId) setClueBanners((prev) => [...prev, clueId]);
                          fetchData();
                        }}
                        onMiss={triggerMiss}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ── Completed quests ── */}
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
                          style={{ fontFamily: "Georgia,serif", color: "rgba(120,90,40,0.7)" }}
                        >
                          {quest.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// QUEST BLOCK
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

  const handleSlidingPuzzleSolved = async () => {
    setLoading(true);
    const result = await completeQuest(gameId, teamId, quest.id);
    setLoading(false);
    if (result.success) {
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
          {quest.title} — skipped
        </span>
        <button
          onClick={() => setSkipped(false)}
          className="text-xs"
          style={{ color: "rgba(180,130,50,0.5)" }}
        >
          Show
        </button>
      </div>
    );
  }

  const sharedProps = { quest, isComplete, feedback, loading, isReadOnly, shownHints, hintsUsed, offerDefinition };

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

  if (quest.type === "sliding_puzzle" && quest.slidingPuzzle) {
    return (
      <div
        className={cn("rounded-xl border p-4 space-y-3 transition-all duration-300", isComplete && "opacity-55")}
        style={{ background: "rgba(20,14,4,0.85)", borderColor: "rgba(180,130,50,0.25)", fontFamily: "Georgia,serif" }}
      >
        <div className="flex items-center gap-1.5">
          {isComplete && <span style={{ color: "rgba(140,100,40,0.8)", fontSize: "11px" }}>✓</span>}
          <span
            className="text-[10px] uppercase tracking-[0.24em]"
            style={{ color: isComplete ? "rgba(120,80,20,0.55)" : "rgba(160,110,40,0.6)" }}
          >
            {isComplete ? "✓ Done" : quest.isRequired ? "Required" : "Bonus"}
          </span>
        </div>
        <h3
          className="font-bold leading-tight"
          style={{ fontSize: "1.1rem", color: isComplete ? "rgba(160,120,50,0.65)" : "rgba(245,235,205,0.97)" }}
        >
          {quest.title}
        </h3>
        <p className="text-sm text-stone-400 leading-relaxed">{quest.description}</p>
        <SlidingPuzzleQuest
          config={quest.slidingPuzzle}
          isComplete={isComplete}
          isReadOnly={isReadOnly}
          onComplete={handleSlidingPuzzleSolved}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border p-4 space-y-2"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(180,130,50,0.2)" }}
    >
      <h3 className="font-bold text-amber-100 text-sm" style={{ fontFamily: "Georgia,serif" }}>
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
  offerDefinition: string;
}

// ─── Puzzle card ────────────────────────────────────────────
function StickyNoteArtifact({
  quest, isComplete, feedback, shownHints, answer, loading, isReadOnly,
  hintsUsed, offerDefinition, onAnswerChange, onSubmit, onHint,
}: ArtifactProps & {
  answer: string;
  onAnswerChange: (v: string) => void;
  onSubmit: () => void;
  onHint: (order: number) => void;
}) {
  return (
    <div className={cn("transition-all duration-300", isComplete && "opacity-55")}>
      <div className="flex items-center gap-1.5 mb-2">
        {isComplete && <span style={{ color: "rgba(140,100,40,0.8)", fontSize: "11px" }}>✓</span>}
        <span
          className="text-[10px] uppercase tracking-[0.24em]"
          style={{
            fontFamily: "Georgia,serif",
            color: isComplete ? "rgba(120,80,20,0.55)" : "rgba(160,110,40,0.6)",
          }}
        >
          {isComplete ? "✓ Done" : quest.isRequired ? "Required" : "Bonus"}
        </span>
      </div>

      <h3
        className="font-bold mb-2 leading-tight"
        style={{
          fontFamily: "Georgia,serif",
          fontSize: "1.15rem",
          color: isComplete ? "rgba(160,120,50,0.65)" : "rgba(245,235,205,0.97)",
        }}
      >
        {quest.title}
      </h3>

      <p
        className="text-sm mb-3 leading-relaxed"
        style={{
          fontFamily: "Georgia,serif",
          color: isComplete ? "rgba(140,100,50,0.55)" : "rgba(205,185,145,0.85)",
        }}
      >
        {quest.description}
      </p>

      {!isComplete && (
        <div
          className="rounded px-3 py-3 mb-3"
          style={{
            background: "rgba(255,240,180,0.03)",
            border: "1px solid rgba(180,130,50,0.22)",
            borderLeft: "2px solid rgba(180,130,50,0.4)",
          }}
        >
          <p
            className="text-sm italic leading-relaxed"
            style={{ fontFamily: "Georgia,serif", color: "rgba(215,180,105,0.9)" }}
          >
            {quest.prompt}
          </p>
        </div>
      )}

      {feedback && (
        <div
          className={cn(
            "rounded px-3 py-2 text-sm mb-3",
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
          className="rounded px-3 py-2 text-sm mb-2"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(180,130,50,0.14)",
            fontFamily: "Georgia,serif",
            color: "rgba(200,170,100,0.75)",
          }}
        >
          <span className="font-bold text-xs mr-1" style={{ color: "rgba(180,130,50,0.6)" }}>
            Hint {h.order}:
          </span>
          {h.text}
        </div>
      ))}

      {!isComplete && !isReadOnly && quest.answer && (
        <div className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            placeholder="Your answer…"
            className="flex-1 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-700/40"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(180,130,50,0.2)",
              color: "rgba(230,210,165,0.9)",
              fontFamily: "Georgia,serif",
              fontSize: "16px",
              touchAction: "manipulation",
            }}
          />
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-bold rounded transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: loading ? "rgba(60,40,10,0.4)" : "linear-gradient(160deg, #a07010, #7a5200)",
              color: loading ? "rgba(180,130,50,0.4)" : "rgba(255,240,195,0.97)",
              fontFamily: "Georgia,serif",
              border: "1px solid rgba(180,130,50,0.35)",
              boxShadow: loading ? "none" : "0 2px 10px rgba(100,70,0,0.35)",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "…" : "⚔️ Strike"}
          </button>
        </div>
      )}

      {!isComplete && !isReadOnly && quest.hints.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
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
                className="text-xs rounded px-3 py-1.5 transition-colors disabled:opacity-50"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(180,130,50,0.18)",
                  color: "rgba(180,130,50,0.6)",
                  fontFamily: "Georgia,serif",
                }}
              >
                🍺 Hint {hint.order} ({formatOfferCost(hint.offerCost, offerDefinition)})
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Ballot ────────────────────────────────────────────────
function BallotArtifact({
  quest, isComplete, feedback, loading, isReadOnly, onChoose,
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
        style={{ borderColor: "rgba(180,130,50,0.15)", background: "rgba(180,130,50,0.05)" }}
      >
        <span className="text-amber-700 text-sm">📋</span>
        <span className="text-xs uppercase tracking-widest text-amber-700/70" style={{ fontFamily: "Georgia,serif" }}>
          {isComplete ? "✓ Done" : "choice"}
        </span>
        {quest.isRequired && !isComplete && (
          <span
            className="ml-auto text-xs bg-amber-900/40 text-amber-600 px-1.5 py-0.5 rounded border border-amber-800/50"
            style={{ fontFamily: "Georgia,serif" }}
          >
            Required
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-amber-100 leading-tight" style={{ fontFamily: "Georgia,serif" }}>
          {quest.title}
        </h3>
        <p className="text-sm text-stone-300 leading-relaxed">{quest.description}</p>
        {!isComplete && (
          <div
            className="rounded-sm px-3 py-2.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(180,130,50,0.12)" }}
          >
            <p className="text-sm text-amber-100/80 italic" style={{ fontFamily: "Georgia,serif" }}>
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
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(180,130,50,0.15)", padding: "10px 12px" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 w-4 h-4 rounded-sm flex-shrink-0 group-hover:border-amber-600/60 transition-colors"
                    style={{ border: "1px solid rgba(180,130,50,0.4)", background: "rgba(0,0,0,0.3)" }}
                  />
                  <div>
                    <div className="text-sm font-medium text-amber-100 group-hover:text-amber-200 transition-colors" style={{ fontFamily: "Georgia,serif" }}>
                      {choice.label}
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">{choice.description}</div>
                    {choice.offerCost && (
                      <div className="text-xs text-amber-700 mt-0.5">
                        🍺 {choice.offerCost} Offer{choice.offerCost !== 1 ? "s" : ""}
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
  quest, isComplete, feedback, loading, isReadOnly, offerDefinition, onUnlock,
}: ArtifactProps & { onUnlock: () => void }) {
  return (
    <div
      className={cn(
        "relative rounded-sm shadow-xl overflow-hidden transition-all duration-300",
        isComplete ? "opacity-70" : ""
      )}
      style={{
        background: "linear-gradient(160deg, #1c1208 0%, #120d05 100%)",
        border: isComplete ? "1px solid rgba(120,80,20,0.3)" : "1px solid rgba(180,130,50,0.35)",
        boxShadow: isComplete ? "0 2px 8px rgba(0,0,0,0.4)" : "0 6px 20px rgba(0,0,0,0.6)",
      }}
    >
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(180,130,50,0.4), transparent)" }} />
      <div className="p-5">
        <div className="flex justify-center mb-4">
          <div
            className={cn("w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg", isComplete ? "opacity-50" : "animate-cold-pulse")}
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
          <span className="text-amber-900/60 text-xs" style={{ fontFamily: "Georgia,serif" }}>✦</span>
          <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.2)" }} />
        </div>
        <h3
          className="font-bold text-center mb-2 leading-tight"
          style={{ fontFamily: "Georgia,serif", color: isComplete ? "rgba(180,130,50,0.6)" : "rgb(251,191,36)" }}
        >
          {quest.title}
        </h3>
        <p
          className="text-sm text-center mb-3 leading-relaxed"
          style={{ color: isComplete ? "rgba(120,90,40,0.7)" : "rgba(200,160,80,0.8)", fontFamily: "Georgia,serif" }}
        >
          {quest.description}
        </p>
        {!isComplete && (
          <p className="text-xs text-center italic mb-4" style={{ color: "rgba(180,120,40,0.6)", fontFamily: "Georgia,serif" }}>
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
            🍺 Pay {formatOfferCost(quest.offerCost, offerDefinition)}
          </Button>
        )}
      </div>
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(180,130,50,0.4), transparent)" }} />
    </div>
  );
}

// ─── Social challenge ───────────────────────────────────────
function TornFlyerArtifact({
  quest, isComplete, feedback, loading, isReadOnly, onComplete, onSkip,
}: ArtifactProps & { onComplete: () => void; onSkip: () => void }) {
  return (
    <div className={cn("relative rounded-sm shadow-lg overflow-visible transition-all duration-300", isComplete ? "opacity-70" : "")}>
      {!isComplete && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
          <div
            className="w-4 h-4 rounded-full shadow-md"
            style={{ background: "radial-gradient(circle at 35% 35%, #ef4444, #7f1d1d)", border: "1px solid rgba(239,68,68,0.5)" }}
          />
        </div>
      )}
      <div
        className="relative artifact-torn overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1e1410 0%, #181008 100%)", border: "1px solid rgba(180,130,50,0.2)", borderRadius: "2px" }}
      >
        <div className="p-4 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="text-xs px-2 py-1 rounded-sm"
              style={{ background: "rgba(180,50,50,0.2)", border: "1px solid rgba(180,50,50,0.3)", color: "rgb(252,165,165)", fontFamily: "Georgia,serif" }}
            >
              👥 social challenge
            </div>
            {isComplete && (
              <span className="text-xs text-amber-700 ml-auto" style={{ fontFamily: "Georgia,serif" }}>
                ✓ Done
              </span>
            )}
          </div>
          <h3 className="font-bold text-amber-100 mb-2 leading-tight" style={{ fontFamily: "Georgia,serif" }}>
            {quest.title}
          </h3>
          <p className="text-sm text-stone-300 leading-relaxed mb-3">{quest.description}</p>
          {!isComplete && (
            <div
              className="rounded-sm px-3 py-2.5 mb-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(180,130,50,0.12)" }}
            >
              <p className="text-sm text-amber-100/80 italic" style={{ fontFamily: "Georgia,serif" }}>
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
              <Button variant="secondary" className="w-full" onClick={onComplete} loading={loading}>
                ✓ Challenge Complete (Group Approved)
              </Button>
              <button
                onClick={onSkip}
                className="w-full text-xs py-1.5 transition-colors"
                style={{ color: "rgba(180,130,50,0.4)", fontFamily: "Georgia,serif" }}
              >
                Move on without completing →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
