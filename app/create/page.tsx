"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGame } from "@/lib/game/actions";
import { storeSession } from "@/hooks/usePlayer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const OFFER_PRESETS = [
  { label: "3 sips", value: "3 sips" },
  { label: "5 sips", value: "5 sips" },
  { label: "Half a drink", value: "half a drink" },
  { label: "One full drink", value: "one full drink" },
  { label: "One shared team toast", value: "one shared team toast" },
  { label: "Alcohol-free (custom)", value: "one sip of your drink (non-alcoholic OK)" },
];

export default function CreatePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [hostName, setHostName] = useState("");
  const [offerPreset, setOfferPreset] = useState(OFFER_PRESETS[2].value);
  const [customOffer, setCustomOffer] = useState("");
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");
  const [error, setError] = useState("");

  const offerDefinition = customOffer.trim() || offerPreset;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) {
      setError("Enter your name.");
      return;
    }

    startTransition(async () => {
      const result = await createGame(
        hostName.trim(),
        offerDefinition,
        teamAName.trim() || "Team A",
        teamBName.trim() || "Team B"
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      storeSession({
        playerId: result.data.hostPlayerId,
        gameId: result.data.gameId,
        gameCode: result.data.gameCode,
        teamId: null,
        playerName: hostName.trim(),
        isHost: true,
      });

      router.push(`/game/${result.data.gameId}/lobby`);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 to-stone-900 text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏕️</div>
          <h1 className="text-2xl font-bold font-game text-amber-400 mb-1">Host a Game</h1>
          <p className="text-stone-400 text-sm">Set up the cabin. Define the Offer. Begin the ritual.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Host name */}
          <Input
            label="Your name (the host)"
            placeholder="e.g. Jonas"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
          />

          {/* Team names */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Team A name"
              placeholder="Team A"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
            />
            <Input
              label="Team B name"
              placeholder="Team B"
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
            />
          </div>

          {/* Offer definition */}
          <div className="space-y-3">
            <label className="block text-sm text-stone-300 font-medium">
              What does 1 Offer mean?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OFFER_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    setOfferPreset(preset.value);
                    setCustomOffer("");
                  }}
                  className={`rounded-lg px-3 py-2 text-sm text-left border transition-colors ${
                    offerPreset === preset.value && !customOffer
                      ? "bg-amber-700/50 border-amber-500 text-amber-300"
                      : "bg-stone-800 border-stone-600 text-stone-300 hover:border-stone-400"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <Input
              placeholder="Or type a custom definition…"
              value={customOffer}
              onChange={(e) => setCustomOffer(e.target.value)}
            />
            <div className="rounded-lg bg-stone-800 border border-stone-700 px-3 py-2">
              <span className="text-xs text-stone-400">Current: </span>
              <span className="text-sm text-amber-400 font-medium">
                1 Offer = {offerDefinition}
              </span>
            </div>
          </div>

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
            Create Game Room →
          </Button>
        </form>

        <p className="text-center text-xs text-stone-600 mt-6">
          Players will join using a 6-character room code.
        </p>
      </div>
    </div>
  );
}
