import type { BoardDetail } from "./types";
import type { Task } from "@/modules/tasks/types";

interface TaskLocation {
  columnId: string;
  index: number;
  task: Task;
}

/** Where a task currently sits on the board. */
export function locateTask(
  board: BoardDetail,
  taskId: string,
): TaskLocation | null {
  for (const column of board.columns) {
    const index = column.tasks.findIndex((t) => t.id === taskId);
    if (index !== -1)
      return { columnId: column.id, index, task: column.tasks[index] };
  }
  return null;
}

// When you drop a card, dnd-kit only tells you the ID of the thing under the cursor (over.id). That could be a column (you dropped on its header or empty space) or a task (you dropped on another card). This function turns that ID into a concrete "column + index."
/**
 * Turns "what the card was dropped on" into a column + index.
 * - dropped on a column (empty area/header) → end of that column
 * - dropped on a task → that task's index (the card takes its place)
 */
export function resolveDropTarget(
  board: BoardDetail,
  overId: string,
  activeId: string,
) {
  const column = board.columns.find((c) => c.id === overId);
  if (column) {
    // count the column's OTHER tasks: dropping on its own column = move to the end
    // we count the tasks without current one and take the lenth
    const index = column.tasks.filter((t) => t.id !== activeId).length;
    return { columnId: column.id, index };
  }
  //   If overId isn't a column, it must be a task.
  const target = locateTask(board, overId);
  return target ? { columnId: target.columnId, index: target.index } : null;
}

/** Returns a NEW board with the task moved. Never mutates the input. */
// export interface BoardDetail extends Board {
//   columns: Column[];
// }

export function moveTaskInBoard(
  board: BoardDetail,
  taskId: string,
  toColumnId: string,
  toIndex: number,
): BoardDetail {
  const from = locateTask(board, taskId);
  if (!from) return board; // task not on the board (e.g. deleted) → nothing to do

  const movedTask = { ...from.task, columnId: toColumnId };

  const columns = board.columns.map((col) => {
    // columns not involved in the move stay exactly as they are
    if (col.id !== from.columnId && col.id !== toColumnId) return col;

    // 1. take the task out (filter already returns a NEW array)
    const tasks = col.tasks.filter((t) => t.id !== taskId);

    // 2. put it in, if this is the target column
    if (col.id === toColumnId) tasks.splice(toIndex, 0, movedTask);

    // 3. positions = array order (same rule as the backend)
    return { ...col, tasks: tasks.map((t, i) => ({ ...t, position: i })) };
  });

  return { ...board, columns };
}
