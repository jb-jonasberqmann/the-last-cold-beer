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
  { from: "shed",         to: "boss",           d: "M170,172 L170,115",                         secret: false },
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
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#0c1a2c" }}>

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
            <radialGradient id="atmBg" cx="50%" cy="40%" r="80%">
              <stop offset="0%" stopColor="#100c06" />
              <stop offset="100%" stopColor="#030202" />
            </radialGradient>
            {/* Lantern glow left */}
            <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d4820a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#d4820a" stopOpacity="0" />
            </radialGradient>
            {/* Cabin window glow */}
            <radialGradient id="cabinGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e09030" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#e09030" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="parchGrad" cx="48%" cy="42%" r="65%">
              <stop offset="0%" stopColor="#d2a848" />
              <stop offset="50%" stopColor="#bf9028" />
              <stop offset="100%" stopColor="#906415" />
            </radialGradient>
            <clipPath id="bossImgClip">
              <polygon points={wp(170, 88, 24, 0)} />
            </clipPath>
          </defs>

          {/* ── Deep dark background ── */}
          <rect width="340" height="520" fill="url(#atmBg)" />

          {/* Stars */}
          <g fill="#e8d890" opacity={0.4}>
            <circle cx="62" cy="6" r="0.8" /><circle cx="135" cy="4" r="1.0" />
            <circle cx="208" cy="6" r="0.7" /><circle cx="278" cy="4" r="0.9" />
            <circle cx="14" cy="30" r="1.0" /><circle cx="326" cy="38" r="1.0" />
            <circle cx="8"  cy="80" r="0.7" /><circle cx="330" cy="76" r="0.8" />
          </g>
          {/* Moon */}
          <circle cx="306" cy="26" r="11" fill="#e8e0a0" opacity={0.35} />
          <circle cx="311" cy="22" r="8.5" fill="#030202" />

          {/* ── Atmospheric scene silhouettes ── */}
          {/* Pine trees — far left */}
          <g fill="#060504" opacity={0.9}>
            <polygon points="4,200 10,170 16,200" />
            <polygon points="2,220 9,185 16,220" />
            <polygon points="0,245 8,205 16,245" />
            <polygon points="0,275 9,230 18,275" />
            <polygon points="0,310 10,260 20,310" />
            <polygon points="0,350 12,292 24,350" />
            <polygon points="0,400 14,330 28,400" />
            <polygon points="0,460 16,370 32,460" />
          </g>
          {/* Cabin silhouette — left */}
          <g fill="#0a0806" opacity={0.85}>
            <rect x="0" y="174" width="30" height="32" />
            <polygon points="0,174 15,158 30,174" />
            {/* Roof ridge */}
            <rect x="12" y="163" width="6" height="12" fill="#0a0806" />
          </g>
          {/* Cabin warm window glow */}
          <ellipse cx="8" cy="185" rx="18" ry="14" fill="url(#cabinGlow)" />
          <rect x="3" y="180" width="7" height="6" fill="#e09030" opacity={0.35} rx="1" />
          {/* Lantern glow — left edge */}
          <ellipse cx="0" cy="230" rx="30" ry="28" fill="url(#lanternGlow)" />
          {/* Pine trees — far right */}
          <g fill="#060504" opacity={0.88}>
            <polygon points="322,215 330,182 338,215" />
            <polygon points="318,245 328,205 338,245" />
            <polygon points="314,280 326,232 338,280" />
            <polygon points="310,320 324,264 338,320" />
            <polygon points="308,368 324,302 340,368" />
            <polygon points="306,425 324,348 342,425" />
            <polygon points="304,480 324,395 344,480" />
          </g>
          {/* Water shimmer — bottom right behind parchment */}
          <g stroke="#1a3040" strokeWidth={0.6} opacity={0.5}>
            <path d="M295,460 Q310,456 325,460 Q335,464 340,460" fill="none" />
            <path d="M290,470 Q308,466 326,470 Q336,474 340,470" fill="none" />
            <path d="M295,480 Q310,476 328,480 Q338,484 340,480" fill="none" />
          </g>

          {/* ── Parchment map ── */}
          <polygon
            points="28,18 90,12 154,16 204,10 262,14 312,18 320,52 322,492 312,506 248,509 170,504 90,508 20,506 10,494 8,52 24,20"
            fill="url(#parchGrad)"
          />
          {/* Aged border */}
          <polygon
            points="28,18 90,12 154,16 204,10 262,14 312,18 320,52 322,492 312,506 248,509 170,504 90,508 20,506 10,494 8,52 24,20"
            fill="none" stroke="#4a2804" strokeWidth={6} opacity={0.3}
          />

          {/* ── Vintage cartographic details ── */}
          <g stroke="#7a5010" fill="#7a5010" opacity={0.18}>
            {/* Trees — left margin */}
            {([[32,210],[26,235],[34,262],[28,295],[32,328],[26,362],[30,400],[28,440]] as [number,number][]).map(([x,y]) => (
              <g key={`tl${x}${y}`}>
                <line x1={x} y1={y+7} x2={x} y2={y} strokeWidth={0.7} />
                <polygon points={`${x},${y} ${x-4},${y+6} ${x+4},${y+6}`} />
                <polygon points={`${x},${y+4} ${x-3},${y+8} ${x+3},${y+8}`} />
              </g>
            ))}
            {/* Trees — right margin */}
            {([[294,218],[302,245],[292,272],[300,305],[294,342],[302,378],[292,418],[298,454]] as [number,number][]).map(([x,y]) => (
              <g key={`tr${x}${y}`}>
                <line x1={x} y1={y+7} x2={x} y2={y} strokeWidth={0.7} />
                <polygon points={`${x},${y} ${x-4},${y+6} ${x+4},${y+6}`} />
                <polygon points={`${x},${y+4} ${x-3},${y+8} ${x+3},${y+8}`} />
              </g>
            ))}
            {/* Mountain marks — upper parchment */}
            <path d="M50,165 L58,148 L66,165" strokeWidth={0.8} fill="none" />
            <path d="M58,165 L67,146 L76,165" strokeWidth={0.8} fill="none" />
            <path d="M262,162 L270,145 L278,162" strokeWidth={0.8} fill="none" />
            <path d="M270,162 L279,143 L288,162" strokeWidth={0.8} fill="none" />
            {/* Water lines — right side of parchment */}
            <path d="M252,330 Q268,326 284,330 Q298,334 310,330" strokeWidth={0.6} fill="none" />
            <path d="M250,340 Q268,336 286,340 Q300,344 312,340" strokeWidth={0.6} fill="none" />
            <path d="M252,350 Q270,346 288,350 Q302,354 314,350" strokeWidth={0.6} fill="none" />
            <path d="M250,360 Q268,356 286,360 Q300,364 312,360" strokeWidth={0.6} fill="none" />
            {/* Compass rose hint — lower right */}
            <circle cx="292" cy="460" r="8" fill="none" strokeWidth={0.6} />
            <line x1="292" y1="450" x2="292" y2="470" strokeWidth={0.6} />
            <line x1="282" y1="460" x2="302" y2="460" strokeWidth={0.6} />
            <polygon points="292,450 289,455 295,455" />
            <text x="292" y="445" textAnchor="middle" fontFamily="Georgia,serif" fontSize={4} fill="#7a5010" opacity={0.9}>N</text>
          </g>
          {/* Grain lines */}
          <g stroke="#8a6020" strokeWidth={0.25} opacity={0.12}>
            <line x1="8" y1="100" x2="322" y2="98"  />
            <line x1="8" y1="200" x2="322" y2="198" />
            <line x1="8" y1="305" x2="322" y2="303" />
            <line x1="8" y1="415" x2="322" y2="413" />
          </g>
          {/* Age spots */}
          <g fill="#6a4008" opacity={0.08}>
            <circle cx="50" cy="118" r="13" />
            <circle cx="292" cy="182" r="10" />
            <circle cx="44" cy="462" r="9" />
          </g>

          {/* ── Title ── */}
          <text x="170" y="40" textAnchor="middle" fontFamily="Georgia,serif" fontSize={20} fontWeight="bold" fill="#3a2008" letterSpacing={4} opacity={0.92}>
            SOMMERHUSET
          </text>
          <line x1="76"  y1="50" x2="126" y2="50" stroke="#5a3010" strokeWidth={0.8} opacity={0.5} />
          <text x="170" y="54" textAnchor="middle" fontFamily="Georgia,serif" fontSize={8} fill="#5a3010" letterSpacing={5}>
            KAPITEL I
          </text>
          <line x1="214" y1="50" x2="264" y2="50" stroke="#5a3010" strokeWidth={0.8} opacity={0.5} />

          {/* ── Fog ── */}
          <rect x="12" y="122" width="316" height="50" fill="#c8b880" opacity={0.28} />
          <text x="170" y="150" textAnchor="middle" fontFamily="Georgia,serif" fontSize={7} fill="#8a6020" letterSpacing={2} opacity={0.55} fontStyle="italic">
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
          <text x="240" y="412" textAnchor="middle" fontFamily="Georgia,serif" fontSize={5.5} fill="#3ab8c8" opacity={0.65} letterSpacing={1}>hemmeligt</text>

          {/* ── Boss node ── */}
          <g onClick={() => { if (canInteract && chapter) router.push(`/game/${gameId}/boss/${chapter.bossId}?team=${teamId}`); }} style={{ cursor: canInteract ? "pointer" : "default" }}>
            <circle cx="170" cy="88" r="36" fill="transparent" />
            <image href="/rooms/boss-cooler.png" x="146" y="46" width="48" height="85" clipPath="url(#bossImgClip)" preserveAspectRatio="xMidYMid slice" />
            <polygon points={wp(170, 88, 24, 0)} fill="none" stroke="#c0392b" strokeWidth={2.2} opacity={0.9} />
            {bossUnlockable && (
              <>
                <polygon points={wp(170, 88, 29, 0)} fill="none" stroke="#e04020" strokeWidth={1.6} opacity={0.4} />
                <polygon points={wp(170, 88, 34, 0)} fill="none" stroke="#e04020" strokeWidth={0.8} opacity={0.18} />
              </>
            )}
            <text x="170" y="124" textAnchor="middle" fontFamily="Georgia,serif" fontSize={7} fill="#3a2208" letterSpacing={2}>BOSS</text>
          </g>

          {/* ── Room nodes ── */}
          {CH1_NODES.map(({ id, cx, cy, r, shift, isSecret }) => {
            const state = getNodeState(id);
            const room = getRoom(id);
            const s = isSecret ? SECRET_NODE_STYLES[state] : NODE_STYLES[state];
            const symbol = nodeSymbol(state, room?.unlockCost ?? 0, isSecret);
            const clickable = canInteract && state !== "locked";
            const labelY = cy + r + 11;
            const subY   = cy + r + 19;

            const LABELS: Record<string, string> = {
              kitchen: "KØKKEN", fridge: "KØLESKAB", terrace: "TERRASSE",
              shed: "SKUR", "coffee-table": "SOFABORD",
            };

            return (
              <g key={id} onClick={() => handleNodeClick(id)} style={{ cursor: clickable ? "pointer" : "default" }} opacity={s.opacity}>
                <circle cx={cx} cy={cy} r={r + 14} fill="transparent" />

                {/* Active glow rings */}
                {state === "active" && !isSecret && (
                  <>
                    <polygon points={wp(cx, cy, r + 8, shift)} fill="none" stroke="#e05818" strokeWidth={3.5} opacity={0.55} />
                    <polygon points={wp(cx, cy, r + 14, shift)} fill="none" stroke="#e05818" strokeWidth={1.5} opacity={0.22} />
                  </>
                )}
                {isSecret && state !== "locked" && (
                  <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="#3ab8c8" strokeWidth={1} opacity={0.4} strokeDasharray="2,3" />
                )}
                {/* Pulse ring */}
                {(state === "active" || state === "can_unlock") && (
                  <circle cx={cx} cy={cy} r={r + 4} fill="none"
                    stroke={isSecret ? "#3ab8c8" : state === "active" ? "#e05010" : "#2a9a4a"}
                    strokeWidth={2} opacity={0}
                  >
                    <animate attributeName="r" values={`${r+4};${r+20};${r+4}`} dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.85;0;0.85" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                )}

                <polygon points={wp(cx, cy, r, shift)} fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} />
                <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="Georgia,serif"
                  fontSize={state === "can_unlock" ? r * 0.7 : r * 0.85}
                  fill={s.textColor} fontWeight={state === "active" ? "bold" : "normal"}
                >
                  {symbol}
                </text>
                <text x={cx} y={labelY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={6.5}
                  fill={isSecret ? "#3ab8c8" : "#3a2208"} opacity={isSecret ? 0.85 : 1} letterSpacing={0.8}
                >
                  {LABELS[id] ?? id.toUpperCase()}
                </text>
                {state === "done" && <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={5} fill={isSecret ? "#3ab8c8" : "#5a8820"}>Gennemført</text>}
                {state === "active" && <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={5} fill="#e05010" fontWeight="bold">Aktiv</text>}
                {state === "can_unlock" && room && (
                  <text x={cx} y={subY} textAnchor="middle" fontFamily="Georgia,serif" fontSize={5} fill={isSecret ? "#3ab8c8" : "#2a7a3a"}>
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
