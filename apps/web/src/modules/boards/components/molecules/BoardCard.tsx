import Link from "next/link";
import { KanbanSquare } from "lucide-react";
import type { Board } from "../../types";

export function BoardCard({ board }: { board: Board }) {
  return (
    <Link
      href={`/projects/${board.projectId}/boards/${board.id}`}
      className="group flex items-center gap-3 rounded-xl border border-line bg-surface p-4 transition hover:border-primary-500/50 hover:shadow-md"
    >
      <KanbanSquare size={20} className="shrink-0 text-primary-500" />
      <span className="truncate font-medium text-ink group-hover:text-primary-500">
        {board.name}
      </span>
    </Link>
  );
}
