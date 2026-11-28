"use client";

import { useParams, useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import {
  useAcceptInvitation,
  useInvitation,
} from "@/modules/invitations/hooks";
import { useLogout } from "@/modules/auth/hooks";
import { useAuthStore } from "@/stores/auth.store";
import { useOrgStore } from "@/stores/org.store";
import { Button } from "@/shared/components/ui/Button";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const setActiveOrg = useOrgStore((s) => s.setActiveOrg);
  const myEmail = useAuthStore((s) => s.user?.email);

  const { data: invite, isLoading, isError } = useInvitation(token);
  const { mutate: accept, isPending, error } = useAcceptInvitation();
  const { mutate: logout } = useLogout(
    `/login?next=${encodeURIComponent(`/invite/${token}`)}`,
  );

  if (isLoading) return <p className="text-muted">Loading…</p>;
  if (isError || !invite)
    return <p className="text-ink">This invitation link is not valid.</p>;

  const isForMe = invite.email.toLowerCase() === myEmail?.toLowerCase();
  const isUsable =
    invite.status === "PENDING" && new Date(invite.expiresAt) > new Date();

  const onAccept = () =>
    accept(token, {
      onSuccess: ({ organizationId }) => {
        setActiveOrg(organizationId);
        router.push("/dashboard");
      },
    });

  return (
    <div className="mx-auto mt-12 max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
      <MailCheck size={32} className="mx-auto text-primary-500" />
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">
        Join {invite.organization.name}
      </h1>
      <p className="mt-1 text-sm text-muted">
        Invited as <b>{invite.role.toLowerCase()}</b> · for {invite.email}
      </p>

      {!isUsable ? (
        <p className="mt-6 text-sm text-danger">
          This invitation was already used or has expired.
        </p>
      ) : !isForMe ? (
        <>
          <p className="mt-6 text-sm text-body">
            You&apos;re logged in as <b>{myEmail}</b>. This invitation is for
            another account.
          </p>
          <Button onClick={() => logout()} className="mt-4 h-11 w-full">
            Log out and continue as {invite.email}
          </Button>
        </>
      ) : (
        <>
          {error && (
            <p className="mt-4 text-sm text-danger">
              {error.response?.data.message}
            </p>
          )}
          <Button
            onClick={onAccept}
            loading={isPending}
            className="mt-6 h-11 w-full"
          >
            Accept invitation
          </Button>
        </>
      )}
    </div>
  );
}
