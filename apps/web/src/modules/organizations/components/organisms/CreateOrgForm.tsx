"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { createOrgSchema, type CreateOrgFormValues } from "../../schemas";
import { useCreateOrganization } from "../../hooks";
import { useOrgStore } from "@/stores/org.store";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { FormField } from "@/shared/components/ui/FormField";

// Preview only — the server generates the real (unique) slug.
const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function CreateOrgForm({ onCreated }: { onCreated?: () => void }) {
  const setActiveOrg = useOrgStore((s) => s.setActiveOrg);
  const {
    register: field,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: "" },
  });

  const name = useWatch({ control, name: "name" });
  const { mutate, isPending, error } = useCreateOrganization();
  const serverError = error?.response?.data.message ?? null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
      <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-surface-2 dark:text-primary-400">
        <Building2 size={22} />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink">
        Create your organization
      </h1>
      <p className="mt-1 text-sm text-muted">
        Your workspace for projects, boards and teammates. You&apos;ll be its
        Owner.
      </p>

      <form
        onSubmit={handleSubmit((values) =>
          mutate(values, {
            onSuccess: (org) => {
              setActiveOrg(org.id);
              onCreated?.();
            },
          }),
        )}
        className="mt-6 flex flex-col gap-4"
      >
        <FormField label="Organization name" error={errors.name?.message}>
          <Input
            placeholder="Acme Corp"
            leftIcon={<Building2 size={16} />}
            {...field("name")}
          />
        </FormField>

        {name && (
          <p className="-mt-2 font-mono text-xs text-muted">
            flowdeck.app/
            <span className="text-primary-500">{toSlug(name) || "…"}</span>
          </p>
        )}

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <Button type="submit" loading={isPending} className="h-11 w-full">
          Create organization
        </Button>
      </form>
    </div>
  );
}
