"use client";

/**
 * RoomSceneFullscreen — uses actual AI-generated room artwork as full-screen backgrounds.
 * Files must exist in /public/rooms/{roomId}.png
 * Falls back to a dark gradient with room icon if no image is available.
 */

import React from "react";
import type { Room } from "@/types/content";
import { cn } from "@/lib/utils";

interface Props {
  room: Room;
  /** "hit" flashes green, "miss" flashes red */
  combatState?: "idle" | "hit" | "miss";
  className?: string;
}

const ROOM_IMAGES: Record<string, string> = {
  kitchen:        "/rooms/kitchen.png",
  fridge:         "/rooms/fridge.png",
  terrace:        "/rooms/terrace.png",
  shed:           "/rooms/shed.png",
  "coffee-table": "/rooms/coffee-table.png",
};

export function RoomSceneFullscreen({ room, combatState = "idle", className }: Props) {
  const imageSrc = ROOM_IMAGES[room.id];

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>

      {imageSrc ? (
        /* ── Photo background — no extra vignette; room page handles it ── */
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        /* ── Fallback gradient ── */
        <DefaultScene room={room} />
      )}

      {/* Combat flash overlays */}
      {combatState === "hit" && (
        <div className="absolute inset-0 bg-green-500/25 animate-hit-flash pointer-events-none z-10" />
      )}
      {combatState === "miss" && (
        <div className="absolute inset-0 bg-red-500/20 animate-miss-flash pointer-events-none z-10" />
      )}
    </div>
  );
}

// ── Fallback scene ────────────────────────────────────────────
function DefaultScene({ room }: { room: Room }) {
  return (
    <div className="absolute inset-0">
      <div
        className={cn("absolute inset-0 bg-gradient-to-br opacity-70", room.look.colorFrom, room.look.colorTo)}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="text-[8rem] opacity-10">{room.look.icon}</div>
      </div>
    </div>
  );
}
