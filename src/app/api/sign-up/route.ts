import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, password, userName } = await req.json();

    if (!email || !password || !userName) {
      return new Response(
        JSON.stringify({ success: false, message: "Email, password, and username are required" }),
        { status: 400 }
      );
    }

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
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

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
        // Update existing user with new password and verification code
        existingUserByEmail.password = await bcrypt.hash(password, 10);
        existingUserByEmail.verificationCode = verificationCode;
        existingUserByEmail.verificationCodeExpiry = new Date(Date.now() + 3600000); // 1 hour expiry
        await existingUserByEmail.save();
      }
    } else {
      // Create a new user
      const newUser = new UserModel({
        userName,
        email,
        password: await bcrypt.hash(password, 10),
        premiumAccess: false,
        questionsSolvedDetails: [],
        selectedSubjects: [],
        verificationCode,
        verificationCodeExpiry: new Date(Date.now() + 3600000), // 1 hour expiry
        isVerified: false,
      });

      await newUser.save();
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(email, userName, verificationCode);

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
    console.error("Error registering user:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error registering user" }),
      { status: 500 }
    );
  }
}
