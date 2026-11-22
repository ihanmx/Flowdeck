"use client";

import { useParams, useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { useAcceptInvitation } from "@/modules/invitations/hooks";
import { useOrgStore } from "@/stores/org.store";
import { Button } from "@/shared/components/ui/Button";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const setActiveOrg = useOrgStore((s) => s.setActiveOrg);
  const { mutate, isPending, error } = useAcceptInvitation();

  const accept = () =>
    mutate(token, {
      onSuccess: ({ organizationId }) => {
        setActiveOrg(organizationId); // land inside the org you just joined
        router.push("/dashboard");
      },
    });

  return (
    <div className="mx-auto mt-12 max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
      <MailCheck size={32} className="mx-auto text-primary-500" />
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">
        You&apos;re invited
      </h1>
      <p className="mt-1 text-sm text-muted">
        Join the organization to see its projects and boards.
      </p>
      {error && (
        <p className="mt-4 text-sm text-danger">
          {error.response?.data.message}
        </p>
      )}
      <Button onClick={accept} loading={isPending} className="mt-6 h-11 w-full">
        Accept invitation
      </Button>
    </div>
  );
}
