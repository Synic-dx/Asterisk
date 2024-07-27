import { z } from "zod";

// This schema is for validating the OTP input
export const verifySchema = z.object({
  token: z
    .string()
    .min(6, {
      message: "Verification code must be at least 6 characters long",
    }),
});
