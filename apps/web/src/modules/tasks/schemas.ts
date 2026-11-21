import { z } from "zod";

export const addTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
});
export type AddTaskFormValues = z.infer<typeof addTaskSchema>;
