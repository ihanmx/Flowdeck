"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { inviteSchema, type InviteFormValues } from "../../schemas";
import { useCreateInvitation } from "../../hooks";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

export function InviteMemberForm({ orgId }: { orgId: string }) {
  const {
    register: field,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "MEMBER" },
  });
  const { mutate, isPending, error } = useCreateInvitation(orgId);
  const message = errors.email?.message ?? error?.response?.data.message;

  return (
    <form
      onSubmit={handleSubmit((values) =>
        mutate(values, { onSuccess: () => reset() }),
      )}
      className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="teammate@company.com"
          leftIcon={<Mail size={16} />}
          {...field("email")}
        />
        <select
          {...field("role")}
          className="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink"
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
          <option value="VIEWER">Viewer</option>
        </select>
        <Button type="submit" loading={isPending}>
          Invite
        </Button>
      </div>
      {message && <p className="text-sm text-danger">{message}</p>}
    </form>
  );
}
