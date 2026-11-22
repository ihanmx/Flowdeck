import type { Task } from "@/modules/tasks/types";

export interface Board {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  boardId: string;
  tasks: Task[];
}

export interface BoardDetail extends Board {
  columns: Column[];
}

/** The ids that identify a board in the API's nested URLs. */
export interface BoardRef {
  orgId: string;
  projectId: string;
  boardId: string;
}
