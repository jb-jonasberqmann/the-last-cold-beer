"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { dealBossDamage } from "@/lib/game/actions";
import { GameLayout } from "@/components/layout/GameLayout";
import { getBoss } from "@/content/bosses";
import { getClue } from "@/content/clues";
import { localizeBoss } from "@/lib/content/localize";
import type { DbGame, DbBossProgress, DbTeamClue, DbRoomProgress, DbGameEvent, DbTeamProgress } from "@/types/database";
import type { TeamId, BossAction } from "@/types/content";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

// ── Artwork mapping — extend as new bosses are added ──────────────────────────
const BOSS_ARTWORK: Record<string, string> = {
  "locked-cooler": "/rooms/boss-cooler.png",
};

// Clue hint labels per puzzle action (shown in cyan under the card description)
const PUZZLE_CLUE_HINTS: Record<string, string> = {
  "cooler-p1-puzzle":    "Uses the Terrace Inscription.",
  "cooler-p2-puzzle":    "Uses the Shed Inventory.",
  "cooler-p4-final-open": "Requires all three clues.",
};

interface Props {
  params: { gameId: string; bossId: string };
}

export default function BossFightPage({ params }: Props) {
  const gameId = params.gameId;
  const bossId = params.bossId;
  const { lang } = useLanguage();
  const router = useRouter();

  const searchParams = useSearchParams();
  const { session } = usePlayer();
  const teamId = (searchParams.get("team") ?? session?.teamId ?? "team-a") as TeamId;

  const rawBoss = bossId ? getBoss(bossId) : null;
  const boss = rawBoss ? localizeBoss(rawBoss, lang) : null;

  // ── State ─────────────────────────────────────────────────────────────────
  const [game, setGame] = useState<DbGame | null>(null);
  const [bossProgressA, setBossProgressA] = useState<DbBossProgress | null>(null);
  const [bossProgressB, setBossProgressB] = useState<DbBossProgress | null>(null);
  const [teamClues, setTeamClues] = useState<DbTeamClue[]>([]);
  const [roomProgress, setRoomProgress] = useState<DbRoomProgress[]>([]);
  const [usedBossActionIds, setUsedBossActionIds] = useState<string[]>([]);
  const [events, setEvents] = useState<DbGameEvent[]>([]);
  const [offerSpent, setOfferSpent] = useState(0);

  const [feedback, setFeedback] = useState<{ actionId: string; text: string; success: boolean } | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"fight" | "clues" | "log">("fight");

  // Free action (secret room advantage)
  const freeActionUsedKey = `boss_free_action_used_${gameId}_${teamId}_${bossId}`;
  const [freeActionUsed, setFreeActionUsed] = useState(() => {
    try { return !!localStorage.getItem(freeActionUsedKey); } catch { return false; }
  });

  // Auto-applied clue tracking
  const autoAppliedKey = `boss_auto_applied_${gameId}_${teamId}_${bossId}`;
  const autoApplied = useRef<Set<string>>(new Set());
  const [autoApplyNotices, setAutoApplyNotices] = useState<{ actionId: string; label: string; damage: number }[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(autoAppliedKey);
      if (stored) autoApplied.current = new Set(JSON.parse(stored));
    } catch {}
  }, [autoAppliedKey]);

  // ── Data fetch ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!gameId || !boss) return;
    const res = await fetch(`/api/game/${gameId}/progress?teamId=${teamId}`);
    if (!res.ok) return;
    const data = await res.json();
    setGame(data.game);
    setTeamClues(data.clues ?? []);
    setRoomProgress(data.roomProgress ?? []);
    setUsedBossActionIds(data.usedBossActionIds ?? []);
    setEvents(data.events ?? []);

    const bossRows: DbBossProgress[] = data.bossProgress ?? [];
    setBossProgressA(bossRows.find((b) => b.team_id === "team-a") ?? null);
    setBossProgressB(bossRows.find((b) => b.team_id === "team-b") ?? null);

    // Offer spent — from team_progress (total) as proxy for current balance
    const myTp = (data.teamProgress as DbTeamProgress[] ?? []).find((tp) => tp.team_id === teamId);
    if (myTp) setOfferSpent(myTp.offer_spent ?? 0);
  }, [gameId, boss, teamId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeGame(gameId ?? undefined, fetchData);

  // ── Auto-apply clue damage ─────────────────────────────────────────────────
  useEffect(() => {
    if (!boss || !game || teamClues.length === 0) return;
    if (session?.isHost) return;

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

    (async () => {
      for (const action of toApply) {
        autoApplied.current.add(action.id);
        try { localStorage.setItem(autoAppliedKey, JSON.stringify(Array.from(autoApplied.current))); } catch {}
        const result = await dealBossDamage(gameId, teamId, bossId, action.id);
        if (result.success && result.data.damage > 0) {
          setAutoApplyNotices((prev) => [...prev, { actionId: action.id, label: action.label, damage: result.data.damage }]);
        }
      }
      fetchData();
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamClues, bossProgressA, bossProgressB]);

  if (!boss || !game || !gameId || !bossId) return null;

  // ── Prerequisites gate ────────────────────────────────────────────────────
  const prerequisitesMet =
    !rawBoss?.requiredRoomIds?.length ||
    rawBoss.requiredRoomIds.every((rid) =>
      roomProgress.some((rp) => rp.room_id === rid && rp.status === "complete")
    );

  if (!prerequisitesMet) {
    const missing = rawBoss!.requiredRoomIds!.filter(
      (rid) => !roomProgress.some((rp) => rp.room_id === rid && rp.status === "complete")
    );
    return (
      <GameLayout gameId={gameId} teamId={teamId} backHref={`/game/${gameId}/team/${teamId}`} backLabel="Quest Board" title={boss.title}>
        <div className="rounded-xl bg-stone-950 border border-red-900/50 p-6 text-center mt-6" style={{ fontFamily: "Georgia, serif" }}>
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-bold text-red-300 mb-2">Not Yet</h2>
          <p className="text-sm text-stone-400 mb-4">Complete the required rooms first to challenge this boss.</p>
          <div className="text-xs text-amber-800">Missing: {missing.join(", ")}</div>
        </div>
      </GameLayout>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const myBossProgress   = teamId === "team-a" ? bossProgressA : bossProgressB;
  const otherBossProgress = teamId === "team-a" ? bossProgressB : bossProgressA;
  const currentHp     = myBossProgress?.current_hp ?? boss.maxHp;
  const currentPhase  = myBossProgress?.current_phase ?? 1;
  const isDefeated    = myBossProgress?.status === "defeated";
  const hpPercent     = (currentHp / boss.maxHp) * 100;
  const isLowHp       = hpPercent <= 25 && !isDefeated;

  const phase       = boss.phases.find((p) => p.phase === currentPhase) ?? boss.phases[0];
  const teamName    = teamId === "team-a" ? game.team_a_name : game.team_b_name;
  const otherTeamName = teamId === "team-a" ? game.team_b_name : game.team_a_name;
  const canInteract = !session?.isHost;

  const hasClue       = (clueId: string) => teamClues.some((tc) => tc.clue_id === clueId);
  const isPuzzleUsed  = (actionId: string) => usedBossActionIds.includes(actionId);
  const bossImage     = BOSS_ARTWORK[bossId] ?? null;

  const hasBossFreeAction = roomProgress.some(
    (rp) => rp.room_id === "coffee-table" && rp.status === "complete"
  );

  const bossEvents = events.filter((e) =>
    e.event_type === "boss_damaged" || e.event_type === "boss_defeated"
  );
  const lastBossEvent = bossEvents[bossEvents.length - 1] ?? null;

  // ── Action helpers ────────────────────────────────────────────────────────
  const getActionIcon = (action: BossAction) => {
    switch (action.type) {
      case "puzzle":      return "🧩";
      case "offer_boost": return "🍺";
      case "clue_check":  return "🗝️";
      case "social":      return "⚡";
      default:            return "⚔️";
    }
  };

  const handleFreeAction = async () => {
    setLoading("free-action");
    const result = await dealBossDamage(gameId, teamId, bossId, "cooler-p1-offer-boost", "", true);
    setLoading(null);
    try { localStorage.setItem(freeActionUsedKey, "1"); } catch {}
    setFreeActionUsed(true);
    if (result.success) {
      setFeedback({ actionId: "free-action", text: `🎯 Free action! ${result.data.damage > 0 ? `${result.data.damage} damage.` : ""} ${result.data.rewardText ?? ""}`, success: true });
      fetchData();
    }
  };

  const handleAction = async (action: BossAction) => {
    setLoading(action.id);
    const result = await dealBossDamage(gameId, teamId, bossId, action.id, puzzleAnswer);
    setLoading(null);
    if (result.success) {
      setFeedback({
        actionId: action.id,
        text: result.data.defeated
          ? boss.defeatText
          : result.data.damage > 0
          ? `💥 ${result.data.damage} damage! HP now ${result.data.newHp}. ${result.data.rewardText ?? ""}`
          : result.data.failureText ?? "No damage dealt.",
        success: result.data.damage > 0,
      });
      setPuzzleAnswer("");
      setActiveActionId(null);
      fetchData();
    } else {
      setFeedback({ actionId: action.id, text: result.error ?? "Something went wrong.", success: false });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <GameLayout
      gameId={gameId}
      teamId={teamId}
      backHref={`/game/${gameId}/team/${teamId}`}
      backLabel="Quest Board"
      title={boss.title}
    >
      {/* ── CSS animations ── */}
      <style>{`
        @keyframes steamRise {
          0%   { transform: translateY(0)    scale(1);   opacity: 0;    }
          12%  { opacity: 0.5; }
          65%  { opacity: 0.18; }
          100% { transform: translateY(-88px) scale(2.2); opacity: 0; }
        }
        @keyframes steamSway1 {
          0%,100% { transform: translateX(0); }
          38%     { transform: translateX(-10px); }
          72%     { transform: translateX(7px);  }
        }
        @keyframes steamSway2 {
          0%,100% { transform: translateX(0); }
          35%     { transform: translateX(9px); }
          68%     { transform: translateX(-6px); }
        }
        @keyframes lockGlow {
          0%,100% { filter: drop-shadow(0 0 5px rgba(255,140,0,0.4)); }
          50%     { filter: drop-shadow(0 0 16px rgba(255,140,0,0.85)) drop-shadow(0 0 28px rgba(255,80,0,0.3)); }
        }
        @keyframes lockGlowRed {
          0%,100% { filter: drop-shadow(0 0 6px rgba(220,30,0,0.55)); }
          50%     { filter: drop-shadow(0 0 20px rgba(220,30,0,0.95)) drop-shadow(0 0 38px rgba(180,0,0,0.35)); }
        }
        @keyframes redPulse {
          0%,100% { opacity: 0;    }
          50%     { opacity: 0.12; }
        }
        @keyframes angryShake {
          0%,100% { transform: translateX(0) rotate(0deg); }
          12%     { transform: translateX(-3px) rotate(-0.4deg); }
          28%     { transform: translateX(3px)  rotate(0.4deg);  }
          44%     { transform: translateX(-2px) rotate(-0.2deg); }
          60%     { transform: translateX(2px)  rotate(0.2deg);  }
          76%     { transform: translateX(-1px) rotate(0deg);    }
        }
      `}</style>

      {/* ── Hero image ── */}
      <div
        className="relative -mx-4 overflow-hidden"
        style={{ height: "clamp(160px, 48vw, 230px)", marginTop: -4 }}
      >
        {bossImage ? (
          <img
            src={bossImage}
            alt={boss.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              animation: isLowHp ? "angryShake 0.75s ease-in-out infinite" : undefined,
              filter: isLowHp ? "brightness(0.8) contrast(1.15) saturate(1.2)" : "brightness(0.95)",
            }}
          />
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br", boss.look.colorFrom, boss.look.colorTo)} />
        )}

        {/* Low-HP red pulse */}
        {isLowHp && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 35%, rgba(200,0,0,0.3) 100%)",
              animation: "redPulse 1.4s ease-in-out infinite",
            }}
          />
        )}

        {/* Steam particles — 8 wisps at varied positions */}
        {[
          { w: 14, h: 9,  left: "18%", bottom: "48%", dur: 3.3, delay: 0,   sway: "steamSway1" },
          { w: 20, h: 13, left: "31%", bottom: "52%", dur: 2.9, delay: 0.8, sway: "steamSway2" },
          { w: 11, h: 7,  left: "45%", bottom: "55%", dur: 3.9, delay: 1.6, sway: "steamSway1" },
          { w: 18, h: 11, left: "58%", bottom: "50%", dur: 3.1, delay: 0.4, sway: "steamSway2" },
          { w: 13, h: 8,  left: "70%", bottom: "46%", dur: 2.6, delay: 2.0, sway: "steamSway1" },
          { w: 16, h: 10, left: "24%", bottom: "43%", dur: 3.6, delay: 1.2, sway: "steamSway2" },
          { w: 10, h: 6,  left: "52%", bottom: "42%", dur: 4.1, delay: 0.6, sway: "steamSway1" },
          { w: 22, h: 14, left: "76%", bottom: "54%", dur: 3.4, delay: 1.9, sway: "steamSway2" },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute pointer-events-none rounded-full"
            style={{
              width: s.w, height: s.h,
              left: s.left, bottom: s.bottom,
              background: "rgba(190,210,230,0.22)",
              filter: "blur(5px)",
              animation: `steamRise ${s.dur}s ease-out ${s.delay}s infinite, ${s.sway} ${s.dur * 0.55}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}

        {/* Gradient vignette — bottom to transparent */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "70%",
            background: "linear-gradient(to top, rgba(5,3,1,0.96) 0%, rgba(5,3,1,0.45) 55%, transparent 100%)",
          }}
        />

        {/* Lock medallion */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <div
            className="w-11 h-11 rounded-full bg-stone-900/90 border border-amber-700/50 flex items-center justify-center text-2xl"
            style={{ animation: isLowHp ? "lockGlowRed 1.1s ease-in-out infinite" : "lockGlow 2.8s ease-in-out infinite" }}
          >
            {boss.look.icon}
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-2 inset-x-0 text-center px-4">
          <h2
            className="text-2xl font-bold tracking-[0.1em] uppercase"
            style={{ color: "#d4a520", fontFamily: "Georgia, serif", textShadow: "0 1px 10px rgba(0,0,0,0.9)" }}
          >
            {boss.title}
          </h2>
          <p className="text-xs italic text-stone-400 mt-0.5" style={{ fontFamily: "Georgia, serif" }}>
            {boss.subtitle}
          </p>
        </div>
      </div>

      {/* ── HP card ── */}
      <div className="rounded-xl bg-stone-950 border border-amber-900/20 p-3 mt-3" style={{ fontFamily: "Georgia, serif" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-amber-100">{teamName}</span>
            <span className="text-xs text-stone-600">vs</span>
            <span className="text-xl">{boss.icon}</span>
          </div>
          <span className="text-xs text-amber-800">Phase {currentPhase}/{boss.phases.length}</span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-xs text-stone-500">HP:</span>
          <span className="text-base font-bold text-white">{currentHp}</span>
          <span className="text-xs text-stone-600">/{boss.maxHp}</span>
        </div>

        {/* Segmented HP bar */}
        <div>
          <div className="flex h-[18px] rounded-full overflow-hidden gap-[2px] bg-stone-900">
            {boss.phases.map((ph, i) => {
              const prevPct  = i === 0 ? 100 : boss.phases[i - 1].hpThreshold;
              const thisPct  = ph.hpThreshold;
              const span     = prevPct - thisPct;
              const topHp    = (prevPct / 100) * boss.maxHp;
              const botHp    = (thisPct / 100) * boss.maxHp;
              const fill     = Math.max(0, Math.min(1, (Math.max(0, currentHp) - botHp) / (topHp - botHp)));
              const isActive = ph.phase === currentPhase;
              return (
                <div key={ph.phase} className="relative" style={{ flex: span }}>
                  <div className="absolute inset-0 bg-stone-800" />
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-700"
                    style={{
                      width: `${fill * 100}%`,
                      background: fill > 0.6
                        ? "linear-gradient(90deg, #c4880a, #f0b020)"
                        : fill > 0.3
                        ? "linear-gradient(90deg, #a05808, #d08010)"
                        : "linear-gradient(90deg, #7a1806, #b02808)",
                    }}
                  />
                  {isActive && fill > 0 && (
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,200,80,0.12) 100%)" }} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex mt-1">
            {boss.phases.map((ph, i) => {
              const prevPct = i === 0 ? 100 : boss.phases[i - 1].hpThreshold;
              const span    = prevPct - ph.hpThreshold;
              return (
                <div key={ph.phase} className="text-center" style={{ flex: span }}>
                  <span className={cn("text-[9px]", ph.phase === currentPhase ? "text-amber-400 font-bold" : "text-stone-600")}>
                    P{ph.phase}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Other team strip */}
        {otherBossProgress && (
          <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-stone-800/50">
            <span className="text-stone-600" style={{ fontFamily: "Georgia, serif" }}>{otherTeamName}</span>
            {otherBossProgress.status === "defeated" ? (
              <span className="text-amber-700">💀 Defeated</span>
            ) : (
              <span className="text-red-500">{otherBossProgress.current_hp}/{boss.maxHp} HP</span>
            )}
          </div>
        )}
      </div>

      {/* ── Auto-apply notices ── */}
      {autoApplyNotices.map((n) => (
        <div
          key={n.actionId}
          className="flex items-center gap-2.5 mt-2 rounded-xl px-3 py-2.5 border border-amber-600/40"
          style={{ background: "rgba(65,38,4,0.92)", fontFamily: "Georgia, serif" }}
        >
          <span className="text-lg">🗝️</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Clue Applied Automatically</div>
            <div className="text-sm text-amber-200 truncate">{n.label}</div>
          </div>
          <span className="text-red-400 font-bold text-sm flex-shrink-0">-{n.damage} HP</span>
          <button
            onClick={() => setAutoApplyNotices((prev) => prev.filter((x) => x.actionId !== n.actionId))}
            className="text-amber-900 hover:text-amber-700 text-sm flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}

      {/* ── Defeated state ── */}
      {isDefeated ? (
        <div className="rounded-xl bg-stone-950 border border-amber-800/50 p-5 mt-3 text-center" style={{ fontFamily: "Georgia, serif" }}>
          <div className="text-3xl mb-2">💀</div>
          <h2 className="text-lg font-bold text-amber-300 mb-2">Defeated!</h2>
          <p className="text-sm text-amber-200/80 leading-relaxed">{boss.defeatText}</p>
          <div className="mt-3 text-xs text-amber-800 italic">{boss.victoryAdvantage}</div>
        </div>
      ) : (
        <>
          {/* ── Tab bar ── */}
          <div className="flex mt-3 border-b border-stone-800">
            {([
              { id: "fight", label: "⚔", text: "FIGHT" },
              { id: "clues", label: "🗝",  text: "CLUES" },
              { id: "log",   label: "📋", text: "LOG"   },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] tracking-widest font-bold transition-colors",
                  activeTab === tab.id
                    ? "text-amber-400 border-b-2 border-amber-400 -mb-px"
                    : "text-stone-600 hover:text-stone-400"
                )}
                style={{ fontFamily: "Georgia, serif" }}
              >
                <span>{tab.label}</span>
                <span>{tab.text}</span>
              </button>
            ))}
          </div>

          {/* ═══ FIGHT TAB ═══ */}
          {activeTab === "fight" && canInteract && phase && (
            <div className="mt-3 space-y-3 pb-24">
              {/* Phase text */}
              <p className="text-xs text-stone-500 leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
                {phase.description}
              </p>

              {/* Feedback */}
              {feedback && (
                <div
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm border",
                    feedback.success
                      ? "bg-stone-950 border-amber-800/40 text-amber-300"
                      : "bg-red-950/20 border-red-900/40 text-red-300"
                  )}
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {feedback.text}
                </div>
              )}

              {/* Secret advantage card (if applicable) */}
              {hasBossFreeAction && (
                <div
                  className="rounded-xl border border-stone-700/40 p-3 flex items-center gap-3"
                  style={{ background: "rgba(8,16,22,0.85)", fontFamily: "Georgia, serif" }}
                >
                  <div className="w-9 h-9 rounded-lg bg-stone-800/80 flex items-center justify-center text-lg flex-shrink-0">🎯</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-cyan-400">Sofabord-fordel</div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {freeActionUsed ? "Used this fight" : "Free action — no Offer cost"}
                    </div>
                  </div>
                  {freeActionUsed ? (
                    <div className="w-7 h-7 rounded-full border border-stone-700 flex items-center justify-center text-stone-500">✓</div>
                  ) : (
                    <button
                      onClick={handleFreeAction}
                      disabled={!!loading}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold text-cyan-300 border border-cyan-800/40 disabled:opacity-50"
                      style={{ background: "rgba(0,60,80,0.4)" }}
                    >
                      {loading === "free-action" ? "…" : "Use"}
                    </button>
                  )}
                </div>
              )}

              {/* ── 2-column action grid ── */}
              <div className="grid grid-cols-2 gap-2">
                {phase.actions.map((action) => {
                  const isUsedPuzzle  = action.type === "puzzle" && isPuzzleUsed(action.id);
                  const needsClue     = action.type === "clue_check" && !!action.requiredClueId && !hasClue(action.requiredClueId);
                  const isAutoApplied = autoApplied.current.has(action.id);
                  const isExpanded    = activeActionId === action.id;
                  const clueHint      = PUZZLE_CLUE_HINTS[action.id] ?? null;
                  const isDimmed      = isUsedPuzzle || needsClue || isAutoApplied;

                  return (
                    <div
                      key={action.id}
                      className={cn(
                        "rounded-xl border flex flex-col p-3 transition-all",
                        isDimmed ? "opacity-45 border-stone-800/50" : isExpanded ? "border-amber-700/50" : "border-stone-700/40"
                      )}
                      style={{ background: isExpanded ? "rgba(28,18,6,0.96)" : "rgba(12,8,4,0.88)" }}
                    >
                      {/* Card header row */}
                      <div className="flex items-start gap-1.5 mb-1.5">
                        <span className="text-[17px] leading-none flex-shrink-0 mt-0.5">{getActionIcon(action)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-amber-100 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                              {action.label}
                            </h4>
                            <span className="text-[11px] font-bold text-red-400 flex-shrink-0 ml-1">-{action.damage} HP</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[10px] text-stone-400 leading-snug mb-2 flex-1" style={{ fontFamily: "Georgia, serif" }}>
                        {action.description}
                      </p>

                      {/* Clue puzzle hint */}
                      {clueHint && !isUsedPuzzle && (
                        <p className="text-[10px] text-cyan-700 italic mb-1.5" style={{ fontFamily: "Georgia, serif" }}>
                          {clueHint}
                        </p>
                      )}

                      {/* Offer cost badge */}
                      {action.offerCost && !needsClue && (
                        <div className="text-[10px] text-amber-700 mb-1.5">🍺 {action.offerCost}</div>
                      )}

                      {/* ── Action area ── */}
                      {isUsedPuzzle ? (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700" style={{ fontFamily: "Georgia, serif" }}>
                          <span>✓</span><span className="italic">Puzzle solved</span>
                        </div>
                      ) : isAutoApplied ? (
                        <div className="flex items-center gap-1 text-[10px] text-amber-800" style={{ fontFamily: "Georgia, serif" }}>
                          <span>✓</span><span className="italic">Applied</span>
                        </div>
                      ) : needsClue ? (
                        <div className="text-[10px] text-stone-600 italic" style={{ fontFamily: "Georgia, serif" }}>
                          🔒 {getClue(action.requiredClueId!)?.title ?? "Clue required"}
                        </div>
                      ) : action.type === "puzzle" && action.puzzle ? (
                        isExpanded ? (
                          <div className="space-y-1.5 mt-1">
                            <p className="text-[10px] text-amber-200/75 italic leading-snug" style={{ fontFamily: "Georgia, serif" }}>
                              {action.puzzle.prompt}
                            </p>
                            {action.hint && (
                              <p className="text-[10px] text-stone-600" style={{ fontFamily: "Georgia, serif" }}>
                                Hint: {action.hint}
                              </p>
                            )}
                            <input
                              type="text"
                              value={puzzleAnswer}
                              onChange={(e) => setPuzzleAnswer(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleAction(action)}
                              placeholder="Answer…"
                              className="w-full bg-stone-900 border border-amber-900/40 rounded-lg px-2.5 py-2 text-amber-100 placeholder-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
                              style={{ fontSize: "16px", touchAction: "manipulation", fontFamily: "Georgia, serif" }}
                            />
                            <button
                              onClick={() => handleAction(action)}
                              disabled={!!loading}
                              className="w-full py-2 text-xs font-bold rounded-lg border border-stone-700/50 text-stone-200 disabled:opacity-50"
                              style={{ background: "rgba(22,18,12,0.9)", fontFamily: "Georgia, serif" }}
                            >
                              {loading === action.id ? "…" : "Submit Answer"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveActionId(action.id)}
                            className="w-full py-2 text-xs font-bold rounded-lg border border-stone-700/50 text-stone-300"
                            style={{ background: "rgba(18,16,12,0.85)", fontFamily: "Georgia, serif" }}
                          >
                            Solve Puzzle
                          </button>
                        )
                      ) : action.type === "offer_boost" ? (
                        <button
                          onClick={() => handleAction(action)}
                          disabled={!!loading}
                          className="w-full py-2 text-xs font-bold rounded-lg text-stone-900 disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg, #c88010, #f0b020)", fontFamily: "Georgia, serif" }}
                        >
                          {loading === action.id ? "…" : `🍺 Pay ${action.offerCost} — ${action.damage} damage`}
                        </button>
                      ) : action.type === "clue_check" ? (
                        <button
                          onClick={() => handleAction(action)}
                          disabled={!!loading}
                          className="w-full py-2 text-xs font-bold rounded-lg border border-amber-700/35 text-amber-300 disabled:opacity-50"
                          style={{ background: "rgba(36,22,4,0.75)", fontFamily: "Georgia, serif" }}
                        >
                          {loading === action.id ? "…" : "Use Clue"}
                        </button>
                      ) : action.type === "social" ? (
                        <button
                          onClick={() => handleAction(action)}
                          disabled={!!loading}
                          className="w-full py-2 text-xs font-bold rounded-lg border border-stone-600/40 text-stone-300 disabled:opacity-50"
                          style={{ background: "rgba(18,16,12,0.85)", fontFamily: "Georgia, serif" }}
                        >
                          {loading === action.id ? "…" : "Group Decision"}
                        </button>
                      ) : null}
                    </div>
                  );
                })}

                {/* Future phases placeholder */}
                {boss.phases.some((p) => p.phase > currentPhase) && (
                  <div
                    className="rounded-xl border border-stone-800/30 flex flex-col items-center justify-center p-3 opacity-30"
                    style={{ background: "rgba(6,4,2,0.6)", minHeight: 110 }}
                  >
                    <span className="text-xl mb-1.5">🔒</span>
                    <p className="text-[10px] text-stone-600 text-center leading-snug" style={{ fontFamily: "Georgia, serif" }}>
                      More actions unlock in later phases.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ CLUES TAB ═══ */}
          {activeTab === "clues" && (
            <div className="mt-3 space-y-2 pb-24">
              {teamClues.length === 0 ? (
                <p className="text-xs text-stone-600 italic text-center py-8" style={{ fontFamily: "Georgia, serif" }}>
                  No clues gathered yet. Complete rooms to find them.
                </p>
              ) : teamClues.map((tc) => {
                const clue = getClue(tc.clue_id);
                return (
                  <div
                    key={tc.clue_id}
                    className="rounded-xl border border-amber-900/20 p-3 flex items-start gap-2.5"
                    style={{ background: "rgba(10,7,3,0.92)", fontFamily: "Georgia, serif" }}
                  >
                    <span className="text-base mt-0.5">🗝️</span>
                    <div>
                      <div className="text-sm font-bold text-amber-200">{clue?.title ?? tc.clue_id}</div>
                      {clue?.description && (
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">{clue.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ LOG TAB ═══ */}
          {activeTab === "log" && (
            <div className="mt-3 space-y-1.5 pb-24">
              {bossEvents.length === 0 ? (
                <p className="text-xs text-stone-600 italic text-center py-8" style={{ fontFamily: "Georgia, serif" }}>
                  No events yet.
                </p>
              ) : [...bossEvents].reverse().map((ev, i) => {
                const ed = ev.event_data ?? {};
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-stone-800/25 px-3 py-2.5 flex items-start gap-2.5"
                    style={{ background: "rgba(8,6,3,0.85)", fontFamily: "Georgia, serif" }}
                  >
                    <span className="text-sm mt-0.5">
                      {ev.event_type === "boss_damaged" ? "💥" : "💀"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-stone-500 capitalize">
                        {ev.event_type.replace(/_/g, " ")}
                      </div>
                      {ed.action_id != null && (
                        <div className="text-xs text-amber-800 truncate">{String(ed.action_id)}</div>
                      )}
                      {ed.damage != null && (
                        <div className="text-[10px] text-red-500 font-bold">-{String(ed.damage)} HP</div>
                      )}
                    </div>
                    <span className="text-[9px] text-stone-700 flex-shrink-0">
                      {new Date(ev.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Recent event strip ── */}
      {lastBossEvent && !isDefeated && (
        <div
          className="flex items-center gap-2 px-0 py-2 border-t border-stone-800/30 mt-2"
          style={{ background: "rgba(4,3,1,0)", fontFamily: "Georgia, serif" }}
        >
          <span className="text-xs text-stone-600">📜</span>
          <p className="flex-1 text-[10px] text-stone-500 line-clamp-2">
            <span className="text-amber-800 font-bold">RECENT: </span>
            {String(lastBossEvent.event_data?.action_id ?? "action")}
            {lastBossEvent.event_data?.damage ? `. ${String(lastBossEvent.event_data.damage)} damage dealt.` : "."}
          </p>
          <button
            onClick={() => setActiveTab("log")}
            className="text-[10px] text-amber-800 hover:text-amber-600 flex-shrink-0"
          >
            View Log
          </button>
        </div>
      )}

      {/* ── Bottom action bar (fixed) ── */}
      {!isDefeated && canInteract && (
        <div
          className="fixed bottom-0 inset-x-0 flex items-center h-[68px] px-4 gap-3 border-t border-stone-800/40 z-30"
          style={{ background: "rgba(4,3,1,0.97)" }}
        >
          {/* Offer count */}
          <div
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full border border-amber-900/35 flex-shrink-0"
            style={{ background: "rgba(18,12,4,0.95)", fontFamily: "Georgia, serif" }}
          >
            <span className="text-lg leading-none">🍺</span>
            <span className="text-[9px] text-amber-600 font-bold mt-0.5">{offerSpent}</span>
          </div>

          {/* Team Action */}
          <button
            className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl font-bold text-stone-900"
            style={{
              background: "linear-gradient(135deg, #b87010, #e0a020)",
              fontFamily: "Georgia, serif",
            }}
            onClick={() => setActiveTab("fight")}
          >
            <span className="text-sm tracking-widest">TEAM ACTION</span>
            <span className="text-[9px] font-normal opacity-70 tracking-wide">Plan together and act</span>
          </button>

          {/* Retreat */}
          <button
            onClick={() => router.push(`/game/${gameId}/team/${teamId}`)}
            className="flex flex-col items-center gap-0.5 w-12 flex-shrink-0"
          >
            <span className="text-lg">🏳</span>
            <span className="text-[9px] text-stone-600" style={{ fontFamily: "Georgia, serif" }}>Retreat</span>
          </button>
        </div>
      )}
    </GameLayout>
  );
}
