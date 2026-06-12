"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePlayer, storeSession } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { LiveProgress } from "@/components/game/LiveProgress";
import { GameLayout } from "@/components/layout/GameLayout";
import type { DbGame, DbGameEvent } from "@/types/database";
import { relativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

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

  const { session, setSession, isLoaded } = usePlayer();

  const [game, setGame] = useState<DbGame | null>(null);
  const [events, setEvents] = useState<DbGameEvent[]>([]);
  const [teamProgress, setTeamProgress] = useState<import("@/types/database").DbTeamProgress[]>([]);
  // Server-verified team — resolves even when localStorage is stale (shared incognito session)
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

    // Resolve the actual team from the player list — session.teamId can be stale
    // when two players share the same browser (incognito testing).
    if (gameRes.ok && session?.playerId) {
      const gameData = await gameRes.json();
      const me = (gameData.players ?? []).find(
        (p: { id: string; team_id: string | null }) => p.id === session.playerId
      );
      if (me?.team_id) {
        setServerTeamId(me.team_id);
        // Heal the localStorage session if it drifted
        if (me.team_id !== session.teamId) {
          const healed = { ...session, teamId: me.team_id as import("@/types/content").TeamId };
          setSession(healed);
          storeSession(healed);
        }
      }
    }
  }, [gameId, session, setSession]);

  useEffect(() => {
    if (isLoaded && gameId) fetchData();
  }, [isLoaded, gameId, fetchData]);

  useRealtimeGame(gameId ?? undefined, fetchData);

  if (!isLoaded || !session) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400">Loading…</p>
      </div>
    );
  }

  if (!game || !gameId) return null;

  // Use server-verified team for navigation; fall back to session only for host
  const myTeamId = session.isHost ? null : (serverTeamId ?? session.teamId ?? null);
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

  return (
    <GameLayout
      gameId={gameId}
      teamId={myTeamId ?? undefined}
      title="Dashboard"
    >
      {/* Game started banner — pinned at top */}
      {gameStartedEvent && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-950/60 border border-amber-700/50 px-4 py-2 mb-4 text-sm text-amber-300">
          <span>🏁</span>
          <span className="font-medium">The Ritual has begun</span>
          <span className="text-amber-600 text-xs ml-auto">{relativeTime(gameStartedEvent.created_at)}</span>
        </div>
      )}

      {/* Host GM banner */}
      {session.isHost && (
        <Link
          href={`/game/${gameId}/host`}
          className="flex items-center gap-3 rounded-xl bg-amber-900/40 border border-amber-700/60 px-4 py-3 mb-4 hover:bg-amber-900/60 transition-colors"
        >
          <span className="text-xl">🎮</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-amber-500 font-bold uppercase tracking-widest">Game Master</div>
            <div className="text-sm font-bold text-amber-300">Host Controls →</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-stone-500">Code</div>
            <div className="font-mono font-bold text-amber-400 text-sm tracking-widest">{game.code}</div>
          </div>
        </Link>
      )}

      {/* Role banner */}
      {myRoleData && (
        <div className="rounded-xl bg-purple-950/70 border-2 border-purple-500 p-4 mb-4 animate-pulse">
          <div className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-1">🎲 You have been assigned a role!</div>
          <div className="text-lg font-bold text-purple-200">{myRoleData.label}</div>
          <div className="text-sm text-purple-300 mt-1">{myRoleData.effect}</div>
          <div className="text-xs text-purple-500 mt-2">This role was assigned by the host. Everyone can see it in the activity feed.</div>
        </div>
      )}

      {/* Team action button — uses server-verified team */}
      {myTeamId && (
        <Link
          href={`/game/${gameId}/team/${myTeamId}`}
          className="block w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-center py-4 rounded-xl transition-colors border border-amber-400 mb-4"
        >
          🗺️ Go to {teamName}&apos;s Quest Board →
        </Link>
      )}

      {/* Quick links — Case File + Boss Fight */}
      {myTeamId && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link
            href={`/game/${gameId}/case-file?team=${myTeamId}`}
            className="rounded-xl bg-stone-800 border border-stone-600 p-3 text-center hover:bg-stone-700 transition-colors"
          >
            <div className="text-2xl mb-1">📁</div>
            <div className="text-sm font-medium text-stone-200">Case File</div>
            <div className="text-xs text-stone-500">Your clues</div>
          </Link>
          <Link
            href={`/game/${gameId}/boss/locked-cooler?team=${myTeamId}`}
            className="rounded-xl bg-stone-800 border border-stone-600 p-3 text-center hover:bg-stone-700 transition-colors"
          >
            <div className="text-2xl mb-1">🔒</div>
            <div className="text-sm font-medium text-stone-200">Boss Fight</div>
            <div className="text-xs text-stone-500">The Locked Cooler</div>
          </Link>
        </div>
      )}

      {/* Live progress */}
      <div className="mb-4">
        <h3 className="text-xs text-stone-500 uppercase tracking-widest mb-2 font-medium">
          Live Progress
        </h3>
        <LiveProgress
          gameId={gameId}
          myTeamId={myTeamId as import("@/types/content").TeamId | null}
          teamAName={game.team_a_name}
          teamBName={game.team_b_name}
        />
      </div>

      {/* Activity feed */}
      <ActivityFeed
        events={events}
        game={game}
        teamProgress={teamProgress}
        myTeamId={myTeamId}
        isHost={session.isHost}
      />

    </GameLayout>
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
  const border = color === "orange" ? "border-orange-700/60" : "border-cyan-700/60";
  const bg = color === "orange" ? "bg-orange-950/40" : "bg-cyan-950/40";
  const accent = color === "orange" ? "text-orange-300" : "text-cyan-300";
  const dimAccent = color === "orange" ? "text-orange-500" : "text-cyan-500";
  const barFill = color === "orange" ? "bg-orange-500" : "bg-cyan-500";

  return (
    <div className={cn("rounded-xl p-3 border flex-1", bg, border, isMe && "ring-1 ring-offset-1 ring-offset-stone-950", isMe && (color === "orange" ? "ring-orange-600" : "ring-cyan-600"))}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-bold text-white text-sm">{label}</div>
          {isMe && <div className={cn("text-xs font-medium", accent)}>You</div>}
        </div>
        <div className="text-right">
          <div className={cn("text-xl font-bold leading-none", accent)}>🍺 {offerSpent}</div>
          <div className={cn("text-xs", dimAccent)}>sips taken</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-stone-400">
        <span>✅ {rooms} rooms</span>
      </div>
      <div className="mt-2 h-1.5 bg-stone-700 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", barFill)} style={{ width: `${Math.min(100, offerSpent * 10)}%` }} />
      </div>
      <div className={cn("text-xs mt-1 italic truncate", dimAccent)}>{offerSpent > 0 ? `${offerSpent}× ${offerDef}` : "No sips yet"}</div>
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
