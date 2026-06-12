"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePlayer } from "@/hooks/usePlayer";
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

  const { session, isLoaded } = usePlayer();

  const [game, setGame] = useState<DbGame | null>(null);
  const [events, setEvents] = useState<DbGameEvent[]>([]);

  const fetchData = useCallback(async () => {
    if (!gameId) return;
    const res = await fetch(`/api/game/${gameId}/progress`);
    if (!res.ok) return;
    const data = await res.json();
    setGame(data.game);
    setEvents(data.events ?? []);
  }, [gameId]);

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

  const teamName = session.teamId === "team-a" ? game.team_a_name : game.team_b_name;

  // Find the most recent role assigned to this player
  const myRole = [...events]
    .reverse()
    .find((e) => {
      if (e.event_type !== "role_assigned") return false;
      const d = e.event_data as Record<string, unknown> | null;
      return d?.player_id === session.playerId;
    });
  const myRoleData = myRole?.event_data as { label: string; effect: string } | null ?? null;

  return (
    <GameLayout
      gameId={gameId}
      teamId={session.teamId ?? undefined}
      title="Dashboard"
    >
      {/* Chapter banner */}
      <div className="rounded-xl bg-gradient-to-r from-amber-950 to-stone-900 border border-amber-700/50 p-4 mb-4 text-center">
        <div className="text-2xl mb-1">🏡</div>
        <div className="text-xs text-stone-400 uppercase tracking-widest mb-0.5">Chapter 1</div>
        <h2 className="text-lg font-bold text-amber-400 font-game">Arrival</h2>
        <p className="text-xs text-stone-400 mt-1">
          Something is wrong with the fridge.
        </p>
      </div>

      {/* Role banner — shown when host assigns a strawman or other role */}
      {myRoleData && (
        <div className="rounded-xl bg-purple-950/70 border-2 border-purple-500 p-4 mb-4 animate-pulse">
          <div className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-1">🎲 You have been assigned a role!</div>
          <div className="text-lg font-bold text-purple-200">{myRoleData.label}</div>
          <div className="text-sm text-purple-300 mt-1">{myRoleData.effect}</div>
          <div className="text-xs text-purple-500 mt-2">This role was assigned by the host. Everyone can see it in the activity feed.</div>
        </div>
      )}

      {/* Live progress comparison */}
      <div className="mb-4">
        <h3 className="text-xs text-stone-500 uppercase tracking-widest mb-2 font-medium">
          Live Progress
        </h3>
        <LiveProgress
          gameId={gameId}
          myTeamId={session.teamId ?? "team-a"}
          teamAName={game.team_a_name}
          teamBName={game.team_b_name}
        />
      </div>

      {/* Team action button */}
      {session.teamId && (
        <Link
          href={`/game/${gameId}/team/${session.teamId}`}
          className="block w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-center py-4 rounded-xl transition-colors border border-amber-400 mb-4"
        >
          🗺️ Go to {teamName}&apos;s Quest Board →
        </Link>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link
          href={`/game/${gameId}/case-file?team=${session.teamId}`}
          className="rounded-xl bg-stone-800 border border-stone-600 p-3 text-center hover:bg-stone-700 transition-colors"
        >
          <div className="text-2xl mb-1">📁</div>
          <div className="text-sm font-medium text-stone-200">Case File</div>
          <div className="text-xs text-stone-500">Your clues</div>
        </Link>
        <Link
          href={`/game/${gameId}/boss/locked-cooler?team=${session.teamId}`}
          className="rounded-xl bg-stone-800 border border-stone-600 p-3 text-center hover:bg-stone-700 transition-colors"
        >
          <div className="text-2xl mb-1">🔒</div>
          <div className="text-sm font-medium text-stone-200">Boss Fight</div>
          <div className="text-xs text-stone-500">The Locked Cooler</div>
        </Link>
      </div>

      {/* Activity feed */}
      <div>
        <h3 className="text-xs text-stone-500 uppercase tracking-widest mb-2 font-medium">
          Activity Feed
        </h3>
        {events.length === 0 ? (
          <div className="rounded-xl bg-stone-900 border border-stone-700 p-4 text-center text-sm text-stone-500 italic">
            The ritual has not yet begun.
          </div>
        ) : (
          <div className="space-y-1.5">
            {[...events].reverse().map((event) => {
              const isTeamA = event.team_id === "team-a";
              const isTeamB = event.team_id === "team-b";
              const isMyTeam = event.team_id === session.teamId;
              const teamName = isTeamA ? game.team_a_name : isTeamB ? game.team_b_name : null;
              const { icon, text, detail } = eventLabel(event, game.offer_definition);

              return (
                <div
                  key={event.id}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-2 border",
                    event.event_type === "game_started"
                      ? "bg-amber-950/60 border-amber-600/60 text-amber-200"
                      : isTeamA
                        ? "bg-orange-950/40 border-orange-700/50 text-orange-200"
                        : isTeamB
                          ? "bg-cyan-950/40 border-cyan-700/50 text-cyan-200"
                          : "bg-stone-900/50 border-stone-700/50 text-stone-300"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base leading-none flex-shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <span className="font-medium">{text}</span>
                      {detail && <span className="text-xs opacity-60 ml-1.5">{detail}</span>}
                      {teamName && (
                        <span className={cn(
                          "text-xs ml-1.5 font-semibold",
                          isTeamA ? "text-orange-400" : "text-cyan-400"
                        )}>
                          — {teamName}{isMyTeam ? " (you)" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-stone-600 flex-shrink-0 ml-2">
                    {relativeTime(event.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Host link */}
      {session.isHost && (
        <div className="mt-4 pt-4 border-t border-stone-800">
          <Link
            href={`/game/${gameId}/host`}
            className="text-sm text-stone-500 hover:text-stone-300 transition-colors"
          >
            🎮 Host Controls →
          </Link>
        </div>
      )}
    </GameLayout>
  );
}
