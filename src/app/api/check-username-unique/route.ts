import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { userNameValidation } from "@/schemas/signUpSchema";

const UserNameQuerySchema = z.object({
  userName: userNameValidation,
});

export async function GET(req: Request) {
  await dbConnect();

  try {
    console.log("Request URL:", req.url);

    // Extract and validate query parameters
    const url = new URL(req.url);
    const userNameParam = url.searchParams.get("userName");
    console.log("Extracted userName:", userNameParam);

    // Validate query parameters using zod
    const validationResult = UserNameQuerySchema.safeParse({ userName: userNameParam });

    console.log("Validation result:", validationResult);

    if (!validationResult.success) {
      const userNameErrors = validationResult.error.format().userName?._errors || [];
      console.warn("Validation errors:", userNameErrors);
      return new Response(
        JSON.stringify({
          success: false,
          message:
            userNameErrors.length > 0
              ? userNameErrors.join(", ")
              : "Invalid query parameters",
        }),
        { status: 400 }
      );
    }

    const { userName } = validationResult.data;
    console.log("Validated userName:", userName);

    // Check if the username is taken
    const existingVerifiedUser = await UserModel.findOne({
      userName,
      isVerified: true,
    });

    console.log("Existing user check result:", existingVerifiedUser);

    if (existingVerifiedUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Username is already taken",
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Username is available" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error checking username" }),
      { status: 500 }
    );
  }
}
