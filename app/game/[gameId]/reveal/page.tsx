"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { getCulpritReveal } from "@/lib/game/actions";

type RevealStage = "loading" | "radio-words" | "building" | "culprit" | "done";

const RADIO_LINES = [
  "The last one to take it…",
  "…will always be the one to finish it.",
  "You've been here before.",
  "You know who.",
];

export default function RevealPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { session } = usePlayer();
  const playerId = session?.playerId ?? null;

  const [stage, setStage] = useState<RevealStage>("loading");
  const [radioLineIndex, setRadioLineIndex] = useState(0);
  const [culpritName, setCulpritName] = useState<string | null>(null);
  const [isCulprit, setIsCulprit] = useState(false);

  // Fetch culprit once
  const fetchCulprit = useCallback(async () => {
    if (!gameId) return;
    const result = await getCulpritReveal(gameId);
    if (result.success && result.data) {
      setCulpritName(result.data.culpritName);
      setIsCulprit(result.data.culpritPlayerId === playerId);
    }
  }, [gameId, playerId]);

  useEffect(() => {
    fetchCulprit();
  }, [fetchCulprit]);

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
            ? "You knew. You always knew. You just hadn't admitted it yet."
            : `${culpritName ?? "They"} took the last one. While everyone else was settling in.`}
        </p>
        <p className="text-stone-600 text-xs mt-4">
          Nørrestrand 48A, Hou. Some summers, a week 28–30. Every year, one cold beer less.
        </p>

        <div className="mt-10 border-t border-stone-800 pt-6">
          <p className="text-stone-600 text-xs">The Last Cold Beer — 2026</p>
        </div>
      </div>
    </div>
  );
}
