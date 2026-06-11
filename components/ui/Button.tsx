import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "offer";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary: "bg-amber-500 hover:bg-amber-400 text-black font-bold border border-amber-400",
  secondary: "bg-stone-700 hover:bg-stone-600 text-white border border-stone-500",
  ghost: "bg-transparent hover:bg-white/10 text-white border border-white/20",
  danger: "bg-red-700 hover:bg-red-600 text-white border border-red-500",
  offer: "bg-amber-600 hover:bg-amber-500 text-black font-bold border-2 border-amber-300",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
