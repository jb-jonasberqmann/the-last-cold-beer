"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { GameLayout } from "@/components/layout/GameLayout";
import { ClueCard } from "@/components/game/ClueCard";
import { getClue } from "@/content/clues";
import type { DbGame, DbTeamClue } from "@/types/database";
import type { TeamId } from "@/types/content";

interface Props {
  params: { gameId: string };
}

// Separate component so useSearchParams is inside a Suspense boundary (Next.js 14 requirement)
function CaseFileContent({ gameId }: { gameId: string }) {
  const searchParams = useSearchParams();
  const { session } = usePlayer();
  const teamId = (searchParams.get("team") ?? session?.teamId ?? "team-a") as TeamId;

  const [game, setGame] = useState<DbGame | null>(null);
  const [teamClues, setTeamClues] = useState<DbTeamClue[]>([]);

  const fetchData = useCallback(async () => {
    if (!gameId) return;
    const res = await fetch(`/api/game/${gameId}/progress?teamId=${teamId}`);
    if (!res.ok) return;
    const data = await res.json();
    setGame(data.game);
    setTeamClues(data.clues ?? []);
  }, [gameId, teamId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!game || !gameId) return null;

  const teamName = teamId === "team-a" ? game.team_a_name : game.team_b_name;
  const discoveredClues = teamClues
    .map((tc) => ({ clue: getClue(tc.clue_id), discoveredAt: tc.discovered_at }))
    .filter((c) => c.clue !== undefined);

  const keyClues = discoveredClues.filter((c) => c.clue!.isKeyClue);
  const otherClues = discoveredClues.filter((c) => !c.clue!.isKeyClue);

  return (
    <GameLayout
      gameId={gameId}
      teamId={teamId}
      backHref={`/game/${gameId}/dashboard`}
      backLabel="Dashboard"
      title={`${teamName} — Case File`}
    >
      <div className="rounded-xl bg-gradient-to-br from-amber-950 to-stone-900 border border-amber-700/50 p-4 mb-5 text-center">
        <div className="text-3xl mb-2">📁</div>
        <h1 className="text-xl font-bold text-amber-400 font-game">Case File</h1>
        <p className="text-sm text-stone-400 mt-1">{teamName}</p>
        <div className="mt-2 text-sm text-amber-300 font-medium">
          {discoveredClues.length} clue{discoveredClues.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {discoveredClues.length === 0 ? (
        <div className="rounded-xl bg-stone-900 border border-stone-700 p-8 text-center">
          <div className="text-3xl mb-3 opacity-40">🔍</div>
          <p className="text-stone-500 italic">No clues found yet.</p>
          <p className="text-xs text-stone-600 mt-1">
            Complete quests and explore rooms to discover clues.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {keyClues.length > 0 && (
            <div>
              <h2 className="text-xs text-amber-500 uppercase tracking-widest font-medium mb-2">
                🔑 Key Clues
              </h2>
              <div className="space-y-3">
                {keyClues.map(({ clue, discoveredAt }) => (
                  <ClueCard key={clue!.id} clue={clue!} discoveredAt={discoveredAt} />
                ))}
              </div>
            </div>
          )}
          {otherClues.length > 0 && (
            <div>
              <h2 className="text-xs text-stone-500 uppercase tracking-widest font-medium mb-2">
                Evidence
              </h2>
              <div className="space-y-3">
                {otherClues.map(({ clue, discoveredAt }) => (
                  <ClueCard key={clue!.id} clue={clue!} discoveredAt={discoveredAt} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </GameLayout>
  );
}

export default function CaseFilePage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <CaseFileContent gameId={params.gameId} />
    </Suspense>
  );
}
