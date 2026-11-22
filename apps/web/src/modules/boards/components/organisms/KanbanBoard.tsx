"use client";

import { useId, useState } from "react"; //useState holds what's being dragged and which column is under it.,useId creates a stable ID.
import {
  DndContext, // the "drag zone": everything draggable must be inside it
  DragOverlay, // the floating card that follows the cursor
  KeyboardSensor, // lets you drag with the keyboard
  PointerSensor, // lets you drag with mouse / touch / pen
  closestCorners, // the rule for "which thing is the card over?"
  useSensor, // creates one sensor
  useSensors, // combines sensors into a list
  type DragEndEvent, // the event types, only for TypeScript
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { BoardDetail, BoardRef } from "../../types";
import { locateTask, resolveDropTarget } from "../../utils";
import { useMoveTask } from "@/modules/tasks/hooks";
import { TaskCard } from "@/modules/tasks/components/molecules/TaskCard";
import { KanbanColumn } from "./KanbanColumn";
import { AddColumnForm } from "./AddColumnForm";
import { useBoardRealtime } from "../../hooks/useBoardRealTime";

// KanbanBoard is the controller of drag and drop
interface Props {
  board: BoardDetail;
  boardRef: BoardRef;
}

export function KanbanBoard({ board, boardRef }: Props) {
  const dndId = useId(); //dnd-kit gives each DndContext an accessibility ID based on a counter. In Next, the component renders twice: once on the server, then again in the browser. If the counters don't match, React warns about a hydration mismatch. useId() produces the same ID on both,
  useBoardRealtime(boardRef);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null); // the card dragged now
  const [overColumnId, setOverColumnId] = useState<string | null>(null); //the col the card over
  const { mutate: moveTask } = useMoveTask(boardRef);

  const sensors = useSensors(
    // must move 5px before a drag starts → plain clicks still work (open task later)
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  //   PointerSensor with distance: 5: a drag only starts after the pointer moves 5 pixels while pressed. A quick click moves 0px, so it stays a normal click. Without this, every click on a card would count as a tiny drag, and later "click a card to open it" would never work.
  // KeyboardSensor: focus a card with Tab and press Space to pick it up, the arrow keys to move it, and Space to drop it (or Esc to cancel). This is what makes the board accessible to people who can't use a mouse. sortableKeyboardCoordinates makes the arrows move between cards instead of by a fixed number of pixels.

  // derived from the cache, not stored → always the current version of the task
  const activeTask = activeTaskId
    ? locateTask(board, activeTaskId)?.task
    : undefined;

  const resetDrag = () => {
    setActiveTaskId(null);
    setOverColumnId(null);
  };
  //{ active } destructures the event. active is the item being dragged, and active.id is the ID we gave useSortable (the task ID).
  //String(...): dnd-kit types IDs as string | number. Ours are always strings (UUIDs), so this converts the type to plain string.
  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTaskId(String(active.id));
  };
  //over is what under the curser
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    //     resolveDropTarget turns that into a column and index. Here we only need the column, for the highlight.
    // target?.columnId ?? null: if there's no target, store null, which means no highlight.
    const target = over
      ? resolveDropTarget(board, String(over.id), String(active.id))
      : null;
    setOverColumnId(target?.columnId ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    resetDrag();
    if (!over) return; // dropped outside any column

    const from = locateTask(board, String(active.id));
    const to = resolveDropTarget(board, String(over.id), String(active.id));
    if (!from || !to) return;

    // dropped back where it started → no request If it was dropped in the same spot it started, send no request. That avoids a useless PATCH and refetch every time someone picks up a card and puts it back.
    if (from.columnId === to.columnId && from.index === to.index) return;

    moveTask({
      taskId: from.task.id,
      fromColumnId: from.columnId,
      toColumnId: to.columnId,
      toIndex: to.index,
    });
  };

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={resetDrag}
    >
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2">
        {board.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            boardRef={boardRef}
            // highlight only when moving to a DIFFERENT column
            isDropTarget={
              overColumnId === column.id && activeTask?.columnId !== column.id
            }
          />
        ))}
        <AddColumnForm boardRef={boardRef} />
      </div>

      {/* the floating copy that follows the cursor */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 cursor-grabbing shadow-xl">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
