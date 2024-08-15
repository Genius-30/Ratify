import { Industries, Roles } from "@/types/enums";
import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must be atleast 3 characters!")
  .max(20, "Username must be atmost 20 characters!")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain alphanumeric characters and underscores."
  );

export const signupSchemaForUser = z.object({
  avatar: z.string().optional(),
  fullName: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters!" })
    .max(32, { message: "Full name must be at most 32 characters!" }),
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters!" }),
  role: z.enum(Roles, { invalid_type_error: "Invalid role" }),
});

export const signupSchemaForOrg = z.object({
  avatar: z.string().optional(),
  organizationName: usernameValidation,
  organizationDescription: z
    .string()
    .min(50, {
      message: "Organization description must be at least 50 characters!",
    })
    .max(1000, {
      message: "Organization description must be at most 1000 characters!",
    }),
  email: z.string().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters!" }),
  role: z.enum(Roles, { invalid_type_error: "Invalid role" }),
  industry: z.enum(Industries, { invalid_type_error: "Invalid industry" }),
  topExecutives: z
    .array(z.string())
    .min(1, { message: "At least one top executive is required!" })
    .max(10, { message: "At most 10 top executives are allowed!" }),
  links: z.array(z.string()).optional(),
});
