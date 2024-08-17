import { z } from "zod";

export const discussionValidation = z.object({
  content: z
    .string()
    .max(120, { message: "Discussion content must be atmost 120 characters!" }),
});
