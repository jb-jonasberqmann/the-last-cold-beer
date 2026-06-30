import Link from "next/link";
import type { Room } from "@/types/content";
import type { RoomStatus } from "@/types/database";
import { cn } from "@/lib/utils";

interface RoomCardProps {
  room: Room;
  status: RoomStatus;
  gameId: string;
  teamId: string;
  questsCompleted?: number;
  questsTotal?: number;
}

const statusConfig: Record<RoomStatus, { label: string; border: string; opacity: string; badge: string }> = {
  locked: {
    label: "Locked",
    border: "border-stone-700",
    opacity: "opacity-40",
    badge: "bg-stone-700 text-stone-300",
  },
  unlocked: {
    label: "Available",
    border: "border-amber-600",
    opacity: "",
    badge: "bg-amber-700/50 text-amber-300",
  },
  active: {
    label: "In Progress",
    border: "border-blue-500",
    opacity: "",
    badge: "bg-blue-700/50 text-blue-300",
  },
  complete: {
    label: "Complete",
    border: "border-green-600",
    opacity: "",
    badge: "bg-green-800/50 text-green-300",
  },
  occupied: {
    label: "Occupied",
    border: "border-rose-700",
    opacity: "opacity-50",
    badge: "bg-rose-800/50 text-rose-300",
  },
};

export function RoomCard({
  room,
  status,
  gameId,
  teamId,
  questsCompleted = 0,
  questsTotal = 0,
}: RoomCardProps) {
  const config = statusConfig[status];
  const isLocked = status === "locked";
  const isComplete = status === "complete";

  const content = (
    <div
      className={cn(
        "rounded-xl border-2 p-4 transition-all duration-200",
        `bg-gradient-to-br ${room.look.colorFrom} ${room.look.colorTo}`,
        config.border,
        config.opacity,
        !isLocked && "hover:scale-[1.02] hover:shadow-lg hover:shadow-black/40 cursor-pointer"
      )}
    >
      {/* Icon + status */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-3xl">{room.look.icon}</span>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", config.badge)}>
          {isComplete ? "✓ Done" : config.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-white text-base mb-1 font-game">
        {isLocked ? "???" : room.title}
      </h3>

      {/* Atmosphere or locked message */}
      <p className="text-xs text-stone-300 leading-relaxed line-clamp-2">
        {isLocked ? room.lockedDescription : room.look.atmosphere}
      </p>

      {/* Progress bar */}
      {!isLocked && questsTotal > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-stone-400 mb-1">
            <span>Quests</span>
            <span>{questsCompleted}/{questsTotal}</span>
          </div>
          <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isComplete ? "bg-green-400" : "bg-amber-400"
              )}
              style={{ width: `${questsTotal > 0 ? (questsCompleted / questsTotal) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Unlock cost hint */}
      {status === "unlocked" && room.unlockCost > 0 && (
        <div className="mt-2 text-xs text-amber-300">
          🍺 {room.unlockCost} Offer to enter
        </div>
      )}
    </div>
  );

  if (isLocked) return content;

  return (
    <Link href={`/game/${gameId}/team/${teamId}/room/${room.id}`}>
      {content}
    </Link>
  );
}
