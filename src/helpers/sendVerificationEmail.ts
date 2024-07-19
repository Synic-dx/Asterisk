import { resend } from "../lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "../types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  verificationCode: string,
  userName: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
        from: 'onboarding@resend.dev', // to be replaced by custom email after domain buying
        to: email,
        subject: 'Asterisk | Sign Up Verification Code',
        react: VerificationEmail({ userName, otp: verificationCode }),
      });

    return { success: true, message: 'Verification Email Sent Successfully' };
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    return { success: false, message: "Failed to send verification email" };
  }
}
