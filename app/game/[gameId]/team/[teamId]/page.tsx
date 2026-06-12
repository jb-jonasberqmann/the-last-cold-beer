"use client";

import { useEffect, useState, useCallback } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { unlockRoom } from "@/lib/game/actions";
import { GameLayout } from "@/components/layout/GameLayout";
import { RoomCard } from "@/components/game/RoomCard";
import type { DbGame, DbRoomProgress, DbQuestProgress } from "@/types/database";
import type { TeamId } from "@/types/content";
import { getRoomsByChapter, getChapter, getRequiredQuestsByRoom } from "@/content/index";

interface Props {
  params: { gameId: string; teamId: TeamId };
}

export default function TeamQuestBoardPage({ params }: Props) {
  const gameId = params.gameId;
  const teamId = params.teamId;

  const { session } = usePlayer();

  const [game, setGame] = useState<DbGame | null>(null);
  const [roomProgress, setRoomProgress] = useState<DbRoomProgress[]>([]);
  const [questProgress, setQuestProgress] = useState<DbQuestProgress[]>([]);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!gameId || !teamId) return;
    const res = await fetch(`/api/game/${gameId}/progress?teamId=${teamId}`);
    if (!res.ok) return;
    const data = await res.json();
    setGame(data.game);
    setRoomProgress(data.roomProgress ?? []);
    setQuestProgress(data.questProgress ?? []);
  }, [gameId, teamId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeGame(gameId ?? undefined, fetchData);

  if (!game || !gameId || !teamId) return null;

  const chapter = getChapter(game.current_chapter_id);
  const rooms = chapter ? getRoomsByChapter(chapter.id) : [];
  const teamName = teamId === "team-a" ? game.team_a_name : game.team_b_name;
  // Trust the URL, not the session — localStorage can be stale when testing
  // with multiple players on the same browser. Host (isHost=true) observes only.
  const canInteract = !session?.isHost;

  const getRoomStatus = (roomId: string): DbRoomProgress["status"] => {
    const rp = roomProgress.find((r) => r.room_id === roomId);
    return rp?.status ?? "locked";
  };

  const getQuestsStats = (roomId: string) => {
    const required = getRequiredQuestsByRoom(roomId, teamId);
    const completed = questProgress.filter(
      (qp) => qp.room_id === roomId && qp.status === "completed"
    ).length;
    return { total: required.length, completed };
  };

  const handleUnlockRoom = async (roomId: string) => {
    setUnlocking(roomId);
    const result = await unlockRoom(gameId, teamId, roomId);
    setUnlocking(null);
    if (result.success) {
      setMessage(`Room unlocked! ${result.data.offerCost > 0 ? `(${result.data.offerCost} Offer paid)` : ""}`);
      fetchData();
    } else {
      setMessage(result.error);
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <GameLayout
      gameId={gameId}
      teamId={teamId}
      backHref={`/game/${gameId}/dashboard`}
      backLabel="Dashboard"
      title={`${teamName} — Quest Board`}
    >
      {/* Chapter header */}
      <div className="rounded-xl bg-gradient-to-r from-amber-950 to-stone-900 border border-amber-700/40 p-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{chapter?.theme.emoji ?? "🏡"}</span>
          <div>
            <div className="text-xs text-stone-400 uppercase tracking-widest">
              {chapter?.title ?? "Chapter 1"}
            </div>
            <p className="text-sm text-stone-300 mt-0.5">{chapter?.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {message && (
        <div className="rounded-lg bg-stone-800 border border-stone-600 px-4 py-2 mb-4 text-sm text-stone-200">
          {message}
        </div>
      )}

      {/* Rooms grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {rooms.map((room) => {
          const status = getRoomStatus(room.id);
          const { total, completed } = getQuestsStats(room.id);
          return (
            <div key={room.id}>
              <RoomCard
                room={room}
                status={status}
                gameId={gameId}
                teamId={teamId}
                questsCompleted={completed}
                questsTotal={total}
              />
              {status === "locked" && canInteract && (() => {
                const prereqsComplete = room.unlockRequires.every(
                  (req) => getRoomStatus(req) === "complete"
                );
                if (!prereqsComplete) return null;
                return (
                  <button
                    onClick={() => handleUnlockRoom(room.id)}
                    disabled={unlocking === room.id}
                    className="w-full mt-1 text-xs bg-amber-700/40 hover:bg-amber-700/60 text-amber-300 border border-amber-700/50 rounded-lg px-2 py-1 transition-colors disabled:opacity-50"
                  >
                    {unlocking === room.id
                      ? "Unlocking…"
                      : room.unlockCost > 0
                      ? `🍺 Unlock (${room.unlockCost} Offer)`
                      : "🔓 Unlock"}
                  </button>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* Boss room link */}
      {chapter && (
        <div className="rounded-xl bg-gradient-to-r from-red-950 to-stone-900 border border-red-800/50 p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            <div className="flex-1">
              <div className="text-xs text-stone-400 uppercase tracking-widest">Chapter Boss</div>
              <div className="font-bold text-white">The Locked Cooler</div>
              <div className="text-xs text-stone-400 mt-0.5">
                Complete rooms to unlock boss abilities
              </div>
            </div>
            {canInteract && (
              <a
                href={`/game/${gameId}/boss/${chapter.bossId}?team=${teamId}`}
                className="text-sm bg-red-700/50 hover:bg-red-700/70 text-red-300 border border-red-700/50 rounded-lg px-3 py-2 transition-colors"
              >
                Fight →
              </a>
            )}
          </div>
        </div>
      )}
    </GameLayout>
  );
}
