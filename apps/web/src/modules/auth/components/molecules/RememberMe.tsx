import { InputHTMLAttributes, forwardRef } from "react";
import { Checkbox } from "@/shared/components/ui/Checkbox";

export const RememberMe = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <label className="flex items-center gap-2 text-sm text-body cursor-pointer select-none">
    <Checkbox ref={ref} {...props} />
    Remember me
  </label>
));
RememberMe.displayName = "RememberMe";
