import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";

export async function POST(request: Request) {
  await dbConnect();

  try {
    // Extract data from request
    const { userName, token } = await request.json();

    // Log incoming request data for debugging
    console.debug("Received request data:", { userName, token });

    // Check if token is present
    if (!token) {
      console.warn("No token provided in the request");
      return new Response(
        JSON.stringify({ success: false, message: "Verification token is required" }),
        { status: 400 }
      );
    }

    // Check if userName is present
    if (!userName) {
      console.warn("No userName provided in the request");
      return new Response(
        JSON.stringify({ success: false, message: "UserName is required" }),
        { status: 400 }
      );
    }

    const decodedUserName = decodeURIComponent(userName);

    // Find user in database
    const user = await UserModel.findOne({ userName: decodedUserName });

    if (!user) {
      console.warn("User not found:", decodedUserName);
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    // Validate verification code and check expiration
    const isCodeValid = user.verificationCode === token;
    const isCodeNotExpired = user.verificationCodeExpiry > new Date();

    console.debug("Verification check:", { isCodeValid, isCodeNotExpired });

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
      console.warn("Verification code expired for user:", decodedUserName);
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Verification code expired, please sign up again to get a new code",
        }),
        { status: 400 }
      );
    } else {
      console.warn("Invalid verification code provided for user:", decodedUserName);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid verification code",
        }),
        { status: 400 }
      );
    }
  } catch (error: any) {
    // Log detailed error information
    console.error("Error verifying user:", {
      message: error.message,
      stack: error.stack,
      // Optionally, you can also log additional information if needed
    });

    return new Response(
      JSON.stringify({ success: false, message: "Error verifying user" }),
      { status: 500 }
    );
  }
}
