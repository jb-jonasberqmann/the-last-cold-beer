"use client";

import { useState, useCallback, useRef } from "react";
import type { SlidingPuzzleConfig } from "@/types/content";

interface Props {
  config: SlidingPuzzleConfig;
  isComplete: boolean;
  isReadOnly: boolean;
  onComplete: () => void;
}

// ── Puzzle logic ──────────────────────────────────────────────────────────────

const GAP = 5; // px gap between tiles

function buildSolved(size: number): number[] {
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
    return countInversions(tiles) % 2 === 0;
  } else {
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

function getMovableIndices(tiles: number[], size: number): number[] {
  const blankIdx = tiles.indexOf(0);
  const bRow = Math.floor(blankIdx / size);
  const bCol = blankIdx % size;
  const movable: number[] = [];
  if (bRow > 0) movable.push(blankIdx - size);
  if (bRow < size - 1) movable.push(blankIdx + size);
  if (bCol > 0) movable.push(blankIdx - 1);
  if (bCol < size - 1) movable.push(blankIdx + 1);
  return movable;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SlidingPuzzleQuest({ config, isComplete, isReadOnly, onComplete }: Props) {
  const { size, label, solvedText } = config;

  const [tiles, setTiles] = useState<number[]>(() => shuffleTiles(size));
  const [moves, setMoves] = useState(0);
  const [justSolved, setJustSolved] = useState(false);

  // Touch tracking for swipe support
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Cell size: fill most of the card width.
  // The quest card is roughly min(100vw - 48px, 440px). Use 88px cells for 3×3, 66px for 4×4.
  const cellPx = size === 3 ? 88 : 66;
  const gridPx = cellPx * size + GAP * (size - 1);

  const movableIndices = getMovableIndices(tiles, size);

  const slideTile = useCallback((idx: number) => {
    if (isReadOnly || isComplete || justSolved) return;
    if (!getMovableIndices(tiles, size).includes(idx)) return;

    const blankIdx = tiles.indexOf(0);
    const next = [...tiles];
    [next[idx], next[blankIdx]] = [next[blankIdx], next[idx]];
    setTiles(next);
    setMoves((m) => m + 1);

    if (isSolved(next, size)) {
      setJustSolved(true);
      setTimeout(() => onComplete(), 900);
    }
  }, [tiles, isComplete, isReadOnly, justSolved, onComplete, size]);

  // Swipe handler: swipe direction → slide tile opposite to blank
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return; // too small — treat as tap

    const blankIdx = tiles.indexOf(0);
    const bRow = Math.floor(blankIdx / size);
    const bCol = blankIdx % size;

    // Swipe RIGHT → tile to the LEFT of blank slides right
    // Swipe LEFT  → tile to the RIGHT of blank slides left
    // Swipe DOWN  → tile ABOVE blank slides down
    // Swipe UP    → tile BELOW blank slides up
    let targetIdx = -1;
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx > 0 && bCol > 0) targetIdx = blankIdx - 1;
      else if (dx < 0 && bCol < size - 1) targetIdx = blankIdx + 1;
    } else {
      if (dy > 0 && bRow > 0) targetIdx = blankIdx - size;
      else if (dy < 0 && bRow < size - 1) targetIdx = blankIdx + size;
    }

    if (targetIdx !== -1) slideTile(targetIdx);
  };

  const handleReset = () => {
    setTiles(shuffleTiles(size));
    setMoves(0);
    setJustSolved(false);
  };

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
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Label + move counter */}
      <div className="w-full flex items-center justify-between px-1">
        <span className="text-[11px] uppercase tracking-widest text-amber-700/70" style={{ fontFamily: "Georgia,serif" }}>
          {label}
        </span>
        <span className="text-[11px] text-stone-500" style={{ fontFamily: "Georgia,serif" }}>
          {moves} move{moves !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Puzzle grid — uses absolute positioning so CSS transitions animate the slide */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative",
          width: gridPx,
          height: gridPx,
          touchAction: "none", // prevent page scroll while swiping puzzle
        }}
      >
        {/* Render tile VALUES as keys — React keeps DOM nodes alive across swaps → CSS transition fires */}
        {Array.from({ length: size * size - 1 }, (_, i) => i + 1).map((value) => {
          const idx = tiles.indexOf(value);
          const row = Math.floor(idx / size);
          const col = idx % size;
          const isMovable = movableIndices.includes(idx);

          return (
            <button
              key={value}
              onPointerDown={(e) => {
                // Prevent default so browser doesn't also fire click on long-press
                e.currentTarget.releasePointerCapture(e.pointerId);
              }}
              onClick={() => slideTile(idx)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: cellPx,
                height: cellPx,
                borderRadius: 10,
                // The slide animation — transform changes when idx changes, CSS transitions it
                transform: `translate(${col * (cellPx + GAP)}px, ${row * (cellPx + GAP)}px)`,
                transition: "transform 140ms cubic-bezier(0.25,0.46,0.45,0.94)",
                border: isMovable
                  ? "1.5px solid rgba(220,160,40,0.75)"
                  : "1.5px solid rgba(80,60,20,0.3)",
                background: isMovable
                  ? "rgba(55,38,6,0.95)"
                  : "rgba(24,18,4,0.88)",
                color: isMovable ? "rgb(251,191,36)" : "rgba(160,120,50,0.5)",
                fontSize: size === 3 ? 30 : 22,
                fontWeight: "bold",
                fontFamily: "Georgia,serif",
                cursor: isMovable ? "pointer" : "default",
                boxShadow: isMovable
                  ? "0 3px 10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,200,60,0.12)"
                  : "0 1px 4px rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              {value}
            </button>
          );
        })}

        {/* Blank slot (visual only) */}
        {(() => {
          const blankIdx = tiles.indexOf(0);
          const row = Math.floor(blankIdx / size);
          const col = blankIdx % size;
          return (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: cellPx,
                height: cellPx,
                borderRadius: 10,
                transform: `translate(${col * (cellPx + GAP)}px, ${row * (cellPx + GAP)}px)`,
                border: "1.5px dashed rgba(80,55,10,0.18)",
                background: "rgba(8,6,2,0.35)",
                pointerEvents: "none",
              }}
            />
          );
        })()}
      </div>

      {/* Hint + reset */}
      <div className="w-full flex items-center justify-between px-1 mt-0.5">
        <span className="text-[10px] text-stone-700 italic" style={{ fontFamily: "Georgia,serif" }}>
          Tap or swipe to slide
        </span>
        <button
          onClick={handleReset}
          className="text-[10px] text-stone-600 active:text-amber-600 transition-colors"
          style={{ fontFamily: "Georgia,serif", padding: "4px 0" }}
        >
          ↺ Reshuffle
        </button>
      </div>

      {justSolved && (
        <div
          className="w-full rounded-xl px-4 py-3 text-center border border-emerald-700/50"
          style={{ background: "rgba(6,30,14,0.95)", fontFamily: "Georgia,serif" }}
        >
          <div className="text-emerald-400 font-bold text-sm">✓ Solved! Recording…</div>
        </div>
      )}
    </div>
  );
}
