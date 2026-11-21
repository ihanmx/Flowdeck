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

const tasksUrl = ({ orgId, projectId, boardId }: BoardRef, columnId: string) =>
  `/organizations/${orgId}/projects/${projectId}/boards/${boardId}/columns/${columnId}/tasks`;

export function createTask(
  ref: BoardRef,
  columnId: string,
  input: CreateTaskInput,
) {
  return apiClient.post<Task>(tasksUrl(ref, columnId), input);
}
