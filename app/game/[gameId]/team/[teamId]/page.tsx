"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { unlockRoom, markCluesRead as markCluesReadAction } from "@/lib/game/actions";
import type { DbGame, DbRoomProgress, DbGameEvent, DbTeamClue } from "@/types/database";
import type { TeamId, Clue } from "@/types/content";
import { getChapter, getRoom } from "@/content/index";
import { getBoss } from "@/content/bosses";
import { getClue } from "@/content/clues";
import { getQuest } from "@/content/quests";
import { RichText } from "@/components/ui/RichText";
import { GameTimer } from "@/components/game/GameTimer";

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
  // Linear flow (no reconnecting branches):
  //   DRIVEWAY → TERRACE → GARDEN → CARPORT → FRONT DOOR → BOSS
  //                                          ↘ SHED (dead-end)
  "act-1": {
    // Act 1 flow (bottom → top):
    //   DRIVEWAY → TERRACE → GARDEN → SHED (main) → BOSS (Mads) → FRONT DOOR (triggers Act 2)
    //                                              ↗ CARPORT (optional branch — unlocks boss advantage)
    svgW: 340, svgH: 540, scale: 1.65,
    bossNode: { cx: 170, cy: 195 },
    titleCY: 42,
    nodes: [
      { id: "front-door", cx: 170, cy: 95,  sz: 14 },  // TOP — very last room
      { id: "shed",       cx: 130, cy: 295, sz: 13 },  // main path (left-center)
      { id: "carport",    cx: 255, cy: 295, sz: 11 },  // optional branch (RIGHT)
      { id: "garden",     cx: 108, cy: 385, sz: 14 },  // after terrace
      { id: "terrace",    cx: 245, cy: 410, sz: 12 },  // after driveway
      { id: "driveway",   cx: 175, cy: 470, sz: 14 },  // START — bottom center
    ],
    paths: [
      ["driveway",   "terrace"],    // 1: terrace before garden
      ["terrace",    "garden"],     // 2: garden after terrace
      ["garden",     "shed"],       // 3: shed — main route
      ["garden",     "carport"],    // 3b: carport — optional branch (no further connection)
      ["shed",       "boss"],       // 4: boss after shed
      ["boss",       "front-door"], // 5: front-door is last
    ],
  },

  // ── ACT 2 — indoor / settling ─────────────────────────────────────────────
  // Spine: bedrooms → living-room → kitchen → activity → dining → boss
  // Sunroom: optional branch from living-room (left, pushed down to make
  //   room for the toilet above it)
  // The Toilet: required branch from kitchen-act2 (left), holds the "last"
  //   radio fragment
  "act-2": {
    svgW: 340, svgH: 520, scale: 1.65,
    bossNode: { cx: 170, cy: 78 },
    titleCY: 36,
    nodes: [
      { id: "dining-room",    cx: 170, cy: 152, sz: 14 },
      { id: "darts-board",    cx: 252, cy: 165, sz: 10, isOptional: true },
      { id: "activity-room",  cx: 230, cy: 228, sz: 12 },
      { id: "foosball-table", cx: 254, cy: 292, sz: 10, isOptional: true },
      { id: "kitchen-act2",   cx: 170, cy: 228, sz: 13 },
      { id: "the-toilet",     cx: 100, cy: 228, sz: 10 },
      { id: "sunroom",        cx: 100, cy: 280, sz: 11, isOptional: true },
      { id: "living-room",    cx: 170, cy: 318, sz: 14 },
      { id: "double-room",    cx: 100, cy: 428, sz: 12 },
      { id: "single-room",    cx: 170, cy: 428, sz: 14 },
      { id: "bunk-room",      cx: 240, cy: 428, sz: 12 },
    ],
    paths: [
      ["double-room",   "living-room"],
      ["single-room",   "living-room"],
      ["bunk-room",     "living-room"],
      ["living-room",   "sunroom"],
      ["living-room",   "kitchen-act2"],
      ["kitchen-act2",  "the-toilet"],
      ["kitchen-act2",  "activity-room"],
      ["activity-room", "darts-board"],
      ["activity-room", "foosball-table"],
      ["kitchen-act2",  "dining-room"],
      ["dining-room",   "boss"],
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
      { id: "meter-cupboard",    cx: 100, cy: 273, sz: 10 },
      { id: "sealed-wall",       cx: 95,  cy: 308, sz: 11 },
      { id: "conservatory",      cx: 152, cy: 308, sz: 11 },
      { id: "kitchen-dark",      cx: 232, cy: 308, sz: 12 },
      { id: "rattling-window",   cx: 242, cy: 238, sz: 10, isOptional: true },
      { id: "behind-the-shed",   cx: 165, cy: 382, sz: 12 },
      { id: "fuse-box",          cx: 235, cy: 382, sz: 11 },
      // Bottom spine — pulled up and tightened so the starting room
      // (dining-room-dark) doesn't sit flush against the fixed bottom
      // nav bar and become hard to tap on first load.
      { id: "back-corridor",     cx: 170, cy: 445, sz: 14 },
      { id: "utility-corner",    cx: 170, cy: 495, sz: 12 },
      { id: "dining-room-dark",  cx: 170, cy: 545, sz: 14 },
    ],
    paths: [
      ["dining-room-dark",  "utility-corner"],
      ["utility-corner",    "back-corridor"],
      ["back-corridor",     "door-nobody-tried"],
      ["back-corridor",     "behind-the-shed"],
      ["back-corridor",     "fuse-box"],
      ["door-nobody-tried", "meter-cupboard"],
      ["meter-cupboard",    "sealed-wall"],
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
  // "Unread" = clue not yet opened in the Case File by ANYONE on the team (server-tracked)
  const [unreadClueIds, setUnreadClueIds] = useState<Set<string>>(new Set());
  const [offerSpent, setOfferSpent] = useState(0);
  const [teamChapterId, setTeamChapterId] = useState<string | null>(null);
  const [otherCompletedRoomIds, setOtherCompletedRoomIds] = useState<string[] | null>(null);
  const [tollBanners, setTollBanners] = useState<{ msg: string; key: number }[]>([]);
  const tollKeyRef = useRef(0);
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  // Mark clues read for the WHOLE TEAM — optimistic locally, persisted server-side.
  // Other devices pick it up on their next poll. locallyReadRef prevents a poll
  // that raced the server write from flickering the badge back on.
  const locallyReadRef = useRef<Set<string>>(new Set());
  const markCluesRead = useCallback((ids: string[]) => {
    if (ids.length === 0 || !gameId || !teamId) return;
    ids.forEach((id) => locallyReadRef.current.add(id));
    setUnreadClueIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    markCluesReadAction(gameId, teamId, ids).catch(() => {});
  }, [gameId, teamId]);
  const [activeChallenges, setActiveChallenges] = useState<Record<string, string>>({});
  const [forcedClueModal, setForcedClueModal] = useState<Clue[]>([]);

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
    // Newest clues first — the drawer shows them in this order
    const sortedDb = [...dbClues].sort(
      (a, b) => new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime()
    );
    const resolved = sortedDb
      .map((c) => getClue(c.clue_id))
      .filter((c): c is Clue => !!c);
    setTeamClues(resolved);
    // Team-wide unread state comes straight from the server (read_at is null)
    setUnreadClueIds(new Set(
      sortedDb
        .filter((c) => !c.read_at && !locallyReadRef.current.has(c.clue_id))
        .map((c) => c.clue_id)
    ));

    // ── Detect new clues after returning from a room ──────────────────────────
    // When the player navigated to a room, we saved their clue IDs in sessionStorage.
    // On the first fetch after returning, compare and surface any new clues as a forced modal.
    if (typeof window !== "undefined" && gameId && teamId) {
      const departKey = `tlcb_depart_clues_${gameId}_${teamId}`;
      const departed = sessionStorage.getItem(departKey);
      if (departed) {
        const departedIds = new Set<string>(JSON.parse(departed) as string[]);
        const brandNew = resolved.filter((c) => !departedIds.has(c.id));
        if (brandNew.length > 0) setForcedClueModal(brandNew);
        sessionStorage.removeItem(departKey);
      }
    }

    const myTp = (data.teamProgress ?? []).find(
      (tp: { team_id: string; offer_spent: number; current_chapter_id?: string }) => tp.team_id === teamId
    );
    if (myTp) setOfferSpent(myTp.offer_spent ?? 0);
    // Each team plays its OWN act — never the game-wide (furthest) one.
    setTeamChapterId(myTp?.current_chapter_id ?? g.current_chapter_id);

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
        const ids = (d.roomProgress ?? [])
          .filter((rp: { status: string }) => rp.status === "complete")
          .map((rp: { room_id: string }) => rp.room_id);
        setOtherCompletedRoomIds(ids);
      })
      .catch(() => {});
  }, [gameId, teamId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeGame(gameId ?? undefined, fetchData);

  // ── Scroll setup — runs once per act ──────────────────────────────────────
  useEffect(() => {
    if (!game || !gameId || !teamId || !teamChapterId) return;
    const actId = teamChapterId;
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
  }, [game, gameId, teamId, teamChapterId]);

  // Save scroll position on every scroll
  useEffect(() => {
    const el = mapScrollRef.current;
    if (!el || !teamChapterId || !gameId || !teamId) return;
    const actId = teamChapterId;
    const storageKey = `tlcb_scroll_${gameId}_${teamId}_${actId}`;
    const onScroll = () => sessionStorage.setItem(storageKey, String(el.scrollTop));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [teamChapterId, gameId, teamId]);

  // ── Room helpers ─────────────────────────────────────────────────────────
  const canInteract = !session?.isHost;

  const getRoomStatus = (roomId: string): DbRoomProgress["status"] =>
    roomProgress.find((r) => r.room_id === roomId)?.status ?? "locked";

  // Act 3 power-cut gimmick: fixing the fuse box "lights" the map; opening
  // the door nobody tried cuts the main switch outside (Meter Cupboard) and
  // the map goes dark again for the rest of the act. mapLit only needs the
  // fuse fixed and the door not yet fully explored — order-independent.
  const mapLit =
    teamChapterId === "act-3" &&
    getRoomStatus("fuse-box") === "complete" &&
    getRoomStatus("door-nobody-tried") !== "complete";

  // One-time banner the moment the door-nobody-tried room is finished in
  // Act 3 — the narrative beat where the main switch outside gets thrown
  // and the map goes dark again. Guarded by sessionStorage so it only
  // fires once per game/team, not on every poll.
  useEffect(() => {
    if (!gameId || !teamId || teamChapterId !== "act-3") return;
    if (getRoomStatus("door-nobody-tried") !== "complete") return;
    const key = `tlcb_powercut_${gameId}_${teamId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    setMessage("The lights just went out again. Somewhere outside, the main switch has been thrown.");
    setTimeout(() => setMessage(null), 4500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomProgress, gameId, teamId, teamChapterId]);

  const canUnlock = (roomId: string): boolean => {
    const room = getRoom(roomId);
    if (!room) return false;
    if (getRoomStatus(roomId) !== "locked") return false;
    if (!room.unlockRequires.every((req) => getRoomStatus(req) === "complete")) return false;
    if (room.unlockRequiresArtifacts && room.unlockRequiresArtifacts.length > 0) {
      return room.unlockRequiresArtifacts.every((cid) => teamClues.some((c) => c.id === cid));
    }
    return true;
  };

  const handleNodeClick = (roomId: string) => {
    if (!canInteract) return;
    const status = getRoomStatus(roomId);
    if (["complete", "active", "unlocked", "occupied"].includes(status)) {
      // Boss rooms (e.g. the dining room in Act 2) lead straight to the fight
      const clickedRoom = getRoom(roomId);
      if (clickedRoom?.type === "boss_room" && chapter) {
        router.push(`/game/${gameId}/boss/${chapter.bossId}?team=${teamId}`);
        return;
      }
      // Snapshot current clue IDs so we can detect new ones when player returns
      if (typeof window !== "undefined" && gameId && teamId) {
        sessionStorage.setItem(
          `tlcb_depart_clues_${gameId}_${teamId}`,
          JSON.stringify(teamClues.map((c) => c.id))
        );
      }
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
  if (!game || !gameId || !teamId || !teamChapterId) return null;

  // ── Derived values — always based on THIS team's act ─────────────────────
  const chapter    = getChapter(teamChapterId);
  const theme      = ACT_THEMES[teamChapterId] ?? ACT_THEMES["act-1"];
  const geo        = ACT_GEO[teamChapterId] ?? ACT_GEO["act-1"];
  const actFolder  = teamChapterId.replace(/-/g, "");  // "act-1" → "act1"
  const teamName   = teamId === "team-a" ? game.team_a_name : game.team_b_name;
  const pendingRoom = pendingUnlock ? getRoom(pendingUnlock) : null;

  const sipMatch = game.offer_definition.trim().match(/^(\d+)/);
  const sipsPerOffer = sipMatch ? parseInt(sipMatch[1], 10) : 1;
  const totalSipsDrunk = offerSpent * sipsPerOffer;

  const roomIds = chapter?.roomIds ?? [];
  // Boss rooms (dining room, living room in Act 3) have no quests and are
  // "completed" by defeating the boss — exclude them from the room counter.
  const mainRooms = roomIds.map((id) => getRoom(id)).filter((r) => !!r && r.type !== "boss_room");
  const completedCount = mainRooms.filter((r) => getRoomStatus(r!.id) === "complete").length;
  const totalRooms = mainRooms.length;
  // Opponent progress compared within THIS team's act only (acts can diverge)
  const otherRoomsCompleted = otherCompletedRoomIds === null
    ? null
    : otherCompletedRoomIds.filter((id) => roomIds.includes(id)).length;
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

  // ── Path colour helper ─────────────────────────────────────────────────────
  // Single thin dotted line: dark=locked, yellow=accessible, green=complete.
  // A path [A→B] is "complete" when B is done, "active" when A is done (B is reachable).
  const pathColor = (fromId: string, toId: string) => {
    const fromSt = fromId === "boss" ? "complete" : getRoomStatus(fromId);
    const toSt   = toId   === "boss" ? (bossUnlockable ? "active" : "locked") : getRoomStatus(toId);
    const bothDone = fromSt === "complete" && toSt === "complete";
    const fromDone = fromSt === "complete";
    // Act 1 (light parchment): locked paths use visible dark brown instead of near-black
    const lockedColor = theme.darkLabels ? "rgba(80,55,28,0.42)" : "rgba(40,30,12,0.35)";
    return {
      color:     bothDone ? "rgba(90,210,60,0.95)" : fromDone ? "rgba(225,175,40,0.95)" : lockedColor,
      width:     1.6,
      dashArray: "4.5 3",
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
            {/* Act 3 only: swaps to a "lit" variant once the fuse box is
                fixed, and back to the normal dark map once the door nobody
                tried is finished (the main switch outside gets thrown).
                NOTE: /map/act3/map-lit.png does not exist yet — needs to be
                created as a companion asset to the existing map.png. */}
            <image
              href={mapLit ? `/map/${actFolder}/map-lit.png` : `/map/${actFolder}/map.png`}
              x="0" y="0"
              width={svgW} height={svgH}
              preserveAspectRatio="xMidYMid slice"
            />

            {/* ── Act title ── */}
            {/* Act 1 uses dark text + light halo for readability on bright parchment */}
            <text
              x={svgW / 2} y={geo.titleCY - 7}
              textAnchor="middle"
              fontFamily="Georgia,serif"
              fontSize={13}
              fontWeight="bold"
              fill={theme.darkLabels ? "#3c2008" : theme.accent}
              letterSpacing={3}
              filter={theme.darkLabels ? "url(#tlcb-shadow-light)" : "url(#tlcb-shadow)"}
              opacity={0.96}
            >
              {theme.label}
            </text>
            <text
              x={svgW / 2} y={geo.titleCY + 4}
              textAnchor="middle"
              fontFamily="Georgia,serif"
              fontSize={6}
              fill={theme.darkLabels ? "#3c2008" : theme.accent}
              letterSpacing={5}
              filter={theme.darkLabels ? "url(#tlcb-shadow-light)" : "url(#tlcb-shadow)"}
              opacity={0.65}
            >
              {theme.subtitle}
            </text>
            {/* Decorative rule */}
            <line
              x1={svgW / 2 - 55} y1={geo.titleCY + 1}
              x2={svgW / 2 - 22} y2={geo.titleCY + 1}
              stroke={theme.darkLabels ? "#3c2008" : theme.accent} strokeWidth={0.5} opacity={0.35}
            />
            <line
              x1={svgW / 2 + 22} y1={geo.titleCY + 1}
              x2={svgW / 2 + 55} y2={geo.titleCY + 1}
              stroke={theme.darkLabels ? "#3c2008" : theme.accent} strokeWidth={0.5} opacity={0.35}
            />

            {/* ── Path lines between nodes ── */}
            {geo.paths.map(([fromId, toId], i) => {
              const from = getNodePos(fromId);
              const to   = getNodePos(toId);
              if (!from || !to) return null;
              const col = pathColor(fromId, toId);
              return (
                <line
                  key={i}
                  x1={from.cx} y1={from.cy}
                  x2={to.cx}   y2={to.cy}
                  stroke={col.color}
                  strokeWidth={col.width}
                  strokeDasharray={col.dashArray}
                  strokeLinecap="round"
                />
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
                    <circle cx={cx} cy={cy} r={24} fill="none" stroke="#e03020" strokeWidth={1.5} opacity={0.7}>
                      <animate attributeName="r"       values="24;38;24" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Boss NodeBlob — larger than room nodes */}
                  <image
                    href={bossImg}
                    x={cx - 22} y={cy - 22}
                    width={44} height={44}
                    opacity={bossUnlockable ? 1 : 0.50}
                    style={bossUnlockable
                      ? { filter: "drop-shadow(0 0 10px rgba(220,40,40,0.95)) hue-rotate(310deg) saturate(2)" }
                      : { filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.85))" }}
                  />
                  {/* Boss label */}
                  <text
                    x={cx} y={cy + 30}
                    textAnchor="middle"
                    fontFamily="Georgia,serif"
                    fontSize={7}
                    fill={bossUnlockable ? "#fca5a5" : (theme.darkLabels ? "rgba(120,60,60,0.65)" : "rgba(180,100,100,0.45)")}
                    letterSpacing={1.5}
                    filter={theme.darkLabels ? "url(#tlcb-shadow-light)" : "url(#tlcb-shadow)"}
                    opacity={0.95}
                  >
                    {(bossUnlockable ? boss?.title ?? "BOSS" : "???").toUpperCase()}
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
          <div className="text-[10px] uppercase tracking-[0.3em] mb-0.5" style={{ color: theme.accent, fontFamily: "Georgia,serif", opacity: 0.65 }}>
            {theme.emoji} {theme.label}
          </div>
          <div className="font-bold text-xl leading-tight truncate" style={{ color: "rgba(245,225,170,0.97)", fontFamily: "Georgia,serif" }}>
            {teamName}
          </div>
          <GameTimer
            startedAt={game?.started_at}
            className="block text-[11px] mt-0.5 tracking-wide"
            style={{ color: theme.accent, opacity: 0.55, fontFamily: "Georgia,serif" }}
          />
        </div>

        {/* VS progress pill */}
        <div className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm pointer-events-auto"
          style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(180,130,50,0.22)", fontFamily: "Georgia,serif" }}>
          <span className="font-bold" style={{ color: bossUnlockable ? "rgb(248,113,113)" : theme.accent }}>
            {completedCount}/{totalRooms}
          </span>
          <span style={{ color: "rgba(120,80,30,0.5)", margin: "0 2px" }}>vs</span>
          <span style={{ color: "rgba(180,160,100,0.55)" }}>{otherRoomsCompleted ?? "·"}/{totalRooms}</span>
        </div>

        {/* Settings */}
        <button
          onClick={() => setShowPanel(true)}
          className="w-11 h-11 flex items-center justify-center rounded-full active:scale-95 transition-transform pointer-events-auto"
          style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(180,130,50,0.2)", color: "rgba(180,130,50,0.8)", fontSize: "18px" }}
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
          BOTTOM HUD — Case File (large, pulses on new clues) + sips counter.
          Boss access lives on the map (boss node) and in the control panel.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-20"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)", background: "linear-gradient(180deg, transparent 0%, rgba(6,4,2,0.97) 45%)" }}>
        <div className="px-4 pt-5 pb-4 flex items-center gap-3">
          {/* Case File — primary bottom action */}
          <button
            onClick={() => setShowCaseFile(true)}
            className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.97] transition-transform relative ${unreadClueIds.size > 0 ? "animate-pulse-glow" : ""}`}
            style={{
              background: unreadClueIds.size > 0 ? "rgba(120,80,10,0.8)" : "rgba(12,8,3,0.9)",
              border: `1.5px solid ${unreadClueIds.size > 0 ? "rgba(251,191,36,0.65)" : "rgba(180,130,50,0.3)"}`,
              boxShadow: unreadClueIds.size > 0 ? "0 0 18px rgba(251,191,36,0.3)" : "0 2px 12px rgba(0,0,0,0.5)",
            }}
          >
            <span style={{ fontSize: "22px" }}>🗂</span>
            <span className="text-base font-bold" style={{ color: teamClues.length > 0 ? "rgba(251,191,36,0.95)" : "rgba(150,110,45,0.6)", fontFamily: "Georgia,serif" }}>
              Case File{teamClues.length > 0 ? ` · ${teamClues.length}` : ""}
            </span>
            {unreadClueIds.size > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center text-[11px] font-black"
                style={{ background: "rgb(251,191,36)", color: "#1a0e00", boxShadow: "0 0 10px rgba(251,191,36,0.7)" }}>
                {unreadClueIds.size}
              </span>
            )}
          </button>

          {/* Sips counter — large */}
          <div className="h-14 px-5 rounded-2xl flex items-center gap-2"
            style={{ background: "rgba(12,8,3,0.9)", border: "1.5px solid rgba(180,130,50,0.25)", fontFamily: "Georgia,serif" }}>
            <span style={{ fontSize: "22px" }}>🍺</span>
            <span className="text-lg font-bold" style={{ color: "rgba(220,165,70,0.9)" }}>{totalSipsDrunk}</span>
          </div>
        </div>
      </div>

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
                      {bossUnlockable ? boss?.title ?? chapter.bossId : "???"}
                    </div>
                    <div className="text-xs" style={{ color: bossUnlockable ? "rgba(220,100,100,0.6)" : "rgba(100,60,20,0.4)", fontFamily: "Georgia,serif" }}>
                      {bossUnlockable ? "Ready for battle" : "Something is waiting. Keep exploring."}
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
                    {teamClues.map((clue) => {
                      // Clues from earlier acts are "spent" — dim them to 50%
                      const actNum = (id?: string) => (id ? parseInt(id.replace("act-", ""), 10) || 0 : 0);
                      const isSpent = actNum(clue.chapterId) < actNum(teamChapterId ?? undefined);
                      const isUnread = unreadClueIds.has(clue.id);
                      return (
                      <button key={clue.id} onClick={() => { setSelectedClue(clue); markCluesRead([clue.id]); }}
                        className="w-full text-left rounded-xl px-3 py-3 active:scale-[0.98] transition-transform"
                        style={{ opacity: isSpent ? 0.5 : 1, background: clue.isArtifact ? "rgba(30,20,60,0.4)" : clue.isKeyClue ? "rgba(80,55,10,0.3)" : "rgba(255,255,255,0.04)", border: `1px solid ${clue.isArtifact ? "rgba(160,120,255,0.3)" : clue.isKeyClue ? "rgba(220,160,40,0.35)" : "rgba(180,130,50,0.12)"}` }}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl flex-shrink-0 relative">
                            {clue.icon}
                            {isUnread && (
                              <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full"
                                style={{ background: "rgb(251,191,36)", boxShadow: "0 0 8px rgba(251,191,36,0.9)" }} />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold truncate" style={{ color: isUnread ? "rgb(251,215,120)" : "rgba(245,225,170,0.92)", fontFamily: "Georgia,serif" }}>{clue.title}</span>
                              {isUnread && <span className="text-[9px] uppercase tracking-widest flex-shrink-0" style={{ color: "rgb(251,191,36)", fontFamily: "Georgia,serif" }}>New</span>}
                              {clue.isArtifact && <span className="text-[9px] uppercase tracking-widest flex-shrink-0" style={{ color: "rgba(160,120,255,0.6)", fontFamily: "Georgia,serif" }}>Artifact</span>}
                              {clue.isKeyClue && !clue.isArtifact && <span className="text-[9px] uppercase tracking-widest flex-shrink-0" style={{ color: "rgba(251,191,36,0.6)", fontFamily: "Georgia,serif" }}>Key</span>}
                              {isSpent && <span className="text-[9px] uppercase tracking-widest flex-shrink-0" style={{ color: "rgba(140,110,60,0.5)", fontFamily: "Georgia,serif" }}>Past act</span>}
                            </div>
                            <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(160,120,60,0.6)", fontFamily: "Georgia,serif" }}>{clue.flavor}</p>
                          </div>
                          <span className="text-xs flex-shrink-0" style={{ color: "rgba(120,90,30,0.4)" }}>›</span>
                        </div>
                      </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          FORCED CLUE MODAL — shown when player returns from a completed room
          Player MUST dismiss this to continue. No backdrop-click dismiss.
      ══════════════════════════════════════════════════════════════════════ */}
      {forcedClueModal.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: "rgba(4,2,0,0.92)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden animate-quest-fade"
            style={{ background: "rgba(14,10,4,0.99)", border: "1px solid rgba(180,130,50,0.4)" }}>
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b" style={{ borderColor: "rgba(180,130,50,0.15)" }}>
              <div className="text-[9px] uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(180,130,50,0.45)", fontFamily: "Georgia,serif" }}>
                New Evidence
              </div>
              <div className="text-base font-bold" style={{ color: "rgba(245,225,170,0.97)", fontFamily: "Georgia,serif" }}>
                {forcedClueModal.length === 1 ? "A clue was discovered." : `${forcedClueModal.length} clues were discovered.`}
              </div>
            </div>

            {/* Clue list */}
            <div className="divide-y divide-amber-900/20 px-0" style={{ maxHeight: "52vh", overflowY: "auto" }}>
              {forcedClueModal.map((clue) => (
                <div key={clue.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{clue.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm font-bold" style={{ color: "rgba(245,225,170,0.95)", fontFamily: "Georgia,serif" }}>{clue.title}</span>
                        {clue.isKeyClue && (
                          <span className="text-[8px] uppercase tracking-widest" style={{ color: "rgba(251,191,36,0.6)", fontFamily: "Georgia,serif" }}>Key</span>
                        )}
                      </div>
                      <RichText as="p" className="text-xs leading-relaxed" style={{ color: "rgba(200,175,120,0.8)", fontFamily: "Georgia,serif" }} text={clue.description} />
                      {clue.flavor && (
                        <RichText as="p" className="text-[11px] italic mt-1.5" style={{ color: "rgba(130,95,35,0.55)", fontFamily: "Georgia,serif" }} text={clue.flavor} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dismiss */}
            <div className="px-5 pb-5 pt-3">
              <button
                onClick={() => {
                  // The modal showed the full clue text — that counts as read for the team
                  markCluesRead(forcedClueModal.map((c) => c.id));
                  setForcedClueModal([]);
                }}
                className="w-full py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                style={{ background: "rgba(120,80,10,0.55)", border: "1px solid rgba(180,130,50,0.4)", color: "rgba(251,191,36,0.95)", fontFamily: "Georgia,serif" }}
              >
                Added to Case File →
              </button>
            </div>
          </div>
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
