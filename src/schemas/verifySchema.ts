import {z} from "zod"

// ZOD is a server-side validator which validates based on types, minimum, maximum length, regex etc
// This particular code is for validating the otp input after verification email is sent
export const verifySchema = z.object({
    verificationCode: z.string().min(6, {message: 'Verification code must be at least 6 characters long'}),
    email: z.string().email({message: 'Invalid email address'})
})