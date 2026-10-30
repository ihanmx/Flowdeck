"use client";

import { useActiveOrganization } from "@/modules/organizations/hooks";
import { CreateOrgForm } from "@/modules/organizations/components/organisms/CreateOrgForm";

export default function DashboardPage() {
  const { activeOrg, isLoading } = useActiveOrganization();

  if (isLoading) return <p className="text-muted">Loading…</p>;

  if (!activeOrg) {
    return (
      <div className="mx-auto mt-12 max-w-md">
        <CreateOrgForm />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-display text-2xl font-bold text-ink">
        {activeOrg.name}
      </h1>
      <p className="text-muted">
        Your projects and activity will show up here.
      </p>
    </div>
  );
}
