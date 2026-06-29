"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { unlockRoom } from "@/lib/game/actions";
import type { DbGame, DbRoomProgress, DbGameEvent } from "@/types/database";
import type { TeamId } from "@/types/content";
import { getChapter, getRoom } from "@/content/index";

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
  { id: "coffee-table", cx: 215, cy: 395, r:  9, shift: 1, isSecret: true  },
  { id: "toolbox",      cx: 125, cy: 310, r:  8, shift: 5, isSecret: false },
  { id: "hammock",      cx: 215, cy: 225, r:  8, shift: 7, isSecret: false },
] as const;

const CH1_PATHS = [
  { from: "kitchen",      to: "fridge",        d: "M170,423 L170,365",                         secret: false },
  { from: "fridge",       to: "terrace",        d: "M170,339 L170,280",                         secret: false },
  { from: "terrace",      to: "shed",           d: "M170,254 L170,198",                         secret: false },
  { from: "shed",         to: "boss",           d: "M170,172 L170,132",                         secret: false },
  { from: "kitchen",      to: "coffee-table",   d: "M181,432 C196,422 207,411 204,396",         secret: true  },
  { from: "fridge",       to: "toolbox",        d: "M158,348 C142,338 130,328 127,318",         secret: false },
  { from: "terrace",      to: "hammock",        d: "M181,263 C196,254 207,244 204,232",         secret: false },
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

// Optional side-quest nodes (teal-ish, less prominent than main path)
const OPTIONAL_NODE_STYLES: Record<NodeState, {
  fill: string; stroke: string; strokeWidth: number; opacity: number; textColor: string;
}> = {
  done:       { fill: "#1a4a2a", stroke: "#3a9a5a", strokeWidth: 1.6, opacity: 1,    textColor: "#a0f0b8" },
  active:     { fill: "#1e5a36", stroke: "#3aba6a", strokeWidth: 2.2, opacity: 1,    textColor: "#c0ffd8" },
  can_unlock: { fill: "#143820", stroke: "#3a8a50", strokeWidth: 1.8, opacity: 1,    textColor: "#60c880" },
  locked:     { fill: "#1a2a1a", stroke: "#3a6840", strokeWidth: 1.0, opacity: 0.45, textColor: "#3a5840" },
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
  const [game, setGame] = useState<DbGame | null>(null);
  const [roomProgress, setRoomProgress] = useState<DbRoomProgress[]>([]);
  const [pendingUnlock, setPendingUnlock] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [otherRoomsCompleted, setOtherRoomsCompleted] = useState<number | null>(null);
  const [tollBanners, setTollBanners] = useState<{ msg: string; key: number }[]>([]);
  const tollKeyRef = useRef(0);
  const seenEventIdsRef = useRef<Set<string>>(new Set());

  // Map scroll — CSS scale makes map larger than screen; native overflow-y scroll
  const mapScrollRef = useRef<HTMLDivElement>(null);
  const roomProgressRef = useRef<DbRoomProgress[]>([]);
  // Whether this session has already played the intro sweep
  const introPlayedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!gameId || !teamId) return;
    const res = await fetch(`/api/game/${gameId}/progress?teamId=${teamId}`);
    if (!res.ok) return;
    const data = await res.json();
    const g: DbGame = data.game;
    setGame(g);
    const rp = data.roomProgress ?? [];
    setRoomProgress(rp);
    roomProgressRef.current = rp;

    // Detect new offer_paid events → toll banner
    const events: DbGameEvent[] = data.events ?? [];
    const isFirstLoad = seenEventIdsRef.current.size === 0;
    for (const ev of events) {
      if (!seenEventIdsRef.current.has(ev.id)) {
        seenEventIdsRef.current.add(ev.id);
        if (!isFirstLoad && ev.event_type === "offer_paid") {
          const amount = (ev.event_data?.amount as number) ?? 1;
          const teamName = ev.team_id === "team-a" ? g.team_a_name : g.team_b_name;
          const msg = `🍺 ${teamName ?? ev.team_id} paid ${amount} Offer${amount !== 1 ? "s" : ""}`;
          const key = ++tollKeyRef.current;
          setTollBanners((prev) => [...prev, { msg, key }]);
          setTimeout(() => setTollBanners((prev) => prev.filter((b) => b.key !== key)), 4500);
        }
      }
    }

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

  // Scroll logic: first visit → stall at top then sweep down; return visits → jump to active node.
  // "First visit" = no sessionStorage flag for this game+team combo.
  useEffect(() => {
    const introKey = `quest-board-intro-${gameId}-${teamId}`;
    const hasSeenIntro = typeof sessionStorage !== "undefined" && !!sessionStorage.getItem(introKey);

    let rafId: number;

    if (hasSeenIntro) {
      // Return visit: wait briefly for data then scroll to active node
      introPlayedRef.current = true;
      const timeoutId = setTimeout(() => {
        const container = mapScrollRef.current;
        if (!container) return;
        // Active node is the first non-complete room or last completed
        const activeNode = CH1_NODES.find((n) => {
          const rp = roomProgressRef.current.find((r) => r.room_id === n.id);
          return !rp || rp.status === "unlocked" || rp.status === "active";
        }) ?? CH1_NODES[0];

        // Convert SVG cy coord → scroll position
        // SVG height = 520 units at 2.2× scale on 100vw → px per SVG unit = (vw * 2.2) / 340
        const vw = window.innerWidth;
        const pxPerUnit = (vw * 2.2) / 340;
        // We want the node to be in the center of the viewport
        const nodePx = activeNode.cy * pxPerUnit;
        const targetScroll = nodePx - window.innerHeight * 0.45;
        container.scrollTop = Math.max(0, targetScroll);
      }, 200);
      return () => clearTimeout(timeoutId);
    }

    // First visit: stall at top, then sweep to bottom (room list end = kitchen area)
    const stallMs = 1500;
    const swooshMs = 800;

    const timeoutId = setTimeout(() => {
      const container = mapScrollRef.current;
      if (!container) return;

      if (typeof sessionStorage !== "undefined") sessionStorage.setItem(introKey, "1");
      introPlayedRef.current = true;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setMessage(cost > 0 ? `Room unlocked! (${cost} Offer used)` : "Room unlocked!");
      fetchData();
    } else {
      setMessage(result.error ?? "Failed to unlock.");
    }
    setTimeout(() => setMessage(null), 3000);
  };

  if (!game || !gameId || !teamId) return null;

  const chapter = getChapter(game.current_chapter_id);
  const teamName = teamId === "team-a" ? game.team_a_name : game.team_b_name;
  const pendingRoom = pendingUnlock ? getRoom(pendingUnlock) : null;

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
          {/* ── Defs ── */}
          <defs>
            <filter id="titleShadow" x="-10%" y="-40%" width="120%" height="180%">
              <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#000" floodOpacity="0.85" />
            </filter>
          </defs>

          {/* ── Real background image ── */}
          <image href="/map/map-bg.png" x="0" y="0" width="340" height="520" preserveAspectRatio="xMidYMid slice" />

          {/* ── Title overlay ── */}
          <text x="170" y="44" textAnchor="middle" fontFamily="Georgia,serif" fontSize={14} fontWeight="bold"
            fill="#d4a832" letterSpacing={3} filter="url(#titleShadow)" opacity={0.96}>
            SOMMERHUSET
          </text>
          <line x1="112" y1="50" x2="140" y2="50" stroke="#d4a832" strokeWidth={0.7} opacity={0.55} />
          <text x="170" y="56" textAnchor="middle" fontFamily="Georgia,serif" fontSize={6}
            fill="#d4a832" letterSpacing={5} filter="url(#titleShadow)" opacity={0.8}>
            CHAPTER I
          </text>
          <line x1="200" y1="50" x2="228" y2="50" stroke="#d4a832" strokeWidth={0.7} opacity={0.55} />

          {/* ── Fog band ── */}
          <text x="170" y="178" textAnchor="middle" fontFamily="Georgia,serif" fontSize={7} fill="#8a6520" letterSpacing={2} opacity={0.6} fontStyle="italic">
            ~ unknown territory ~
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
          <text x="215" y="412" textAnchor="middle" fontFamily="Georgia,serif" fontSize={5.5} fill="#3ab8c8" opacity={0.75} letterSpacing={1}>secret</text>

          {/* ── Boss node ── */}
          <g onClick={() => { if (canInteract && chapter) router.push(`/game/${gameId}/boss/${chapter.bossId}?team=${teamId}`); }} style={{ cursor: canInteract ? "pointer" : "default" }}>
            <circle cx="170" cy="95" r="34" fill="transparent" />
            <image href="/map/node-boss.png" x="143" y="68" width="54" height="58" />
            {bossUnlockable && (
              <>
                <circle cx="170" cy="95" r="32" fill="none" stroke="#e04020" strokeWidth={1.8} opacity={0.5} />
                <circle cx="170" cy="95" r="40" fill="none" stroke="#e04020" strokeWidth={0.8} opacity={0.2} />
              </>
            )}
            <text x="170" y="136" textAnchor="middle" fontFamily="Georgia,serif" fontSize={7}
              fill="#d4a832" letterSpacing={2} filter="url(#titleShadow)" opacity={0.9}>BOSS</text>
          </g>

          {/* ── Room nodes ── */}
          {CH1_NODES.map(({ id, cx, cy, r, isSecret }) => {
            const state     = getNodeState(id);
            const room      = getRoom(id);
            const clickable = canInteract && state !== "locked";

            // Pick asset — done gets green-tinted variant
            const nodeImg = isSecret
              ? "/map/node-secret.png"
              : state === "active"
              ? "/map/node-active.png"
              : state === "done"
              ? "/map/node-room-done.png"
              : "/map/node-room.png";

            // Sizes in SVG units (images include transparent padding)
            const [nw, nh] = isSecret
              ? [22, 17]
              : state === "active"
              ? [36, 34]
              : [26, 15];

            const labelY = cy + (state === "active" ? 21 : 11);
            const subY   = labelY + 7;
            const opacity = state === "locked" ? 0.35 : 1;

            const LABELS: Record<string, string> = {
              kitchen: "KITCHEN", fridge: "FRIDGE", terrace: "TERRACE",
              shed: "SHED", "coffee-table": "COFFEE TABLE",
              toolbox: "TOOLBOX", hammock: "HAMMOCK",
            };

            const isOptional = room?.isOptional && !isSecret;
            const labelColor = isSecret ? "#3ab8c8" : isOptional ? "#7ad890" : "#d4a832";

            return (
              <g key={id} onClick={() => handleNodeClick(id)} style={{ cursor: clickable ? "pointer" : "default" }} opacity={opacity}>
                {/* Hit area */}
                <circle cx={cx} cy={cy} r={state === "active" ? 22 : 14} fill="transparent" />

                {/* Pulse for active state */}
                {state === "active" && !isSecret && (
                  <circle cx={cx} cy={cy} r={17} fill="none" stroke={isOptional ? "#3aba6a" : "#f06018"} strokeWidth={2.5} opacity={0}>
                    <animate attributeName="r"       values="17;44;17"   dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0;0.9"  dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Pulse for can_unlock */}
                {state === "can_unlock" && (
                  <circle cx={cx} cy={cy} r={12} fill="none" stroke={isOptional ? "#3aba6a" : "#2a9a4a"} strokeWidth={1.8} opacity={0}>
                    <animate attributeName="r"       values="12;28;12"    dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.85;0;0.85" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Optional dashed ring */}
                {isOptional && state !== "locked" && (
                  <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#3aba6a" strokeWidth={0.7} opacity={0.4} strokeDasharray="2,3" />
                )}
                {/* Secret dashed ring */}
                {isSecret && state !== "locked" && (
                  <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#3ab8c8" strokeWidth={0.8} opacity={0.45} strokeDasharray="2,3" />
                )}

                {/* Node image (transparent bg, sits on map) */}
                <image href={nodeImg} x={cx - nw / 2} y={cy - nh / 2} width={nw} height={nh} />

                {/* Label */}
                <text x={cx} y={labelY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={6}
                  fill={labelColor} filter="url(#titleShadow)"
                  opacity={0.92} letterSpacing={0.6}
                >
                  {LABELS[id] ?? id.toUpperCase()}
                </text>
                {isOptional && state === "locked" && (
                  <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={4}
                    fill="#3a7a4a" filter="url(#titleShadow)" opacity={0.7}>
                    SIDE QUEST
                  </text>
                )}
                {state === "done" && (
                  <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={4.5}
                    fill="#6aee50" filter="url(#titleShadow)" opacity={0.85}>
                    Complete
                  </text>
                )}
                {state === "active" && (
                  <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={5}
                    fill={isOptional ? "#60ee80" : "#f07030"} fontWeight="bold" filter="url(#titleShadow)">
                    Active
                  </text>
                )}
                {state === "can_unlock" && room && (
                  <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={4.5}
                    fill={isSecret ? "#3ab8c8" : isOptional ? "#3aba6a" : "#2aba4a"} filter="url(#titleShadow)">
                    {room.unlockCost > 0 ? `${room.unlockCost} Offer` : isSecret ? "Bonus" : "Free"}
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
              Chapter I
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
                  The Locked Cooler
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
                    {completedRooms}/{totalMainRooms} rooms cleared
                  </span>
                  {secretRoomDone && (
                    <span className="text-[10px]" style={{ color: "rgba(103,232,249,0.7)", fontFamily: "Georgia,serif" }}>
                      · ⭐ buff active
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
                  {bossUnlockable ? "⚔️ Fight" : "🔒"}
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
                Control Panel
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
                      {team.isMe ? "Your Team" : "Opponents"}
                    </div>
                    <div className="font-bold text-sm truncate" style={{ color: "rgba(245,225,170,0.9)", fontFamily: "Georgia,serif" }}>
                      {team.name}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: "rgba(180,130,50,0.6)", fontFamily: "Georgia,serif" }}>
                      {team.count}/{totalMainRooms} rooms
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
                      The Locked Cooler
                    </div>
                    <div className="text-xs" style={{ color: bossUnlockable ? "rgba(220,100,100,0.6)" : "rgba(100,60,20,0.4)", fontFamily: "Georgia,serif" }}>
                      {bossUnlockable ? "Ready for battle" : `${completedRooms}/${totalMainRooms} rooms to unlock`}
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
                      Coffee Table bonus active
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toll banners ── */}
      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none flex flex-col gap-1 pt-[env(safe-area-inset-top,0px)]">
        {tollBanners.map((b) => (
          <div
            key={b.key}
            className="animate-banner-drop mx-3 mt-2 rounded-xl px-4 py-3 flex items-center gap-3 pointer-events-auto"
            style={{
              background: "rgba(120,60,0,0.95)",
              border: "1px solid rgba(251,146,60,0.5)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}
          >
            <span className="text-xl flex-shrink-0">🍺</span>
            <span className="text-sm font-bold" style={{ color: "rgb(254,215,170)", fontFamily: "Georgia,serif" }}>
              {b.msg}
            </span>
          </div>
        ))}
      </div>

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
                    {pendingRoom.isSecret ? "★ Secret Location" : "Unlock"}
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
                  🎯 Complete this location to earn a <strong>free action</strong> against the boss.
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
                    ? "Unlocking…"
                    : pendingRoom.unlockCost > 0
                    ? `🍺 Unlock (${pendingRoom.unlockCost} Offer)`
                    : "🔓 Unlock (free)"}
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
