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
const CH1_NODES = [
  { id: "kitchen",      cx: 160, cy: 404, r: 12, shift: 2, isSecret: false },
  { id: "fridge",       cx: 160, cy: 314, r: 12, shift: 4, isSecret: false },
  { id: "terrace",      cx: 160, cy: 224, r: 10, shift: 6, isSecret: false },
  { id: "shed",         cx: 160, cy: 144, r: 10, shift: 3, isSecret: false },
  { id: "coffee-table", cx: 220, cy: 355, r: 11, shift: 1, isSecret: true  },
] as const;

const CH1_PATHS = [
  { from: "kitchen",      to: "fridge",        d: "M160,390 L160,326",                         secret: false },
  { from: "fridge",       to: "terrace",        d: "M160,300 L160,236",                         secret: false },
  { from: "terrace",      to: "shed",           d: "M160,212 L160,156",                         secret: false },
  { from: "shed",         to: "boss",           d: "M160,132 L160,82",                          secret: false },
  { from: "kitchen",      to: "coffee-table",   d: "M172,398 C185,385 205,372 209,362",         secret: true  },
];

// ─── Node visual states ─────────────────────────────────────────────────────
type NodeState = "done" | "active" | "can_unlock" | "locked";

const NODE_STYLES: Record<NodeState, {
  fill: string; stroke: string; strokeWidth: number; opacity: number; textColor: string;
}> = {
  done:       { fill: "#a88828", stroke: "#5a8820", strokeWidth: 1.4, opacity: 1,    textColor: "#1a1008" },
  active:     { fill: "#c89030", stroke: "#c0392b", strokeWidth: 2.2, opacity: 1,    textColor: "#7a1008" },
  can_unlock: { fill: "#d4b060", stroke: "#2a7a3a", strokeWidth: 1.8, opacity: 1,    textColor: "#1a4a2a" },
  locked:     { fill: "#c4a840", stroke: "#8a6020", strokeWidth: 1.2, opacity: 0.42, textColor: "#5a3808" },
};

const SECRET_NODE_STYLES: Record<NodeState, {
  fill: string; stroke: string; strokeWidth: number; opacity: number; textColor: string;
}> = {
  done:       { fill: "#1a4a5a", stroke: "#3ab8c8", strokeWidth: 1.6, opacity: 1,    textColor: "#a0e8f8" },
  active:     { fill: "#1e5a6e", stroke: "#3ab8c8", strokeWidth: 2.2, opacity: 1,    textColor: "#a0f0ff" },
  can_unlock: { fill: "#163848", stroke: "#3ab8c8", strokeWidth: 1.8, opacity: 1,    textColor: "#70d8e8" },
  locked:     { fill: "#0e2030", stroke: "#3a6878", strokeWidth: 1.2, opacity: 0.55, textColor: "#4a8898" },
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

  // Map pan — dynamic viewBox for zoom+scroll feel
  const VISIBLE_H = 280;   // SVG units shown at once (~2-3 rooms)
  const MAP_H = 520;
  const MAX_PAN = MAP_H - VISIBLE_H;  // = 240
  const [panY, setPanY] = useState(225); // default: show fridge+coffee-table+kitchen
  const touchPanRef = useRef<{ clientY: number; startPanY: number } | null>(null);
  const clampedPan = Math.max(0, Math.min(panY, MAX_PAN));

  const handleMapTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    touchPanRef.current = { clientY: e.touches[0].clientY, startPanY: clampedPan };
  };
  const handleMapTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!touchPanRef.current) return;
    e.preventDefault();
    const dy = e.touches[0].clientY - touchPanRef.current.clientY;
    // drag up → reveal bottom of map (kitchen) → panY increases
    const svgDelta = -(dy / (window.innerHeight / VISIBLE_H));
    setPanY(Math.max(0, Math.min(MAX_PAN, touchPanRef.current.startPanY + svgDelta)));
  };
  const handleMapTouchEnd = () => { touchPanRef.current = null; };

  const fetchData = useCallback(async () => {
    if (!gameId || !teamId) return;
    const res = await fetch(`/api/game/${gameId}/progress?teamId=${teamId}`);
    if (!res.ok) return;
    const data = await res.json();
    setGame(data.game);
    setRoomProgress(data.roomProgress ?? []);

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
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#0c1a2c" }}>

      {/* ── Full-screen map SVG ── */}
      <svg
        viewBox={`0 ${clampedPan} 340 ${VISIBLE_H}`}
        className="absolute inset-0"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Quest map — tap a room to enter or unlock it"
        style={{ touchAction: "none" }}
        onTouchStart={handleMapTouchStart}
        onTouchMove={handleMapTouchMove}
        onTouchEnd={handleMapTouchEnd}
        xmlns="http://www.w3.org/2000/svg"
      >
          {/* Navy background */}
          <rect width="340" height="520" fill="#0c1a2c" />

          {/* Stars */}
          <g fill="#e8d890" opacity={0.6}>
            <circle cx="14"  cy="38"  r="1.1" /><circle cx="8"   cy="110" r="0.8" />
            <circle cx="20"  cy="205" r="1"   /><circle cx="10"  cy="300" r="0.9" />
            <circle cx="22"  cy="390" r="1.1" /><circle cx="326" cy="52"  r="1.2" />
            <circle cx="320" cy="148" r="0.9" /><circle cx="330" cy="240" r="1"   />
            <circle cx="316" cy="330" r="0.8" /><circle cx="324" cy="420" r="1.1" />
            <circle cx="62"  cy="7"   r="0.9" /><circle cx="135" cy="4"   r="1.1" />
            <circle cx="208" cy="7"   r="0.8" /><circle cx="278" cy="5"   r="1"   />
          </g>

          {/* Moon */}
          <circle cx="308" cy="32" r="13" fill="#e8d890" opacity={0.42} />
          <circle cx="314" cy="28" r="10" fill="#0c1a2c" />

          {/* Parchment polygon */}
          <polygon
            points="24,22 88,16 150,20 200,14 260,18 316,22 322,56 325,488 316,504 250,507 170,502 90,506 22,504 12,494 10,56 20,24"
            fill="#c8a040"
          />

          {/* Grain lines */}
          <g stroke="#a88030" strokeWidth={0.25} opacity={0.18}>
            <line x1="10" y1="88"  x2="330" y2="86"  />
            <line x1="10" y1="188" x2="330" y2="186" />
            <line x1="10" y1="290" x2="330" y2="288" />
            <line x1="10" y1="400" x2="330" y2="398" />
          </g>

          {/* Age spots */}
          <g fill="#906020" opacity={0.12}>
            <circle cx="48" cy="105" r="9" />
            <circle cx="294" cy="160" r="8" />
            <circle cx="42" cy="444" r="7" />
          </g>

          {/* Fog — unknown upper territory */}
          <rect x="14" y="88" width="312" height="105" fill="#c8b880" opacity={0.4} />
          <text
            x="170" y="138"
            textAnchor="middle"
            fontFamily="Georgia,serif"
            fontSize={8}
            fill="#8a6020"
            letterSpacing={2}
            opacity={0.65}
          >
            ~ ukendt territorium ~
          </text>

          {/* Title */}
          <text
            x="170" y="48"
            textAnchor="middle"
            fontFamily="Georgia,serif"
            fontSize={12}
            fontWeight="bold"
            fill="#3a2208"
            letterSpacing={3}
          >
            SOMMERHUSET
          </text>
          <text
            x="170" y="63"
            textAnchor="middle"
            fontFamily="Georgia,serif"
            fontSize={8}
            fill="#5a3010"
            letterSpacing={4}
          >
            KAPITEL I
          </text>
          <line x1="102" y1="68" x2="238" y2="68" stroke="#5a3010" strokeWidth={0.7} opacity={0.5} />

          {/* Compass rose */}
          <g transform="translate(275,450)">
            <circle cx="0" cy="0" r="12" stroke="#5a3010" strokeWidth={0.8} fill="#c8a040" opacity={0.9} />
            <line x1="0" y1="-9" x2="0" y2="9" stroke="#5a3010" strokeWidth={1} />
            <line x1="-9" y1="0" x2="9" y2="0" stroke="#5a3010" strokeWidth={1} />
            <polygon points="0,-9 -2,-4 0,-6 2,-4" fill="#5a3010" />
            <text x="0" y="-11" textAnchor="middle" fontFamily="Georgia,serif" fontSize={6} fill="#3a2208">N</text>
          </g>

          {/* Moon phase deco */}
          <g transform="translate(42,450)" opacity={0.55}>
            <circle cx="0" cy="0" r="9"  fill="#c8a040" stroke="#8a6020" strokeWidth={0.7} />
            <circle cx="4" cy="-1" r="7" fill="#b09030" />
            <text x="0" y="14" textAnchor="middle" fontFamily="Georgia,serif" fontSize={5.5} fill="#3a2208">FASE I</text>
          </g>

          {/* Paths */}
          {CH1_PATHS.map(({ from, to, d, secret }) => (
            <path
              key={`${from}-${to}`}
              d={d}
              stroke={secret ? "#3ab8c8" : "#c88020"}
              strokeWidth={secret ? 1.1 : 1.3}
              fill="none"
              strokeDasharray={secret ? "3,5" : "4,4"}
              opacity={pathOpacity(from, to, secret)}
            />
          ))}

          {/* Secret branch label */}
          <text
            x="210" y="382"
            textAnchor="middle"
            fontFamily="Georgia,serif"
            fontSize={5.5}
            fill="#3ab8c8"
            opacity={0.6}
            letterSpacing={1}
          >
            hemmeligt
          </text>

          {/* Boss node */}
          <g
            onClick={() => {
              if (canInteract && chapter) {
                router.push(`/game/${gameId}/boss/${chapter.bossId}?team=${teamId}`);
              }
            }}
            style={{ cursor: canInteract ? "pointer" : "default" }}
          >
            <circle cx="160" cy="92" r="22" fill="transparent" />
            <polygon
              points={wp(160, 92, 11, 0)}
              fill="#5a1010"
              stroke="#c0392b"
              strokeWidth={1.8}
            />
            <text
              x="160" y="89"
              textAnchor="middle"
              fontFamily="Georgia,serif"
              fontSize={9}
              fill="#f0c8a0"
            >
              ◉  ◉
            </text>
            <text
              x="160" y="116"
              textAnchor="middle"
              fontFamily="Georgia,serif"
              fontSize={6}
              fill="#3a2208"
            >
              BOSS
            </text>
          </g>

          {/* Room nodes */}
          {CH1_NODES.map(({ id, cx, cy, r, shift, isSecret }) => {
            const state = getNodeState(id);
            const room = getRoom(id);
            const s = isSecret ? SECRET_NODE_STYLES[state] : NODE_STYLES[state];
            const symbol = nodeSymbol(state, room?.unlockCost ?? 0, isSecret);
            const clickable = canInteract && state !== "locked";
            const labelY = cy + r + 14;
            const subY   = cy + r + 23;

            // Danish labels
            const LABELS: Record<string, string> = {
              kitchen:       "KØKKEN",
              fridge:        "KØLESKAB",
              terrace:       "TERRASSE",
              shed:          "SKUR",
              "coffee-table": "SOFABORD",
            };

            return (
              <g
                key={id}
                onClick={() => handleNodeClick(id)}
                style={{ cursor: clickable ? "pointer" : "default" }}
                opacity={s.opacity}
              >
                {/* Touch target */}
                <circle cx={cx} cy={cy} r={r + 12} fill="transparent" />

                {/* Secret glow ring */}
                {isSecret && state !== "locked" && (
                  <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#3ab8c8" strokeWidth={0.8} opacity={0.4} strokeDasharray="2,3" />
                )}

                {/* Node shape */}
                <polygon
                  points={wp(cx, cy, r, shift)}
                  fill={s.fill}
                  stroke={s.stroke}
                  strokeWidth={s.strokeWidth}
                />

                {/* Symbol */}
                <text
                  x={cx} y={cy + 4}
                  textAnchor="middle"
                  fontFamily="Georgia,serif"
                  fontSize={state === "can_unlock" ? 9 : 11}
                  fill={s.textColor}
                  fontWeight={state === "active" ? "bold" : "normal"}
                >
                  {symbol}
                </text>

                {/* Room label */}
                <text
                  x={cx} y={labelY}
                  textAnchor="middle"
                  fontFamily="Georgia,serif"
                  fontSize={6}
                  fill={isSecret ? "#3ab8c8" : "#3a2208"}
                  opacity={isSecret ? 0.85 : 1}
                >
                  {LABELS[id] ?? id.toUpperCase()}
                </text>

                {/* State sub-label */}
                {state === "done" && (
                  <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={5} fill={isSecret ? "#3ab8c8" : "#5a8820"}>
                    Gennemført
                  </text>
                )}
                {state === "active" && (
                  <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={5} fill="#c0392b">
                    Aktiv
                  </text>
                )}
                {state === "can_unlock" && room && (
                  <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={5} fill={isSecret ? "#3ab8c8" : "#2a7a3a"}>
                    {room.unlockCost > 0 ? `${room.unlockCost} Offer` : isSecret ? "Bonus" : "Gratis"}
                  </text>
                )}
              </g>
            );
          })}
      </svg>

      {/* ── Scroll indicator dots (right edge, vertical center) ── */}
      <div
        className="absolute right-2.5 z-20 flex flex-col gap-1.5 pointer-events-none"
        style={{ top: "50%", transform: "translateY(-50%)" }}
      >
        {[0, 0.5, 1].map((anchor) => {
          const active = Math.abs(clampedPan / MAX_PAN - anchor) < 0.28;
          return (
            <div
              key={anchor}
              style={{
                width: active ? 6 : 4,
                height: active ? 6 : 4,
                borderRadius: "50%",
                background: active ? "rgba(245,215,140,0.85)" : "rgba(180,140,60,0.35)",
                transition: "all 0.2s",
              }}
            />
          );
        })}
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
              className="text-[9px] uppercase tracking-[0.25em]"
              style={{ color: "rgba(180,130,50,0.4)", fontFamily: "Georgia,serif" }}
            >
              Kapitel I
            </span>
            <span
              className="font-bold text-sm"
              style={{ color: "rgba(245,225,170,0.95)", fontFamily: "Georgia,serif", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
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
