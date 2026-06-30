"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { dealBossDamage, applyBossDamage } from "@/lib/game/actions";
import { formatOfferCost } from "@/lib/game/formatOffer";
import { GameLayout } from "@/components/layout/GameLayout";
import { getBoss } from "@/content/bosses";
import { getClue } from "@/content/clues";
import { localizeBoss } from "@/lib/content/localize";
import type { DbGame, DbBossProgress, DbTeamClue, DbRoomProgress, DbGameEvent, DbTeamProgress } from "@/types/database";
import type { TeamId, BossAction } from "@/types/content";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

// ── Artwork mapping ────────────────────────────────────────────────────────────
const BOSS_ARTWORK: Record<string, string> = {
  "mads":       "/bosses/mads.png",
  "the-radio":  "/bosses/the-radio.png",
  "yourselves": "/bosses/yourselves.png",
};

// Clue hint labels per puzzle action (shown in cyan under the card description)
const PUZZLE_CLUE_HINTS: Record<string, string> = {
  "radio-frequency": "Uses the Broadcast Log from the Tool Shed.",
  "radio-fuse":      "Check what you found in the Bunk Room.",
  "yourselves-a1":   "Requires the artifact from Act 1.",
  "yourselves-a2":   "Requires both team artifacts combined.",
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

  // Drunk gamble mechanic
  const [drunkModal, setDrunkModal] = useState(false);
  const [drunkSips, setDrunkSips] = useState(1);
  const [resistAnim, setResistAnim] = useState(false); // boss resist animation
  const [gambleResult, setGambleResult] = useState<{ won: boolean; wagered: number; damage: number; newHp?: number } | null>(null);
  const [hpFlash, setHpFlash] = useState(false); // triggers hit-flash on HP bar

  // Track sips already wagered so the pool shrinks with each gamble
  const sipsWageredKey = `boss_sips_wagered_${gameId}_${teamId}_${bossId}`;
  const [sipsWagered, setSipsWagered] = useState(() => {
    try { return parseInt(localStorage.getItem(sipsWageredKey) ?? "0", 10) || 0; } catch { return 0; }
  });
  const availableForGamble = Math.max(0, offerSpent - sipsWagered);

  // Keep drunkSips in range [1, availableForGamble] whenever pool changes
  useEffect(() => {
    if (availableForGamble > 0) setDrunkSips((prev) => Math.min(prev, availableForGamble));
  }, [availableForGamble]);

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
  const isActionUsed  = (actionId: string) => usedBossActionIds.includes(actionId);
  const bossImage     = BOSS_ARTWORK[bossId] ?? null;

  // Free action: Act 1 boss — complete "landing-strip" (outdoor clearing) unlocks a free boost
  // Act 2 boss — completing "tool-shed" unlocks a free radio sabotage action
  const FREE_ACTION_ROOM: Record<string, string> = {
    "mads":       "landing-strip",
    "the-radio":  "tool-shed",
  };
  const freeActionRoom = FREE_ACTION_ROOM[bossId] ?? null;
  const hasBossFreeAction = freeActionRoom
    ? roomProgress.some((rp) => rp.room_id === freeActionRoom && rp.status === "complete")
    : false;

  const FREE_ACTION_ID: Record<string, string> = {
    "mads":      "mads-offer-boost",
    "the-radio": "radio-offer-boost",
  };
  const freeActionId = FREE_ACTION_ID[bossId] ?? "offer-boost";

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
      case "choice":      return "🗳️";
      default:            return "⚔️";
    }
  };

  const handleFreeAction = async () => {
    setLoading("free-action");
    const result = await dealBossDamage(gameId, teamId, bossId, freeActionId, "", true);
    setLoading(null);
    if (result.success && result.data.damage > 0) {
      try { localStorage.setItem(freeActionUsedKey, "1"); } catch {}
      setFreeActionUsed(true);
      setFeedback({ actionId: "free-action", text: `🎯 Coffee Table Bonus! ${result.data.damage} damage dealt. ${result.data.rewardText ?? ""}`, success: true });
      fetchData();
    } else {
      const msg = result.success ? (result.data.failureText ?? "No damage dealt.") : (result.error ?? "Something went wrong.");
      setFeedback({ actionId: "free-action", text: msg, success: false });
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

  const handleDrunkGamble = async () => {
    const wagered = drunkSips;      // sips on the line
    const bossDamage = wagered * 3; // boss takes 3× if it loses
    setLoading("drunk-gamble");
    setDrunkModal(false);
    setActiveTab("fight");

    // Always deduct from the sip pool regardless of outcome
    const newWagered = sipsWagered + wagered;
    setSipsWagered(newWagered);
    try { localStorage.setItem(sipsWageredKey, String(newWagered)); } catch {}

    const isSuccessful = Math.random() < 0.5;

    try {
      if (isSuccessful) {
        // Boss drinks — takes wagered × 3 damage
        const result = await applyBossDamage(gameId, teamId, bossId, wagered, bossDamage);
        if (result.success) {
          setGambleResult({ won: true, wagered, damage: bossDamage, newHp: result.data.newHp });
          setHpFlash(true);
          setTimeout(() => setHpFlash(false), 600);
          setTimeout(() => setGambleResult(null), 5000);
          setFeedback({
            actionId: "drunk-gamble",
            text: result.data.defeated
              ? `🍺 The boss is completely drunk! ${boss.defeatText}`
              : `🍺 Boss drinks ${bossDamage} sips (${wagered}×3)! HP: ${result.data.newHp}`,
            success: true,
          });
          await fetchData();
        } else {
          // Server error — refund the sips
          const refunded = sipsWagered; // already incremented above
          const refundedWagered = refunded - wagered;
          setSipsWagered(refundedWagered);
          try { localStorage.setItem(sipsWageredKey, String(refundedWagered)); } catch {}
          setFeedback({ actionId: "drunk-gamble", text: result.error ?? "Gamble failed — sips refunded.", success: false });
        }
      } else {
        // Boss resists — team must drink the wagered amount IRL
        setResistAnim(true);
        setGambleResult({ won: false, wagered, damage: 0 });
        setTimeout(() => { setResistAnim(false); setGambleResult(null); }, 5000);
      }
      fetchData(); // always refresh HP/state
    } finally {
      setLoading(null);
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
        @keyframes resistBounce {
          0%   { transform: translateX(0)    scale(1);    }
          10%  { transform: translateX(-6px) scale(1.03); }
          22%  { transform: translateX(7px)  scale(1.04); }
          36%  { transform: translateX(-5px) scale(1.02); }
          50%  { transform: translateX(5px)  scale(1.03); }
          65%  { transform: translateX(-3px) scale(1.01); }
          80%  { transform: translateX(3px)  scale(1);    }
          100% { transform: translateX(0)    scale(1);    }
        }
        @keyframes resistFlash {
          0%   { opacity: 0;    }
          15%  { opacity: 0.55; }
          45%  { opacity: 0.40; }
          70%  { opacity: 0.20; }
          100% { opacity: 0;    }
        }
      `}</style>

      {/* ── Sticky hero + HP wrapper ── */}
      <div className="sticky top-0 z-20 -mx-4" style={{ background: "rgba(5,3,1,1)" }}>

      {/* ── Hero image ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: "clamp(130px, 38vw, 190px)", marginTop: -4 }}
      >
        {bossImage ? (
          <img
            src={bossImage}
            alt={boss.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              animation: resistAnim
                ? "resistBounce 0.9s ease-in-out"
                : isLowHp ? "angryShake 0.75s ease-in-out infinite" : undefined,
              filter: isLowHp ? "brightness(0.8) contrast(1.15) saturate(1.2)" : "brightness(0.95)",
            }}
          />
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br", boss.look.colorFrom, boss.look.colorTo)} />
        )}

        {/* Resist flash overlay */}
        {resistAnim && (
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ animation: "resistFlash 1.8s ease-out forwards" }}
          >
            <div className="absolute inset-0" style={{ background: "rgba(80,200,80,0.35)" }} />
            <span
              className="relative z-10 text-2xl font-black tracking-widest text-green-200 drop-shadow-lg select-none"
              style={{ fontFamily: "Georgia,serif", textShadow: "0 0 20px rgba(80,255,80,0.8)" }}
            >
              💪 RESISTS!
            </span>
          </div>
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
      </div>{/* end hero image */}

      {/* ── HP bar (inside sticky wrapper) ── */}
      <div className="px-4 pt-2 pb-2.5" style={{ fontFamily: "Georgia, serif" }}>
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <span className="text-xs text-stone-500">{teamName}</span>
          <span className="text-sm font-bold text-white ml-1">{currentHp}</span>
          <span className="text-xs text-stone-600">/ {boss.maxHp} HP</span>
          {otherBossProgress && (
            <span className="text-[10px] text-stone-600 ml-auto">
              {otherTeamName}:{" "}
              {otherBossProgress.status === "defeated"
                ? "💀"
                : `${otherBossProgress.current_hp} HP`}
            </span>
          )}
        </div>
        <div
          className="h-[10px] rounded-full overflow-hidden"
          style={{
            background: hpFlash ? "rgba(255,80,40,0.6)" : "rgb(28,25,23)",
            transition: "background 0.15s",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${hpPercent}%`,
              background: hpFlash
                ? "linear-gradient(90deg, #ff4020, #ff8040)"
                : hpPercent > 50
                ? "linear-gradient(90deg, #c4880a, #f0b020)"
                : hpPercent > 25
                ? "linear-gradient(90deg, #a05808, #d08010)"
                : "linear-gradient(90deg, #7a1806, #c02808)",
            }}
          />
        </div>
      </div>

      </div>{/* end sticky wrapper */}

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
          {/* YOURSELVES defeat → culprit reveal */}
          {bossId === "yourselves" && (
            <a
              href={`/game/${gameId}/reveal`}
              className="mt-5 inline-block px-6 py-3 rounded-lg text-sm font-bold"
              style={{ background: "rgba(120,10,10,0.6)", border: "1px solid rgba(220,60,60,0.4)", color: "rgb(254,202,202)", fontFamily: "Georgia,serif" }}
            >
              📻 Hear what the radio said →
            </a>
          )}
          {/* Radio defeat → Act 3 begins (act transition is server-side, just redirect to team page) */}
          {bossId === "the-radio" && (
            <a
              href={`/game/${gameId}/team/${teamId}`}
              className="mt-5 inline-block px-6 py-3 rounded-lg text-sm font-bold"
              style={{ background: "rgba(20,20,60,0.7)", border: "1px solid rgba(80,80,200,0.4)", color: "rgb(180,180,255)", fontFamily: "Georgia,serif" }}
            >
              🌑 The night begins →
            </a>
          )}
          {/* Mads defeat → back to quest board */}
          {bossId === "mads" && (
            <a
              href={`/game/${gameId}/team/${teamId}`}
              className="mt-5 inline-block px-6 py-3 rounded-lg text-sm font-bold"
              style={{ background: "rgba(30,20,8,0.7)", border: "1px solid rgba(180,130,50,0.3)", color: "rgb(245,215,130)", fontFamily: "Georgia,serif" }}
            >
              🏠 Enter the house →
            </a>
          )}
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
                    <div className="text-sm font-bold text-cyan-400">Coffee Table Bonus</div>
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
                {phase.actions.filter((action) => {
                  // Hide the opposing team's puzzles/clue-checks
                  if (action.id.includes("-team-a") && teamId !== "team-a") return false;
                  if (action.id.includes("-team-b") && teamId !== "team-b") return false;
                  return true;
                }).map((action) => {
                  const isUsedPuzzle  = action.type === "puzzle" && isActionUsed(action.id);
                  const isClueApplied = action.type === "clue_check" && isActionUsed(action.id);
                  const needsClue     = action.type === "clue_check" && !!action.requiredClueId && !hasClue(action.requiredClueId) && !isClueApplied;
                  const isAutoApplied = isClueApplied || autoApplied.current.has(action.id);
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
                        <div className="text-[10px] text-amber-700 mb-1.5">🍺 {formatOfferCost(action.offerCost, game.offer_definition)}</div>
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
                          {loading === action.id ? "…" : `🍺 Pay ${formatOfferCost(action.offerCost!, game.offer_definition)} — ${action.damage} damage`}
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
                      ) : action.type === "choice" && action.choices ? (
                        isExpanded ? (
                          <div className="space-y-1.5 mt-1">
                            {action.choices.map((choice) => (
                              <button
                                key={choice.id}
                                onClick={() => handleAction({ ...action, id: `${action.id}:${choice.id}` })}
                                disabled={!!loading}
                                className="w-full py-2 px-2.5 text-[11px] font-bold rounded-lg text-left border border-stone-700/40 text-stone-200 disabled:opacity-50 transition-colors"
                                style={{ background: "rgba(18,16,12,0.9)", fontFamily: "Georgia, serif" }}
                              >
                                <div>{choice.label}</div>
                                {choice.description && (
                                  <div className="text-[9px] text-stone-500 mt-0.5 font-normal">{choice.description}</div>
                                )}
                              </button>
                            ))}
                            <button onClick={() => setActiveActionId(null)} className="text-[10px] text-stone-600">Cancel</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveActionId(action.id)}
                            className="w-full py-2 text-xs font-bold rounded-lg border border-stone-700/50 text-stone-300"
                            style={{ background: "rgba(18,16,12,0.85)", fontFamily: "Georgia, serif" }}
                          >
                            Choose…
                          </button>
                        )
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

      {/* ── Drunk gamble modal ── */}
      {drunkModal && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.72)" }}
          onClick={() => setDrunkModal(false)}
        >
          <div
            className="w-full rounded-t-2xl p-5"
            style={{
              background: "rgba(8,5,2,0.99)",
              border: "1px solid rgba(180,130,50,0.22)",
              paddingBottom: "max(28px, env(safe-area-inset-bottom, 28px))",
              fontFamily: "Georgia, serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center mb-3">
              <div className="w-8 h-[3px] rounded-full bg-stone-700" />
            </div>

            <h3 className="text-lg font-bold text-amber-300 text-center mb-1">
              🍺 Make the Boss Drink
            </h3>
            <p className="text-xs text-stone-500 text-center mb-5 leading-relaxed">
              50/50 — boss takes <span className="text-amber-400 font-bold">{drunkSips * 3} damage</span> ({drunkSips}×3)
              <br />or your team drinks <span className="text-red-400 font-bold">{drunkSips} sip{drunkSips !== 1 ? "s" : ""}</span> themselves.
            </p>

            {/* Sip picker */}
            <div className="flex items-center gap-6 justify-center mb-6">
              <button
                onClick={() => setDrunkSips(Math.max(1, drunkSips - 1))}
                disabled={drunkSips <= 1}
                className="w-11 h-11 rounded-full text-amber-400 text-2xl font-bold border border-amber-800/40 flex items-center justify-center disabled:opacity-30"
                style={{ background: "rgba(20,12,4,0.9)" }}
              >−</button>
              <div className="text-center min-w-[48px]">
                <div className="text-4xl font-bold text-amber-200">{drunkSips}</div>
                <div className="text-[10px] text-stone-600 mt-0.5">sip{drunkSips !== 1 ? "s" : ""}</div>
                <div className="text-[9px] text-amber-900 mt-1">{availableForGamble} available</div>
              </div>
              <button
                onClick={() => setDrunkSips(Math.min(availableForGamble, drunkSips + 1))}
                disabled={drunkSips >= availableForGamble}
                className="w-11 h-11 rounded-full text-amber-400 text-2xl font-bold border border-amber-800/40 flex items-center justify-center disabled:opacity-30"
                style={{ background: "rgba(20,12,4,0.9)" }}
              >+</button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDrunkModal(false)}
                className="flex-1 py-3 rounded-xl border border-stone-700/40 text-stone-400 text-sm font-bold"
                style={{ background: "rgba(12,8,4,0.9)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDrunkGamble}
                disabled={!!loading || availableForGamble === 0}
                className="flex-1 py-3 rounded-xl text-stone-900 font-bold text-sm disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #c88010, #f0b020)" }}
              >
                {loading === "drunk-gamble" ? "…" : "🎲 Gamble!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Gamble result overlay — tap to dismiss ── */}
      {gambleResult && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: gambleResult.won
              ? "rgba(0,40,0,0.92)"
              : "rgba(60,0,0,0.92)",
            backdropFilter: "blur(8px)",
            animation: "room-enter 0.35s cubic-bezier(0.22,1,0.36,1) both",
          }}
          onClick={() => setGambleResult(null)}
        >
          <div className="text-8xl mb-4">{gambleResult.won ? "🍺" : "💪"}</div>
          <div
            className="text-4xl font-black tracking-widest mb-3 text-center px-4"
            style={{
              color: gambleResult.won ? "rgb(160,255,60)" : "rgb(255,100,100)",
              fontFamily: "Georgia,serif",
              textShadow: gambleResult.won
                ? "0 0 30px rgba(100,255,40,0.7)"
                : "0 0 30px rgba(255,60,60,0.7)",
            }}
          >
            {gambleResult.won ? "BOSS DRINKS!" : "BOSS RESISTS!"}
          </div>
          {gambleResult.won ? (
            <div className="text-center" style={{ fontFamily: "Georgia,serif" }}>
              <div className="text-xl text-green-200 font-bold mb-1">
                −{gambleResult.damage} HP ({gambleResult.wagered}×3)
              </div>
              {gambleResult.newHp !== undefined && (
                <div className="text-sm text-green-400/70">
                  Boss HP now: <span className="font-bold text-green-300">{gambleResult.newHp}</span>
                  {" / "}{boss.maxHp}
                </div>
              )}
            </div>
          ) : (
            <>
              <div
                className="text-2xl font-black text-red-200 text-center mb-2"
                style={{ fontFamily: "Georgia,serif" }}
              >
                YOUR TEAM DRINKS
              </div>
              <div
                className="text-6xl font-black text-red-400"
                style={{ fontFamily: "Georgia,serif", textShadow: "0 0 20px rgba(255,60,60,0.8)" }}
              >
                {gambleResult.wagered}
              </div>
              <div className="text-xl text-red-300 mt-1" style={{ fontFamily: "Georgia,serif" }}>
                sip{gambleResult.wagered !== 1 ? "s" : ""} — right now
              </div>
            </>
          )}
          <div className="mt-8 text-xs text-white/30" style={{ fontFamily: "Georgia,serif" }}>
            tap to dismiss
          </div>
        </div>
      )}

      {/* ── Bottom action bar (fixed) ── */}
      {!isDefeated && canInteract && (
        <div
          className="fixed bottom-0 inset-x-0 flex items-center h-[68px] px-4 gap-3 border-t border-stone-800/40 z-30"
          style={{ background: "rgba(4,3,1,0.97)" }}
        >
          {/* Offer count (available for gamble) */}
          <div
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full border border-amber-900/35 flex-shrink-0"
            style={{ background: "rgba(18,12,4,0.95)", fontFamily: "Georgia, serif" }}
          >
            <span className="text-lg leading-none">🍺</span>
            <span className="text-[9px] text-amber-600 font-bold mt-0.5">{availableForGamble}</span>
          </div>

          {/* Drunk gamble button */}
          <button
            className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl font-bold text-stone-900 disabled:opacity-40"
            style={{
              background: availableForGamble > 0 ? "linear-gradient(135deg, #b87010, #e0a020)" : "rgba(60,40,10,0.4)",
              fontFamily: "Georgia, serif",
            }}
            onClick={() => availableForGamble > 0 && setDrunkModal(true)}
            disabled={availableForGamble === 0}
          >
            <span className="text-sm tracking-widest">🍺 DRUNK GAMBLE</span>
            <span className="text-[9px] font-normal opacity-70 tracking-wide">
              {availableForGamble > 0 ? `50/50 — up to ${availableForGamble} sip${availableForGamble !== 1 ? "s" : ""}` : "No sips available to wager"}
            </span>
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
