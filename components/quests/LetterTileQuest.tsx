"use client";

// LetterTileQuest — "Wheel of Fortune" style letter-tile puzzle. Tap letters
// from the bank to fill slots left-to-right; each slot that lands on the
// correct letter for its position lights up immediately. Tap a filled slot
// to send that letter back to the bank. Once every slot is correctly filled,
// onComplete() fires (the caller — completeQuest — needs no extra proof;
// the finished board IS the proof, same pattern as the sliding puzzle).

import { useState, useMemo } from "react";
import type { LetterTilesConfig } from "@/types/content";

interface Props {
  config: LetterTilesConfig;
  isComplete: boolean;
  isReadOnly: boolean;
  onComplete: () => void;
}

export default function LetterTileQuest({ config, isComplete, isReadOnly, onComplete }: Props) {
  const target = config.targetWord.toUpperCase();
  // slots[i] = index into `letters` currently occupying slot i, or null if empty
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(target.length).fill(null));
  const [solved, setSolved] = useState(isComplete);
  const [justSolved, setJustSolved] = useState(false);

  const usedIndices = useMemo(() => new Set(slots.filter((s): s is number => s !== null)), [slots]);
  const bankIndices = useMemo(
    () => config.letters.map((_, i) => i).filter((i) => !usedIndices.has(i)),
    [config.letters, usedIndices]
  );

  const placeLetter = (letterIdx: number) => {
    if (isReadOnly || solved) return;
    const nextEmpty = slots.findIndex((s) => s === null);
    if (nextEmpty === -1) return;
    const next = [...slots];
    next[nextEmpty] = letterIdx;
    setSlots(next);

    if (next.every((s) => s !== null)) {
      const assembled = next.map((i) => config.letters[i as number]).join("");
      if (assembled === target) {
        setSolved(true);
        setJustSolved(true);
        onComplete();
      }
    }
  };

  const clearSlot = (slotIdx: number) => {
    if (isReadOnly || solved) return;
    const next = [...slots];
    next[slotIdx] = null;
    setSlots(next);
  };

  if (solved) {
    return (
      <div className="flex flex-wrap gap-1.5 justify-center py-2">
        {target.split("").map((ch, i) => (
          <div
            key={i}
            className="w-9 h-11 rounded-lg flex items-center justify-center font-black text-lg"
            style={{
              background: "linear-gradient(160deg, #fde68a, #f59e0b)",
              color: "#1a0e00",
              boxShadow: justSolved ? "0 0 18px rgba(251,191,36,0.8)" : "0 2px 8px rgba(0,0,0,0.4)",
              animation: justSolved ? `tlcb-tile-glow 0.5s ease-out ${i * 60}ms both` : undefined,
            }}
          >
            {ch}
          </div>
        ))}
        <style>{`
          @keyframes tlcb-tile-glow {
            0% { transform: scale(0.7); opacity: 0; box-shadow: 0 0 0 rgba(251,191,36,0); }
            60% { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Slots */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {slots.map((letterIdx, i) => {
          const filled = letterIdx !== null;
          const correct = filled && config.letters[letterIdx as number] === target[i];
          return (
            <button
              key={i}
              onClick={() => clearSlot(i)}
              disabled={!filled || isReadOnly}
              className="w-9 h-11 rounded-lg flex items-center justify-center font-black text-lg transition-all duration-300"
              style={{
                background: !filled
                  ? "rgba(255,255,255,0.04)"
                  : correct
                  ? "linear-gradient(160deg, #fde68a, #f59e0b)"
                  : "rgba(180,60,60,0.35)",
                border: !filled ? "1px dashed rgba(180,130,50,0.35)" : "1px solid rgba(251,191,36,0.5)",
                color: !filled ? "transparent" : correct ? "#1a0e00" : "rgb(255,220,220)",
                boxShadow: correct ? "0 0 14px rgba(251,191,36,0.65)" : "none",
              }}
            >
              {filled ? config.letters[letterIdx as number] : "·"}
            </button>
          );
        })}
      </div>

      {/* Bank */}
      <div className="flex flex-wrap gap-1.5 justify-center pt-2 border-t" style={{ borderColor: "rgba(180,130,50,0.15)" }}>
        {bankIndices.map((i) => (
          <button
            key={i}
            onClick={() => placeLetter(i)}
            disabled={isReadOnly}
            className="w-9 h-11 rounded-lg flex items-center justify-center font-black text-lg active:scale-90 transition-transform"
            style={{
              background: "rgba(28,20,8,0.9)",
              border: "1px solid rgba(180,130,50,0.3)",
              color: "rgba(245,235,205,0.95)",
            }}
          >
            {config.letters[i]}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-center" style={{ color: "rgba(180,130,50,0.5)" }}>
        Tap a letter to place it. Tap a filled slot to take it back.
      </p>
    </div>
  );
}
