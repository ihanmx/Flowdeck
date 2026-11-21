import { z } from "zod";

export const createBoardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "At least 2 characters")
    .max(60, "Max 60 characters"),
});
export type CreateBoardFormValues = z.infer<typeof createBoardSchema>;

export const createColumnSchema = z.object({
  name: z.string().trim().min(1, "Required").max(40, "Max 40 characters"),
});
export type CreateColumnFormValues = z.infer<typeof createColumnSchema>;
