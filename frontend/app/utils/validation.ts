import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .refine((value) => /[a-zA-Z]/.test(value), {
      message: "Password must contain at least 1 letter and 1 number.",
    })
    .refine((value) => /\d/.test(value), {
      message: "Password must contain at least 1 letter and 1 number.",
    }),
});

export const verifyOTPSchema = z.object({
  code: z.string().regex(/^\d{4}$/, "OTP must be exactly 4 digits."),
});
