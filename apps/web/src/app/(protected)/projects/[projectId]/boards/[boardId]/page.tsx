"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useActiveOrganization } from "@/modules/organizations/hooks";
import { useBoard } from "@/modules/boards/hooks";
import { KanbanColumn } from "@/modules/boards/components/organisms/KanbanColumn";
import type { BoardRef } from "@/modules/boards/types";
import { AddColumnForm } from "@/modules/boards/components/organisms/AddColumnForm";
import { KanbanBoard } from "@/modules/boards/components/organisms/KanbanBoard";

export default function BoardPage() {
  const { projectId, boardId } = useParams<{
    projectId: string;
    boardId: string;
  }>();
  const { activeOrg } = useActiveOrganization();
  const boardRef: BoardRef = { orgId: activeOrg?.id ?? "", projectId, boardId };

  const { data: board, isLoading, isError } = useBoard(boardRef);

  if (!boardRef.orgId || isLoading)
    return <p className="text-muted">Loading…</p>;

  if (isError || !board) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-ink">Board not found.</p>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-primary-500 hover:underline"
        >
          Back to project
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="flex w-fit items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft size={14} className="rtl:rotate-180" /> Project
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">
          {board.name}
        </h1>
      </div>

      <KanbanBoard board={board} boardRef={boardRef} />
    </div>
  );
}
