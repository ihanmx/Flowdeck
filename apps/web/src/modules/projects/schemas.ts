import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "At least 2 characters")
    .max(80, "Max 80 characters"),
  description: z.string().trim().max(500, "Max 500 characters"),
});
export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
