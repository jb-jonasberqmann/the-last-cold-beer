"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import { getCulpritReveal, getEndingChoice, submitEndingChoice } from "@/lib/game/actions";
import type { TeamId } from "@/types/content";

type RevealStage = "loading" | "radio-words" | "building" | "culprit" | "done";

const RADIO_LINES = [
  "The last one to take it…",
  "…will always be the one to finish it.",
  "You've been here before.",
  "You know who.",
];

function RevealContent() {
  const { gameId } = useParams<{ gameId: string }>();
  const searchParams = useSearchParams();
  const { session } = usePlayer();
  const playerId = session?.playerId ?? null;
  const teamId = (searchParams.get("team") ?? session?.teamId ?? "team-a") as TeamId;

  const [stage, setStage] = useState<RevealStage>("loading");
  const [radioLineIndex, setRadioLineIndex] = useState(0);
  const [culpritName, setCulpritName] = useState<string | null>(null);
  const [isCulprit, setIsCulprit] = useState(false);

  // The culprit's final choice: drink alone (corrupted) or share a toast.
  const [endingChoice, setEndingChoice] = useState<{ choice: "alone" | "toast"; playerName: string } | null>(null);
  const [endingLoading, setEndingLoading] = useState<"alone" | "toast" | null>(null);
  const [endingError, setEndingError] = useState<string | null>(null);

  // Fetch this TEAM's culprit + ritual photo once
  const fetchCulprit = useCallback(async () => {
    if (!gameId) return;
    const result = await getCulpritReveal(gameId, teamId);
    if (result.success && result.data) {
      setCulpritName(result.data.culpritName);
      // Primary check: this browser's session was the one that took the photo.
      // Fallback: match by name. Solo/dev testing often loses the original
      // session (new tab, cleared storage, rejoining as "the same person"
      // creates a new player row) — without this, nobody could ever reach
      // the choice buttons again for that culprit. Real play is unaffected:
      // players keep their own session throughout, so the ID already matches.
      const nameMatches =
        !!session?.playerName &&
        session.playerName.trim().toLowerCase() === result.data.culpritName.trim().toLowerCase();
      setIsCulprit(result.data.culpritPlayerId === playerId || nameMatches);
    }
  }, [gameId, teamId, playerId, session?.playerName]);

  useEffect(() => {
    fetchCulprit();
  }, [fetchCulprit]);

  // Poll for the ending choice — teammates need to see it land once the
  // culprit decides, without a manual refresh.
  const fetchEndingChoice = useCallback(async () => {
    if (!gameId) return;
    const result = await getEndingChoice(gameId, teamId);
    if (result.success && result.data) setEndingChoice(result.data);
  }, [gameId, teamId]);

  useEffect(() => {
    fetchEndingChoice();
  }, [fetchEndingChoice]);

  useRealtimeGame(gameId ?? undefined, fetchEndingChoice);

  const handleEndingChoice = async (choice: "alone" | "toast") => {
    if (!gameId || !playerId) return;
    setEndingLoading(choice);
    setEndingError(null);
    const result = await submitEndingChoice(gameId, teamId, playerId, session?.playerName ?? "The culprit", choice);
    setEndingLoading(null);
    if (result.success) {
      setEndingChoice({ choice, playerName: session?.playerName ?? "The culprit" });
    } else {
      setEndingError(result.error ?? "Something went wrong.");
      fetchEndingChoice(); // in case someone else already chose
    }
  };

  // Sequence through radio lines, then reveal
  useEffect(() => {
    if (stage !== "radio-words") return;

    if (radioLineIndex < RADIO_LINES.length) {
      const timer = setTimeout(() => {
        setRadioLineIndex((i) => i + 1);
      }, 2800);
      return () => clearTimeout(timer);
    } else {
      // All lines shown — brief pause then building
      const timer = setTimeout(() => setStage("building"), 1200);
      return () => clearTimeout(timer);
    }
  }, [stage, radioLineIndex]);

  useEffect(() => {
    if (stage !== "building") return;
    const timer = setTimeout(() => setStage("culprit"), 2000);
    return () => clearTimeout(timer);
  }, [stage]);

  const startSequence = () => setStage("radio-words");

  if (stage === "loading") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-4xl mb-6">📻</div>
          <h1 className="text-white text-2xl font-bold mb-3 tracking-wide">
            YOURSELVES — Defeated
          </h1>
          <p className="text-stone-400 mb-8 text-sm leading-relaxed">
            The house has gone quiet. One question remains.
          </p>
          <button
            onClick={startSequence}
            className="bg-red-900/60 border border-red-700 text-red-200 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-800/60 transition-colors"
          >
            Hear what the radio said
          </button>
        </div>
      </div>
    );
  }

  if (stage === "radio-words") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="text-3xl mb-2">📻</div>
          {RADIO_LINES.slice(0, radioLineIndex).map((line, i) => (
            <p
              key={i}
              className="text-stone-300 text-xl italic leading-relaxed animate-fade-in"
              style={{ opacity: 1, transition: "opacity 0.8s ease" }}
            >
              {line}
            </p>
          ))}
          {radioLineIndex < RADIO_LINES.length && (
            <div className="flex gap-1 justify-center mt-8">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === "building") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <p className="text-stone-500 text-sm tracking-widest uppercase mb-6">
            Searching the house…
          </p>
          <div className="flex gap-1 justify-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
          </div>
        </div>
      </div>
    );
  }

  // culprit stage
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <p className="text-stone-500 text-xs tracking-widest uppercase mb-8">
          The last cold beer was taken by
        </p>

        <div className="relative mb-10">
          <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur-xl" />
          <div className="relative border border-amber-700/60 rounded-2xl p-8 bg-stone-950/80">
            <div className="text-5xl mb-4">🍺</div>
            <h2 className="text-amber-300 text-3xl font-bold tracking-wide mb-2">
              {culpritName ?? "…"}
            </h2>
            {isCulprit && (
              <p className="text-amber-500/80 text-sm mt-3 italic">
                That&apos;s you.
              </p>
            )}
          </div>
        </div>

        <p className="text-stone-500 text-sm leading-relaxed mb-2">
          {isCulprit
            ? "You knew. You always knew. You held the camera so no one would see your hands."
            : `${culpritName ?? "They"} took the last one. While everyone else was settling in.`}
        </p>
        <p className="text-stone-600 text-xs mt-4">
          Nørrestrand 48A, Hou. Some summers, a week 28–30. Every year, one cold beer less.
        </p>

        <div className="mt-10 border-t border-stone-800 pt-6">
          {endingChoice ? (
            <div className="text-center">
              {endingChoice.choice === "alone" ? (
                <>
                  <p className="text-red-400 text-sm font-semibold tracking-wide mb-1">🍺 Corrupted.</p>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    {endingChoice.playerName} drank alone. An extra full drink for them — and their whole team takes a sip.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-amber-300 text-sm font-semibold tracking-wide mb-1">🥂 A toast, shared.</p>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    {endingChoice.playerName} chose to share it. Everyone — both teams — raise a glass and cheer the GM.
                  </p>
                </>
              )}
            </div>
          ) : isCulprit ? (
            <div className="text-center">
              <p className="text-stone-500 text-xs tracking-widest uppercase mb-4">One last choice</p>
              <p className="text-stone-400 text-sm leading-relaxed mb-5">
                It's the last cold beer. Drink it alone — or share a toast with everyone in the game.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleEndingChoice("toast")}
                  disabled={endingLoading !== null}
                  className="bg-amber-900/40 border border-amber-700/60 text-amber-200 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-amber-800/50 transition-colors disabled:opacity-50"
                >
                  {endingLoading === "toast" ? "…" : "🥂 Share a toast with everyone"}
                </button>
                <button
                  onClick={() => handleEndingChoice("alone")}
                  disabled={endingLoading !== null}
                  className="bg-stone-900/60 border border-red-900/50 text-red-300/90 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-red-950/40 transition-colors disabled:opacity-50"
                >
                  {endingLoading === "alone" ? "…" : "🍺 Drink it alone — become corrupted"}
                </button>
              </div>
              {endingError && <p className="text-red-500 text-xs mt-3">{endingError}</p>}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-stone-600 text-xs italic mb-2">
                Waiting for {culpritName ?? "the culprit"} to decide how this ends…
              </p>
              {/* Manual fallback: if this really is {culpritName}'s device but the
                  session/name check above didn't match (new tab, cleared storage,
                  rejoined mid-game), let them claim it directly rather than being
                  stuck watching forever. */}
              <button
                onClick={() => setIsCulprit(true)}
                className="text-stone-700 text-[11px] underline decoration-dotted"
              >
                Actually, this is {culpritName ?? "the culprit"}&apos;s phone →
              </button>
            </div>
          )}
          <p className="text-stone-700 text-xs mt-6">The Last Cold Beer — 2026</p>
        </div>
      </div>
    </div>
  );
}

export default function RevealPage() {
  return (
    <Suspense fallback={null}>
      <RevealContent />
    </Suspense>
  );
}
