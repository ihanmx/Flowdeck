"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { createColumnSchema, type CreateColumnFormValues } from "../../schemas";
import { useCreateColumn } from "../../hooks";
import type { BoardRef } from "../../types";
import { Input } from "@/shared/components/ui/Input";

export function AddColumnForm({ boardRef }: { boardRef: BoardRef }) {
  const [open, setOpen] = useState(false);
  const {
    register: field,
    handleSubmit,
    reset,
  } = useForm<CreateColumnFormValues>({
    resolver: zodResolver(createColumnSchema),
    defaultValues: { name: "" },
  });
  const { mutate, error } = useCreateColumn(boardRef);

  const close = () => {
    reset();
    setOpen(false);
  };

  return (
    <div className="w-72 shrink-0">
      {open ? (
        <form
          onSubmit={handleSubmit((values) =>
            mutate(values, { onSuccess: close }),
          )}
          onKeyDown={(e) => e.key === "Escape" && close()}
          className="flex flex-col gap-1 rounded-2xl border border-line bg-surface-2 p-3"
        >
          <Input
            autoFocus
            placeholder="Column name, then Enter"
            {...field("name")}
          />
          {error && (
            <p className="text-xs text-danger">
              {error.response?.data.message}
            </p>
          )}
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-line p-4 text-sm text-muted transition hover:border-primary-500/50 hover:text-ink"
        >
          <Plus size={16} /> Add column
        </button>
      )}
    </div>
  );
}
