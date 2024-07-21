// This code is there just to tackle the nextauthjs's User tokens being too simple
// (just accepting a few datapoints) while not even specifying their types.
// This code will set the types for the User datapoints, which are themselves
// added in src\app\api\auth\[...nextauth]\options.ts file

import "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    isVerified?: boolean;
    userName?: string;
    premiumAccess?: boolean;
    questionsSolvedDetails?: mongoose.Types.ObjectId[];
    selectedSubjects?: number[];
  }

  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      userName?: string;
      premiumAccess?: boolean;
      questionsSolvedDetails?: mongoose.Types.ObjectId[];
      selectedSubjects?: number[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    userName?: string;
    premiumAccess?: boolean;
    questionsSolvedDetails?: mongoose.Types.ObjectId[];
    selectedSubjects?: number[];
  }
}
