import { z } from "zod";

export const inviteSchema = z.object({
  email: z.email("Enter a valid email"),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});
export type InviteFormValues = z.infer<typeof inviteSchema>;
