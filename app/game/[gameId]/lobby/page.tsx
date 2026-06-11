"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { storeSession } from "@/hooks/usePlayer";
import { useRealtimeLobby } from "@/hooks/useRealtimeGame";
import { startGame, assignPlayerToTeam, renameTeam, joinGame } from "@/lib/game/actions";
import { Button } from "@/components/ui/Button";
import type { DbGame, DbPlayer } from "@/types/database";
import type { TeamId } from "@/types/content";

interface Props {
  params: { gameId: string };
}

export default function LobbyPage({ params }: Props) {
  const gameId = params.gameId;

  const { session, setSession, isLoaded } = usePlayer();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [game, setGame] = useState<DbGame | null>(null);
  const [players, setPlayers] = useState<DbPlayer[]>([]);
  const [teamAEdit, setTeamAEdit] = useState("");
  const [teamBEdit, setTeamBEdit] = useState("");
  const [editingTeam, setEditingTeam] = useState<TeamId | null>(null);

  // Inline join state (shown when visitor has no session for this game)
  const [joinName, setJoinName] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const fetchLobby = useCallback(async () => {
    if (!gameId) return;
    const res = await fetch(`/api/game/${gameId}`);
    if (!res.ok) return;
    const data = await res.json();
    setGame(data.game);
    setPlayers(data.players ?? []);
    if (data.game?.status === "active" && session?.gameId === gameId) {
      router.push(`/game/${gameId}/dashboard`);
    }
  }, [gameId, router, session]);

  // Always fetch on load regardless of session
  useEffect(() => {
    if (isLoaded && gameId) fetchLobby();
  }, [isLoaded, gameId, fetchLobby]);

  // Polling for all visitors — they need to see player list too
  useRealtimeLobby(gameId ?? undefined, fetchLobby);

  const needsToJoin = isLoaded && (!session || session.gameId !== gameId);
  const isHost = !needsToJoin && (session?.isHost ?? false);

  const shareUrl = typeof window !== "undefined" && game
    ? `${window.location.origin}/join/${game.code}`
    : "";

  const handleInlineJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim()) { setJoinError("Enter your name."); return; }
    if (!game) return;
    setIsJoining(true);
    setJoinError("");
    try {
      const result = await joinGame(game.code, joinName.trim());
      if (!result.success) {
        setJoinError(result.error ?? "Could not join. Try again.");
        setIsJoining(false);
        return;
      }
      storeSession({
        playerId: result.data.playerId,
        gameId: result.data.gameId,
        gameCode: game.code,
        teamId: result.data.teamId,
        playerName: joinName.trim(),
        isHost: false,
      });
      setSession({
        playerId: result.data.playerId,
        gameId: result.data.gameId,
        gameCode: game.code,
        teamId: result.data.teamId,
        playerName: joinName.trim(),
        isHost: false,
      });
      await fetchLobby();
    } catch {
      setJoinError("Connection error — check your network.");
    }
    setIsJoining(false);
  };

  const handleStartGame = () => {
    if (!gameId) return;
    startTransition(async () => {
      const result = await startGame(gameId);
      if (result.success) {
        router.push(`/game/${gameId}/dashboard`);
      }
    });
  };

  const handleMovePlayer = async (playerId: string, teamId: TeamId) => {
    await assignPlayerToTeam(playerId, teamId);
    if (session && playerId === session.playerId) {
      setSession({ ...session, teamId });
    }
    fetchLobby();
  };

  const handleRenameTeam = async (teamId: TeamId) => {
    if (!gameId) return;
    const newName = teamId === "team-a" ? teamAEdit : teamBEdit;
    if (!newName.trim()) return;
    await renameTeam(gameId, teamId, newName.trim());
    setEditingTeam(null);
    fetchLobby();
  };

  const teamA = players.filter((p) => p.team_id === "team-a");
  const teamB = players.filter((p) => p.team_id === "team-b");
  const unassigned = players.filter((p) => !p.team_id);

  // ── Loading ──────────────────────────────────────────────────────────
  if (!game) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-stone-400 text-center">
          <div className="text-3xl mb-2">🍺</div>
          Loading…
        </div>
      </div>
    );
  }

  // ── Inline join form ─────────────────────────────────────────────────
  if (needsToJoin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-950 to-stone-900 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🚪</div>
            <h1 className="text-2xl font-bold font-game text-amber-400 mb-1">Join the Ritual</h1>
            <div className="inline-block bg-stone-800 rounded-xl px-4 py-2 border border-stone-600 mt-2">
              <span className="text-stone-400 text-sm mr-2">Room Code:</span>
              <span className="font-mono font-bold text-amber-400 text-lg tracking-widest">{game.code}</span>
            </div>
            <p className="text-stone-500 text-xs mt-3">
              {players.length} player{players.length !== 1 ? "s" : ""} already waiting
            </p>
          </div>

          <form onSubmit={handleInlineJoin} className="space-y-4">
            <input
              type="text"
              value={joinName}
              onChange={(e) => { setJoinError(""); setJoinName(e.target.value); }}
              placeholder="Your name"
              maxLength={24}
              autoFocus
              className="w-full bg-stone-800 border border-stone-600 rounded-xl px-4 py-4 text-white text-center text-lg placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {joinError && (
              <p className="text-red-400 text-sm text-center bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
                {joinError}
              </p>
            )}
            <button
              type="submit"
              disabled={isJoining}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-colors text-lg"
            >
              {isJoining ? "Joining…" : "Enter the Cabin →"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Lobby ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 to-stone-900 text-white p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <div className="text-3xl mb-2">🏕️</div>
          <h1 className="text-xl font-bold font-game text-amber-400">The Cabin Awaits</h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="bg-stone-800 rounded-xl px-4 py-2 border border-stone-600">
              <span className="text-stone-400 text-xs mr-2">Room Code:</span>
              <span className="font-mono font-bold text-amber-400 text-lg tracking-widest">
                {game.code}
              </span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors bg-amber-950/40 rounded-lg px-3 py-2 border border-amber-700/60 font-medium"
            >
              📋 Share Join Link
            </button>
          </div>
        </div>

        {/* Offer definition */}
        <div className="rounded-xl bg-amber-950/40 border border-amber-700/50 p-3 mb-4 text-sm text-center">
          <span className="text-stone-400">1 Offer = </span>
          <span className="text-amber-300 font-medium">{game.offer_definition}</span>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(["team-a", "team-b"] as TeamId[]).map((teamId) => {
            const name = teamId === "team-a" ? game.team_a_name : game.team_b_name;
            const members = teamId === "team-a" ? teamA : teamB;
            const editValue = teamId === "team-a" ? teamAEdit : teamBEdit;
            const setEdit = teamId === "team-a" ? setTeamAEdit : setTeamBEdit;

            return (
              <div key={teamId} className="rounded-xl bg-stone-800/50 border border-stone-600 p-3">
                {editingTeam === teamId && isHost ? (
                  <div className="flex gap-1 mb-2">
                    <input
                      className="flex-1 bg-stone-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      value={editValue}
                      onChange={(e) => setEdit(e.target.value)}
                      placeholder={name}
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameTeam(teamId)}
                      className="text-xs bg-amber-600 hover:bg-amber-500 text-black px-2 rounded"
                    >✓</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mb-2">
                    <h3 className="font-bold text-white text-sm flex-1">{name}</h3>
                    {isHost && (
                      <button
                        onClick={() => { setEditingTeam(teamId); setEdit(name); }}
                        className="text-xs text-stone-500 hover:text-stone-300"
                      >✏️</button>
                    )}
                  </div>
                )}
                <div className="space-y-1">
                  {members.length === 0 ? (
                    <p className="text-xs text-stone-600 italic">No players yet</p>
                  ) : (
                    members.map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <span className="text-sm text-stone-300">
                          {p.name}
                          {p.is_host && <span className="text-xs text-amber-500 ml-1">(host)</span>}
                          {p.id === session?.playerId && <span className="text-xs text-blue-400 ml-1">(you)</span>}
                        </span>
                        {isHost && (
                          <button
                            onClick={() => handleMovePlayer(p.id, teamId === "team-a" ? "team-b" : "team-a")}
                            className="text-xs text-stone-500 hover:text-white ml-auto"
                            title="Move to other team"
                          >⇄</button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Unassigned */}
        {unassigned.length > 0 && (
          <div className="rounded-xl bg-stone-800/30 border border-stone-700 p-3 mb-4">
            <h3 className="text-xs text-stone-500 mb-2 font-medium uppercase tracking-wide">Unassigned</h3>
            <div className="space-y-1">
              {unassigned.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-sm text-stone-400">{p.name}</span>
                  {isHost && (
                    <div className="ml-auto flex gap-1">
                      <button
                        onClick={() => handleMovePlayer(p.id, "team-a")}
                        className="text-xs bg-stone-700 hover:bg-stone-600 px-2 py-0.5 rounded text-stone-300"
                      >→ A</button>
                      <button
                        onClick={() => handleMovePlayer(p.id, "team-b")}
                        className="text-xs bg-stone-700 hover:bg-stone-600 px-2 py-0.5 rounded text-stone-300"
                      >→ B</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start game (host only) */}
        {isHost && (
          <div className="space-y-3">
            <Button size="lg" className="w-full" onClick={handleStartGame} loading={isPending}>
              🍺 Start the Ritual
            </Button>
            {players.length < 2 && (
              <p className="text-center text-xs text-stone-500">
                Tip: share the room code so others can join before you start.
              </p>
            )}
          </div>
        )}

        {!isHost && (
          <div className="text-center text-stone-500 text-sm mt-4">
            Waiting for the host to start the game…
          </div>
        )}
      </div>
    </div>
  );
}
