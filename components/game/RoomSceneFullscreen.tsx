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
  // Act 1 — The Arrival
  driveway:          "/rooms/driveway.png",
  terrace:           "/rooms/terrace.png",
  garden:            "/rooms/garden.png",
  shed:              "/rooms/shed.png",
  "petanque-court":  "/rooms/petanque-court.png",
  carport:           "/rooms/carport.png",
  "front-door":      "/rooms/front-door.png",

  // Act 2 — Settling In
  "double-room":     "/rooms/double-room.png",
  "single-room":     "/rooms/single-room.png",
  "bunk-room":       "/rooms/bunk-room.png",
  "living-room":     "/rooms/living-room.png",
  sunroom:           "/rooms/sunroom.png",
  "dining-room":     "/rooms/dining-room.png",
  "kitchen-act2":    "/rooms/kitchen-act2.png",
  "the-toilet":      "/rooms/the-toilet.png",
  "activity-room":   "/rooms/activity-room.png",
  "darts-board":     "/rooms/darts-board.png",
  "foosball-table":  "/rooms/foosball-table.png",

  // Act 3 — The Late Night
  "dining-room-dark":  "/rooms/dining-room-dark.png",
  "utility-corner":    "/rooms/utility-corner.png",
  "back-corridor":     "/rooms/back-corridor.png",
  "fuse-box":          "/rooms/fuse-box.png",
  "kitchen-dark":      "/rooms/kitchen-dark.png",
  "broken-window":     "/rooms/broken-window.png",
  "door-nobody-tried": "/rooms/door-nobody-tried.png",
  "meter-cupboard":    "/rooms/meter-cupboard.png",
  "sealed-wall":       "/rooms/sealed-wall.png",
  "behind-the-shed":   "/rooms/behind-the-shed.png",
  conservatory:        "/rooms/conservatory.png",
  "shed-dark":         "/rooms/shed-dark.png",
  "living-room-boss":  "/rooms/living-room-boss.png",
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
