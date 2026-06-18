"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { unlockRoom } from "@/lib/game/actions";
import { GameLayout } from "@/components/layout/GameLayout";
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
  { id: "coffee-table", cx: 274, cy: 360, r: 11, shift: 1, isSecret: true  },
] as const;

const CH1_PATHS = [
  { from: "kitchen",      to: "fridge",        d: "M160,390 L160,326",                         secret: false },
  { from: "fridge",       to: "terrace",        d: "M160,300 L160,236",                         secret: false },
  { from: "terrace",      to: "shed",           d: "M160,212 L160,156",                         secret: false },
  { from: "shed",         to: "boss",           d: "M160,132 L160,82",                          secret: false },
  { from: "kitchen",      to: "coffee-table",   d: "M172,398 C210,386 248,374 262,369",         secret: true  },
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

  const fetchData = useCallback(async () => {
    if (!gameId || !teamId) return;
    const res = await fetch(`/api/game/${gameId}/progress?teamId=${teamId}`);
    if (!res.ok) return;
    const data = await res.json();
    setGame(data.game);
    setRoomProgress(data.roomProgress ?? []);
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

  return (
    <GameLayout
      gameId={gameId}
      teamId={teamId}
      backHref={`/game/${gameId}/dashboard`}
      backLabel="Dashboard"
      title={teamName}
    >
      {/* ── Map + modal container ── */}
      <div className="w-full mb-4 select-none relative">
        <svg
          viewBox="0 0 340 520"
          width="100%"
          role="img"
          aria-label="Quest map — tap a room to enter or unlock it"
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
            x="232" y="370"
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

        {/* ── Unlock modal overlay ── */}
        {pendingUnlock && pendingRoom && (
          <div
            className="absolute inset-0 flex items-center justify-center p-6 z-20"
            style={{ background: "rgba(12,26,44,0.82)", backdropFilter: "blur(4px)", borderRadius: "inherit" }}
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

      {/* ── Toast ── */}
      {message && (
        <div className="rounded-lg bg-stone-800 border border-stone-600 px-4 py-2 mb-4 text-sm text-stone-200">
          {message}
        </div>
      )}

      {/* ── Secret advantage badge ── */}
      {secretRoomDone && (
        <div className="rounded-xl bg-cyan-950/40 border border-cyan-800/50 px-4 py-3 mb-4 flex items-center gap-3">
          <span className="text-lg">🎯</span>
          <div style={{ fontFamily: "Georgia,serif" }}>
            <div className="text-xs text-cyan-500 uppercase tracking-widest font-bold">Boss-fordel aktiv</div>
            <div className="text-sm text-cyan-300">Sofabordet: gratis bosshandling optjent</div>
          </div>
        </div>
      )}

      {/* ── Boss section ── */}
      {chapter && (
        <div className="rounded-xl bg-gradient-to-r from-red-950 to-stone-900 border border-red-800/50 p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            <div className="flex-1">
              <div className="text-xs text-stone-400 uppercase tracking-widest">Kapitel Boss</div>
              <div className="font-bold text-white">Den Låste Køler</div>
              <div className="text-xs text-stone-400 mt-0.5">
                Saml spor for at overvinde bossen
              </div>
            </div>
            {canInteract && (
              <a
                href={`/game/${gameId}/boss/${chapter.bossId}?team=${teamId}`}
                className="text-sm bg-red-700/50 hover:bg-red-700/70 text-red-300 border border-red-700/50 rounded-lg px-3 py-2 transition-colors"
              >
                Kæmp →
              </a>
            )}
          </div>
        </div>
      )}
    </GameLayout>
  );
}
