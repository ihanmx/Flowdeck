"use client";

import { cn } from "@/lib/cn";
import { InputHTMLAttributes, ReactNode, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, type = "text", ...props }, ref) => {
    const isPassword = type === "password";
    const [show, setShow] = useState(false);

    // In password mode, the type flips between "password" and "text" on toggle.
    const resolvedType = isPassword ? (show ? "text" : "password") : type;

    return (
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          type={resolvedType}
          className={cn(
            "h-11 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
            leftIcon && "pl-10",
            isPassword && "pr-10",
            className,
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-ink transition"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
