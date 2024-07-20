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
    // just to get the localhost:3000/api/{check-username-unique?userName=Shin?}/otherStuff part of the url
    const { searchParams } = new URL(req.url);
    const queryParam = {
      userName: searchParams.get("userName"),
    };
    const result = UserNameQuerySchema.safeParse(queryParam);
    console.log(result); //TODO REMOVE
    if (!result.success) {
      const userNameErrors = result.error.format().userName?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            userNameErrors?.length > 0
              ? userNameErrors.join(", ")
              : "Invalid query paramenters",
        },
        { status: 400 }
      );
    }
    const { userName } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      userName,
      verified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        { success: false, message: "Username is already taken" },
        { status: 400 }
      );
    }
    return Response.json({ success: true, message: "Username is available" });
  } catch (error) {
    console.error("Error checking username", error);
    return Response.json(
      { message: "Error checking username" },
      { status: 500 }
    );
  }
}
