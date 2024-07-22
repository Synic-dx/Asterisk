import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { userName, code } = await request.json();

    const decodedUserName = decodeURIComponent(userName);
    const user = await UserModel.findOne({ userName: decodedUserName });

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    const isCodeValid = user.verificationCode === code;
    const isCodeNotExpired = user.verificationCodeExpiry > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return new Response(
        JSON.stringify({
          success: true,
          message: "User verified successfully",
        }),
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Verification code expired, please sign up again to get a new code",
        }),
        { status: 400 }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid verification code",
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error verifying user" }),
      { status: 500 }
    );
  }
}
