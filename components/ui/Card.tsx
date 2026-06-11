import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "amber" | "ghost";
}

const variants = {
  default: "bg-stone-800 border border-stone-600",
  dark: "bg-stone-900 border border-stone-700",
  amber: "bg-amber-950 border border-amber-700",
  ghost: "bg-white/5 border border-white/10",
};

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-xl p-4", variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
