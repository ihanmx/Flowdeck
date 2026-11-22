"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBoardSchema, type CreateBoardFormValues } from "../../schemas";
import { useCreateBoard } from "../../hooks/hooks";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

interface Props {
  orgId: string;
  projectId: string;
  onDone: () => void;
}

export function CreateBoardForm({ orgId, projectId, onDone }: Props) {
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: { name: "" },
  });

  const { mutate, isPending, error } = useCreateBoard(orgId, projectId);
  const message = errors.name?.message ?? error?.response?.data.message;

  return (
    <form
      onSubmit={handleSubmit((values) => mutate(values, { onSuccess: onDone }))}
      className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4"
    >
      <div className="flex gap-2">
        <Input
          placeholder="Board name, e.g. Sprint 1"
          autoFocus
          {...field("name")}
        />
        <Button type="submit" loading={isPending}>
          Add
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
      {message && <p className="text-sm text-danger">{message}</p>}
    </form>
  );
}
