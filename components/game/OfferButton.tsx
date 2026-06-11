"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface OfferButtonProps {
  cost: number;
  offerDefinition: string;
  label: string;
  onConfirm: () => Promise<void>;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function OfferButton({
  cost,
  offerDefinition,
  label,
  onConfirm,
  className,
  size = "md",
}: OfferButtonProps) {
  const [state, setState] = useState<"idle" | "confirming" | "loading">("idle");

  const handleClick = async () => {
    if (state === "idle") {
      setState("confirming");
      return;
    }

    if (state === "confirming") {
      setState("loading");
      try {
        await onConfirm();
      } finally {
        setState("idle");
      }
    }
  };

  const handleCancel = () => setState("idle");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {state === "confirming" ? (
        <div className="rounded-xl border border-amber-600 bg-amber-950/50 p-3 space-y-2">
          <p className="text-sm text-amber-300 font-medium">
            🍺 Pay {cost} Offer ({offerDefinition})?
          </p>
          <p className="text-xs text-stone-400">
            {cost === 1 ? "1 Offer" : `${cost} Offers`} = {offerDefinition}
          </p>
          <div className="flex gap-2">
            <Button
              variant="offer"
              size="sm"
              onClick={handleClick}
              className="flex-1"
            >
              ✓ Pay & Continue
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="offer"
          size={size}
          onClick={handleClick}
          loading={state === "loading"}
          className={cn(className)}
        >
          🍺 {label} ({cost} Offer)
        </Button>
      )}
    </div>
  );
}
