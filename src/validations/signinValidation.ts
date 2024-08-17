import { z } from "zod";

export const signinSchema = z.object({
  identifier: z
    .string()
    .min(3, { message: "Identifier must be at least 3 characters!" })
    .refine(
      (val) =>
        /^[a-zA-Z0-9_]+$/.test(val) ||
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val),
      {
        message:
          "Identifier must be a valid user/organization name or email address.",
      }
    ),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters!" }),
});
