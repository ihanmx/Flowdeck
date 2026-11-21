"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { addTaskSchema, type AddTaskFormValues } from "../../schemas";
import { useCreateTask } from "../../hooks";
import type { BoardRef } from "@/modules/boards/types";
import { Input } from "@/shared/components/ui/Input";

interface Props {
  boardRef: BoardRef;
  columnId: string;
}

export function AddTaskForm({ boardRef, columnId }: Props) {
  const [open, setOpen] = useState(false);
  const {
    register: field,
    handleSubmit,
    reset,
  } = useForm<AddTaskFormValues>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: { title: "" },
  });
  const { mutate, error } = useCreateTask(boardRef);

  const close = () => {
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-muted transition hover:bg-surface hover:text-ink"
      >
        <Plus size={14} /> Add task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(({ title }) =>
        mutate({ columnId, title }, { onSuccess: () => reset() }),
      )}
      onKeyDown={(e) => e.key === "Escape" && close()}
      className="flex flex-col gap-1"
    >
      <Input
        autoFocus
        placeholder="Task title, then Enter"
        {...field("title")}
      />
      {error && (
        <p className="text-xs text-danger">{error.response?.data.message}</p>
      )}
    </form>
  );
}
