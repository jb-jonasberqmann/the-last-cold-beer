"use client";

// Global visual effect for the Sunroom's "sun-blind" dare (Act 2).
// Mounted once in the root layout so it applies no matter which screen
// the affected player is on — quest board, room view, boss fight, etc.
// Purely visual (pointer-events: none) so it never blocks a player from
// completing their own actions; it just makes everything hard to read,
// which is the point. Clears automatically server-side the moment the
// team reaches the Act 2 boss (see clearSunBlindForTeam).

import { useCallback, useEffect, useState } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { useRealtimeGame } from "@/hooks/useRealtimeGame";
import type { DbPlayer } from "@/types/database";

export function SunBlindOverlay() {
  const { session, isLoaded } = usePlayer();
  const [isBlind, setIsBlind] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!session?.gameId || !session?.teamId || !session?.playerId) {
      setIsBlind(false);
      return;
    }
    try {
      const res = await fetch(`/api/game/${session.gameId}/progress?teamId=${session.teamId}`);
      if (!res.ok) return;
      const data = await res.json();
      const players: DbPlayer[] = data.players ?? [];
      const me = players.find((p) => p.id === session.playerId);
      setIsBlind(me?.player_status === "sun_blind");
    } catch {
      // non-fatal — just skip this poll
    }
  }, [session?.gameId, session?.teamId, session?.playerId]);

  // Immediate check on load/session-change, then re-checked every 5s via the
  // app's existing realtime-poll pattern — so the effect clears within one
  // poll cycle of the boss-page reset firing.
  useEffect(() => {
    if (isLoaded) checkStatus();
  }, [isLoaded, checkStatus]);
  useRealtimeGame(session?.gameId, checkStatus);

  if (!isBlind) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        backdropFilter: "blur(6px) brightness(1.15)",
        WebkitBackdropFilter: "blur(6px) brightness(1.15)",
        background:
          "radial-gradient(circle at 50% 40%, rgba(255,244,214,0.18) 0%, rgba(20,15,5,0.35) 75%)",
      }}
    >
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "auto",
          background: "rgba(20,15,5,0.85)",
          border: "1px solid rgba(220,180,80,0.4)",
          color: "rgba(245,225,170,0.9)",
          fontFamily: "Georgia, serif",
          fontSize: "12px",
          padding: "6px 14px",
          borderRadius: "999px",
          whiteSpace: "nowrap",
        }}
        title="You stared into the low sun in the sunroom. You can't see straight until the house goes dark — and you still have to fetch drinks when asked."
      >
        🌇 Sun-blind — clears when the house goes dark
      </div>
    </div>
  );
}
