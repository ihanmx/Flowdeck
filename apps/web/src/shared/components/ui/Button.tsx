import { cn } from "@/lib/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", loading, disabled, children, ...props },
    ref,
  ) => {
    const variants = {
      primary: "bg-primary-500 text-white hover:bg-primary-600",
      secondary: "border border-line bg-surface text-ink hover:bg-canvas",
      ghost: "text-body hover:bg-canvas",
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50",
          variants[variant],
          className,
        )}
        {...props}
      >
        {loading ? "Please wait…" : children}
      </button>
    );
  },
);
Button.displayName = "Button";
