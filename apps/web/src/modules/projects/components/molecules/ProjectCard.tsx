import Link from "next/link";
import { FolderKanban } from "lucide-react";
import type { Project } from "../../types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 transition hover:border-primary-500/50 hover:shadow-md"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-surface-2 dark:text-primary-400">
        <FolderKanban size={20} />
      </div>
      <div className="min-w-0">
        <h3 className="truncate font-semibold text-ink group-hover:text-primary-500">
          {project.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">
          {project.description || "No description"}
        </p>
      </div>
      <p className="mt-auto text-xs text-muted">
        Created {new Date(project.createdAt).toLocaleDateString()}
      </p>
    </Link>
  );
}
