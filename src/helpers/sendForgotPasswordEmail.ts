import { resend } from "../lib/resend";
import ForgotPasswordEmail from "../../emails/ForgotPasswordEmail";
import { ApiResponse } from "../types/ApiResponse";

export async function sendForgotPasswordEmail(
  email: string,
  forgotPasswordToken: string,
  userName: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // to be replaced by custom email after domain buying
      to: email,
      subject: "Asterisk | Password Reset Code",
      react: ForgotPasswordEmail({ userName, forgotOTP: forgotPasswordToken }),
    });

    return { success: true, message: "Password Reset Email Sent Successfully" };
  } catch (emailError) {
    console.error("Error sending Password Reset email:", emailError);
    return { success: false, message: "Failed to send Password Reset email" };
  }
}
