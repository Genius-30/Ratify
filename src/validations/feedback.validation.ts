import { z } from "zod";

export const feedbackValidation = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be atleast 3 characters!" })
    .max(120, { message: "Title must be atmost 120 characters!" }),
  content: z
    .string()
    .min(3, { message: "Content must be atleast 3 characters!" })
    .max(1000, { message: "Content must be atmost 1000 characters!" }),
});
