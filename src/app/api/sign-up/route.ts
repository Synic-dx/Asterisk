import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request) {
  await dbConnect();

  try {
    console.log("Received request for user registration");

    const { email, password, userName } = await req.json();
    console.log("Request data:", { email, password, userName });

    if (!email || !password || !userName) {
      console.warn("Missing required fields");
      return new Response(
        JSON.stringify({ success: false, message: "Email, password, and username are required" }),
        { status: 400 }
      );
    }

    if (!validateEmail(email) || !validatePassword(password)) {
      console.warn("Invalid email format or password strength");
      return new Response(
        JSON.stringify({ success: false, message: "Invalid email format or password strength" }),
        { status: 400 }
      );
    }

    const existingUserVerifiedByUserName = await UserModel.findOne({
      userName,
      isVerified: true,
    });

    if (existingUserVerifiedByUserName) {
      console.warn("Username is already taken");
      return new Response(
        JSON.stringify({ success: false, message: "Username is already taken" }),
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      console.log("Existing user found by email:", existingUserByEmail);

      if (existingUserByEmail.isVerified) {
        console.warn("Email is already registered and verified");
        return new Response(
          JSON.stringify({
            success: false,
            message: "Email is already registered and verified. Please log in instead.",
          }),
          { status: 400 }
        );
      } else {
        existingUserByEmail.password = await bcrypt.hash(password, 10);
        existingUserByEmail.verificationCode = verificationCode;
        existingUserByEmail.verificationCodeExpiry = new Date(Date.now() + 3600000); // 1 hour expiry
        await existingUserByEmail.save();
        console.log("Updated existing user with new password and verification code");
      }
    } else {
      const newUser = new UserModel({
        userName,
        email,
        password: await bcrypt.hash(password, 10),
        premiumAccess: {
          valid: false,
          accessTill: null,
          accessModel: null
        },
        graderAccess: {
          valid: false,
          accessTill: null,
          graderAccessModel: null,
          weeklyEssayLimit: null
        },
        questionsSolvedDetails: [],
        selectedSubjects: [],
        verificationCode,
        verificationCodeExpiry: new Date(Date.now() + 3600000), // 1 hour expiry
        isVerified: false,
      });

      await newUser.save();
      console.log("Created new user:", newUser);
    }

    const emailResponse = await sendVerificationEmail(email, userName, verificationCode);
    console.log("Verification email response:", emailResponse);

    if (!emailResponse.success) {
      console.error("Failed to send verification email");
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

function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
function validatePassword(password: string): boolean {
  return password.length >= 6;
}
