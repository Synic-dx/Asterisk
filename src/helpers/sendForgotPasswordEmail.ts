import { resend } from "../lib/resend";
import ForgotPasswordEmail from "../../emails/ForgotPasswordEmail";
import { ApiResponse } from "../types/ApiResponse";

export async function sendForgotPasswordEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<ApiResponse> {
  try {
    // Ensure your email service is properly configured
    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your custom email after domain setup
      to: email,
      subject: "Asterisk | Password Reset Code",
      react: ForgotPasswordEmail({ resetToken, userName }),
    });

    // Log response for debugging
    console.log("Email sent response:", response);

    return {
      success: true,
      message: "Password reset email sent successfully.",
    };
  } catch (emailError) {
    // Log detailed error for debugging
    console.error("Error sending password reset email:", emailError);

    return {
      success: false,
      message: "Failed to send password reset email. Please try again later.",
    };
  }
}
