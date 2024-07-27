import { z } from "zod";

// Updated to match the password schema used in signUpSchema
export const setNewPasswordSchema = z.object({
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string()
    .min(6, { message: "Confirm Password must be at least 6 characters long" }) // Matching the signUpSchema
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"], // Highlight the confirmPassword field if passwords don't match
});
