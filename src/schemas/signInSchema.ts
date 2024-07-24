import { z } from "zod";

// ZOD is a server-side validator which validates based on types, minimum, maximum length, regex etc
// This particular code is for validating login inputs
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
