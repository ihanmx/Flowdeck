"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { BoardRef, Column } from "../../types";
import { SortableTaskCard } from "@/modules/tasks/components/molecules/SortableTaskCard";
import { AddTaskForm } from "@/modules/tasks/components/organisms/AddTaskForm";
import { cn } from "@/lib/cn";

interface Props {
  column: Column;
  boardRef: BoardRef;
  isDropTarget: boolean;
}

// useDroppable on the whole column means you can drop anywhere on it, including on the header or on an empty column. Without it, an empty column would have nothing to drop on.
// One SortableContext per column creates one sortable list per column. items must list the IDs in the same order they're rendered.
// IDs have to be unique across all draggables and droppables. Column IDs and task IDs are both UUIDs, so they never collide. That's how resolveDropTarget can tell a column from a task just by the ID.

export function KanbanColumn({ column, boardRef, isDropTarget }: Props) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex max-h-full w-72 shrink-0 flex-col rounded-2xl border border-line bg-surface-2 p-3 transition-colors",
        isDropTarget && "border-primary-500/60 ring-2 ring-primary-500/20",
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-ink">{column.name}</h3>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
          {column.tasks.length}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      <div className="mt-2">
        <AddTaskForm boardRef={boardRef} columnId={column.id} />
      </div>
    </div>
  );
}
