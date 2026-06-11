import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm text-stone-300 font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "bg-stone-800 border border-stone-600 rounded-lg px-4 py-3 text-white",
            "placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
