"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, KanbanSquare } from "lucide-react";
import { useActiveOrganization } from "@/modules/organizations/hooks";
import { useProject } from "@/modules/projects/hooks";
import { useBoards } from "@/modules/boards/hooks/hooks";
import { BoardCard } from "@/modules/boards/components/molecules/BoardCard";
import { CreateBoardForm } from "@/modules/boards/components/organisms/CreateBoardForm";
import { Button } from "@/shared/components/ui/Button";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [creating, setCreating] = useState(false);

  const { activeOrg } = useActiveOrganization();
  const orgId = activeOrg?.id ?? "";

  const { data: project, isLoading, isError } = useProject(orgId, projectId);
  const { data: boards = [] } = useBoards(orgId, projectId);

  if (!orgId || isLoading) return <p className="text-muted">Loading…</p>;

  if (isError || !project) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-ink">Project not found in {activeOrg?.name}.</p>
        <Link
          href="/projects"
          className="text-sm text-primary-500 hover:underline"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/projects"
        className="flex w-fit items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={14} className="rtl:rotate-180" /> Projects
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold text-ink">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-1 text-sm text-muted">{project.description}</p>
          )}
        </div>
        {!creating && (
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} /> New board
          </Button>
        )}
      </div>

      {creating && (
        <CreateBoardForm
          orgId={orgId}
          projectId={projectId}
          onDone={() => setCreating(false)}
        />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Boards
        </h2>
        {boards.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-line p-10 text-center">
            <KanbanSquare size={28} className="text-muted" />
            <p className="mt-2 text-sm text-muted">
              No boards yet. Create one to start tracking tasks.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((b) => (
              <BoardCard key={b.id} board={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
