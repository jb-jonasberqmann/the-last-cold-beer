"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinGame } from "@/lib/game/actions";
import { storeSession } from "@/hooks/usePlayer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Props {
  params: { code: string };
}

export default function JoinPage({ params }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const code = params.code.toUpperCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }

    startTransition(async () => {
      let result;
      try {
        result = await joinGame(code, name.trim());
      } catch (err) {
        setError("Connection error — check your network and try again.");
        console.error("joinGame threw:", err);
        return;
      }

      if (!result.success) {
        setError(result.error ?? "Unknown error joining game.");
        return;
      }

      storeSession({
        playerId: result.data.playerId,
        gameId: result.data.gameId,
        gameCode: code,
        teamId: result.data.teamId,
        playerName: name.trim(),
        isHost: false,
      });

      router.push(`/game/${result.data.gameId}/lobby`);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 to-stone-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚪</div>
          <h1 className="text-2xl font-bold font-game text-amber-400 mb-1">Join the Ritual</h1>
          <div className="inline-block bg-stone-800 rounded-xl px-4 py-2 border border-stone-600 mt-2">
            <span className="text-stone-400 text-sm mr-2">Room Code:</span>
            <span className="font-mono font-bold text-amber-400 text-lg tracking-widest">{code}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your name"
            placeholder="e.g. Erik"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          {error && (
            <p className="text-red-400 text-sm bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isPending}
          >
            Enter the Cabin →
          </Button>
        </form>

        <p className="text-center text-xs text-stone-600 mt-6">
          Teams are assigned when the host starts the game.
        </p>
      </div>
    </div>
  );
}
