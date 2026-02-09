import { Resend } from "resend";

// Use a dummy key for build/development if not set
// In production at runtime, email operations should validate the key before use
export const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');
