import { z } from "zod";

// Schema for setting a new password with email
export const setNewPasswordSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address" }), // Validates email format
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" }), // Minimum length for the password
  confirmPassword: z.string()
    .min(6, { message: "Confirm Password must be at least 6 characters long" }) // Minimum length for confirm password
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match", // Error message if passwords do not match
  path: ["confirmPassword"], // Highlight the confirmPassword field if passwords don't match
});
