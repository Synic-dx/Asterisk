import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, password, userName } = await req.json();

    const existingUserVerifiedByUserName = await UserModel.findOne({
      userName,
      isVerified: true,
    });

    if (existingUserVerifiedByUserName) {
      return new Response(
        JSON.stringify({ success: false, message: "Username is already taken" }),
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Email is already registered and verified. Please login instead.",
          }),
          { status: 400 }
        );
      } else {
        // allows taking over of emails and usernames if you can verify them before another user
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verificationCode = verificationCode;
        existingUserByEmail.verificationCodeExpiry = new Date(
          Date.now() + 3600000
        );
        await existingUserByEmail.save();
      }
    } else {
      // checks have been passed no user exists with the same email or userName so continue registration
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        userName,
        email,
        password: hashedPassword,
        premiumAccess: false,
        questionsSolvedDetails: [],
        selectedSubjects: [],
        verificationCode,
        verificationCodeExpiry: expiryDate,
        isVerified: false,
      });

      await newUser.save();
    }

    //send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      userName,
      verificationCode
    );

    if (!emailResponse.success) {
      return new Response(
        JSON.stringify({ success: false, message: "Failed to send verification email" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User registered successfully. Please verify your email.",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error registering user" }),
      { status: 500 }
    );
  }
}
