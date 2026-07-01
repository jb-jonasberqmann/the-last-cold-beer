"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { assignPlayerToTeam, hostForceRoomStatus, hostResetBoss, assignRandomRole, rebalanceTeams } from "@/lib/game/actions";
import { Button } from "@/components/ui/Button";
import type { DbGame, DbPlayer, DbTeamProgress, DbBossProgress } from "@/types/database";

interface Props {
  params: { gameId: string };
}

export default function HostPage({ params }: Props) {
  const gameId = params.gameId;
  const router = useRouter();

  const { session, isLoaded } = usePlayer();
  const [game, setGame] = useState<DbGame | null>(null);
  const [players, setPlayers] = useState<DbPlayer[]>([]);
  const [teamProgressA, setTeamProgressA] = useState<DbTeamProgress | null>(null);
  const [teamProgressB, setTeamProgressB] = useState<DbTeamProgress | null>(null);
  const [bossA, setBossA] = useState<DbBossProgress | null>(null);
  const [bossB, setBossB] = useState<DbBossProgress | null>(null);
  const [message, setMessage] = useState<string>("");

  const fetchAll = useCallback(async () => {
    if (!gameId) return;
    const [gameRes, progressRes] = await Promise.all([
      fetch(`/api/game/${gameId}`),
      fetch(`/api/game/${gameId}/progress`),
    ]);
    if (!gameRes.ok || !progressRes.ok) return;
    const [gameData, progressData] = await Promise.all([gameRes.json(), progressRes.json()]);

    setGame(gameData.game);
    setPlayers(gameData.players ?? []);
    const tpRows: DbTeamProgress[] = progressData.teamProgress ?? [];
    setTeamProgressA(tpRows.find((t) => t.team_id === "team-a") ?? null);
    setTeamProgressB(tpRows.find((t) => t.team_id === "team-b") ?? null);
    const bossRows: DbBossProgress[] = progressData.bossProgress ?? [];
    setBossA(bossRows.find((b) => b.team_id === "team-a") ?? null);
    setBossB(bossRows.find((b) => b.team_id === "team-b") ?? null);
  }, [gameId]);

  useEffect(() => { if (gameId) fetchAll(); }, [gameId, fetchAll]);

  // Wait for session to load from sessionStorage before checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!session?.isHost) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400">
        Host access only.
      </div>
    );
  }

  if (!game || !gameId) return null;

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleForceUnlock = async (roomId: string, teamId: "team-a" | "team-b") => {
    await hostForceRoomStatus(gameId, teamId, roomId, "unlocked");
    showMessage(`Room ${roomId} unlocked for ${teamId}`);
    fetchAll();
  };

  const handleForceComplete = async (roomId: string, teamId: "team-a" | "team-b") => {
    await hostForceRoomStatus(gameId, teamId, roomId, "complete");
    showMessage(`Room ${roomId} forced complete for ${teamId}`);
    fetchAll();
  };

  const handleResetBoss = async (teamId: "team-a" | "team-b") => {
    await hostResetBoss(gameId, teamId, "mads", 100);
    showMessage(`Boss reset for ${teamId}`);
    fetchAll();
  };

  const allRooms = ["driveway", "terrace", "garden", "shed", "petanque-court"];

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-stone-950/95 border-b border-amber-900/30 px-4 py-3 flex items-center gap-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 12px)" }}>
        <button
          onClick={() => router.push(`/game/${gameId}/dashboard`)}
          className="text-amber-700 hover:text-amber-400 text-sm transition-colors"
          style={{ fontFamily: "Georgia,serif" }}
        >
          ← Dashboard
        </button>
        <h1 className="font-bold text-amber-200 flex-1 text-center" style={{ fontFamily: "Georgia,serif", letterSpacing: "0.05em" }}>
          Host Controls
        </h1>
        <div className="w-16" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Game info */}
        <div className="rounded-xl bg-stone-800 border border-stone-600 p-4 space-y-2">
          <h2 className="font-bold text-white">Game State</h2>
          <div className="text-sm text-stone-300 space-y-1">
            <div>Code: <span className="font-mono text-amber-400">{game.code}</span></div>
            <div>Status: <span className="text-amber-400">{game.status}</span></div>
            <div>Chapter: <span className="text-amber-400">{game.current_chapter_id}</span></div>
            <div>1 Offer = <span className="text-amber-300">{game.offer_definition}</span></div>
          </div>
        </div>

        {message && (
          <div className="rounded-lg bg-green-950/50 border border-green-700 px-3 py-2 text-sm text-green-300">
            ✓ {message}
          </div>
        )}

        {/* Players + Strawman */}
        <div className="rounded-xl bg-stone-800 border border-stone-600 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">Players ({players.length})</h2>
            <button
              onClick={async () => {
                await rebalanceTeams(gameId);
                showMessage("Teams rebalanced — players split evenly by join order.");
                fetchAll();
              }}
              className="text-xs bg-amber-800/60 hover:bg-amber-700/80 border border-amber-700/50 text-amber-300 px-2 py-1 rounded font-medium"
            >
              ⚖️ Rebalance
            </button>
          </div>
          <p className="text-xs text-stone-500 mb-3">🎲 Strawman = random role • ⚖️ Rebalance = auto-split teams evenly</p>
          <div className="space-y-2">
            {players.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1 text-stone-300">
                  {p.name}
                  {p.is_host && <span className="text-amber-500 ml-1">(host)</span>}
                </span>
                <span className="text-stone-500 text-xs">{p.team_id ?? "unassigned"}</span>
                <button
                  onClick={() => assignPlayerToTeam(p.id, "team-a").then(fetchAll)}
                  className="text-xs bg-stone-700 hover:bg-stone-600 px-2 py-0.5 rounded text-stone-300"
                >→ A</button>
                <button
                  onClick={() => assignPlayerToTeam(p.id, "team-b").then(fetchAll)}
                  className="text-xs bg-stone-700 hover:bg-stone-600 px-2 py-0.5 rounded text-stone-300"
                >→ B</button>
                {!p.is_host && (
                  <button
                    onClick={async () => {
                      const r = await assignRandomRole(gameId, p.id, p.name);
                      if (r.success) showMessage(`🎲 ${p.name} is now: ${r.data.role} — ${r.data.effect}`);
                    }}
                    className="text-xs bg-purple-800/60 hover:bg-purple-700/80 border border-purple-700/50 text-purple-300 px-2 py-0.5 rounded"
                  >🎲 Strawman</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Team progress */}
        <div className="rounded-xl bg-stone-800 border border-stone-600 p-4">
          <h2 className="font-bold text-white mb-3">Progress Overview</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {([
              { tid: "team-a", name: game.team_a_name, tp: teamProgressA },
              { tid: "team-b", name: game.team_b_name, tp: teamProgressB },
            ] as const).map(({ tid, name, tp }) => (
              <div key={tid} className="space-y-1">
                <div className="font-bold text-stone-200">{name}</div>
                <div className="text-stone-400">Rooms: {tp?.rooms_completed ?? 0}</div>
                <div className="text-stone-400">Clues: {tp?.clues_found ?? 0}</div>
                <div className="text-stone-400">Offer: {tp?.offer_spent ?? 0}</div>
                <div className="text-stone-400">Status: {tp?.status ?? "—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Force room actions */}
        <div className="rounded-xl bg-stone-800 border border-stone-600 p-4">
          <h2 className="font-bold text-white mb-1">Force Room State</h2>
          <p className="text-xs text-stone-500 mb-3">Use if game state gets stuck.</p>
          <div className="space-y-2">
            {allRooms.map((roomId) => (
              <div key={roomId} className="flex items-center gap-2 text-xs">
                <span className="text-stone-300 flex-1 font-mono">{roomId}</span>
                <button
                  onClick={() => handleForceUnlock(roomId, "team-a")}
                  className="bg-stone-700 hover:bg-stone-600 px-2 py-1 rounded text-stone-300"
                >A:unlock</button>
                <button
                  onClick={() => handleForceComplete(roomId, "team-a")}
                  className="bg-stone-700 hover:bg-stone-600 px-2 py-1 rounded text-green-400"
                >A:done</button>
                <button
                  onClick={() => handleForceUnlock(roomId, "team-b")}
                  className="bg-stone-700 hover:bg-stone-600 px-2 py-1 rounded text-stone-300"
                >B:unlock</button>
                <button
                  onClick={() => handleForceComplete(roomId, "team-b")}
                  className="bg-stone-700 hover:bg-stone-600 px-2 py-1 rounded text-green-400"
                >B:done</button>
              </div>
            ))}
          </div>
        </div>

        {/* Boss controls */}
        <div className="rounded-xl bg-stone-800 border border-stone-600 p-4">
          <h2 className="font-bold text-white mb-3">Boss Controls</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-stone-300 mb-1">{game.team_a_name}</div>
              <div className="text-xs text-stone-400 mb-2">
                HP: {bossA?.current_hp ?? "Not started"} | Status: {bossA?.status ?? "—"}
              </div>
              <button
                onClick={() => handleResetBoss("team-a")}
                className="text-xs bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-300 px-2 py-1 rounded"
              >
                Reset Boss
              </button>
            </div>
            <div>
              <div className="text-sm text-stone-300 mb-1">{game.team_b_name}</div>
              <div className="text-xs text-stone-400 mb-2">
                HP: {bossB?.current_hp ?? "Not started"} | Status: {bossB?.status ?? "—"}
              </div>
              <button
                onClick={() => handleResetBoss("team-b")}
                className="text-xs bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-300 px-2 py-1 rounded"
              >
                Reset Boss
              </button>
            </div>
          </div>
        </div>

        <Button variant="ghost" className="w-full" onClick={fetchAll}>
          ↻ Refresh Data
        </Button>
      </div>
      </div>
    </div>
  );
}
