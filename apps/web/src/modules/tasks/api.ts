import apiClient from "@/services/apiClient";
import type { BoardRef } from "@/modules/boards/types";
import type { Priority, Task } from "./types";

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  assigneeId?: string;
}

export interface MoveTaskInput {
  targetColumnId: string;
  targetPosition: number;
}

const tasksUrl = ({ orgId, projectId, boardId }: BoardRef, columnId: string) =>
  `/organizations/${orgId}/projects/${projectId}/boards/${boardId}/columns/${columnId}/tasks`;

export function createTask(
  ref: BoardRef,
  columnId: string,
  input: CreateTaskInput,
) {
  return apiClient.post<Task>(tasksUrl(ref, columnId), input);
}

export function moveTask(
  ref: BoardRef,
  fromColumnId: string,
  taskId: string,
  input: MoveTaskInput,
) {
  return apiClient.patch<Task>(
    `${tasksUrl(ref, fromColumnId)}/${taskId}/move`,
    input,
  );
}
