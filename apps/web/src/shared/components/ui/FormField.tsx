import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-body">{label}</label>
      {children}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
