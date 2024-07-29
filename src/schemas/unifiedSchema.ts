import * as z from "zod";

export const unifiedSchema = z.object({
  token: z.string().min(6, "Verification code is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().nonempty("Confirm password is required")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
