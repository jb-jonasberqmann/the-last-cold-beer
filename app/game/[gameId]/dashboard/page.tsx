"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlayer, storeSession } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { LiveProgress } from "@/components/game/LiveProgress";
import type { DbGame, DbGameEvent } from "@/types/database";
import { relativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getChapter } from "@/content/chapters";
import { getBoss } from "@/content/bosses";
import { GameTimer } from "@/components/game/GameTimer";

interface Props {
  params: { gameId: string };
}

// Returns a human label + any extra detail extracted from event_data
function eventLabel(event: DbGameEvent, offerDef: string): { icon: string; text: string; detail?: string } {
  const d = event.event_data as Record<string, unknown> | null;
  switch (event.event_type) {
    case "offer_paid": {
      const amt = d?.amount as number | undefined;
      return {
        icon: "🍺",
        text: amt ? `Paid ${amt} ${amt === 1 ? "Offer" : "Offers"}` : "Offer paid",
        detail: amt ? `= ${amt}× ${offerDef}` : undefined,
      };
    }
    case "room_unlocked":    return { icon: "🔓", text: "Unlocked a room" };
    case "room_completed":   return { icon: "✅", text: "Room complete!" };
    case "clue_found":       return { icon: "🔍", text: "Clue found" };
    case "quest_completed":  return { icon: "⭐", text: "Quest solved" };
    case "boss_damaged":     return { icon: "⚔️", text: "Boss hit" };
    case "boss_defeated":    return { icon: "💀", text: "Boss defeated!" };
    case "chapter_complete": return { icon: "🎉", text: "Chapter complete!" };
    case "game_started":     return { icon: "🏁", text: "Game started" };
    case "role_assigned": {
      const name = (d?.player_name as string) ?? "Someone";
      const label = (d?.label as string) ?? "a role";
      return { icon: "🎲", text: `${name} got a role`, detail: label };
    }
    default:                 return { icon: "•", text: event.event_type };
  }
}

export default function DashboardPage({ params }: Props) {
  const gameId = params.gameId;
  const router = useRouter();

  const { session, setSession, isLoaded } = usePlayer();
  // Keep a ref so fetchData always reads the latest session without needing it
  // in the dependency array (avoids stale-closure churn and infinite re-creates).
  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  const [game, setGame] = useState<DbGame | null>(null);
  const [events, setEvents] = useState<DbGameEvent[]>([]);
  const [teamProgress, setTeamProgress] = useState<import("@/types/database").DbTeamProgress[]>([]);
  // Server-verified team — the only source of truth for navigation.
  // We never fall back to session.teamId; we wait for this to be confirmed.
  const [serverTeamId, setServerTeamId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!gameId) return;
    const [progressRes, gameRes] = await Promise.all([
      fetch(`/api/game/${gameId}/progress`),
      fetch(`/api/game/${gameId}`),
    ]);
    if (!progressRes.ok) return;
    const data = await progressRes.json();
    setGame(data.game);
    setEvents(data.events ?? []);
    setTeamProgress(data.teamProgress ?? []);

    // Resolve the actual team from the server player list — session.teamId can be
    // wrong when multiple players share the same browser (any tab writes localStorage).
    // With sessionStorage this is much rarer, but we still heal as a safety net.
    const sess = sessionRef.current;
    if (gameRes.ok && sess?.playerId) {
      const gameData = await gameRes.json();
      const me = (gameData.players ?? []).find(
        (p: { id: string; team_id: string | null }) => p.id === sess.playerId
      );
      if (me?.team_id) {
        setServerTeamId(me.team_id);
        if (me.team_id !== sess.teamId) {
          const healed = { ...sess, teamId: me.team_id as import("@/types/content").TeamId };
          setSession(healed);
          storeSession(healed);
        }
      }
    }
  }, [gameId, setSession]);

  useEffect(() => {
    if (isLoaded && gameId) fetchData();
  }, [isLoaded, gameId, fetchData]);

  // Players go straight to the map — dashboard is host-only
  useEffect(() => {
    if (serverTeamId && session && !session.isHost) {
      router.replace(`/game/${gameId}/team/${serverTeamId}`);
    }
  }, [serverTeamId, session, gameId, router]);

  useRealtimeGame(gameId ?? undefined, fetchData);

  if (!isLoaded || !session) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400">Loading…</p>
      </div>
    );
  }

  if (!game || !gameId) return null;

  // Always use server-verified team for navigation — never trust session.teamId
  // directly, because sessionStorage could still be stale on a fresh tab open.
  const myTeamId = session.isHost ? null : (serverTeamId ?? null);
  const teamName = myTeamId === "team-a"
    ? game.team_a_name
    : myTeamId === "team-b"
      ? game.team_b_name
      : null;

  // Find the most recent role assigned to this player
  const myRole = [...events]
    .reverse()
    .find((e) => {
      if (e.event_type !== "role_assigned") return false;
      const d = e.event_data as Record<string, unknown> | null;
      return d?.player_id === session.playerId;
    });
  const myRoleData = myRole?.event_data as { label: string; effect: string } | null ?? null;

  // Most recent game_started event for the top banner
  const gameStartedEvent = events.find((e) => e.event_type === "game_started");

  // Current act boss (dynamic — per-team act; host falls back to the game-wide furthest act)
  const myTeamChapterId = myTeamId
    ? teamProgress.find((t) => t.team_id === myTeamId)?.current_chapter_id ?? game.current_chapter_id
    : game.current_chapter_id;
  const currentChapter = getChapter(myTeamChapterId);
  const currentBoss = currentChapter ? getBoss(currentChapter.bossId) : null;

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #0c0a09 0%, #080806 60%, #060808 100%)" }}
    >
      {/* ── Slim nav ── */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4"
        style={{
          paddingTop: "max(12px, env(safe-area-inset-top, 12px))",
          paddingBottom: "10px",
          background: "rgba(10,8,6,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(180,130,50,0.08)",
        }}
      >
        <div
          className="text-xs uppercase tracking-[0.25em]"
          style={{ color: "rgba(180,130,50,0.4)", fontFamily: "Georgia,serif" }}
        >
          ⚔ The Last Cold Beer
        </div>
        <GameTimer
          startedAt={game.started_at}
          className="font-mono text-xs tracking-widest"
          style={{ color: "rgba(180,130,50,0.5)", fontFamily: "Georgia,serif" }}
        />
        {session.isHost && (
          <Link
            href={`/game/${gameId}/host`}
            className="text-xs px-2.5 py-1 rounded-md"
            style={{
              background: "rgba(180,130,50,0.12)",
              border: "1px solid rgba(180,130,50,0.25)",
              color: "rgba(180,130,50,0.7)",
              fontFamily: "Georgia,serif",
            }}
          >
            GM →
          </Link>
        )}
        {!session.isHost && (
          <div
            className="font-mono text-xs tracking-widest"
            style={{ color: "rgba(180,130,50,0.35)", fontFamily: "Georgia,serif" }}
          >
            #{game.code}
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4 animate-dashboard-enter">

        {/* ── Chapter title block ── */}
        <div className="text-center py-2">
          <div
            className="text-[10px] uppercase tracking-[0.3em] mb-1"
            style={{ color: "rgba(180,130,50,0.4)", fontFamily: "Georgia,serif" }}
          >
            Chapter I
          </div>
          <div
            className="text-2xl font-bold"
            style={{
              fontFamily: "Georgia,serif",
              color: "rgba(245,225,170,0.95)",
              textShadow: "0 2px 16px rgba(180,130,50,0.2)",
            }}
          >
            The Last Cold Beer
          </div>
          {gameStartedEvent && (
            <div
              className="text-xs mt-1.5 flex items-center justify-center gap-1.5"
              style={{ color: "rgba(180,130,50,0.5)", fontFamily: "Georgia,serif" }}
            >
              <span>🏁</span>
              <span>The Ritual has begun · {relativeTime(gameStartedEvent.created_at)}</span>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.15)" }} />
          <span className="text-amber-800/40 text-xs">✦</span>
          <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.15)" }} />
        </div>

        {/* ── Role banner ── */}
        {myRoleData && (
          <div
            className="rounded-xl p-4"
            style={{
              background: "linear-gradient(160deg, #1a0830 0%, #120520 100%)",
              border: "1.5px solid rgba(168,85,247,0.4)",
              boxShadow: "0 0 20px rgba(168,85,247,0.08)",
            }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.2em] mb-1"
              style={{ color: "rgba(168,85,247,0.6)", fontFamily: "Georgia,serif" }}
            >
              🎲 Din rolle
            </div>
            <div
              className="text-base font-bold mb-1"
              style={{ color: "rgb(233,213,255)", fontFamily: "Georgia,serif" }}
            >
              {myRoleData.label}
            </div>
            <div
              className="text-xs"
              style={{ color: "rgba(196,181,253,0.75)", fontFamily: "Georgia,serif" }}
            >
              {myRoleData.effect}
            </div>
          </div>
        )}

        {/* ── Team Quest Board CTA ── */}
        {myTeamId && (
          <Link
            href={`/game/${gameId}/team/${myTeamId}`}
            className="block w-full rounded-xl overflow-hidden active:scale-[0.99] transition-transform"
            style={{
              background: "linear-gradient(160deg, #2a1c08 0%, #1c1208 60%, #140e06 100%)",
              border: "1px solid rgba(180,130,50,0.35)",
              boxShadow: "0 4px 20px rgba(180,130,50,0.08)",
            }}
          >
            <div
              className="h-px w-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(180,130,50,0.45), transparent)" }}
            />
            <div className="px-5 py-4 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: "radial-gradient(circle, #2a1c08, #140e04)",
                  border: "1px solid rgba(180,130,50,0.3)",
                }}
              >
                🗺️
              </div>
              <div className="flex-1">
                <div
                  className="text-[10px] uppercase tracking-[0.2em] mb-0.5"
                  style={{ color: "rgba(180,130,50,0.5)", fontFamily: "Georgia,serif" }}
                >
                  Dit hold
                </div>
                <div
                  className="text-base font-bold"
                  style={{ color: "rgb(251,191,36)", fontFamily: "Georgia,serif" }}
                >
                  {teamName}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "rgba(180,130,50,0.5)", fontFamily: "Georgia,serif" }}
                >
                  Se quest board →
                </div>
              </div>
              <div
                className="text-xl"
                style={{ color: "rgba(180,130,50,0.3)" }}
              >
                ›
              </div>
            </div>
            <div
              className="h-px w-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(180,130,50,0.15), transparent)" }}
            />
          </Link>
        )}

        {/* ── Quick links: Case File + Boss ── */}
        {myTeamId && (
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/game/${gameId}/case-file?team=${myTeamId}`}
              className="rounded-xl p-4 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform"
              style={{
                background: "linear-gradient(160deg, #181410 0%, #100c08 100%)",
                border: "1px solid rgba(180,130,50,0.18)",
              }}
            >
              <span className="text-2xl">📁</span>
              <div className="text-center">
                <div className="text-xs font-bold" style={{ color: "rgba(245,225,170,0.8)", fontFamily: "Georgia,serif" }}>
                  Case File
                </div>
                <div className="text-[10px]" style={{ color: "rgba(180,130,50,0.4)", fontFamily: "Georgia,serif" }}>
                  Dine spor
                </div>
              </div>
            </Link>
            <Link
              href={`/game/${gameId}/boss/${currentChapter?.bossId ?? "mads"}?team=${myTeamId}`}
              className="rounded-xl p-4 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform"
              style={{
                background: "linear-gradient(160deg, #1a0505 0%, #0e0303 100%)",
                border: "1px solid rgba(180,40,40,0.22)",
              }}
            >
              <span className="text-2xl">🔒</span>
              <div className="text-center">
                <div className="text-xs font-bold" style={{ color: "rgba(254,202,202,0.8)", fontFamily: "Georgia,serif" }}>
                  Boss Fight
                </div>
                <div className="text-[10px]" style={{ color: "rgba(180,80,80,0.4)", fontFamily: "Georgia,serif" }}>
                  {currentBoss?.title ?? "The Keybearer"}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ── Section divider ── */}
        <div
          className="text-[9px] uppercase tracking-[0.3em] flex items-center gap-2"
          style={{ color: "rgba(180,130,50,0.3)", fontFamily: "Georgia,serif" }}
        >
          <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.08)" }} />
          Live status
          <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.08)" }} />
        </div>

        {/* ── Live progress ── */}
        <LiveProgress
          gameId={gameId}
          myTeamId={myTeamId as import("@/types/content").TeamId | null}
          teamAName={game.team_a_name}
          teamBName={game.team_b_name}
        />

        {/* ── Section divider ── */}
        <div
          className="text-[9px] uppercase tracking-[0.3em] flex items-center gap-2"
          style={{ color: "rgba(180,130,50,0.3)", fontFamily: "Georgia,serif" }}
        >
          <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.08)" }} />
          Feltrapporter
          <div className="flex-1 h-px" style={{ background: "rgba(180,130,50,0.08)" }} />
        </div>

        {/* ── Activity feed ── */}
        <ActivityFeed
          events={events}
          game={game}
          teamProgress={teamProgress}
          myTeamId={myTeamId}
          isHost={session.isHost}
        />

        {/* Bottom padding for safe area */}
        <div style={{ height: "env(safe-area-inset-bottom, 16px)" }} />
      </div>
    </div>
  );
}

// ==========================================
// ACTIVITY FEED COMPONENT
// ==========================================

function EventRow({ event, teamAName, teamBName, myTeamId, offerDef }: {
  event: DbGameEvent;
  teamAName: string;
  teamBName: string;
  myTeamId: string | null;
  offerDef: string;
}) {
  const isTeamA = event.team_id === "team-a";
  const isTeamB = event.team_id === "team-b";
  const isMyTeam = event.team_id === myTeamId;
  const teamLabel = isTeamA ? teamAName : isTeamB ? teamBName : null;
  const { icon, text, detail } = eventLabel(event, offerDef);

  return (
    <div className={cn(
      "rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-2 border",
      event.event_type === "game_started"
        ? "bg-amber-950/60 border-amber-600/60 text-amber-200"
        : isTeamA
          ? "bg-orange-950/40 border-orange-700/50 text-orange-200"
          : isTeamB
            ? "bg-cyan-950/40 border-cyan-700/50 text-cyan-200"
            : "bg-stone-900/50 border-stone-700/50 text-stone-300"
    )}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base leading-none flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <span className="font-medium">{text}</span>
          {detail && <span className="text-xs opacity-60 ml-1.5">{detail}</span>}
          {teamLabel && (
            <span className={cn("text-xs ml-1.5 font-semibold", isTeamA ? "text-orange-400" : "text-cyan-400")}>
              — {teamLabel}{isMyTeam ? " (you)" : ""}
            </span>
          )}
        </div>
      </div>
      <span className="text-xs text-stone-600 flex-shrink-0 ml-2">{relativeTime(event.created_at)}</span>
    </div>
  );
}

function TeamScoreBar({ label, color, offerSpent, offerDef, rooms, isMe }: {
  label: string;
  color: "orange" | "cyan";
  offerSpent: number;
  offerDef: string;
  rooms: number;
  isMe: boolean;
}) {
  const isOrange = color === "orange";
  return (
    <div
      className="rounded-xl p-3 flex-1"
      style={{
        background: isOrange ? "linear-gradient(160deg, #1c0e05 0%, #120a04 100%)" : "linear-gradient(160deg, #05141c 0%, #040e14 100%)",
        border: isMe
          ? `1.5px solid ${isOrange ? "rgba(251,146,60,0.5)" : "rgba(34,211,238,0.5)"}`
          : `1px solid ${isOrange ? "rgba(180,80,20,0.25)" : "rgba(20,120,160,0.25)"}`,
        boxShadow: isMe ? `0 0 12px ${isOrange ? "rgba(251,146,60,0.08)" : "rgba(34,211,238,0.08)"}` : "none",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div
            className="font-bold text-xs truncate max-w-[90px]"
            style={{ color: isOrange ? "rgb(251,191,36)" : "rgb(103,232,249)", fontFamily: "Georgia,serif" }}
          >
            {label}
          </div>
          {isMe && (
            <div
              className="text-[9px] uppercase tracking-widest"
              style={{ color: isOrange ? "rgba(251,146,60,0.6)" : "rgba(34,211,238,0.6)", fontFamily: "Georgia,serif" }}
            >
              Dit hold
            </div>
          )}
        </div>
        <div className="text-right">
          <div
            className="text-base font-bold leading-none"
            style={{ color: isOrange ? "rgb(251,191,36)" : "rgb(103,232,249)", fontFamily: "Georgia,serif" }}
          >
            🍺 {offerSpent}
          </div>
          <div
            className="text-[10px]"
            style={{ color: isOrange ? "rgba(251,146,60,0.5)" : "rgba(34,211,238,0.5)", fontFamily: "Georgia,serif" }}
          >
            ✓ {rooms} rum
          </div>
        </div>
      </div>
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: isOrange ? "rgba(40,15,5,0.9)" : "rgba(5,20,40,0.9)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, offerSpent * 10)}%`,
            background: isOrange ? "linear-gradient(90deg, #c2410c, #fb923c)" : "linear-gradient(90deg, #0e7490, #22d3ee)",
          }}
        />
      </div>
      <div
        className="text-[10px] mt-1 italic truncate"
        style={{ color: isOrange ? "rgba(251,146,60,0.4)" : "rgba(34,211,238,0.4)", fontFamily: "Georgia,serif" }}
      >
        {offerSpent > 0 ? `${offerSpent}× ${offerDef}` : "Ingen sips endnu"}
      </div>
    </div>
  );
}

function ActivityFeed({ events, game, teamProgress, myTeamId, isHost }: {
  events: DbGameEvent[];
  game: DbGame;
  teamProgress: import("@/types/database").DbTeamProgress[];
  myTeamId: string | null;
  isHost: boolean;
}) {
  const tpA = teamProgress.find((t) => t.team_id === "team-a");
  const tpB = teamProgress.find((t) => t.team_id === "team-b");
  const reversed = [...events].reverse();
  const general = reversed.filter((e) => !e.team_id || e.event_type === "game_started");
  const teamAEvents = reversed.filter((e) => e.team_id === "team-a");
  const teamBEvents = reversed.filter((e) => e.team_id === "team-b");

  return (
    <div className="space-y-4">
      {/* Team score cards */}
      <div className="flex gap-3">
        <TeamScoreBar
          label={game.team_a_name}
          color="orange"
          offerSpent={tpA?.offer_spent ?? 0}
          offerDef={game.offer_definition}
          rooms={tpA?.rooms_completed ?? 0}
          isMe={myTeamId === "team-a"}
        />
        <TeamScoreBar
          label={game.team_b_name}
          color="cyan"
          offerSpent={tpB?.offer_spent ?? 0}
          offerDef={game.offer_definition}
          rooms={tpB?.rooms_completed ?? 0}
          isMe={myTeamId === "team-b"}
        />
      </div>

      {/* For host: split feed by team. For players: show own team + general. */}
      {isHost ? (
        <div className="space-y-3">
          {/* General events */}
          {general.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs text-stone-500 uppercase tracking-widest font-medium">General</div>
              {general.map((e) => (
                <EventRow key={e.id} event={e} teamAName={game.team_a_name} teamBName={game.team_b_name} myTeamId={myTeamId} offerDef={game.offer_definition} />
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {/* Team A */}
            <div className="space-y-1.5">
              <div className="text-xs text-orange-500 uppercase tracking-widest font-medium">{game.team_a_name}</div>
              {teamAEvents.length === 0 ? (
                <div className="text-xs text-stone-600 italic p-2">No activity yet</div>
              ) : (
                teamAEvents.map((e) => (
                  <EventRow key={e.id} event={e} teamAName={game.team_a_name} teamBName={game.team_b_name} myTeamId={myTeamId} offerDef={game.offer_definition} />
                ))
              )}
            </div>
            {/* Team B */}
            <div className="space-y-1.5">
              <div className="text-xs text-cyan-500 uppercase tracking-widest font-medium">{game.team_b_name}</div>
              {teamBEvents.length === 0 ? (
                <div className="text-xs text-stone-600 italic p-2">No activity yet</div>
              ) : (
                teamBEvents.map((e) => (
                  <EventRow key={e.id} event={e} teamAName={game.team_a_name} teamBName={game.team_b_name} myTeamId={myTeamId} offerDef={game.offer_definition} />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="text-xs text-stone-500 uppercase tracking-widest font-medium">Activity</div>
          {reversed.length === 0 ? (
            <div className="rounded-xl bg-stone-900 border border-stone-700 p-4 text-center text-sm text-stone-500 italic">
              The ritual has not yet begun.
            </div>
          ) : (
            reversed.map((e) => (
              <EventRow key={e.id} event={e} teamAName={game.team_a_name} teamBName={game.team_b_name} myTeamId={myTeamId} offerDef={game.offer_definition} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
