"use client";

// GameTimer — small live elapsed-time readout (HH:MM:SS).
// Origin is games.started_at (set once by startGame()), so it stays in
// sync across devices/reloads — it's just a client-side ticker over a
// fixed server timestamp, not authoritative state of its own.

import { useEffect, useState } from "react";

function formatElapsed(startedAt: string): string {
  const startMs = new Date(startedAt).getTime();
  if (Number.isNaN(startMs)) return "00:00:00";
  const elapsedSec = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const h = Math.floor(elapsedSec / 3600);
  const m = Math.floor((elapsedSec % 3600) / 60);
  const s = elapsedSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function GameTimer({
  startedAt,
  className,
  style,
  icon = "⏱",
}: {
  startedAt?: string | null;
  className?: string;
  style?: React.CSSProperties;
  icon?: string | null;
}) {
  const [display, setDisplay] = useState(() => (startedAt ? formatElapsed(startedAt) : "00:00:00"));

  useEffect(() => {
    if (!startedAt) return;
    setDisplay(formatElapsed(startedAt));
    const id = setInterval(() => setDisplay(formatElapsed(startedAt)), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (!startedAt) return null;

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {icon ? `${icon} ` : ""}
      {display}
    </span>
  );
}
