import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";

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
          const user = await UserModel.findOne({
            email: credentials.identifier.email
          });
          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before login");
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
          throw new Error(error.message); // Corrected to error.message
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
        token.unrestrictedSums = user.unrestrictedSums;
        token.unrestrictedSubjects = user.unrestrictedSubjects;
        token.graderAccess = user.graderAccess;
        token.papersSolvedDetails = user.papersSolvedDetails;
        token.questionsSolvedDetails = user.questionsSolvedDetails;
        token.selectedSubjects = user.selectedSubjects;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.userName = token.userName;
        session.user.unrestrictedSums = token.unrestrictedSums;
        session.user.unrestrictedSubjects = token.unrestrictedSubjects;
        session.user.graderAccess = token.graderAccess;
        session.user.papersSolvedDetails = token.papersSolvedDetails;
        session.user.questionsSolvedDetails = token.questionsSolvedDetails;
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
