import { Industries, UserRole } from "@/types/enums";
import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must be atleast 3 characters!")
  .max(20, "Username must be atmost 20 characters!")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain alphanumeric characters and underscores."
  );

export const signupValidationForUser = z.object({
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
  role: z.literal(UserRole.USER, { invalid_type_error: "Invalid role" }),
});

export const signupValidationForOrg = z.object({
  avatar: z.string(),
  organizationName: usernameValidation,
  organizationBio: z
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
  role: z.literal(UserRole.ORG, {
    invalid_type_error: "Invalid role",
  }),
  industry: z.enum(Industries, { invalid_type_error: "Invalid industry" }),
  topExecutives: z.string(),
  links: z.array(z.string()).optional(),
  images: z
    .array(z.string())
    .min(1, { message: "Atleast one image is required!" })
    .max(10, { message: "Atmost 10 images are allowed!" }),
});
