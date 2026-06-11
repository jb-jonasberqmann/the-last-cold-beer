"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { LiveProgress } from "@/components/game/LiveProgress";
import { GameLayout } from "@/components/layout/GameLayout";
import type { DbGame, DbGameEvent } from "@/types/database";
import { relativeTime } from "@/lib/utils";

interface Props {
  params: { gameId: string };
}

const EVENT_LABELS: Record<string, string> = {
  room_unlocked: "🔓 Unlocked a room",
  room_completed: "✅ Completed a room",
  clue_found: "🔍 Found a clue",
  quest_completed: "⭐ Quest complete",
  boss_damaged: "⚔️ Damaged the boss",
  boss_phase_changed: "🔄 Boss phase changed",
  boss_defeated: "💀 Boss defeated!",
  chapter_complete: "🎉 Chapter complete!",
  offer_paid: "🍺 Offer paid",
  game_started: "🏁 Game started",
};

export default function DashboardPage({ params }: Props) {
  const gameId = params.gameId;

  const { session, isLoaded } = usePlayer();
  const router = useRouter();

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
          <div className="space-y-1">
            {events.map((event) => {
              const isMyTeam = event.team_id === session.teamId;
              const teamLabel = event.team_id
                ? event.team_id === "team-a"
                  ? game.team_a_name
                  : game.team_b_name
                : null;

              return (
                <div
                  key={event.id}
                  className={`rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-2 border ${
                    isMyTeam
                      ? "bg-amber-950/30 border-amber-800/50 text-amber-200"
                      : "bg-stone-900/50 border-stone-700/50 text-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{EVENT_LABELS[event.event_type] ?? event.event_type}</span>
                    {teamLabel && (
                      <span className="text-xs opacity-60 truncate">— {teamLabel}</span>
                    )}
                  </div>
                  <span className="text-xs text-stone-600 flex-shrink-0">
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
