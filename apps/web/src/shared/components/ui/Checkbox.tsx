import { cn } from "@/lib/cn";
import { InputHTMLAttributes, forwardRef } from "react";

export const Checkbox = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "h-4 w-4 rounded border-line accent-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
      className,
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";
