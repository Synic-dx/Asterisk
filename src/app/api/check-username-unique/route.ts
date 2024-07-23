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
    // Extract and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryParam = { userName: searchParams.get("userName") };

    // Validate query parameters using zod
    const result = UserNameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const userNameErrors = result.error.format().userName?._errors || [];
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

    const { userName } = result.data;

    // Check if the username is taken
    const existingVerifiedUser = await UserModel.findOne({
      userName,
      isVerified: true,
    });

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
    console.error("Error checking username", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error checking username" }),
      { status: 500 }
    );
  }
}
