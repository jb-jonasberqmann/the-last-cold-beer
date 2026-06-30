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

const ACT_THEMES: Record<string, { bg: string; accent: string; label: string; emoji: string }> = {
  "act-1": { bg: "from-amber-950/80 to-stone-950",  accent: "#d4a832", label: "The Arrival",    emoji: "🌅" },
  "act-2": { bg: "from-indigo-950/60 to-stone-950", accent: "#8ab4f8", label: "Settling In",    emoji: "🏠" },
  "act-3": { bg: "from-slate-950/90 to-stone-950",  accent: "#f87171", label: "The Late Night", emoji: "🌑" },
};

// Node positions as percentage of map image (x=left%, y=top%)
const NODE_POSITIONS: Record<string, Record<string, { x: number; y: number }>> = {
  "act-1": {
    "driveway":       { x: 40, y: 20 },
    "carport":        { x: 66, y: 12 },
    "terrace":        { x: 73, y: 33 },
    "garden":         { x: 39, y: 42 },
    "shed":           { x: 20, y: 57 },
    "petanque-court": { x: 68, y: 54 },
    "front-door":     { x: 46, y: 71 },
  },
  "act-2": {
    "double-room":  { x: 20, y: 17 },
    "single-room":  { x: 50, y: 14 },
    "bunk-room":    { x: 78, y: 17 },
    "bathroom":     { x: 50, y: 31 },
    "living-room":  { x: 44, y: 48 },
    "sunroom":      { x: 16, y: 62 },
    "kitchen-act2": { x: 74, y: 61 },
    "dining-room":  { x: 44, y: 75 },
  },
  "act-3": {
    "dining-room-dark":  { x: 48, y: 10 },
    "utility-corner":    { x: 48, y: 22 },
    "back-corridor":     { x: 48, y: 37 },
    "fuse-box":          { x: 77, y: 49 },
    "door-nobody-tried": { x: 19, y: 49 },
    "behind-the-shed":   { x: 48, y: 49 },
    "kitchen-dark":      { x: 79, y: 60 },
    "rattling-window":   { x: 79, y: 70 },
    "sealed-wall":       { x: 13, y: 63 },
    "conservatory":      { x: 34, y: 64 },
    "shed-dark":         { x: 63, y: 64 },
    "revelation-circle": { x: 48, y: 79 },
  },
};

// Path connections between nodes [fromRoomId, toRoomId]
const NODE_PATHS: Record<string, [string, string][]> = {
  "act-1": [
    ["driveway", "carport"],
    ["driveway", "terrace"],
    ["driveway", "garden"],
    ["terrace", "carport"],
    ["garden", "carport"],
    ["garden", "shed"],
    ["garden", "petanque-court"],
    ["shed", "front-door"],
    ["carport", "front-door"],
  ],
  "act-2": [
    ["double-room", "bathroom"],
    ["single-room", "bathroom"],
    ["bunk-room", "bathroom"],
    ["double-room", "living-room"],
    ["single-room", "living-room"],
    ["bunk-room", "living-room"],
    ["living-room", "sunroom"],
    ["living-room", "kitchen-act2"],
    ["kitchen-act2", "dining-room"],
  ],
  "act-3": [
    ["dining-room-dark", "utility-corner"],
    ["utility-corner", "back-corridor"],
    ["back-corridor", "fuse-box"],
    ["back-corridor", "door-nobody-tried"],
    ["back-corridor", "behind-the-shed"],
    ["fuse-box", "kitchen-dark"],
    ["kitchen-dark", "rattling-window"],
    ["door-nobody-tried", "sealed-wall"],
    ["behind-the-shed", "conservatory"],
    ["behind-the-shed", "shed-dark"],
    ["shed-dark", "revelation-circle"],
    ["door-nobody-tried", "revelation-circle"],
  ],
};

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

    // Act-transition redirect: if game.current_chapter_id changed, check if we should push to new chapter
    // (handled naturally — page reads game.current_chapter_id and shows correct act)

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

  const canInteract = !session?.isHost;

  const getRoomStatus = (roomId: string): DbRoomProgress["status"] =>
    roomProgress.find((r) => r.room_id === roomId)?.status ?? "locked";

  const getRoomOccupant = (roomId: string): string | null =>
    roomProgress.find((r) => r.room_id === roomId)?.occupant_player_id ?? null;

  const canUnlock = (roomId: string): boolean => {
    const room = getRoom(roomId);
    if (!room) return false;
    const status = getRoomStatus(roomId);
    if (status !== "locked") return false;
    return room.unlockRequires.every((req) => getRoomStatus(req) === "complete");
  };

  const handleNodeClick = (roomId: string) => {
    if (!canInteract) return;
    const status = getRoomStatus(roomId);
    if (status === "complete" || status === "active" || status === "unlocked" || status === "occupied") {
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

  if (!game || !gameId || !teamId) return null;

  const chapter = getChapter(game.current_chapter_id);
  const theme = ACT_THEMES[game.current_chapter_id] ?? ACT_THEMES["act-1"];
  const teamName = teamId === "team-a" ? game.team_a_name : game.team_b_name;
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

  return (
    <div className="min-h-screen" style={{ background: "#080604" }}>
      {/* ── Top HUD ── */}
      <div
        className="sticky top-0 z-20 px-4 py-3 flex items-center gap-2"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
          background: "linear-gradient(180deg, rgba(8,6,4,0.98) 0%, rgba(8,6,4,0.92) 100%)",
          borderBottom: "1px solid rgba(180,130,50,0.12)",
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[9px] uppercase tracking-[0.3em] mb-0.5" style={{ color: theme.accent, fontFamily: "Georgia,serif", opacity: 0.6 }}>
            {theme.emoji} {theme.label}
          </div>
          <div className="font-bold text-lg leading-tight truncate" style={{ color: "rgba(245,225,170,0.97)", fontFamily: "Georgia,serif" }}>
            {teamName}
          </div>
        </div>

        {/* VS pill */}
        <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(180,130,50,0.2)", fontFamily: "Georgia,serif" }}>
          <span style={{ color: bossUnlockable ? "rgb(248,113,113)" : theme.accent }}>
            {completedCount}/{totalRooms}
          </span>
          <span style={{ color: "rgba(120,80,30,0.5)", margin: "0 2px" }}>vs</span>
          <span style={{ color: "rgba(180,160,100,0.6)" }}>{otherRoomsCompleted ?? "·"}/{totalRooms}</span>
        </div>

        {/* Sips */}
        {totalSipsDrunk > 0 && (
          <div className="flex items-center gap-1 h-8 px-2.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(180,130,50,0.15)", fontFamily: "Georgia,serif" }}>
            <span style={{ fontSize: "12px" }}>🍺</span>
            <span className="text-[11px] font-bold" style={{ color: "rgba(180,130,50,0.75)" }}>{totalSipsDrunk}</span>
          </div>
        )}

        {/* Case File */}
        <button
          onClick={() => { setShowCaseFile(true); seenClueCountRef.current = teamClues.length; setNewClueCount(0); }}
          className={`flex items-center gap-1.5 h-8 px-2.5 rounded-full active:scale-95 transition-transform relative ${newClueCount > 0 ? "animate-pulse-glow" : ""}`}
          style={{
            background: newClueCount > 0 ? "rgba(120,80,10,0.6)" : "rgba(0,0,0,0.45)",
            border: `1px solid ${newClueCount > 0 ? "rgba(251,191,36,0.55)" : "rgba(180,130,50,0.2)"}`,
            color: teamClues.length > 0 ? "rgba(251,191,36,0.9)" : "rgba(120,90,30,0.45)",
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

        <button onClick={() => setShowPanel(true)} className="w-8 h-8 flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(180,130,50,0.2)", color: "rgba(180,130,50,0.7)", fontSize: "14px" }}>
          ⚙
        </button>
      </div>

      {/* ── Toast ── */}
      {message && (
        <div className="fixed left-4 right-4 z-50 rounded-lg px-4 py-2 text-sm"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 72px)", background: "rgba(20,14,6,0.95)", border: "1px solid rgba(180,130,50,0.35)", color: "rgb(251,191,36)", fontFamily: "Georgia,serif" }}>
          ✦ {message}
        </div>
      )}

      {/* ── Map Quest Board ── */}
      {(() => {
        const actFolder = game.current_chapter_id.replace(/-/g, ""); // "act-1" → "act1"
        const actKey = game.current_chapter_id;
        const positions = NODE_POSITIONS[actKey] ?? {};
        const paths = NODE_PATHS[actKey] ?? [];

        return (
          <div className="relative w-full" style={{ paddingBottom: "88px" }}>
            {/* Map image container — maintains 768:1376 ratio */}
            <div className="relative w-full" style={{ aspectRatio: "768 / 1376" }}>
              {/* Background map */}
              <img
                src={`/map/${actFolder}/map.png`}
                alt="Quest Map"
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: "fill" }}
                draggable={false}
              />

              {/* SVG path overlay — uses same 0-100 percentage coordinate space */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {paths.map(([fromId, toId], i) => {
                  const from = positions[fromId];
                  const to = positions[toId];
                  if (!from || !to) return null;
                  const fromStatus = getRoomStatus(fromId);
                  const toStatus = getRoomStatus(toId);
                  const bothDone = fromStatus === "complete" && toStatus === "complete";
                  const eitherUnlocked = fromStatus !== "locked" || toStatus !== "locked";
                  return (
                    <g key={i}>
                      {/* Road base */}
                      <line
                        x1={from.x} y1={from.y}
                        x2={to.x} y2={to.y}
                        stroke={bothDone ? "rgba(60,130,30,0.5)" : eitherUnlocked ? "rgba(100,70,15,0.55)" : "rgba(50,35,10,0.35)"}
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      {/* Dashed stripe on top */}
                      <line
                        x1={from.x} y1={from.y}
                        x2={to.x} y2={to.y}
                        stroke={bothDone ? "rgba(120,220,60,0.55)" : eitherUnlocked ? "rgba(210,165,60,0.5)" : "rgba(100,75,25,0.3)"}
                        strokeWidth="0.55"
                        strokeDasharray="2.5 2"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* NodeBlob buttons */}
              {mainRooms.map((room) => {
                if (!room) return null;
                const pos = positions[room.id];
                if (!pos) return null;
                const status = getRoomStatus(room.id);
                const unlockable = canUnlock(room.id);
                const isLocked = status === "locked" && !unlockable;
                const isDone = status === "complete";
                const nodeState = isDone ? "completed" : isLocked ? "locked" : "active";
                const nodeImg = `/ui/${actFolder}/node-${nodeState}.png`;

                return (
                  <button
                    key={room.id}
                    onClick={() => handleNodeClick(room.id)}
                    disabled={!canInteract || (status === "locked" && !unlockable)}
                    className="absolute disabled:opacity-25 transition-transform active:scale-90"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: "translate(-50%, -50%)",
                      width: "16%",
                    }}
                  >
                    <img
                      src={nodeImg}
                      alt={room.title}
                      className="w-full h-auto"
                      style={{
                        filter: unlockable
                          ? "drop-shadow(0 0 5px rgba(80,200,80,0.85))"
                          : isDone
                          ? "drop-shadow(0 1px 3px rgba(0,0,0,0.7))"
                          : isLocked
                          ? "grayscale(0.3) brightness(0.7)"
                          : "drop-shadow(0 1px 4px rgba(0,0,0,0.6))",
                      }}
                    />
                    {/* Label */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-22%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "180%",
                        textAlign: "center",
                        fontSize: "clamp(7px, 2.2vw, 10px)",
                        fontFamily: "Georgia, serif",
                        color: isDone
                          ? "rgba(140,220,80,0.95)"
                          : unlockable
                          ? "rgba(120,230,120,0.95)"
                          : isLocked
                          ? "rgba(140,110,60,0.55)"
                          : "rgba(240,215,145,0.9)",
                        textShadow: "0 1px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)",
                        lineHeight: 1.15,
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {room.title}
                      {room.isOptional && !isDone && (
                        <span style={{ opacity: 0.5 }}> ✦</span>
                      )}
                    </div>

                    {/* Unlockable glow ring */}
                    {unlockable && (
                      <div
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: "rgba(80,200,80,0.15)", animationDuration: "1.5s" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Boss strip (fixed bottom) ── */}
      {chapter && (
        <div className="fixed bottom-0 left-0 right-0 z-20"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)", background: "linear-gradient(180deg, transparent 0%, rgba(6,2,2,0.98) 35%)" }}>
          <div className="px-4 pt-3 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: "radial-gradient(circle, #3f0808 0%, #1a0303 100%)",
                  border: `1px solid rgba(180,40,40,${bossUnlockable ? 0.6 : 0.3})`,
                  boxShadow: bossUnlockable ? "0 0 12px rgba(180,40,40,0.3)" : "none",
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
                    color: "rgba(180,80,80,0.35)",
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

      {/* ── Unlock modal ── */}
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

      {/* ── Control panel overlay ── */}
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

      {/* ── Case File drawer ── */}
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
