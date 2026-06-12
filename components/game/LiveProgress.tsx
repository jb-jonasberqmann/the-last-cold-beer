"use client";

import { useEffect, useState, useCallback } from "react";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import type { DbTeamProgress, DbBossProgress } from "@/types/database";
import type { TeamId } from "@/types/content";
import { cn } from "@/lib/utils";

interface LiveProgressProps {
  gameId: string;
  myTeamId: TeamId | null;
  teamAName: string;
  teamBName: string;
  className?: string;
}

interface TeamSnapshot {
  progress: DbTeamProgress | null;
  boss: DbBossProgress | null;
}

const STATUS_LABELS: Record<string, string> = {
  exploring: "Exploring",
  solving: "Solving puzzle",
  at_boss: "⚔️ At the boss",
  waiting: "Waiting",
  chapter_complete: "✅ Chapter done",
};

const STATUS_COLORS: Record<string, string> = {
  exploring: "text-amber-400",
  solving: "text-blue-400",
  at_boss: "text-red-400",
  waiting: "text-stone-400",
  chapter_complete: "text-green-400",
};

function TeamCard({
  name,
  teamId,
  snapshot,
  isMe,
}: {
  name: string;
  teamId: TeamId;
  snapshot: TeamSnapshot;
  isMe: boolean | null;
}) {
  const { progress, boss } = snapshot;
  const hpPercent =
    boss && boss.max_hp > 0
      ? Math.round((boss.current_hp / boss.max_hp) * 100)
      : null;

  return (
    <div
      className={cn(
        "rounded-xl p-3 border flex-1 min-w-0",
        isMe
          ? "bg-amber-950/60 border-amber-600"
          : "bg-stone-900/60 border-stone-600"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{teamId === "team-a" ? "🍺" : "🧊"}</span>
        <div className="min-w-0">
          <div className="font-bold text-sm truncate text-white">{name}</div>
          {isMe && <div className="text-xs text-amber-400 font-medium">You</div>}
        </div>
      </div>

      {progress ? (
        <div className="space-y-1.5">
          <div className={cn("text-xs font-medium", STATUS_COLORS[progress.status] ?? "text-stone-300")}>
            {STATUS_LABELS[progress.status] ?? progress.status}
          </div>
          <div className="grid grid-cols-3 gap-1 text-center">
            <StatPill label="Rooms" value={progress.rooms_completed} />
            <StatPill label="Clues" value={progress.clues_found} />
            <StatPill label="Offer" value={progress.offer_spent} />
          </div>
          {boss && boss.status === "active" && hpPercent !== null && (
            <div className="mt-1.5">
              <div className="flex justify-between text-xs text-stone-400 mb-0.5">
                <span>Boss HP</span>
                <span className="text-red-400">{hpPercent}%</span>
              </div>
              <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>
          )}
          {boss && boss.status === "defeated" && (
            <div className="text-xs text-green-400 font-medium mt-1">✅ Boss defeated</div>
          )}
        </div>
      ) : (
        <div className="text-xs text-stone-500 italic">No progress yet</div>
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-black/20 rounded-lg py-1 px-1">
      <div className="text-sm font-bold text-white">{value}</div>
      <div className="text-xs text-stone-400">{label}</div>
    </div>
  );
}

export function LiveProgress({
  gameId,
  myTeamId,
  teamAName,
  teamBName,
  className,
}: LiveProgressProps) {
  const [teamA, setTeamA] = useState<TeamSnapshot>({ progress: null, boss: null });
  const [teamB, setTeamB] = useState<TeamSnapshot>({ progress: null, boss: null });

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/game/${gameId}/progress`);
    if (!res.ok) return;
    const data = await res.json();

    const getProgress = (tid: TeamId): DbTeamProgress | null =>
      (data.teamProgress as DbTeamProgress[])?.find((p) => p.team_id === tid) ?? null;
    const getBossForTeam = (tid: TeamId): DbBossProgress | null =>
      (data.bossProgress as DbBossProgress[])?.find((b) => b.team_id === tid) ?? null;

    setTeamA({ progress: getProgress("team-a"), boss: getBossForTeam("team-a") });
    setTeamB({ progress: getProgress("team-b"), boss: getBossForTeam("team-b") });
  }, [gameId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeGame(gameId, fetchData);

  return (
    <div className={cn("flex gap-3", className)}>
      <TeamCard name={teamAName} teamId="team-a" snapshot={teamA} isMe={myTeamId === "team-a"} />
      <TeamCard name={teamBName} teamId="team-b" snapshot={teamB} isMe={myTeamId === "team-b"} />
    </div>
  );
}
