"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { unlockRoom } from "@/lib/game/actions";
import type { DbGame, DbRoomProgress, DbGameEvent, DbTeamClue } from "@/types/database";
import type { TeamId, Clue } from "@/types/content";
import { getChapter, getRoom } from "@/content/index";
import { getBoss } from "@/content/bosses";
import { getClue } from "@/content/clues";
import { getQuest } from "@/content/quests";

interface Props {
  params: { gameId: string; teamId: TeamId };
}

// ─── Per-act visual theme ────────────────────────────────────────────────────
const ACT_THEMES: Record<string, { accent: string; label: string; subtitle: string; emoji: string; darkLabels: boolean }> = {
  "act-1": { accent: "#d4a832", label: "THE ARRIVAL",    subtitle: "ACT I",   emoji: "🌅", darkLabels: true  },
  "act-2": { accent: "#8ab4f8", label: "SETTLING IN",    subtitle: "ACT II",  emoji: "🏠", darkLabels: false },
  "act-3": { accent: "#f87171", label: "THE LATE NIGHT", subtitle: "ACT III", emoji: "🌑", darkLabels: false },
};

// ─── SVG map geometry per act ─────────────────────────────────────────────────
//   • Boss always at top   (cy ≈ 88)
//   • Starting room(s) at bottom   (cy ≈ 440-600)
//   • scale 2.2 for act 1/2, 2.0 for act 3 (more rooms)
//   • spacerVW = scale × (svgH / svgW) × 100
//   • Visible SVG-x at scale 2.2:  ≈ 93 – 247  (clipped at screen edges)
//   • Visible SVG-x at scale 2.0:  ≈ 85 – 255
//   • NodeBlob images rendered via SVG <image> — PNG alpha channels respected

interface NodeDef {
  id: string;
  cx: number;
  cy: number;
  sz: number;        // half-size of NodeBlob image in SVG units (radius)
  isOptional?: boolean;
}

interface ActGeo {
  svgW: number; svgH: number;
  scale: number;
  bossNode: { cx: number; cy: number };
  titleCY: number;       // y of act-title text in SVG units
  nodes: NodeDef[];
  paths: [string, string][];   // [fromId, toId]  — "boss" is valid
}

const ACT_GEO: Record<string, ActGeo> = {
  // ── ACT 1 — outdoor / arrival ─────────────────────────────────────────────
  // Spine (cx≈170): driveway → garden → front-door → boss
  // Branches: terrace/carport right, shed left, petanque optional right
  // Scale 1.65 → visible SVG-x ≈ 67–273 → all nodes between cx 112–230 ✓
  "act-1": {
    svgW: 340, svgH: 520, scale: 1.65,
    bossNode: { cx: 170, cy: 88 },
    titleCY: 42,
    nodes: [
      { id: "front-door",     cx: 170, cy: 180, sz: 14 },
      { id: "shed",           cx: 114, cy: 265, sz: 12 },
      { id: "carport",        cx: 226, cy: 265, sz: 12 },
      { id: "garden",         cx: 170, cy: 355, sz: 14 },
      { id: "terrace",        cx: 228, cy: 408, sz: 12 },
      { id: "petanque-court", cx: 230, cy: 458, sz: 11, isOptional: true },
      { id: "driveway",       cx: 155, cy: 462, sz: 14 },
    ],
    paths: [
      ["driveway",    "garden"],
      ["driveway",    "terrace"],
      ["terrace",     "carport"],
      ["garden",      "shed"],
      ["garden",      "carport"],
      ["garden",      "petanque-court"],
      ["shed",        "front-door"],
      ["carport",     "front-door"],
      ["front-door",  "boss"],
    ],
  },

  // ── ACT 2 — indoor / settling ─────────────────────────────────────────────
  // Spine (cx≈170): bedrooms → bathroom → living-room → kitchen → dining → boss
  // Branches: sunroom left (optional), kitchen-act2 right
  "act-2": {
    svgW: 340, svgH: 520, scale: 1.65,
    bossNode: { cx: 170, cy: 82 },
    titleCY: 38,
    nodes: [
      { id: "dining-room",  cx: 170, cy: 162, sz: 14 },
      { id: "kitchen-act2", cx: 226, cy: 248, sz: 12 },
      { id: "sunroom",      cx: 114, cy: 248, sz: 11, isOptional: true },
      { id: "living-room",  cx: 170, cy: 335, sz: 14 },
      { id: "bathroom",     cx: 170, cy: 400, sz: 12 },
      { id: "double-room",  cx: 114, cy: 462, sz: 12 },
      { id: "single-room",  cx: 170, cy: 462, sz: 14 },
      { id: "bunk-room",    cx: 226, cy: 462, sz: 12 },
    ],
    paths: [
      ["double-room",  "bathroom"],
      ["single-room",  "bathroom"],
      ["bunk-room",    "bathroom"],
      ["bathroom",     "living-room"],
      ["living-room",  "sunroom"],
      ["living-room",  "kitchen-act2"],
      ["kitchen-act2", "dining-room"],
      ["dining-room",  "boss"],
    ],
  },

  // ── ACT 3 — late night / dark ─────────────────────────────────────────────
  // Spine: dining-dark → utility → back-corridor → revelation → boss
  // 3-way fan from back-corridor: door (left), behind-shed (centre), fuse-box (right)
  // Scale 1.55 → visible SVG-x ≈ 60–280 → all nodes between cx 95–245 ✓
  "act-3": {
    svgW: 340, svgH: 640, scale: 1.55,
    bossNode: { cx: 170, cy: 88 },
    titleCY: 42,
    nodes: [
      { id: "revelation-circle", cx: 155, cy: 162, sz: 13 },
      { id: "door-nobody-tried", cx: 107, cy: 238, sz: 12 },
      { id: "shed-dark",         cx: 215, cy: 238, sz: 12 },
      { id: "sealed-wall",       cx: 95,  cy: 308, sz: 11 },
      { id: "conservatory",      cx: 152, cy: 308, sz: 11 },
      { id: "kitchen-dark",      cx: 232, cy: 308, sz: 12 },
      { id: "rattling-window",   cx: 242, cy: 238, sz: 10, isOptional: true },
      { id: "behind-the-shed",   cx: 165, cy: 382, sz: 12 },
      { id: "fuse-box",          cx: 235, cy: 382, sz: 11 },
      { id: "back-corridor",     cx: 170, cy: 455, sz: 14 },
      { id: "utility-corner",    cx: 170, cy: 528, sz: 12 },
      { id: "dining-room-dark",  cx: 170, cy: 600, sz: 14 },
    ],
    paths: [
      ["dining-room-dark",  "utility-corner"],
      ["utility-corner",    "back-corridor"],
      ["back-corridor",     "door-nobody-tried"],
      ["back-corridor",     "behind-the-shed"],
      ["back-corridor",     "fuse-box"],
      ["door-nobody-tried", "sealed-wall"],
      ["door-nobody-tried", "revelation-circle"],
      ["behind-the-shed",   "conservatory"],
      ["behind-the-shed",   "shed-dark"],
      ["fuse-box",          "kitchen-dark"],
      ["kitchen-dark",      "rattling-window"],
      ["shed-dark",         "revelation-circle"],
      ["revelation-circle", "boss"],
    ],
  },
};

// ─── Scroll helpers ───────────────────────────────────────────────────────────
function easeInCubic(t: number): number { return t * t * t; }

// ─── Component ────────────────────────────────────────────────────────────────
export default function TeamQuestBoardPage({ params }: Props) {
  const { gameId, teamId } = params;
  const router = useRouter();
  const { session } = usePlayer();

  // ── Data state ───────────────────────────────────────────────────────────
  const [game, setGame] = useState<DbGame | null>(null);
  const [roomProgress, setRoomProgress] = useState<DbRoomProgress[]>([]);
  const [pendingUnlock, setPendingUnlock] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [showCaseFile, setShowCaseFile] = useState(false);
  const [teamClues, setTeamClues] = useState<Clue[]>([]);
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);
  const [newClueCount, setNewClueCount] = useState(0);
  const [offerSpent, setOfferSpent] = useState(0);
  const [otherRoomsCompleted, setOtherRoomsCompleted] = useState<number | null>(null);
  const [tollBanners, setTollBanners] = useState<{ msg: string; key: number }[]>([]);
  const tollKeyRef = useRef(0);
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const seenClueCountRef = useRef<number | null>(null);
  const [activeChallenges, setActiveChallenges] = useState<Record<string, string>>({});

  // ── Map scroll refs ───────────────────────────────────────────────────────
  const mapScrollRef = useRef<HTMLDivElement>(null);
  const scrollSetupActRef = useRef<string | null>(null);  // which act we've already set up scroll for

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!gameId || !teamId) return;
    const res = await fetch(`/api/game/${gameId}/progress?teamId=${teamId}`);
    if (!res.ok) return;
    const data = await res.json();
    const g: DbGame = data.game;
    setGame(g);
    const rp = data.roomProgress ?? [];
    setRoomProgress(rp);

    const dbClues: DbTeamClue[] = data.clues ?? [];
    const resolved = dbClues.map((c) => getClue(c.clue_id)).filter((c): c is Clue => !!c);
    setTeamClues(resolved);

    if (seenClueCountRef.current === null) {
      seenClueCountRef.current = resolved.length;
    } else {
      setNewClueCount(Math.max(0, resolved.length - seenClueCountRef.current));
    }

    const myTp = (data.teamProgress ?? []).find(
      (tp: { team_id: string; offer_spent: number }) => tp.team_id === teamId
    );
    if (myTp) setOfferSpent(myTp.offer_spent ?? 0);

    const events: DbGameEvent[] = data.events ?? [];
    const isFirstLoad = seenEventIdsRef.current.size === 0;
    for (const ev of events) {
      if (!seenEventIdsRef.current.has(ev.id)) {
        seenEventIdsRef.current.add(ev.id);
        if (!isFirstLoad && ev.event_type === "offer_paid" && ev.team_id === teamId) {
          const amount = (ev.event_data?.amount as number) ?? 1;
          const msg = `🍺 Your team paid ${amount} Offer${amount !== 1 ? "s" : ""}`;
          const key = ++tollKeyRef.current;
          setTollBanners((prev) => [...prev, { msg, key }]);
          setTimeout(() => setTollBanners((prev) => prev.filter((b) => b.key !== key)), 4500);
        }
      }
    }

    // Physical challenge detection
    const nowMs = Date.now();
    const running: Record<string, string> = {};
    for (const ev of events) {
      if (ev.event_type === "physical_challenge_started" && ev.team_id === teamId) {
        const questId = ev.event_data?.quest_id as string | undefined;
        const startedAt = ev.event_data?.started_at as string | undefined;
        if (!questId || !startedAt) continue;
        const quest = getQuest(questId);
        const timerSec = quest?.physicalChallenge?.timerSeconds ?? 60;
        const elapsed = (nowMs - new Date(startedAt).getTime()) / 1000;
        if (elapsed < timerSec) running[questId] = startedAt;
      }
    }
    setActiveChallenges(running);

    const otherTeam = teamId === "team-a" ? "team-b" : "team-a";
    fetch(`/api/game/${gameId}/progress?teamId=${otherTeam}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        const done = (d.roomProgress ?? []).filter(
          (rp: { status: string }) => rp.status === "complete"
        ).length;
        setOtherRoomsCompleted(done);
      })
      .catch(() => {});
  }, [gameId, teamId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeGame(gameId ?? undefined, fetchData);

  // ── Scroll setup — runs once per act ──────────────────────────────────────
  useEffect(() => {
    if (!game || !gameId || !teamId) return;
    const actId = game.current_chapter_id;
    if (scrollSetupActRef.current === actId) return;  // already set up for this act
    scrollSetupActRef.current = actId;

    const el = mapScrollRef.current;
    if (!el) return;

    const storageKey = `tlcb_scroll_${gameId}_${teamId}_${actId}`;
    const savedScroll = sessionStorage.getItem(storageKey);

    if (savedScroll !== null) {
      // Return visit — restore scroll position immediately
      el.scrollTop = parseInt(savedScroll, 10);
    } else {
      // First visit to this act — play intro animation
      el.scrollTop = 0;
      let rafId: number;
      const timeoutId = setTimeout(() => {
        const endPos = el.scrollHeight - el.clientHeight;
        const startTime = performance.now();
        const duration = 850;
        const step = (now: number) => {
          const t = Math.min((now - startTime) / duration, 1);
          el.scrollTop = endPos * easeInCubic(t);
          if (t < 1) rafId = requestAnimationFrame(step);
          else sessionStorage.setItem(storageKey, String(el.scrollTop));
        };
        rafId = requestAnimationFrame(step);
      }, 1500);

      return () => { clearTimeout(timeoutId); cancelAnimationFrame(rafId); };
    }
  }, [game, gameId, teamId]);

  // Save scroll position on every scroll
  useEffect(() => {
    const el = mapScrollRef.current;
    if (!el || !game?.current_chapter_id || !gameId || !teamId) return;
    const actId = game.current_chapter_id;
    const storageKey = `tlcb_scroll_${gameId}_${teamId}_${actId}`;
    const onScroll = () => sessionStorage.setItem(storageKey, String(el.scrollTop));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [game?.current_chapter_id, gameId, teamId]);

  // ── Room helpers ─────────────────────────────────────────────────────────
  const canInteract = !session?.isHost;

  const getRoomStatus = (roomId: string): DbRoomProgress["status"] =>
    roomProgress.find((r) => r.room_id === roomId)?.status ?? "locked";

  const canUnlock = (roomId: string): boolean => {
    const room = getRoom(roomId);
    if (!room) return false;
    if (getRoomStatus(roomId) !== "locked") return false;
    return room.unlockRequires.every((req) => getRoomStatus(req) === "complete");
  };

  const handleNodeClick = (roomId: string) => {
    if (!canInteract) return;
    const status = getRoomStatus(roomId);
    if (["complete", "active", "unlocked", "occupied"].includes(status)) {
      router.push(`/game/${gameId}/team/${teamId}/room/${roomId}`);
    } else if (canUnlock(roomId)) {
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

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!game || !gameId || !teamId) return null;

  // ── Derived values ────────────────────────────────────────────────────────
  const chapter    = getChapter(game.current_chapter_id);
  const theme      = ACT_THEMES[game.current_chapter_id] ?? ACT_THEMES["act-1"];
  const geo        = ACT_GEO[game.current_chapter_id] ?? ACT_GEO["act-1"];
  const actFolder  = game.current_chapter_id.replace(/-/g, "");  // "act-1" → "act1"
  const teamName   = teamId === "team-a" ? game.team_a_name : game.team_b_name;
  const pendingRoom = pendingUnlock ? getRoom(pendingUnlock) : null;

  const sipMatch = game.offer_definition.trim().match(/^(\d+)/);
  const sipsPerOffer = sipMatch ? parseInt(sipMatch[1], 10) : 1;
  const totalSipsDrunk = offerSpent * sipsPerOffer;

  const roomIds = chapter?.roomIds ?? [];
  const mainRooms = roomIds.map((id) => getRoom(id)).filter(Boolean);
  const completedCount = mainRooms.filter((r) => getRoomStatus(r!.id) === "complete").length;
  const totalRooms = mainRooms.length;
  const boss = chapter ? getBoss(chapter.bossId) : null;
  const bossUnlockable = boss?.requiredRoomIds
    ? boss.requiredRoomIds.every((r) => getRoomStatus(r) === "complete")
    : completedCount >= Math.ceil(totalRooms * 0.8);

  // SVG scale math
  const { svgW, svgH, scale } = geo;
  const naturalHeightVW = (svgH / svgW * 100).toFixed(2);    // SVG height before scale
  const spacerVW = (scale * svgH / svgW * 100).toFixed(1);    // total scrollable height

  // Helper: get cx/cy for a node ID (including "boss")
  const getNodePos = (id: string): { cx: number; cy: number } | null => {
    if (id === "boss") return geo.bossNode;
    return geo.nodes.find((n) => n.id === id) ?? null;
  };

  // ── Path colour helper ────────────────────────────────────────────────────
  const pathColor = (fromId: string, toId: string) => {
    const fromSt = fromId === "boss" ? "complete" : getRoomStatus(fromId);
    const toSt   = toId   === "boss" ? "complete" : getRoomStatus(toId);
    const bothDone    = fromSt === "complete" && toSt === "complete";
    const anyActive   = fromSt !== "locked" || toSt !== "locked";
    return {
      // Thick road bed
      base:      bothDone  ? "rgba(30,90,10,0.85)"   : anyActive ? "rgba(80,52,8,0.80)"  : "rgba(28,20,6,0.45)",
      // Thin bright stripe on top
      stripe:    bothDone  ? "rgba(140,255,80,0.70)"  : anyActive ? "rgba(230,180,60,0.65)" : "rgba(90,65,20,0.30)",
      // Road width (SVG units) — will be pixel-magnified by scale
      roadW:     bothDone  ? 3.2 : anyActive ? 2.8 : 2.0,
      stripeW:   bothDone  ? 0.9 : anyActive ? 0.8 : 0.55,
      dashArray: bothDone  ? "3.5 2.2" : "2.8 2.2",
    };
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#080604" }}>

      {/* ══════════════════════════════════════════════════════════════════════
          SCROLLABLE MAP
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        ref={mapScrollRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: "none" } as React.CSSProperties}
      >
        {/* Spacer establishes scrollable height; SVG is absolutely inside it */}
        <div
          style={{
            height: `${spacerVW}vw`,
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{
              display: "block",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100vw",
              height: `${naturalHeightVW}vw`,
              transformOrigin: "top center",
              transform: `scale(${scale})`,
            }}
          >
            {/* ── Filters ── */}
            <defs>
              {/* Dark drop shadow — for text on dark map backgrounds (Act 2, 3) */}
              <filter id="tlcb-shadow" x="-25%" y="-25%" width="150%" height="150%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.98" />
              </filter>
              {/* Light halo — for dark text on the light Act 1 map */}
              <filter id="tlcb-shadow-light" x="-25%" y="-25%" width="150%" height="150%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.8" floodColor="#fff8e8" floodOpacity="0.85" />
              </filter>
              <filter id="tlcb-glow-green" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#50d080" floodOpacity="0.9" />
              </filter>
              <filter id="tlcb-glow-red" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#e03030" floodOpacity="0.85" />
              </filter>
              <filter id="tlcb-glow-amber" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#d4a832" floodOpacity="0.75" />
              </filter>
            </defs>

            {/* ── Map background ── */}
            <image
              href={`/map/${actFolder}/map.png`}
              x="0" y="0"
              width={svgW} height={svgH}
              preserveAspectRatio="xMidYMid slice"
            />

            {/* ── Act title ── */}
            <text
              x={svgW / 2} y={geo.titleCY - 7}
              textAnchor="middle"
              fontFamily="Georgia,serif"
              fontSize={13}
              fontWeight="bold"
              fill={theme.accent}
              letterSpacing={3}
              filter="url(#tlcb-shadow)"
              opacity={0.96}
            >
              {theme.label}
            </text>
            <text
              x={svgW / 2} y={geo.titleCY + 4}
              textAnchor="middle"
              fontFamily="Georgia,serif"
              fontSize={6}
              fill={theme.accent}
              letterSpacing={5}
              filter="url(#tlcb-shadow)"
              opacity={0.55}
            >
              {theme.subtitle}
            </text>
            {/* Decorative rule */}
            <line
              x1={svgW / 2 - 55} y1={geo.titleCY + 1}
              x2={svgW / 2 - 22} y2={geo.titleCY + 1}
              stroke={theme.accent} strokeWidth={0.5} opacity={0.3}
            />
            <line
              x1={svgW / 2 + 22} y1={geo.titleCY + 1}
              x2={svgW / 2 + 55} y2={geo.titleCY + 1}
              stroke={theme.accent} strokeWidth={0.5} opacity={0.3}
            />

            {/* ── Path lines between nodes ── */}
            {geo.paths.map(([fromId, toId], i) => {
              const from = getNodePos(fromId);
              const to   = getNodePos(toId);
              if (!from || !to) return null;
              const col = pathColor(fromId, toId);
              return (
                <g key={i}>
                  {/* Shadow/outline under road for depth */}
                  <line
                    x1={from.cx} y1={from.cy}
                    x2={to.cx}   y2={to.cy}
                    stroke="rgba(0,0,0,0.55)"
                    strokeWidth={col.roadW + 1.4}
                    strokeLinecap="round"
                  />
                  {/* Base road bed */}
                  <line
                    x1={from.cx} y1={from.cy}
                    x2={to.cx}   y2={to.cy}
                    stroke={col.base}
                    strokeWidth={col.roadW}
                    strokeLinecap="round"
                  />
                  {/* Dashed stripe overlay */}
                  <line
                    x1={from.cx} y1={from.cy}
                    x2={to.cx}   y2={to.cy}
                    stroke={col.stripe}
                    strokeWidth={col.stripeW}
                    strokeDasharray={col.dashArray}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

            {/* ── Boss node ── */}
            {(() => {
              const { cx, cy } = geo.bossNode;
              const bossImg = bossUnlockable
                ? `/ui/${actFolder}/node-active.png`
                : `/ui/${actFolder}/node-locked.png`;
              return (
                <g
                  onClick={() => {
                    if (canInteract && chapter) {
                      router.push(`/game/${gameId}/boss/${chapter.bossId}?team=${teamId}`);
                    }
                  }}
                  style={{ cursor: canInteract && bossUnlockable ? "pointer" : "default" }}
                >
                  {/* Pulse ring when unlockable */}
                  {bossUnlockable && (
                    <circle cx={cx} cy={cy} r={18} fill="none" stroke="#e03020" strokeWidth={1.5} opacity={0.7}>
                      <animate attributeName="r"       values="18;30;18" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Boss NodeBlob */}
                  <image
                    href={bossImg}
                    x={cx - 16} y={cy - 16}
                    width={32} height={32}
                    opacity={bossUnlockable ? 1 : 0.45}
                    style={bossUnlockable
                      ? { filter: "drop-shadow(0 0 8px rgba(220,40,40,0.9)) hue-rotate(310deg) saturate(2)" }
                      : {}}
                  />
                  {/* Boss label */}
                  <text
                    x={cx} y={cy + 24}
                    textAnchor="middle"
                    fontFamily="Georgia,serif"
                    fontSize={6.5}
                    fill={bossUnlockable ? "#fca5a5" : "rgba(180,100,100,0.45)"}
                    letterSpacing={1.5}
                    filter="url(#tlcb-shadow)"
                    opacity={0.95}
                  >
                    {(boss?.title ?? "BOSS").toUpperCase()}
                  </text>
                </g>
              );
            })()}

            {/* ── Room NodeBlobs ── */}
            {geo.nodes.map(({ id, cx, cy, sz, isOptional }) => {
              const status     = getRoomStatus(id);
              const unlockable = canUnlock(id);
              const isDone     = status === "complete";
              const isLocked   = status === "locked" && !unlockable;
              const isActive   = !isDone && !isLocked;
              const nodeState  = isDone ? "completed" : isLocked ? "locked" : "active";
              const clickable  = canInteract && !isLocked;
              const room       = getRoom(id);
              const opacity    = isLocked ? 0.3 : 1;

              // Only show nodes that are in this chapter's room list
              if (chapter && !chapter.roomIds.includes(id)) return null;

              return (
                <g
                  key={id}
                  onClick={() => { if (clickable) handleNodeClick(id); }}
                  style={{ cursor: clickable ? "pointer" : "default" }}
                  opacity={opacity}
                >
                  {/* Hit-area circle (larger than image) */}
                  <circle cx={cx} cy={cy} r={sz + 8} fill="transparent" />

                  {/* Pulsing ring — unlockable rooms */}
                  {unlockable && (
                    <circle cx={cx} cy={cy} r={sz + 3} fill="none" stroke="#50d080" strokeWidth={1.5} opacity={0}>
                      <animate attributeName="r"       values={`${sz+3};${sz+18};${sz+3}`} dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.85;0;0.85" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Gentle ambient ring — active (entered) rooms */}
                  {isActive && !unlockable && !isDone && (
                    <circle cx={cx} cy={cy} r={sz + 2} fill="none" stroke={theme.accent} strokeWidth={1} opacity={0}>
                      <animate attributeName="r"       values={`${sz+2};${sz+12};${sz+2}`} dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* NodeBlob image — SVG <image> handles PNG alpha correctly */}
                  <image
                    href={`/ui/${actFolder}/node-${nodeState}.png`}
                    x={cx - sz} y={cy - sz}
                    width={sz * 2} height={sz * 2}
                    style={{
                      filter: unlockable
                        ? "url(#tlcb-glow-green) drop-shadow(0 2px 5px rgba(0,0,0,0.85))"
                        : "drop-shadow(0 2px 5px rgba(0,0,0,0.85))",
                    }}
                  />

                  {/* Optional star badge */}
                  {isOptional && !isDone && (
                    <text
                      x={cx + sz - 1} y={cy - sz + 7}
                      textAnchor="middle"
                      fontSize={7}
                      fill="#a8e8c0"
                      fontFamily="Georgia,serif"
                      opacity={0.7}
                    >★</text>
                  )}

                  {/* Room name label */}
                  <text
                    x={cx} y={cy + sz + 9}
                    textAnchor="middle"
                    fontFamily="Georgia,serif"
                    fontSize={5.8}
                    fill={
                      isDone      ? (theme.darkLabels ? "#2a6400" : "#7ae050") :
                      unlockable  ? (theme.darkLabels ? "#1a5800" : "#90ee90") :
                      isLocked    ? (theme.darkLabels ? "rgba(90,60,20,0.55)" : "rgba(140,110,60,0.5)") :
                      theme.darkLabels ? "#5c3200" : theme.accent
                    }
                    filter={theme.darkLabels ? "url(#tlcb-shadow-light)" : "url(#tlcb-shadow)"}
                    opacity={0.97}
                    letterSpacing={0.4}
                  >
                    {(room?.title ?? id).toUpperCase()}
                  </text>

                  {/* Sub-label: status */}
                  {isDone && (
                    <text x={cx} y={cy + sz + 17} textAnchor="middle" fontFamily="Georgia,serif" fontSize={4.5}
                      fill={theme.darkLabels ? "#2a6400" : "#6ae840"}
                      filter={theme.darkLabels ? "url(#tlcb-shadow-light)" : "url(#tlcb-shadow)"}
                      opacity={0.85}>
                      ✓ Done
                    </text>
                  )}
                  {unlockable && !isDone && (
                    <text x={cx} y={cy + sz + 17} textAnchor="middle" fontFamily="Georgia,serif" fontSize={4.5}
                      fill={theme.darkLabels ? "#1a5800" : "#50d080"}
                      filter={theme.darkLabels ? "url(#tlcb-shadow-light)" : "url(#tlcb-shadow)"}
                      opacity={0.9}>
                      {room && room.unlockCost > 0 ? `Unlock (${room.unlockCost} Offer)` : "Tap to unlock"}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TOP HUD — fixed overlay
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute top-0 left-0 right-0 z-20 px-4 py-3 flex items-center gap-2 pointer-events-none"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
          background: "linear-gradient(180deg, rgba(8,6,4,0.97) 0%, rgba(8,6,4,0.0) 100%)",
        }}
      >
        {/* Team name + act label — pointer-events-none on parent, re-enable on children */}
        <div className="flex-1 min-w-0 pointer-events-auto">
          <div className="text-[9px] uppercase tracking-[0.3em] mb-0.5" style={{ color: theme.accent, fontFamily: "Georgia,serif", opacity: 0.6 }}>
            {theme.emoji} {theme.label}
          </div>
          <div className="font-bold text-lg leading-tight truncate" style={{ color: "rgba(245,225,170,0.97)", fontFamily: "Georgia,serif" }}>
            {teamName}
          </div>
        </div>

        {/* VS progress pill */}
        <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] pointer-events-auto"
          style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(180,130,50,0.22)", fontFamily: "Georgia,serif" }}>
          <span style={{ color: bossUnlockable ? "rgb(248,113,113)" : theme.accent }}>
            {completedCount}/{totalRooms}
          </span>
          <span style={{ color: "rgba(120,80,30,0.5)", margin: "0 2px" }}>vs</span>
          <span style={{ color: "rgba(180,160,100,0.55)" }}>{otherRoomsCompleted ?? "·"}/{totalRooms}</span>
        </div>

        {/* Sips counter */}
        {totalSipsDrunk > 0 && (
          <div className="flex items-center gap-1 h-8 px-2.5 rounded-full pointer-events-auto"
            style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(180,130,50,0.18)", fontFamily: "Georgia,serif" }}>
            <span style={{ fontSize: "12px" }}>🍺</span>
            <span className="text-[11px] font-bold" style={{ color: "rgba(180,130,50,0.75)" }}>{totalSipsDrunk}</span>
          </div>
        )}

        {/* Case File */}
        <button
          onClick={() => { setShowCaseFile(true); seenClueCountRef.current = teamClues.length; setNewClueCount(0); }}
          className={`flex items-center gap-1.5 h-8 px-2.5 rounded-full active:scale-95 transition-transform relative pointer-events-auto ${newClueCount > 0 ? "animate-pulse-glow" : ""}`}
          style={{
            background: newClueCount > 0 ? "rgba(120,80,10,0.7)" : "rgba(0,0,0,0.55)",
            border: `1px solid ${newClueCount > 0 ? "rgba(251,191,36,0.55)" : "rgba(180,130,50,0.2)"}`,
            color: teamClues.length > 0 ? "rgba(251,191,36,0.9)" : "rgba(120,90,30,0.4)",
            fontSize: "13px",
          }}
        >
          🗂
          {teamClues.length > 0 && (
            <span className="text-[10px] font-bold" style={{ color: newClueCount > 0 ? "rgba(255,220,80,0.95)" : "rgba(251,191,36,0.75)", fontFamily: "Georgia,serif" }}>
              {teamClues.length}
            </span>
          )}
          {newClueCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black"
              style={{ background: "rgb(251,191,36)", color: "#1a0e00" }}>
              {newClueCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => setShowPanel(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full active:scale-95 transition-transform pointer-events-auto"
          style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(180,130,50,0.2)", color: "rgba(180,130,50,0.7)", fontSize: "14px" }}
        >
          ⚙
        </button>
      </div>

      {/* ── Toast message ── */}
      {message && (
        <div className="fixed left-4 right-4 z-50 rounded-lg px-4 py-2 text-sm"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 72px)", background: "rgba(20,14,6,0.95)", border: "1px solid rgba(180,130,50,0.35)", color: "rgb(251,191,36)", fontFamily: "Georgia,serif" }}>
          ✦ {message}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          BOSS STRIP — fixed bottom
      ══════════════════════════════════════════════════════════════════════ */}
      {chapter && (
        <div className="fixed bottom-0 left-0 right-0 z-20"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)", background: "linear-gradient(180deg, transparent 0%, rgba(6,2,2,0.98) 38%)" }}>
          <div className="px-4 pt-3 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: "radial-gradient(circle, #3f0808 0%, #1a0303 100%)",
                  border: `1px solid rgba(180,40,40,${bossUnlockable ? 0.65 : 0.3})`,
                  boxShadow: bossUnlockable ? "0 0 14px rgba(180,40,40,0.35)" : "none",
                }}>
                {bossUnlockable ? "☠️" : "🔒"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: "rgb(254,202,202)", fontFamily: "Georgia,serif" }}>
                  {(boss?.title ?? chapter.bossId).toUpperCase()}
                </div>
                <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(40,10,10,0.9)", border: "1px solid rgba(100,30,30,0.3)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(completedCount / Math.max(totalRooms, 1)) * 100}%`, background: bossUnlockable ? "linear-gradient(90deg, #dc2626, #ef4444)" : "linear-gradient(90deg, #7f1d1d, #b91c1c)" }} />
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: "rgba(180,80,80,0.6)", fontFamily: "Georgia,serif" }}>
                  {completedCount}/{totalRooms} rooms cleared
                </div>
              </div>
              {canInteract && (
                <a href={`/game/${gameId}/boss/${chapter.bossId}?team=${teamId}`}
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
                    color: "rgba(180,80,80,0.32)",
                    cursor: "not-allowed",
                    fontFamily: "Georgia,serif",
                  }}
                  onClick={!bossUnlockable ? (e) => e.preventDefault() : undefined}>
                  {bossUnlockable ? "⚔️ Fight" : "🔒"}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Physical challenge banners ── */}
      {Object.entries(activeChallenges).map(([questId, startedAt]) => (
        <PhysicalChallengeBanner key={questId} questId={questId} startedAt={startedAt} />
      ))}

      {/* ── Toll banners ── */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex flex-col gap-1" style={{ paddingTop: "env(safe-area-inset-top,0px)" }}>
        {tollBanners.map((b) => (
          <div key={b.key} className="animate-banner-drop mx-3 mt-2 rounded-xl px-4 py-3 flex items-center gap-3 pointer-events-auto"
            style={{ background: "rgba(120,60,0,0.95)", border: "1px solid rgba(251,146,60,0.5)", backdropFilter: "blur(8px)" }}>
            <span className="text-xl flex-shrink-0">🍺</span>
            <span className="text-sm font-bold" style={{ color: "rgb(254,215,170)", fontFamily: "Georgia,serif" }}>{b.msg}</span>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          UNLOCK MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {pendingUnlock && pendingRoom && (
        <div className="fixed inset-0 flex items-center justify-center p-6 z-40"
          style={{ background: "rgba(12,26,44,0.85)", backdropFilter: "blur(5px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setPendingUnlock(null); }}>
          <div className="w-full max-w-xs rounded-xl border p-5 shadow-2xl"
            style={{ background: pendingRoom.isSecret ? "#0e2030" : "#1c1208", borderColor: pendingRoom.isSecret ? "#3ab8c8" : "#b8860b" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{pendingRoom.look.icon}</span>
              <div>
                <div className="text-xs uppercase tracking-widest font-bold mb-0.5" style={{ color: pendingRoom.isSecret ? "#3ab8c8" : "#c8a040", fontFamily: "Georgia,serif" }}>
                  {pendingRoom.isSecret ? "★ Secret" : "Unlock Room"}
                </div>
                <div className="font-bold text-white" style={{ fontFamily: "Georgia,serif" }}>{pendingRoom.title}</div>
              </div>
            </div>
            <p className="text-xs text-stone-400 mb-4 leading-relaxed" style={{ fontFamily: "Georgia,serif" }}>
              {pendingRoom.lockedDescription}
            </p>
            <div className="flex gap-2">
              <button onClick={handleUnlock} disabled={unlocking}
                className="flex-1 font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                style={{ background: pendingRoom.isSecret ? "#1a5a6a" : "#92610a", color: pendingRoom.isSecret ? "#a0f0ff" : "#fff8e8" }}>
                {unlocking ? "Unlocking…" : pendingRoom.unlockCost > 0 ? `🍺 Unlock (${pendingRoom.unlockCost} Offer)` : "🔓 Unlock (free)"}
              </button>
              <button onClick={() => setPendingUnlock(null)} className="px-4 py-2 bg-stone-800 text-stone-300 rounded-lg text-sm">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CONTROL PANEL
      ══════════════════════════════════════════════════════════════════════ */}
      {showPanel && (
        <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)" }} onClick={() => setShowPanel(false)}>
          <div className="absolute bottom-0 left-0 right-0 animate-sheet-up rounded-t-2xl"
            style={{ background: "rgba(10,8,6,0.98)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(180,130,50,0.22)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-2.5 pb-1"><div className="w-8 h-[3px] rounded-full" style={{ background: "rgba(180,130,50,0.22)" }} /></div>
            <div className="px-4 pb-6 pt-1">
              <div className="text-[9px] uppercase tracking-[0.25em] mb-4" style={{ color: "rgba(180,130,50,0.35)", fontFamily: "Georgia,serif" }}>Control Panel</div>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {(["team-a", "team-b"] as TeamId[]).map((tid) => (
                  <div key={tid} className="rounded-xl p-3"
                    style={{ background: tid === teamId ? "rgba(120,80,10,0.25)" : "rgba(255,255,255,0.03)", border: `1px solid ${tid === teamId ? "rgba(180,130,50,0.35)" : "rgba(255,255,255,0.06)"}` }}>
                    <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(180,130,50,0.4)", fontFamily: "Georgia,serif" }}>{tid === teamId ? "Your Team" : "Opponents"}</div>
                    <div className="font-bold text-sm truncate" style={{ color: "rgba(245,225,170,0.9)", fontFamily: "Georgia,serif" }}>
                      {tid === "team-a" ? game.team_a_name : game.team_b_name}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: "rgba(180,130,50,0.6)", fontFamily: "Georgia,serif" }}>
                      {tid === teamId ? completedCount : (otherRoomsCompleted ?? "·")}/{totalRooms} rooms
                    </div>
                  </div>
                ))}
              </div>
              {chapter && (
                <a href={`/game/${gameId}/boss/${chapter.bossId}?team=${teamId}`}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: bossUnlockable ? "rgba(100,20,20,0.35)" : "rgba(255,255,255,0.03)", border: `1px solid ${bossUnlockable ? "rgba(220,60,60,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                  <span className="text-xl">{bossUnlockable ? "⚔️" : "🔒"}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: bossUnlockable ? "rgb(252,165,165)" : "rgba(120,80,40,0.6)", fontFamily: "Georgia,serif" }}>
                      {boss?.title ?? chapter.bossId}
                    </div>
                    <div className="text-xs" style={{ color: bossUnlockable ? "rgba(220,100,100,0.6)" : "rgba(100,60,20,0.4)", fontFamily: "Georgia,serif" }}>
                      {bossUnlockable ? "Ready for battle" : `${completedCount}/${totalRooms} rooms to unlock`}
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CASE FILE DRAWER
      ══════════════════════════════════════════════════════════════════════ */}
      {showCaseFile && (
        <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
          onClick={() => { setShowCaseFile(false); setSelectedClue(null); }}>
          {selectedClue ? (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-2xl p-5 animate-quest-fade"
              style={{ background: "rgba(14,10,4,0.98)", border: "1px solid rgba(180,130,50,0.35)", backdropFilter: "blur(20px)" }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedClue.icon}</span>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.25em] mb-0.5" style={{ color: "rgba(180,130,50,0.4)", fontFamily: "Georgia,serif" }}>
                      {selectedClue.isArtifact ? "Artifact" : selectedClue.isKeyClue ? "Key Clue" : "Clue"}
                    </div>
                    <div className="font-bold text-base" style={{ color: "rgba(245,225,170,0.97)", fontFamily: "Georgia,serif" }}>{selectedClue.title}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedClue(null)} className="text-lg leading-none" style={{ color: "rgba(180,130,50,0.4)" }}>✕</button>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(220,200,155,0.85)", fontFamily: "Georgia,serif" }}>{selectedClue.description}</p>
              <p className="text-xs italic" style={{ color: "rgba(140,100,40,0.6)", fontFamily: "Georgia,serif" }}>{selectedClue.flavor}</p>
            </div>
          ) : (
            <div className="absolute bottom-0 left-0 right-0 animate-sheet-up rounded-t-2xl"
              style={{ background: "rgba(10,8,4,0.98)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(180,130,50,0.22)", paddingBottom: "env(safe-area-inset-bottom, 0px)", maxHeight: "75vh", overflowY: "auto" }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-center pt-2.5 pb-1"><div className="w-8 h-[3px] rounded-full" style={{ background: "rgba(180,130,50,0.22)" }} /></div>
              <div className="px-4 pb-8 pt-1">
                <div className="text-[9px] uppercase tracking-[0.25em] mb-4" style={{ color: "rgba(180,130,50,0.35)", fontFamily: "Georgia,serif" }}>Case File — {teamClues.length} clue{teamClues.length !== 1 ? "s" : ""}</div>
                {teamClues.length === 0 ? (
                  <div className="text-center py-8" style={{ color: "rgba(120,90,40,0.5)", fontFamily: "Georgia,serif", fontSize: "13px" }}>
                    <div className="text-3xl mb-3">🗂</div>
                    No clues found yet. Explore rooms to uncover evidence.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teamClues.map((clue) => (
                      <button key={clue.id} onClick={() => setSelectedClue(clue)}
                        className="w-full text-left rounded-xl px-3 py-3 active:scale-[0.98] transition-transform"
                        style={{ background: clue.isArtifact ? "rgba(30,20,60,0.4)" : clue.isKeyClue ? "rgba(80,55,10,0.3)" : "rgba(255,255,255,0.04)", border: `1px solid ${clue.isArtifact ? "rgba(160,120,255,0.3)" : clue.isKeyClue ? "rgba(220,160,40,0.35)" : "rgba(180,130,50,0.12)"}` }}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl flex-shrink-0">{clue.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold truncate" style={{ color: "rgba(245,225,170,0.92)", fontFamily: "Georgia,serif" }}>{clue.title}</span>
                              {clue.isArtifact && <span className="text-[9px] uppercase tracking-widest flex-shrink-0" style={{ color: "rgba(160,120,255,0.6)", fontFamily: "Georgia,serif" }}>Artifact</span>}
                              {clue.isKeyClue && !clue.isArtifact && <span className="text-[9px] uppercase tracking-widest flex-shrink-0" style={{ color: "rgba(251,191,36,0.6)", fontFamily: "Georgia,serif" }}>Key</span>}
                            </div>
                            <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(160,120,60,0.6)", fontFamily: "Georgia,serif" }}>{clue.flavor}</p>
                          </div>
                          <span className="text-xs flex-shrink-0" style={{ color: "rgba(120,90,30,0.4)" }}>›</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Physical challenge countdown banner ────────────────────────────────────
function PhysicalChallengeBanner({ questId, startedAt }: { questId: string; startedAt: string }) {
  const quest = getQuest(questId);
  const config = quest?.physicalChallenge;
  const [secondsLeft, setSecondsLeft] = useState(config?.timerSeconds ?? 60);

  useEffect(() => {
    const tick = () => {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      setSecondsLeft(Math.max(0, Math.ceil((config?.timerSeconds ?? 60) - elapsed)));
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [startedAt, config?.timerSeconds]);

  if (!config) return null;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${mins > 0 ? `${mins}:` : ""}${String(secs).padStart(2, "0")}`;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-banner-drop" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-3 mt-2 rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ background: "rgba(60,40,4,0.97)", border: "1px solid rgba(251,191,36,0.45)", backdropFilter: "blur(10px)" }}>
        <span className="text-2xl flex-shrink-0">{config.activeEmoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate" style={{ color: "rgb(251,191,36)", fontFamily: "Georgia,serif" }}>{config.bannerText}</div>
          <div className="text-[10px] mt-0.5" style={{ color: "rgba(200,160,60,0.6)", fontFamily: "Georgia,serif" }}>{quest?.title}</div>
        </div>
        <div className="text-2xl font-black tabular-nums flex-shrink-0"
          style={{ color: secondsLeft <= 10 ? "rgb(255,100,60)" : "rgb(251,191,36)", fontFamily: "Georgia,serif" }}>
          {timeStr}
        </div>
      </div>
    </div>
  );
}
