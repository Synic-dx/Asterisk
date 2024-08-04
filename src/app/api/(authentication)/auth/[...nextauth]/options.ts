import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

const VERIFICATION_CODE_EXPIRY_TIME = 3600000; // 1 hour in milliseconds

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials) {
          throw new Error("Credentials are missing");
        }

        const { email, password } = credentials;

        await dbConnect();

        try {
          const user = await UserModel.findOne({ email });
          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            user.verificationCode = verificationCode;
            user.verificationCodeExpiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_TIME);
            await user.save();

            const emailResponse = await sendVerificationEmail(user.email, user.userName, verificationCode);
            if (!emailResponse.success) {
              throw new Error("Failed to send verification email");
            }

            throw new Error("Email not verified. Verification code sent.");
          }

          const isPasswordCorrect = await bcrypt.compare(password, user.password);
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (error: any) {
          throw new Error(error.message);
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString() ?? "";
        token.userName = user.userName;
        token.email = user.email;
        token.isVerified = user.isVerified;
        token.premiumAccess = user.premiumAccess;
        token.graderAccess = user.graderAccess;
        token.selectedSubjects = user.selectedSubjects;
        token.forgotPasswordToken = user.forgotPasswordToken;
        token.forgotPasswordTokenExpiry = user.forgotPasswordTokenExpiry;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          _id: token._id,
          userName: token.userName,
          email: token.email,
          isVerified: token.isVerified,
          premiumAccess: token.premiumAccess,
          graderAccess: token.graderAccess,
          questionsSolvedDetails: token.questionsSolvedDetails,
          selectedSubjects: token.selectedSubjects,
          forgotPasswordToken: token.forgotPasswordToken,
          forgotPasswordTokenExpiry: token.forgotPasswordTokenExpiry,
          essaysGraded: token.essaysGraded,
        };
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
