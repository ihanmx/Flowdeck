"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from "../../schemas";
import { useCreateProject } from "../../hooks";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { FormField } from "@/shared/components/ui/FormField";

interface Props {
  orgId: string;
  onDone: () => void;
}

export function CreateProjectForm({ orgId, onDone }: Props) {
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "" },
  });

  const { mutate, isPending, error } = useCreateProject(orgId);
  const serverError = error?.response?.data.message ?? null;

  return (
    <form
      onSubmit={handleSubmit(({ name, description }) =>
        mutate(
          { name, description: description || undefined }, // don't store "" as a description
          { onSuccess: onDone },
        ),
      )}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5"
    >
      <FormField label="Project name" error={errors.name?.message}>
        <Input placeholder="Website redesign" autoFocus {...field("name")} />
      </FormField>
      <FormField
        label="Description (optional)"
        error={errors.description?.message}
      >
        <Input
          placeholder="What is this project about?"
          {...field("description")}
        />
      </FormField>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={isPending}>
          Create project
        </Button>
      </div>
    </form>
  );
}
