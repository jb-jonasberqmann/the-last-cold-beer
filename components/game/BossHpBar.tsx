import { cn } from "@/lib/utils";

interface BossHpBarProps {
  currentHp: number;
  maxHp: number;
  currentPhase: number;
  totalPhases: number;
  className?: string;
}

export function BossHpBar({
  currentHp,
  maxHp,
  currentPhase,
  totalPhases,
  className,
}: BossHpBarProps) {
  const hpPercent = maxHp > 0 ? (currentHp / maxHp) * 100 : 0;

  const hpColor =
    hpPercent > 60
      ? "bg-green-500"
      : hpPercent > 30
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className={cn("space-y-2", className)}>
      {/* HP numbers */}
      <div className="flex justify-between items-baseline">
        <span className="text-sm text-stone-300">
          HP:{" "}
          <span className="text-white font-bold font-mono">
            {currentHp}
          </span>
          <span className="text-stone-500">/{maxHp}</span>
        </span>
        <span className="text-sm text-stone-400">
          Phase {currentPhase}/{totalPhases}
        </span>
      </div>

      {/* Main HP bar */}
      <div className="h-5 bg-stone-800 rounded-full overflow-hidden border border-stone-600 relative">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            hpColor
          )}
          style={{ width: `${hpPercent}%` }}
        />
        {/* Phase markers */}
        {Array.from({ length: totalPhases - 1 }).map((_, i) => {
          const markerPercent = ((totalPhases - 1 - i) / totalPhases) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-0.5 bg-stone-900/80"
              style={{ left: `${markerPercent}%` }}
            />
          );
        })}
      </div>

      {/* Phase labels */}
      <div className="flex justify-between">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "text-xs",
              i + 1 === currentPhase ? "text-amber-400 font-bold" : "text-stone-500"
            )}
          >
            P{i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
