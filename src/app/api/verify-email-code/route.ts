import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const {userName, code} = await request.json();

    const decodedUserName = decodeURIComponent(userName);
    const user = await UserModel.findOne({userName: decodedUserName});
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isCodeValid = user.verificationCode === code;
    const isCodeNotExpired = user.verificationCodeExpiry > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        { success: true, message: "User verified successfully" },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        { success: false, message: "Verification code expired, please signup again to get a new code" },
        { status: 400 }
      );
    } else {
      return Response.json(
        { success: false, message: "Invalid verification code" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying user", error);
    return Response.json(
      { message: "Error verifying user" },
      { status: 500 }
    );
  }
}
