export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: Priority;
  dueDate: string | null;
  columnId: string;
  assigneeId: string | null;
  // included by GET board; NOT returned by POST task
  assignee?: { id: string; email: string; name: string | null } | null;
  createdAt: string;
  updatedAt: string;
}
