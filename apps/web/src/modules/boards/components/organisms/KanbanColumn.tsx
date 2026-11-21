import type { BoardRef, Column } from "../../types";
import { TaskCard } from "@/modules/tasks/components/molecules/TaskCard";
import { AddTaskForm } from "@/modules/tasks/components/organisms/AddTaskForm";

interface Props {
  column: Column;
  boardRef: BoardRef;
}

export function KanbanColumn({ column, boardRef }: Props) {
  return (
    <div className="flex max-h-full w-72 shrink-0 flex-col rounded-2xl border border-line bg-surface-2 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-ink">{column.name}</h3>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
          {column.tasks.length}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <div className="mt-2">
        <AddTaskForm boardRef={boardRef} columnId={column.id} />
      </div>
    </div>
  );
}
