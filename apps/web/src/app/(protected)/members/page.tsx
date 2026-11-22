"use client";

import {
  useActiveOrganization,
  useOrgMembers,
} from "@/modules/organizations/hooks";
import { useInvitations } from "@/modules/invitations/hooks";
import { MemberRow } from "@/modules/organizations/components/molecules/MemberRow";
import { InviteMemberForm } from "@/modules/invitations/components/organisms/InviteMemberForm";
import { PendingInvitationRow } from "@/modules/invitations/components/molecules/PendingInvitationRow";

export default function MembersPage() {
  const { activeOrg, isLoading } = useActiveOrganization();
  const orgId = activeOrg?.id ?? "";
  // your role comes with the org (UI only — the backend still checks it)
  const canManage = activeOrg?.role === "OWNER" || activeOrg?.role === "ADMIN";

  const { data: members = [] } = useOrgMembers(orgId);
  const { data: invitations = [] } = useInvitations(orgId, canManage);

  if (isLoading) return <p className="text-muted">Loading…</p>;
  if (!activeOrg)
    return <p className="text-muted">Create an organization first.</p>;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Members</h1>
        <p className="text-sm text-muted">in {activeOrg.name}</p>
      </div>

      {canManage && <InviteMemberForm orgId={orgId} />}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Members ({members.length})
        </h2>
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {members.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </ul>
      </section>

      {canManage && invitations.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Pending invitations
          </h2>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {invitations.map((inv) => (
              <PendingInvitationRow key={inv.id} invitation={inv} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
