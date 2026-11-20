"use client";

import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { useActiveOrganization } from "@/modules/organizations/hooks";
import { useProjects } from "@/modules/projects/hooks";
import { ProjectCard } from "@/modules/projects/components/molecules/ProjectCard";
import { CreateProjectForm } from "@/modules/projects/components/organisms/CreateProjectForm";
import { Button } from "@/shared/components/ui/Button";

export default function ProjectsPage() {
  const [creating, setCreating] = useState(false);
  const { activeOrg, isLoading: orgLoading } = useActiveOrganization();
  const orgId = activeOrg?.id ?? "";
  const { data: projects = [], isLoading } = useProjects(orgId);

  if (orgLoading || (orgId && isLoading)) {
    return <p className="text-muted">Loading…</p>;
  }
  if (!activeOrg) {
    return <p className="text-muted">Create an organization first.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Projects</h1>
          <p className="text-sm text-muted">in {activeOrg.name}</p>
        </div>
        {!creating && (
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} /> New project
          </Button>
        )}
      </div>

      {creating && (
        <CreateProjectForm orgId={orgId} onDone={() => setCreating(false)} />
      )}

      {projects.length === 0 && !creating ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line p-12 text-center">
          <FolderKanban size={32} className="text-muted" />
          <p className="mt-3 font-medium text-ink">No projects yet</p>
          <p className="text-sm text-muted">
            Create your first project to start organizing boards.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
