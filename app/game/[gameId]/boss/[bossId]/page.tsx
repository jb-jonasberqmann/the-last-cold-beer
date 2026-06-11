"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { dealBossDamage } from "@/lib/game/actions";
import { GameLayout } from "@/components/layout/GameLayout";
import { BossHpBar } from "@/components/game/BossHpBar";
import { Button } from "@/components/ui/Button";
import { getBoss } from "@/content/bosses";
import { getClue } from "@/content/clues";
import type { DbGame, DbBossProgress, DbTeamClue } from "@/types/database";
import type { TeamId, BossAction } from "@/types/content";
import { cn } from "@/lib/utils";

interface Props {
  params: { gameId: string; bossId: string };
}

export default function BossFightPage({ params }: Props) {
  const gameId = params.gameId;
  const bossId = params.bossId;

  const searchParams = useSearchParams();
  const { session } = usePlayer();
  const teamId = (searchParams.get("team") ?? session?.teamId ?? "team-a") as TeamId;

  const boss = bossId ? getBoss(bossId) : null;

  const [game, setGame] = useState<DbGame | null>(null);
  const [bossProgressA, setBossProgressA] = useState<DbBossProgress | null>(null);
  const [bossProgressB, setBossProgressB] = useState<DbBossProgress | null>(null);
  const [teamClues, setTeamClues] = useState<DbTeamClue[]>([]);
  const [feedback, setFeedback] = useState<{ actionId: string; text: string; success: boolean } | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!gameId || !boss) return;
    const res = await fetch(`/api/game/${gameId}/progress?teamId=${teamId}`);
    if (!res.ok) return;
    const data = await res.json();
    setGame(data.game);
    setTeamClues(data.clues ?? []);

    const bossRows: DbBossProgress[] = data.bossProgress ?? [];
    setBossProgressA(bossRows.find((b) => b.team_id === "team-a") ?? null);
    setBossProgressB(bossRows.find((b) => b.team_id === "team-b") ?? null);
  }, [gameId, boss, teamId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeGame(gameId ?? undefined, fetchData);

  if (!boss || !game || !gameId || !bossId) return null;

  const myBossProgress = teamId === "team-a" ? bossProgressA : bossProgressB;
  const otherBossProgress = teamId === "team-a" ? bossProgressB : bossProgressA;
  const currentHp = myBossProgress?.current_hp ?? boss.maxHp;
  const currentPhase = myBossProgress?.current_phase ?? 1;
  const isDefeated = myBossProgress?.status === "defeated";

  const phase = boss.phases.find((p) => p.phase === currentPhase) ?? boss.phases[0];
  const teamName = teamId === "team-a" ? game.team_a_name : game.team_b_name;
  const otherTeamName = teamId === "team-a" ? game.team_b_name : game.team_a_name;
  const isMyTeam = session?.teamId === teamId;

  const hasClue = (clueId: string) => teamClues.some((tc) => tc.clue_id === clueId);

  const handleAction = async (action: BossAction, answerOverride?: string) => {
    setLoading(action.id);
    const result = await dealBossDamage(
      gameId,
      teamId,
      bossId,
      action.id,
      answerOverride ?? puzzleAnswer
    );
    setLoading(null);

    if (result.success) {
      setFeedback({
        actionId: action.id,
        text: result.data.defeated
          ? boss.defeatText
          : result.data.damage > 0
          ? `💥 ${result.data.damage} damage! HP: ${result.data.newHp}. ${result.data.rewardText ?? ""}`
          : result.data.failureText ?? "No damage dealt.",
        success: result.data.damage > 0,
      });
      setPuzzleAnswer("");
      setActiveActionId(null);
      fetchData();
    }
  };

  return (
    <GameLayout
      gameId={gameId}
      teamId={teamId}
      backHref={`/game/${gameId}/team/${teamId}`}
      backLabel="Quest Board"
      title={boss.title}
    >
      {/* Boss header */}
      <div
        className={cn(
          "rounded-xl p-5 mb-4 border bg-gradient-to-br",
          boss.look.colorFrom,
          boss.look.colorTo,
          "border-white/10 text-center"
        )}
      >
        <div className="text-5xl mb-2 animate-flicker">{boss.look.icon}</div>
        <h1 className="text-2xl font-bold text-white font-game mb-1">{boss.title}</h1>
        <p className="text-sm text-stone-400 italic">{boss.subtitle}</p>
        <p className="text-xs text-stone-400 mt-2 leading-relaxed max-w-sm mx-auto">
          {boss.look.atmosphere}
        </p>
      </div>

      {isDefeated ? (
        <div className="rounded-xl bg-green-950 border border-green-700 p-5 mb-4 text-center">
          <div className="text-3xl mb-2">💀</div>
          <h2 className="text-lg font-bold text-green-400 font-game mb-2">Boss Defeated!</h2>
          <p className="text-sm text-green-300 leading-relaxed">{boss.defeatText}</p>
          <div className="mt-3 text-xs text-green-500 italic">{boss.victoryAdvantage}</div>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-stone-800 border border-stone-600 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-white">{teamName}</span>
              <span className="text-xs text-stone-500">vs</span>
              <span className="text-2xl">{boss.icon}</span>
            </div>
            <BossHpBar
              currentHp={currentHp}
              maxHp={boss.maxHp}
              currentPhase={currentPhase}
              totalPhases={boss.phases.length}
            />
          </div>

          {otherBossProgress && (
            <div className="rounded-xl bg-stone-900/50 border border-stone-700 p-3 mb-4">
              <div className="flex items-center gap-2 justify-between text-sm">
                <span className="text-stone-400">{otherTeamName}</span>
                {otherBossProgress.status === "defeated" ? (
                  <span className="text-green-400 font-medium">💀 Defeated!</span>
                ) : (
                  <span className="text-red-400">
                    {otherBossProgress.current_hp}/{boss.maxHp} HP
                  </span>
                )}
              </div>
            </div>
          )}

          {phase && (
            <div className="rounded-xl bg-stone-800 border border-stone-600 p-4 mb-4">
              <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">
                Phase {currentPhase}: {phase.title}
              </div>
              <p className="text-sm text-stone-300">{phase.description}</p>
            </div>
          )}

          {feedback && (
            <div
              className={cn(
                "rounded-xl px-4 py-3 mb-4 text-sm border",
                feedback.success
                  ? "bg-green-950/50 border-green-700 text-green-300"
                  : "bg-red-950/50 border-red-700 text-red-300"
              )}
            >
              {feedback.text}
            </div>
          )}

          {isMyTeam && phase && (
            <div className="space-y-3 mb-4">
              <h3 className="text-xs text-stone-500 uppercase tracking-widest font-medium">
                Available Actions
              </h3>
              {phase.actions.map((action) => {
                const needsClue =
                  action.type === "clue_check" && action.requiredClueId && !hasClue(action.requiredClueId);

                return (
                  <div
                    key={action.id}
                    className={cn(
                      "rounded-xl border p-4",
                      needsClue
                        ? "bg-stone-900/30 border-stone-700 opacity-50"
                        : activeActionId === action.id
                        ? "bg-stone-700 border-stone-500"
                        : "bg-stone-800 border-stone-600"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{action.label}</h4>
                        <p className="text-xs text-stone-400 mt-0.5">{action.description}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-bold text-red-400">-{action.damage} HP</div>
                        {action.offerCost && (
                          <div className="text-xs text-amber-400">🍺 {action.offerCost}</div>
                        )}
                      </div>
                    </div>

                    {needsClue && action.requiredClueId && (
                      <div className="text-xs text-stone-500 italic">
                        Requires clue: {getClue(action.requiredClueId)?.title ?? action.requiredClueId}
                      </div>
                    )}

                    {!needsClue && (
                      <>
                        {action.type === "puzzle" && action.puzzle && (
                          <>
                            {activeActionId === action.id ? (
                              <div className="space-y-2 mt-2">
                                <p className="text-sm text-amber-200 italic">{action.puzzle.prompt}</p>
                                {action.hint && (
                                  <p className="text-xs text-stone-500">Hint: {action.hint}</p>
                                )}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={puzzleAnswer}
                                    onChange={(e) => setPuzzleAnswer(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAction(action)}
                                    placeholder="Answer…"
                                    className="flex-1 bg-stone-700 border border-stone-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                  <Button size="sm" onClick={() => handleAction(action)} loading={loading === action.id}>
                                    Submit
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="mt-2"
                                onClick={() => setActiveActionId(action.id)}
                              >
                                Solve Puzzle
                              </Button>
                            )}
                          </>
                        )}

                        {action.type === "offer_boost" && (
                          <Button
                            variant="offer"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => handleAction(action)}
                            loading={loading === action.id}
                          >
                            🍺 Pay {action.offerCost} Offer for {action.damage} damage
                          </Button>
                        )}

                        {action.type === "clue_check" && !needsClue && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleAction(action)}
                            loading={loading === action.id}
                          >
                            Use Clue
                          </Button>
                        )}

                        {action.type === "social" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => handleAction(action)}
                            loading={loading === action.id}
                          >
                            ✓ Group Decision Made
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </GameLayout>
  );
}
