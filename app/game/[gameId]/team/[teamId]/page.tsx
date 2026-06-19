"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { unlockRoom } from "@/lib/game/actions";
import type { DbGame, DbRoomProgress } from "@/types/database";
import type { TeamId } from "@/types/content";
import { getChapter, getRoom } from "@/content/index";
import { localizeRoom } from "@/lib/content/localize";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  params: { gameId: string; teamId: TeamId };
}

// ─── Map geometry ───────────────────────────────────────────────────────────
const WOBBLE = [1.08, 0.88, 1.13, 0.91, 1.06, 0.90, 1.11, 0.87, 1.09, 0.93, 1.14, 0.86];

function wp(cx: number, cy: number, r: number, shift = 0, n = 12): string {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const wr = r * WOBBLE[(i + shift) % 12];
    return `${(cx + wr * Math.cos(a)).toFixed(1)},${(cy + wr * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

// Linear spine: Kitchen → Fridge → Terrace → Shed → Boss
// Coffee Table: secret branch off Kitchen (right side)
// Nodes are larger (r 17-24) for visual impact
// Generous vertical spacing; nodes sized to match reference (r=10-12)
const CH1_NODES = [
  { id: "kitchen",      cx: 170, cy: 438, r: 12, shift: 2, isSecret: false },
  { id: "fridge",       cx: 170, cy: 352, r: 10, shift: 4, isSecret: false },
  { id: "terrace",      cx: 170, cy: 267, r: 10, shift: 6, isSecret: false },
  { id: "shed",         cx: 170, cy: 185, r: 10, shift: 3, isSecret: false },
  { id: "coffee-table", cx: 228, cy: 395, r:  9, shift: 1, isSecret: true  },
] as const;

const CH1_PATHS = [
  { from: "kitchen",      to: "fridge",        d: "M170,423 L170,365",                         secret: false },
  { from: "fridge",       to: "terrace",        d: "M170,339 L170,280",                         secret: false },
  { from: "terrace",      to: "shed",           d: "M170,254 L170,198",                         secret: false },
  { from: "shed",         to: "boss",           d: "M170,172 L170,132",                         secret: false },
  { from: "kitchen",      to: "coffee-table",   d: "M181,432 C200,420 214,410 217,397",         secret: true  },
];

// ─── Node visual states ─────────────────────────────────────────────────────
type NodeState = "done" | "active" | "can_unlock" | "locked";

const NODE_STYLES: Record<NodeState, {
  fill: string; stroke: string; strokeWidth: number; opacity: number; textColor: string;
}> = {
  done:       { fill: "#9a7e22", stroke: "#6a9828", strokeWidth: 1.6, opacity: 1,    textColor: "#1a1008" },
  active:     { fill: "#c03a14", stroke: "#e04a18", strokeWidth: 2.8, opacity: 1,    textColor: "#fff0e0" },
  can_unlock: { fill: "#c8a030", stroke: "#3a9a4a", strokeWidth: 2.0, opacity: 1,    textColor: "#1a4a1a" },
  locked:     { fill: "#b89830", stroke: "#7a5818", strokeWidth: 1.2, opacity: 0.38, textColor: "#5a3808" },
};

const SECRET_NODE_STYLES: Record<NodeState, {
  fill: string; stroke: string; strokeWidth: number; opacity: number; textColor: string;
}> = {
  done:       { fill: "#1a4a5a", stroke: "#3ab8c8", strokeWidth: 1.8, opacity: 1,    textColor: "#a0e8f8" },
  active:     { fill: "#1e5a6e", stroke: "#3ab8c8", strokeWidth: 2.4, opacity: 1,    textColor: "#a0f0ff" },
  can_unlock: { fill: "#163848", stroke: "#3ab8c8", strokeWidth: 2.0, opacity: 1,    textColor: "#70d8e8" },
  locked:     { fill: "#0e2030", stroke: "#3a6878", strokeWidth: 1.2, opacity: 0.50, textColor: "#4a8898" },
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function TeamQuestBoardPage({ params }: Props) {
  const { gameId, teamId } = params;
  const router = useRouter();
  const { session } = usePlayer();
  const { lang } = useLanguage();

  const [game, setGame] = useState<DbGame | null>(null);
  const [roomProgress, setRoomProgress] = useState<DbRoomProgress[]>([]);
  const [pendingUnlock, setPendingUnlock] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [otherRoomsCompleted, setOtherRoomsCompleted] = useState<number | null>(null);

  // Map scroll — CSS scale makes map larger than screen; native overflow-y scroll
  // Scale 2.2× means rooms span more than viewport height so you can't see them all at once.
  const mapScrollRef = useRef<HTMLDivElement>(null);
  // Ref mirrors roomProgress so the stall-timeout can read current value without a stale closure
  const roomProgressRef = useRef<DbRoomProgress[]>([]);

  const fetchData = useCallback(async () => {
    if (!gameId || !teamId) return;
    const res = await fetch(`/api/game/${gameId}/progress?teamId=${teamId}`);
    if (!res.ok) return;
    const data = await res.json();
    setGame(data.game);
    const rp = data.roomProgress ?? [];
    setRoomProgress(rp);
    roomProgressRef.current = rp;

    // Fetch other team's progress count (fire-and-forget, best effort)
    const otherTeam = teamId === "team-a" ? "team-b" : "team-a";
    fetch(`/api/game/${gameId}/progress?teamId=${otherTeam}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        const mainNodes = ["kitchen", "fridge", "terrace", "shed"];
        const done = (d.roomProgress ?? []).filter(
          (rp: { room_id: string; status: string }) =>
            mainNodes.includes(rp.room_id) && rp.status === "complete"
        ).length;
        setOtherRoomsCompleted(done);
      })
      .catch(() => {});
  }, [gameId, teamId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeGame(gameId ?? undefined, fetchData);

  // Start at top (show chapter title), stall 1.5s, then speed-ramp to active room (easeInCubic).
  // Only runs on first visit (no completed rooms). Data arrives well within the 1.5s stall window.
  useEffect(() => {
    let rafId: number;
    const stallMs = 1500;
    const swooshMs = 750;

    const timeoutId = setTimeout(() => {
      // Skip animation on return visits
      if (roomProgressRef.current.some((rp) => rp.status === "complete")) return;

      const container = mapScrollRef.current;
      if (!container) return;
      const startPos = container.scrollTop;
      const endPos = container.scrollHeight - container.clientHeight;
      const startTime = performance.now();

      const easeInCubic = (t: number) => t * t * t;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / swooshMs, 1);
        container.scrollTop = startPos + (endPos - startPos) * easeInCubic(progress);
        if (progress < 1) rafId = requestAnimationFrame(step);
      };

      rafId = requestAnimationFrame(step);
    }, stallMs);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const canInteract = !session?.isHost;

  const getRoomStatus = (roomId: string): DbRoomProgress["status"] => {
    return roomProgress.find((r) => r.room_id === roomId)?.status ?? "locked";
  };

  const getNodeState = (roomId: string): NodeState => {
    const status = getRoomStatus(roomId);
    if (status === "complete") return "done";
    if (status === "active" || status === "unlocked") return "active";
    const room = getRoom(roomId);
    const prereqsMet = room?.unlockRequires.every(
      (req) => getRoomStatus(req) === "complete"
    ) ?? false;
    return prereqsMet ? "can_unlock" : "locked";
  };

  const nodeSymbol = (state: NodeState, cost: number, isSecret: boolean): string => {
    if (state === "done") return "✓";
    if (state === "active") return "✕";
    if (state === "can_unlock") return cost > 0 ? String(cost) : isSecret ? "★" : "○";
    return isSecret ? "★" : "?";
  };

  const pathOpacity = (fromId: string, toId: string, secret: boolean): number => {
    if (secret) {
      const from = getNodeState(fromId);
      if (from === "done" || from === "active") return 0.65;
      return 0.25;
    }
    const from = getNodeState(fromId);
    if (fromId === "boss" || toId === "boss") {
      const other = fromId === "boss" ? getNodeState(toId) : getNodeState(fromId);
      return other === "done" ? 0.25 : 0.13;
    }
    if (from === "locked") return 0.12;
    if (from === "done") {
      const to = getNodeState(toId);
      return to === "locked" ? 0.30 : 0.80;
    }
    if (from === "active") return 0.50;
    return 0.18;
  };

  const handleNodeClick = (roomId: string) => {
    if (!canInteract) return;
    const state = getNodeState(roomId);
    if (state === "done" || state === "active") {
      router.push(`/game/${gameId}/team/${teamId}/room/${roomId}`);
    } else if (state === "can_unlock") {
      setPendingUnlock(roomId);
    }
  };

  const handleUnlock = async () => {
    if (!pendingUnlock) return;
    setUnlocking(true);
    const result = await unlockRoom(gameId, teamId, pendingUnlock);
    setUnlocking(false);
    setPendingUnlock(null);
    if (result.success) {
      const cost = result.data.offerCost;
      setMessage(cost > 0 ? `Rum låst op! (${cost} Offer brugt)` : "Rum låst op!");
      fetchData();
    } else {
      setMessage(result.error ?? "Fejl ved oplåsning.");
    }
    setTimeout(() => setMessage(null), 3000);
  };

  if (!game || !gameId || !teamId) return null;

  const chapter = getChapter(game.current_chapter_id);
  const teamName = teamId === "team-a" ? game.team_a_name : game.team_b_name;
  const rawPendingRoom = pendingUnlock ? getRoom(pendingUnlock) : null;
  const pendingRoom = rawPendingRoom ? localizeRoom(rawPendingRoom, lang) : null;

  // Check if coffee-table (secret) is complete — for boss advantage display
  const secretRoomDone = getRoomStatus("coffee-table") === "complete";

  // Stats for UI
  const completedRooms = CH1_NODES.filter(n => !n.isSecret && getRoomStatus(n.id) === "complete").length;
  const totalMainRooms = CH1_NODES.filter(n => !n.isSecret).length;
  const bossUnlockable = completedRooms >= totalMainRooms;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#0a0804" }}>

      {/* ── Scrollable map — scale 2.2× so rooms span beyond viewport height ── */}
      <div
        ref={mapScrollRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: 'none' as const, msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {/* Spacer that provides the full scaled height (2.2 × SVG_natural_height) */}
        {/* SVG natural height at 100vw width = 100vw × 520/340 ≈ 152.94vw          */}
        {/* Scaled height = 2.2 × 152.94vw ≈ 336.47vw → use 337vw                  */}
        <div style={{ height: '337vw', width: '100%', position: 'relative', overflow: 'hidden' }}>
          <svg
            viewBox="0 0 340 520"
            style={{
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100vw',
              height: '152.94vw',
              transformOrigin: 'top center',
              transform: 'scale(2.2)',
            }}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Quest map — tap a room to enter or unlock it"
            xmlns="http://www.w3.org/2000/svg"
          >
          {/* ── Defs — pulse filter only ── */}
          <defs>
            <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── Real background image ── */}
          <image href="/map/map-bg.png" x="0" y="0" width="340" height="520" preserveAspectRatio="xMidYMid slice" />

          {/* ── Title overlay on parchment ── */}
          <text x="170" y="50" textAnchor="middle" fontFamily="Georgia,serif" fontSize={18} fontWeight="bold" fill="#c8a030" letterSpacing={4} opacity={0.95}>
            SOMMERHUSET
          </text>
          <line x1="80"  y1="58" x2="126" y2="58" stroke="#c8a030" strokeWidth={0.8} opacity={0.65} />
          <text x="170" y="65" textAnchor="middle" fontFamily="Georgia,serif" fontSize={7.5} fill="#c8a030" letterSpacing={6} opacity={0.85}>
            KAPITEL I
          </text>
          <line x1="214" y1="58" x2="260" y2="58" stroke="#c8a030" strokeWidth={0.8} opacity={0.65} />

          {/* ── Fog band ── */}
          <text x="170" y="178" textAnchor="middle" fontFamily="Georgia,serif" fontSize={7} fill="#8a6520" letterSpacing={2} opacity={0.6} fontStyle="italic">
            ~ ukendt territorium ~
          </text>

          {/* ── Paths ── */}
          {CH1_PATHS.map(({ from, to, d, secret }) => (
            <path key={`${from}-${to}`} d={d}
              stroke={secret ? "#3ab8c8" : "#c88020"}
              strokeWidth={secret ? 1.2 : 1.5}
              fill="none"
              strokeDasharray={secret ? "3,5" : "5,5"}
              opacity={pathOpacity(from, to, secret)}
            />
          ))}
          <text x="244" y="412" textAnchor="middle" fontFamily="Georgia,serif" fontSize={5.5} fill="#3ab8c8" opacity={0.75} letterSpacing={1}>hemmeligt</text>

          {/* ── Boss node ── */}
          <g onClick={() => { if (canInteract && chapter) router.push(`/game/${gameId}/boss/${chapter.bossId}?team=${teamId}`); }} style={{ cursor: canInteract ? "pointer" : "default" }}>
            {/* Invisible hit area */}
            <circle cx="170" cy="97" r="42" fill="transparent" />
            {/* Boss image */}
            <image href="/map/node-boss.png" x="136" y="65" width="68" height="73" />
            {/* Unlockable glow rings */}
            {bossUnlockable && (
              <>
                <circle cx="170" cy="97" r="40" fill="none" stroke="#e04020" strokeWidth={2} opacity={0.45} />
                <circle cx="170" cy="97" r="48" fill="none" stroke="#e04020" strokeWidth={0.9} opacity={0.18} />
              </>
            )}
            <text x="170" y="148" textAnchor="middle" fontFamily="Georgia,serif" fontSize={7.5} fill="#c8a030" letterSpacing={2} opacity={0.9}>BOSS</text>
          </g>

          {/* ── Room nodes ── */}
          {CH1_NODES.map(({ id, cx, cy, r, isSecret }) => {
            const state     = getNodeState(id);
            const room      = getRoom(id);
            const clickable = canInteract && state !== "locked";

            // Pick asset image by node state
            const nodeImg = isSecret
              ? "/map/node-secret.png"
              : state === "active"
              ? "/map/node-active.png"
              : "/map/node-room.png";

            // Visual sizes (the images have dark padding — these represent displayed size in SVG units)
            const [nw, nh] = isSecret
              ? [28, 22]
              : state === "active"
              ? [48, 46]
              : [34, 20];

            const labelY = cy + (state === "active" ? 27 : 14);
            const subY   = labelY + 8;
            const opacity = state === "locked" ? 0.38 : 1;

            const LABELS: Record<string, string> = {
              kitchen: "KØKKEN", fridge: "KØLESKAB", terrace: "TERRASSE",
              shed: "SKUR", "coffee-table": "SOFABORD",
            };

            return (
              <g key={id} onClick={() => handleNodeClick(id)} style={{ cursor: clickable ? "pointer" : "default" }} opacity={opacity}>
                {/* Invisible hit area */}
                <circle cx={cx} cy={cy} r={state === "active" ? 30 : 18} fill="transparent" />

                {/* Pulse ring (behind image for active/can_unlock) */}
                {state === "active" && !isSecret && (
                  <circle cx={cx} cy={cy} r={22} fill="none" stroke="#f06018" strokeWidth={3} opacity={0}>
                    <animate attributeName="r"       values="22;56;22"   dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0;0.9"  dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {state === "can_unlock" && (
                  <circle cx={cx} cy={cy} r={14} fill="none" stroke="#2a9a4a" strokeWidth={2} opacity={0}>
                    <animate attributeName="r"       values="14;36;14"   dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.85;0;0.85" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {isSecret && state !== "locked" && (
                  <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="#3ab8c8" strokeWidth={1} opacity={0.4} strokeDasharray="2,3" />
                )}

                {/* Node image */}
                <image
                  href={nodeImg}
                  x={cx - nw / 2}
                  y={cy - nh / 2}
                  width={nw}
                  height={nh}
                />

                {/* "Done" green check overlay */}
                {state === "done" && !isSecret && (
                  <circle cx={cx + nw/2 - 4} cy={cy - nh/2 + 4} r={4} fill="#1a5a1a" stroke="#3a9a3a" strokeWidth={0.8}>
                  </circle>
                )}
                {state === "done" && !isSecret && (
                  <text x={cx + nw/2 - 4} y={cy - nh/2 + 6} textAnchor="middle" fontSize={4} fill="#7aee7a">✓</text>
                )}

                {/* Labels */}
                <text x={cx} y={labelY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={6.5}
                  fill={isSecret ? "#3ab8c8" : "#c8a030"} opacity={isSecret ? 0.9 : 0.95} letterSpacing={0.8}
                >
                  {LABELS[id] ?? id.toUpperCase()}
                </text>
                {state === "done" && (
                  <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={5} fill={isSecret ? "#3ab8c8" : "#6aae30"} opacity={0.8}>
                    Gennemført
                  </text>
                )}
                {state === "active" && (
                  <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={5.5} fill="#f07030" fontWeight="bold">
                    Aktiv
                  </text>
                )}
                {state === "can_unlock" && room && (
                  <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={5} fill={isSecret ? "#3ab8c8" : "#2a8a3a"}>
                    {room.unlockCost > 0 ? `${room.unlockCost} Offer` : isSecret ? "Bonus" : "Gratis"}
                  </text>
                )}
              </g>
            );
          })}
          </svg>
        </div>
      </div>

      {/* ── TOP HUD overlay ── */}
      <div
        className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          background: "linear-gradient(180deg, rgba(12,26,44,0.88) 0%, rgba(12,26,44,0.55) 65%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-2 px-3 py-3 pointer-events-auto">
          {/* Team name + chapter */}
          <div className="flex-1 flex flex-col leading-tight">
            <span
              className="text-[9px] uppercase tracking-[0.3em]"
              style={{ color: "rgba(180,130,50,0.5)", fontFamily: "Georgia,serif" }}
            >
              Kapitel I
            </span>
            <span
              className="font-bold text-lg leading-tight"
              style={{ color: "rgba(245,225,170,0.97)", fontFamily: "Georgia,serif", textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
            >
              {teamName}
            </span>
          </div>

          {/* VS status pill — both teams */}
          <div
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(180,130,50,0.2)",
              fontFamily: "Georgia,serif",
            }}
          >
            <span style={{ color: bossUnlockable ? "rgb(248,113,113)" : "rgb(251,191,36)" }}>
              {completedRooms}/{totalMainRooms}
            </span>
            <span style={{ color: "rgba(120,80,30,0.5)", margin: "0 2px" }}>vs</span>
            <span style={{ color: "rgba(180,160,100,0.6)" }}>
              {otherRoomsCompleted ?? "·"}/{totalMainRooms}
            </span>
          </div>

          {/* Control panel button */}
          <button
            onClick={() => setShowPanel(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full active:scale-95 transition-transform"
            style={{
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(180,130,50,0.2)",
              color: "rgba(180,130,50,0.7)",
              fontSize: "14px",
            }}
          >
            ⚙
          </button>
        </div>
      </div>

      {/* ── BOTTOM boss strip ── */}
      {chapter && (
        <div
          className="absolute bottom-0 left-0 right-0 z-20"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            background: "linear-gradient(180deg, transparent 0%, rgba(8,3,3,0.82) 35%, rgba(6,2,2,0.96) 100%)",
          }}
        >
          <div className="px-4 pt-3 pb-8">
            <div className="flex items-center gap-3">
              {/* Boss icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: "radial-gradient(circle, #3f0808 0%, #1a0303 100%)",
                  border: `1px solid rgba(180,40,40,${bossUnlockable ? 0.6 : 0.3})`,
                  boxShadow: bossUnlockable ? "0 0 12px rgba(180,40,40,0.3)" : "none",
                }}
              >
                {bossUnlockable ? "☠️" : "🔒"}
              </div>

              {/* Name + progress */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-bold truncate"
                  style={{ color: "rgb(254,202,202)", fontFamily: "Georgia,serif" }}
                >
                  Den Låste Køler
                </div>
                <div
                  className="mt-1 h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(40,10,10,0.9)", border: "1px solid rgba(100,30,30,0.3)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(completedRooms / totalMainRooms) * 100}%`,
                      background: bossUnlockable
                        ? "linear-gradient(90deg, #dc2626, #ef4444)"
                        : "linear-gradient(90deg, #7f1d1d, #b91c1c)",
                      boxShadow: completedRooms > 0 ? "0 0 6px rgba(185,28,28,0.5)" : "none",
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(180,80,80,0.6)", fontFamily: "Georgia,serif" }}
                  >
                    {completedRooms}/{totalMainRooms} rum ryddet
                  </span>
                  {secretRoomDone && (
                    <span className="text-[10px]" style={{ color: "rgba(103,232,249,0.7)", fontFamily: "Georgia,serif" }}>
                      · ⭐ buff aktiv
                    </span>
                  )}
                </div>
              </div>

              {/* Fight button */}
              {canInteract && (
                <a
                  href={`/game/${gameId}/boss/${chapter.bossId}?team=${teamId}`}
                  className="flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95"
                  style={bossUnlockable ? {
                    background: "linear-gradient(160deg, #7f1d1d, #450a0a)",
                    border: "1px solid rgba(220,50,50,0.5)",
                    color: "rgb(254,202,202)",
                    boxShadow: "0 2px 10px rgba(185,28,28,0.3)",
                    fontFamily: "Georgia,serif",
                  } : {
                    background: "rgba(30,10,10,0.6)",
                    border: "1px solid rgba(100,30,30,0.25)",
                    color: "rgba(180,80,80,0.35)",
                    cursor: "not-allowed",
                    fontFamily: "Georgia,serif",
                  }}
                  onClick={!bossUnlockable ? (e) => e.preventDefault() : undefined}
                >
                  {bossUnlockable ? "⚔️ Kæmp" : "🔒"}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Control panel overlay ── */}
      {showPanel && (
        <div
          className="absolute inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)" }}
          onClick={() => setShowPanel(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 animate-sheet-up rounded-t-2xl"
            style={{
              background: "rgba(10,8,6,0.98)",
              backdropFilter: "blur(16px)",
              borderTop: "1px solid rgba(180,130,50,0.22)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-8 h-[3px] rounded-full" style={{ background: "rgba(180,130,50,0.22)" }} />
            </div>
            <div className="px-4 pb-6 pt-1">
              <div
                className="text-[9px] uppercase tracking-[0.25em] mb-4"
                style={{ color: "rgba(180,130,50,0.35)", fontFamily: "Georgia,serif" }}
              >
                Kontrolpanel
              </div>

              {/* Team status */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { id: "team-a", name: game.team_a_name, isMe: teamId === "team-a", count: teamId === "team-a" ? completedRooms : (otherRoomsCompleted ?? 0) },
                  { id: "team-b", name: game.team_b_name, isMe: teamId === "team-b", count: teamId === "team-b" ? completedRooms : (otherRoomsCompleted ?? 0) },
                ].map((team) => (
                  <div
                    key={team.id}
                    className="rounded-xl p-3"
                    style={{
                      background: team.isMe ? "rgba(120,80,10,0.25)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${team.isMe ? "rgba(180,130,50,0.35)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(180,130,50,0.4)", fontFamily: "Georgia,serif" }}>
                      {team.isMe ? "Jeres hold" : "Modstandere"}
                    </div>
                    <div className="font-bold text-sm truncate" style={{ color: "rgba(245,225,170,0.9)", fontFamily: "Georgia,serif" }}>
                      {team.name}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: "rgba(180,130,50,0.6)", fontFamily: "Georgia,serif" }}>
                      {team.count}/{totalMainRooms} rum
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div className="space-y-2">
                <a
                  href={`/game/${gameId}/boss/${chapter?.bossId}?team=${teamId}`}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 active:scale-98 transition-transform"
                  style={{
                    background: bossUnlockable ? "rgba(100,20,20,0.35)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${bossUnlockable ? "rgba(220,60,60,0.3)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <span className="text-xl">{bossUnlockable ? "⚔️" : "🔒"}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: bossUnlockable ? "rgb(252,165,165)" : "rgba(120,80,40,0.6)", fontFamily: "Georgia,serif" }}>
                      Den Låste Køler
                    </div>
                    <div className="text-xs" style={{ color: bossUnlockable ? "rgba(220,100,100,0.6)" : "rgba(100,60,20,0.4)", fontFamily: "Georgia,serif" }}>
                      {bossUnlockable ? "Klar til kamp" : `${completedRooms}/${totalMainRooms} rum for at låse op`}
                    </div>
                  </div>
                </a>

                {secretRoomDone && (
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: "rgba(10,40,50,0.4)", border: "1px solid rgba(58,184,200,0.25)" }}
                  >
                    <span className="text-xl">⭐</span>
                    <div className="text-sm" style={{ color: "rgba(103,232,249,0.7)", fontFamily: "Georgia,serif" }}>
                      Sofabord-fordel aktiv
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {message && (
        <div
          className="absolute left-4 right-4 z-30 rounded-lg px-4 py-2 text-sm animate-quest-in"
          style={{
            top: "calc(env(safe-area-inset-top, 0px) + 72px)",
            background: "rgba(20,14,6,0.95)",
            border: "1px solid rgba(180,130,50,0.35)",
            color: "rgb(251,191,36)",
            fontFamily: "Georgia,serif",
          }}
        >
          ✦ {message}
        </div>
      )}

      {/* ── Unlock modal ── */}
      {pendingUnlock && pendingRoom && (
        <div
          className="absolute inset-0 flex items-center justify-center p-6 z-40"
          style={{ background: "rgba(12,26,44,0.85)", backdropFilter: "blur(5px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setPendingUnlock(null); }}
        >
            <div
              className="w-full max-w-xs rounded-xl border p-5 shadow-2xl"
              style={{
                background: pendingRoom.isSecret ? "#0e2030" : "#1c1208",
                borderColor: pendingRoom.isSecret ? "#3ab8c8" : "#b8860b",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{pendingRoom.look.icon}</span>
                <div>
                  <div
                    className="text-xs uppercase tracking-widest font-bold mb-0.5"
                    style={{ color: pendingRoom.isSecret ? "#3ab8c8" : "#c8a040", fontFamily: "Georgia,serif" }}
                  >
                    {pendingRoom.isSecret ? "★ Hemmeligt sted" : "Lås op"}
                  </div>
                  <div className="font-bold text-white" style={{ fontFamily: "Georgia,serif" }}>
                    {pendingRoom.title}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-stone-400 mb-3 leading-relaxed" style={{ fontFamily: "Georgia,serif" }}>
                {pendingRoom.lockedDescription}
              </p>

              {/* Secret advantage callout */}
              {pendingRoom.isSecret && pendingRoom.secretAdvantage && (
                <div className="rounded-lg bg-cyan-950/50 border border-cyan-800/50 px-3 py-2 mb-3 text-xs text-cyan-300" style={{ fontFamily: "Georgia,serif" }}>
                  🎯 Fuldfør dette sted for at optjene en <strong>gratis handling</strong> mod bossen.
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="flex-1 font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                  style={{
                    background: pendingRoom.isSecret ? "#1a5a6a" : "#92610a",
                    color: pendingRoom.isSecret ? "#a0f0ff" : "#fff8e8",
                  }}
                >
                  {unlocking
                    ? "Låser op…"
                    : pendingRoom.unlockCost > 0
                    ? `🍺 Lås op (${pendingRoom.unlockCost} Offer)`
                    : "🔓 Lås op (gratis)"}
                </button>
                <button
                  onClick={() => setPendingUnlock(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────
function StatChip({
  icon, value, label, highlight, danger,
}: {
  icon: string; value: string; label: string; highlight?: boolean; danger?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-sm px-2 py-1"
      style={{
        background: danger
          ? "rgba(100,20,20,0.3)"
          : highlight
          ? "rgba(8,40,50,0.6)"
          : "rgba(255,255,255,0.04)",
        border: danger
          ? "1px solid rgba(180,40,40,0.3)"
          : highlight
          ? "1px solid rgba(56,189,200,0.25)"
          : "1px solid rgba(180,130,50,0.12)",
      }}
    >
      <span className="text-xs">{icon}</span>
      <span
        className="text-xs font-bold"
        style={{
          fontFamily: "Georgia,serif",
          color: danger ? "rgb(252,165,165)" : highlight ? "rgb(103,232,249)" : "rgb(251,191,36)",
        }}
      >
        {value}
      </span>
      <span
        className="text-[10px]"
        style={{
          fontFamily: "Georgia,serif",
          color: danger ? "rgba(252,165,165,0.6)" : highlight ? "rgba(103,232,249,0.6)" : "rgba(180,130,50,0.5)",
        }}
      >
        {label}
      </span>
    </div>
  );
}
