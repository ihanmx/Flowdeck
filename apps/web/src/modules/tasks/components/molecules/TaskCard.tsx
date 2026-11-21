import { Calendar } from "lucide-react";
import type { Task } from "../../types";
import { PriorityBadge } from "../atoms/ProrityBadge";

export function TaskCard({ task }: { task: Task }) {
  const assigneeLabel = task.assignee?.name ?? task.assignee?.email;

  return (
    <div className="rounded-lg border border-line bg-surface p-3 shadow-sm">
      <p className="text-sm font-medium text-ink">{task.title}</p>
      <div className="mt-2 flex items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className="flex items-center gap-1 text-xs text-muted">
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        {assigneeLabel && (
          <span
            title={assigneeLabel}
            className="ms-auto grid h-6 w-6 place-items-center rounded-full bg-primary-500 text-[10px] font-semibold text-white"
          >
            {assigneeLabel.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
