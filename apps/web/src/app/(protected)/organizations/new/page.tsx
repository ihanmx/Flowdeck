"use client";

import { useRouter } from "next/navigation";
import { CreateOrgForm } from "@/modules/organizations/components/organisms/CreateOrgForm";

export default function NewOrganizationPage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-md pt-8">
      <CreateOrgForm onCreated={() => router.push("/dashboard")} />
    </div>
  );
}
