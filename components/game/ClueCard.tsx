import type { Clue } from "@/types/content";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/ui/RichText";

interface ClueCardProps {
  clue: Clue;
  discoveredAt?: string;
  className?: string;
  descriptionOverride?: string; // e.g. the shed note's dynamically generated signature
}

export function ClueCard({ clue, discoveredAt, className, descriptionOverride }: ClueCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-stone-900 border-amber-700/50 p-4 space-y-2",
        clue.isKeyClue && "border-amber-500 shadow-amber-900/30 shadow-lg",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{clue.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-amber-300 text-sm">{clue.title}</h3>
            {clue.isKeyClue && (
              <span className="text-xs bg-amber-700/50 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-600/50">
                Key Clue
              </span>
            )}
          </div>
          <RichText as="p" className="text-stone-300 text-sm leading-relaxed" text={descriptionOverride ?? clue.description} />
        </div>
      </div>
      <div className="border-t border-stone-700 pt-2 flex justify-between items-center">
        <RichText as="p" className="text-xs text-stone-500 italic" text={clue.flavor} />
        {discoveredAt && (
          <span className="text-xs text-stone-600 ml-2 flex-shrink-0">
            Found {new Date(discoveredAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
