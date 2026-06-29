"use client";

import { useState, useEffect, useCallback } from "react";
import type { SlidingPuzzleConfig } from "@/types/content";

interface Props {
  config: SlidingPuzzleConfig;
  isComplete: boolean;
  isReadOnly: boolean;
  onComplete: () => void;
}

// ── Puzzle logic ──────────────────────────────────────────────────────────────

function buildSolved(size: number): number[] {
  // [1, 2, 3, ..., n*n-1, 0]  — 0 is the blank
  const total = size * size;
  return Array.from({ length: total }, (_, i) => (i === total - 1 ? 0 : i + 1));
}

function countInversions(tiles: number[]): number {
  const arr = tiles.filter((t) => t !== 0);
  let inv = 0;
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] > arr[j]) inv++;
  return inv;
}

function isSolvable(tiles: number[], size: number): boolean {
  if (size % 2 === 1) {
    // Odd grid: solvable iff even inversions
    return countInversions(tiles) % 2 === 0;
  } else {
    // Even grid: solvable depends on blank row from bottom
    const blankRow = Math.floor(tiles.indexOf(0) / size);
    const blankFromBottom = size - blankRow;
    const inv = countInversions(tiles);
    return blankFromBottom % 2 === 0 ? inv % 2 === 1 : inv % 2 === 0;
  }
}

function shuffleTiles(size: number): number[] {
  const solved = buildSolved(size);
  let arr: number[];
  do {
    arr = [...solved];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (!isSolvable(arr, size) || JSON.stringify(arr) === JSON.stringify(solved));
  return arr;
}

function isSolved(tiles: number[], size: number): boolean {
  const solved = buildSolved(size);
  return tiles.every((t, i) => t === solved[i]);
}

function getMovableTiles(tiles: number[], size: number): number[] {
  const blankIdx = tiles.indexOf(0);
  const bRow = Math.floor(blankIdx / size);
  const bCol = blankIdx % size;
  const movable: number[] = [];
  if (bRow > 0) movable.push(blankIdx - size); // above
  if (bRow < size - 1) movable.push(blankIdx + size); // below
  if (bCol > 0) movable.push(blankIdx - 1); // left
  if (bCol < size - 1) movable.push(blankIdx + 1); // right
  return movable;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SlidingPuzzleQuest({ config, isComplete, isReadOnly, onComplete }: Props) {
  const { size, label, solvedText } = config;
  const total = size * size;

  const [tiles, setTiles] = useState<number[]>(() => shuffleTiles(size));
  const [moves, setMoves] = useState(0);
  const [justSolved, setJustSolved] = useState(false);
  const [flash, setFlash] = useState<number | null>(null); // tile index that was just tapped

  const movableTiles = getMovableTiles(tiles, size);

  const handleTap = useCallback((idx: number) => {
    if (isReadOnly || isComplete || justSolved) return;
    if (!movableTiles.includes(idx)) return;

    const blankIdx = tiles.indexOf(0);
    const next = [...tiles];
    [next[idx], next[blankIdx]] = [next[blankIdx], next[idx]];
    setFlash(idx);
    setTimeout(() => setFlash(null), 150);
    setTiles(next);
    setMoves((m) => m + 1);

    if (isSolved(next, size)) {
      setJustSolved(true);
      setTimeout(() => onComplete(), 800);
    }
  }, [tiles, movableTiles, isComplete, isReadOnly, justSolved, onComplete, size]);

  const handleReset = () => {
    setTiles(shuffleTiles(size));
    setMoves(0);
    setJustSolved(false);
  };

  // Cell size based on screen — we use a fixed-width container
  const cellPx = size === 3 ? 84 : 64;
  const gridPx = cellPx * size + (size - 1) * 4; // gap of 4px between tiles

  if (isComplete) {
    return (
      <div
        className="rounded-xl px-4 py-5 text-center border border-emerald-800/40"
        style={{ background: "rgba(6,24,12,0.85)", fontFamily: "Georgia,serif" }}
      >
        <div className="text-3xl mb-2">✓</div>
        <div className="text-sm font-bold text-emerald-400 mb-1">Puzzle Solved!</div>
        <div className="text-xs text-emerald-700 leading-relaxed">{solvedText}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Label + move counter */}
      <div className="w-full flex items-center justify-between px-1">
        <span className="text-[11px] uppercase tracking-widest text-amber-700/70" style={{ fontFamily: "Georgia,serif" }}>
          {label}
        </span>
        <span className="text-[11px] text-stone-600" style={{ fontFamily: "Georgia,serif" }}>
          {moves} move{moves !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
          gap: "4px",
          width: gridPx,
        }}
      >
        {tiles.map((tile, idx) => {
          const isBlank = tile === 0;
          const isMovable = movableTiles.includes(idx);
          const isFlashing = flash === idx;

          return (
            <button
              key={idx}
              onClick={() => handleTap(idx)}
              disabled={isBlank || !isMovable || isReadOnly}
              style={{
                width: cellPx,
                height: cellPx,
                borderRadius: 8,
                border: isBlank
                  ? "1px dashed rgba(80,60,20,0.2)"
                  : isMovable
                  ? "1px solid rgba(220,160,40,0.6)"
                  : "1px solid rgba(80,60,20,0.35)",
                background: isBlank
                  ? "rgba(10,8,4,0.3)"
                  : isFlashing
                  ? "rgba(200,140,20,0.5)"
                  : isMovable
                  ? "rgba(60,40,8,0.9)"
                  : "rgba(28,20,6,0.85)",
                color: isMovable ? "rgb(251,191,36)" : "rgba(180,130,50,0.55)",
                fontSize: size === 3 ? 28 : 22,
                fontWeight: "bold",
                fontFamily: "Georgia,serif",
                cursor: isBlank || !isMovable ? "default" : "pointer",
                transition: "background 0.12s, transform 0.08s",
                transform: isFlashing ? "scale(0.93)" : "scale(1)",
                boxShadow: isMovable && !isBlank ? "0 2px 8px rgba(0,0,0,0.5)" : "none",
              }}
            >
              {isBlank ? "" : tile}
            </button>
          );
        })}
      </div>

      {/* Instructions + reset */}
      <div className="w-full flex items-center justify-between px-1 mt-1">
        <span className="text-[10px] text-stone-700 italic" style={{ fontFamily: "Georgia,serif" }}>
          Tap a highlighted tile to slide it
        </span>
        <button
          onClick={handleReset}
          className="text-[10px] text-stone-600 hover:text-amber-700 transition-colors"
          style={{ fontFamily: "Georgia,serif" }}
        >
          ↺ Reshuffle
        </button>
      </div>

      {justSolved && (
        <div
          className="w-full rounded-xl px-4 py-3 text-center border border-emerald-700/50 animate-quest-fade"
          style={{ background: "rgba(6,30,14,0.95)", fontFamily: "Georgia,serif" }}
        >
          <div className="text-emerald-400 font-bold text-sm">✓ Solved! Recording…</div>
        </div>
      )}
    </div>
  );
}
