import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          const user = await UserModel.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            const verificationCode = Math.floor(
              100000 + Math.random() * 900000
            ).toString();
            user.verificationCode = verificationCode;
            user.verificationCodeExpiry = new Date(Date.now() + 3600000); // 1 hour expiry
            await user.save();

            const emailResponse = await sendVerificationEmail(
              user.email,
              user.userName,
              verificationCode
            );
            if (!emailResponse.success) {
              throw new Error("Failed to send verification email");
            }

            throw new Error("Email not verified. Verification code sent.");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
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
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.userName = user.userName;
        token.premiumAccess = user.premiumAccess;
        // token.questionsSolvedDetails = user.questionsSolvedDetails;
        token.selectedSubjects = user.selectedSubjects;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.userName = token.userName;
        session.user.premiumAccess = token.premiumAccess;
        // session.user.questionsSolvedDetails = token.questionsSolvedDetails;
        session.user.selectedSubjects = token.selectedSubjects;
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
