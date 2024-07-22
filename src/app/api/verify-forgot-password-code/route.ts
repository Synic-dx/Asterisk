import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { userName, code, newPassword } = await request.json();

    const decodedUserName = decodeURIComponent(userName);
    const user = await UserModel.findOne({ userName: decodedUserName });
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    const isCodeValid = user.forgotPasswordToken === code;
    const isCodeNotExpired = user.forgotPasswordTokenExpiry && user.forgotPasswordTokenExpiry > new Date();

    if (isCodeValid && isCodeNotExpired) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.forgotPasswordToken = undefined; // Clear the token
      user.forgotPasswordTokenExpiry = undefined; // Clear the token expiry
      await user.save();
      return new Response(
        JSON.stringify({ success: true, message: "Password reset successfully" }),
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return new Response(
        JSON.stringify({ success: false, message: "Reset token expired, please request a new one" }),
        { status: 400 }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid reset token" }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error resetting password", error);
    return new Response(
      JSON.stringify({ message: "Error resetting password" }),
      { status: 500 }
    );
  }
}
