"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { dealBossDamage } from "@/lib/game/actions";
import { GameLayout } from "@/components/layout/GameLayout";
import { BossHpBar } from "@/components/game/BossHpBar";
import { Button } from "@/components/ui/Button";
import { getBoss } from "@/content/bosses";
import { getClue } from "@/content/clues";
import { localizeBoss } from "@/lib/content/localize";
import type { DbGame, DbBossProgress, DbTeamClue, DbRoomProgress } from "@/types/database";
import type { TeamId, BossAction } from "@/types/content";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  params: { gameId: string; bossId: string };
}

export default function BossFightPage({ params }: Props) {
  const gameId = params.gameId;
  const bossId = params.bossId;
  const { t, lang } = useLanguage();

  const searchParams = useSearchParams();
  const { session } = usePlayer();
  const teamId = (searchParams.get("team") ?? session?.teamId ?? "team-a") as TeamId;

  const rawBoss = bossId ? getBoss(bossId) : null;
  const boss = rawBoss ? localizeBoss(rawBoss, lang) : null;

  const [game, setGame] = useState<DbGame | null>(null);
  const [bossProgressA, setBossProgressA] = useState<DbBossProgress | null>(null);
  const [bossProgressB, setBossProgressB] = useState<DbBossProgress | null>(null);
  const [teamClues, setTeamClues] = useState<DbTeamClue[]>([]);
  const [roomProgress, setRoomProgress] = useState<DbRoomProgress[]>([]);
  const [feedback, setFeedback] = useState<{ actionId: string; text: string; success: boolean } | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  // Track which clue actions have been auto-applied (per game+team+boss, persisted in localStorage)
  const autoAppliedKey = `boss_auto_applied_${gameId}_${teamId}_${bossId}`;
  const autoApplied = useRef<Set<string>>(new Set());
  const [autoApplyNotices, setAutoApplyNotices] = useState<{ actionId: string; label: string; damage: number }[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(autoAppliedKey);
      if (stored) autoApplied.current = new Set(JSON.parse(stored));
    } catch {}
  }, [autoAppliedKey]);

  const fetchData = useCallback(async () => {
    if (!gameId || !boss) return;
    const res = await fetch(`/api/game/${gameId}/progress?teamId=${teamId}`);
    if (!res.ok) return;
    const data = await res.json();
    setGame(data.game);
    setTeamClues(data.clues ?? []);
    setRoomProgress(data.roomProgress ?? []);

    const bossRows: DbBossProgress[] = data.bossProgress ?? [];
    setBossProgressA(bossRows.find((b) => b.team_id === "team-a") ?? null);
    setBossProgressB(bossRows.find((b) => b.team_id === "team-b") ?? null);
  }, [gameId, boss, teamId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeGame(gameId ?? undefined, fetchData);

  // Auto-apply clue damage once data is loaded
  useEffect(() => {
    if (!boss || !game || teamClues.length === 0) return;
    if (session?.isHost) return; // hosts observe only

    const myBp = teamId === "team-a" ? bossProgressA : bossProgressB;
    if (myBp?.status === "defeated") return;

    const currentPhaseNum = myBp?.current_phase ?? 1;
    const currentPhase = boss.phases.find((p) => p.phase === currentPhaseNum);
    if (!currentPhase) return;

    const toApply = currentPhase.actions.filter((action) => {
      if (action.type !== "clue_check" || !action.requiredClueId) return false;
      if (autoApplied.current.has(action.id)) return false;
      return teamClues.some((tc) => tc.clue_id === action.requiredClueId);
    });

    if (toApply.length === 0) return;

    // Apply each found clue action in sequence
    (async () => {
      for (const action of toApply) {
        autoApplied.current.add(action.id);
        try {
          localStorage.setItem(autoAppliedKey, JSON.stringify(Array.from(autoApplied.current)));
        } catch {}
        const result = await dealBossDamage(gameId, teamId, bossId, action.id);
        if (result.success && result.data.damage > 0) {
          setAutoApplyNotices((prev) => [
            ...prev,
            { actionId: action.id, label: action.label, damage: result.data.damage },
          ]);
        }
      }
      fetchData();
    })();
  // Only run when clues or boss progress changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamClues, bossProgressA, bossProgressB]);

  if (!boss || !game || !gameId || !bossId) return null;

  // Boss gate: check if required rooms are complete
  const prerequisitesMet = !rawBoss?.requiredRoomIds?.length ||
    rawBoss.requiredRoomIds.every((rid) =>
      roomProgress.some((rp) => rp.room_id === rid && rp.status === "complete")
    );

  if (!prerequisitesMet) {
    const missingRooms = rawBoss!.requiredRoomIds!.filter(
      (rid) => !roomProgress.some((rp) => rp.room_id === rid && rp.status === "complete")
    );
    return (
      <GameLayout
        gameId={gameId}
        teamId={teamId}
        backHref={`/game/${gameId}/team/${teamId}`}
        backLabel="Quest Board"
        title={boss.title}
      >
        <div
          className="rounded-xl bg-stone-950 border border-red-900/50 p-6 text-center mt-6"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-bold text-red-300 mb-2">{t("boss.locked_title")}</h2>
          <p className="text-sm text-stone-400 mb-4">{t("boss.locked_message")}</p>
          <div className="text-xs text-amber-800">
            <span className="font-bold">{t("boss.locked_requires")}</span>{" "}
            {missingRooms.join(", ")}
          </div>
        </div>
      </GameLayout>
    );
  }

  const myBossProgress = teamId === "team-a" ? bossProgressA : bossProgressB;
  const otherBossProgress = teamId === "team-a" ? bossProgressB : bossProgressA;
  const currentHp = myBossProgress?.current_hp ?? boss.maxHp;
  const currentPhase = myBossProgress?.current_phase ?? 1;
  const isDefeated = myBossProgress?.status === "defeated";

  const phase = boss.phases.find((p) => p.phase === currentPhase) ?? boss.phases[0];
  const teamName = teamId === "team-a" ? game.team_a_name : game.team_b_name;
  const otherTeamName = teamId === "team-a" ? game.team_b_name : game.team_a_name;
  const canInteract = !session?.isHost;

  const hasClue = (clueId: string) => teamClues.some((tc) => tc.clue_id === clueId);

  // Secret room advantages
  const hasBossFreeAction = roomProgress.some(
    (rp) => rp.room_id === "coffee-table" && rp.status === "complete"
  );
  const freeActionUsedKey = `boss_free_action_used_${gameId}_${teamId}_${bossId}`;
  const [freeActionUsed, setFreeActionUsed] = useState(() => {
    try { return !!localStorage.getItem(freeActionUsedKey); } catch { return false; }
  });
  const handleFreeAction = async () => {
    // Apply a free 20-damage offer_boost action without Offer cost
    setLoading("free-action");
    const result = await dealBossDamage(gameId, teamId, bossId, "cooler-p1-offer-boost", "", true);
    setLoading(null);
    try { localStorage.setItem(freeActionUsedKey, "1"); } catch {}
    setFreeActionUsed(true);
    if (result.success) {
      setFeedback({
        actionId: "free-action",
        text: `🎯 Sofabord-fordel anvendt! ${result.data.damage > 0 ? `${result.data.damage} skade.` : ""} ${result.data.rewardText ?? ""}`,
        success: true,
      });
      fetchData();
    }
  };

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

  // Separate clue actions (available) from other actions for current phase
  const clueActionsReady = phase?.actions.filter(
    (a) => a.type === "clue_check" && a.requiredClueId && hasClue(a.requiredClueId) && !autoApplied.current.has(a.id)
  ) ?? [];

  return (
    <GameLayout
      gameId={gameId}
      teamId={teamId}
      backHref={`/game/${gameId}/team/${teamId}`}
      backLabel="Quest Board"
      title={boss.title}
    >
      {/* Boss header */}
      <div className="rounded-xl mb-4 border border-red-900/50 bg-stone-950 overflow-hidden">
        <div className={cn("h-1 w-full bg-gradient-to-r", boss.look.colorFrom, boss.look.colorTo, "opacity-70")} />
        <div className="p-5 text-center">
          <div className="text-5xl mb-2">{boss.look.icon}</div>
          <h1
            className="text-2xl font-bold text-red-200 mb-1"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}
          >
            {boss.title}
          </h1>
          <p className="text-sm text-stone-400 italic" style={{ fontFamily: "Georgia, serif" }}>
            {boss.subtitle}
          </p>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed max-w-sm mx-auto">
            {boss.look.atmosphere}
          </p>
        </div>
      </div>

      {/* Auto-apply notices */}
      {autoApplyNotices.map((n) => (
        <div
          key={n.actionId}
          className="rounded-xl bg-amber-950/60 border border-amber-700/60 px-4 py-3 mb-3 flex items-center gap-3"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <span className="text-xl">🗝️</span>
          <div className="flex-1">
            <div className="text-xs text-amber-500 font-bold uppercase tracking-widest">Clue applied automatically</div>
            <div className="text-sm text-amber-200">{n.label} — <span className="text-red-400 font-bold">-{n.damage} HP</span></div>
          </div>
          <button
            onClick={() => setAutoApplyNotices((prev) => prev.filter((x) => x.actionId !== n.actionId))}
            className="text-amber-800 hover:text-amber-600 text-xs"
          >
            ✕
          </button>
        </div>
      ))}

      {isDefeated ? (
        <div
          className="rounded-xl bg-stone-950 border border-amber-800/50 p-5 mb-4 text-center"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <div className="text-3xl mb-2">💀</div>
          <h2 className="text-lg font-bold text-amber-300 mb-2">{t("boss.defeated_title")}</h2>
          <p className="text-sm text-amber-200/80 leading-relaxed">{boss.defeatText}</p>
          <div className="mt-3 text-xs text-amber-800 italic">{boss.victoryAdvantage}</div>
        </div>
      ) : (
        <>
          {/* HP bar */}
          <div className="rounded-xl bg-stone-950 border border-stone-800 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-amber-200" style={{ fontFamily: "Georgia, serif" }}>
                {teamName}
              </span>
              <span className="text-xs text-stone-600">{t("boss.vs")}</span>
              <span className="text-2xl">{boss.icon}</span>
            </div>
            <BossHpBar
              currentHp={currentHp}
              maxHp={boss.maxHp}
              currentPhase={currentPhase}
              totalPhases={boss.phases.length}
            />
          </div>

          {/* Other team progress */}
          {otherBossProgress && (
            <div className="rounded-xl bg-stone-950/60 border border-stone-800 p-3 mb-4">
              <div className="flex items-center gap-2 justify-between text-sm">
                <span className="text-stone-500" style={{ fontFamily: "Georgia, serif" }}>{otherTeamName}</span>
                {otherBossProgress.status === "defeated" ? (
                  <span className="text-amber-600 font-medium" style={{ fontFamily: "Georgia, serif" }}>💀 Defeated</span>
                ) : (
                  <span className="text-red-500" style={{ fontFamily: "Georgia, serif" }}>
                    {otherBossProgress.current_hp}/{boss.maxHp} HP
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Secret room advantage */}
          {hasBossFreeAction && canInteract && !isDefeated && (
            <div className="rounded-xl bg-cyan-950/40 border border-cyan-800/50 p-4 mb-4">
              <div style={{ fontFamily: "Georgia, serif" }}>
                <div className="text-xs text-cyan-500 uppercase tracking-widest font-bold mb-1">
                  🎯 Sofabord-fordel
                </div>
                {freeActionUsed ? (
                  <div className="text-xs text-cyan-900">Gratis handling allerede brugt.</div>
                ) : (
                  <>
                    <div className="text-sm text-cyan-300 mb-2">
                      I fandt sofabordets hemmelighed. Brug én gratis handling mod bossen uden Offer-omkostning.
                    </div>
                    <Button
                      size="sm"
                      onClick={handleFreeAction}
                      loading={loading === "free-action"}
                    >
                      ★ Brug gratis handling
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Phase description */}
          {phase && (
            <div
              className="rounded-xl bg-stone-950 border border-amber-900/30 p-4 mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <div className="text-xs text-amber-800 uppercase tracking-[0.15em] mb-1">
                {t("boss.phase")} {currentPhase}: {phase.title}
              </div>
              <p className="text-sm text-stone-300">{phase.description}</p>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={cn(
                "rounded-xl px-4 py-3 mb-4 text-sm border",
                feedback.success
                  ? "bg-stone-950 border-amber-800/50 text-amber-300"
                  : "bg-red-950/30 border-red-900/50 text-red-300"
              )}
              style={{ fontFamily: "Georgia, serif" }}
            >
              {feedback.text}
            </div>
          )}

          {canInteract && phase && (
            <div className="space-y-3 mb-4">
              {/* ── Clue actions (if any found, show prominently BEFORE other actions) ── */}
              {clueActionsReady.length > 0 && (
                <div className="rounded-xl border-2 border-amber-700/60 bg-amber-950/20 p-4 space-y-3">
                  <div style={{ fontFamily: "Georgia, serif" }}>
                    <div className="text-xs text-amber-500 uppercase tracking-widest font-bold mb-0.5">
                      {t("boss.clue_auto_title")}
                    </div>
                    <div className="text-xs text-amber-800">{t("boss.clue_auto_sub")}</div>
                  </div>
                  {clueActionsReady.map((action) => (
                    <div key={action.id} className="flex items-center gap-3">
                      <span className="text-lg">🗝️</span>
                      <div className="flex-1">
                        <div
                          className="text-sm font-bold text-amber-200"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          {action.label}
                        </div>
                        <div className="text-xs text-amber-800">{action.description}</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAction(action)}
                        loading={loading === action.id}
                      >
                        {t("boss.use_clue")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <h3
                className="text-xs text-amber-900 uppercase tracking-[0.2em] font-medium pt-1"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {t("boss.actions")}
              </h3>

              {phase.actions.map((action) => {
                // Skip clue_check actions already shown in the prominent section above
                if (action.type === "clue_check" && action.requiredClueId && hasClue(action.requiredClueId)) return null;

                const needsClue =
                  action.type === "clue_check" && action.requiredClueId && !hasClue(action.requiredClueId);

                return (
                  <div
                    key={action.id}
                    className={cn(
                      "rounded-xl border p-4",
                      needsClue
                        ? "bg-stone-950/40 border-stone-800 opacity-40"
                        : activeActionId === action.id
                        ? "bg-stone-900 border-amber-800/60"
                        : "bg-stone-950 border-stone-800"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4
                          className="font-bold text-amber-100 text-sm"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          {action.label}
                        </h4>
                        <p className="text-xs text-stone-400 mt-0.5">{action.description}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div
                          className="text-sm font-bold text-red-500"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          -{action.damage} HP
                        </div>
                        {action.offerCost && (
                          <div className="text-xs text-amber-700">🍺 {action.offerCost}</div>
                        )}
                      </div>
                    </div>

                    {needsClue && action.requiredClueId && (
                      <div
                        className="text-xs text-stone-600 italic"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {t("boss.clue_requires")} {getClue(action.requiredClueId)?.title ?? action.requiredClueId}
                      </div>
                    )}

                    {!needsClue && (
                      <>
                        {action.type === "puzzle" && action.puzzle && (
                          <>
                            {activeActionId === action.id ? (
                              <div className="space-y-2 mt-2">
                                <p
                                  className="text-sm text-amber-200/80 italic"
                                  style={{ fontFamily: "Georgia, serif" }}
                                >
                                  {action.puzzle.prompt}
                                </p>
                                {action.hint && (
                                  <p
                                    className="text-xs text-stone-600"
                                    style={{ fontFamily: "Georgia, serif" }}
                                  >
                                    Hint: {action.hint}
                                  </p>
                                )}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={puzzleAnswer}
                                    onChange={(e) => setPuzzleAnswer(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAction(action)}
                                    placeholder={t("boss.answer_placeholder")}
                                    className="flex-1 bg-stone-900 border border-amber-900/40 rounded-lg px-3 py-2 text-amber-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-700 placeholder-amber-900"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleAction(action)}
                                    loading={loading === action.id}
                                  >
                                    {t("boss.submit")}
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
                                {t("boss.solve_puzzle")}
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
                            🍺 Pay {action.offerCost} Offer — {action.damage} damage
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
                            {loading === action.id ? t("boss.applying_clue") : t("boss.use_clue")}
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
                            {t("boss.group_decision")}
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
