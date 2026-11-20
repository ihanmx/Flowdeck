import { z } from "zod";

export const createBoardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "At least 2 characters")
    .max(60, "Max 60 characters"),
});
export type CreateBoardFormValues = z.infer<typeof createBoardSchema>;
