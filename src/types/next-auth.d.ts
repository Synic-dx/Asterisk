import "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    isVerified?: boolean;
    userName?: string;
    unrestrictedSums?: boolean;
    unrestrictedSubjects?: boolean;
    graderAccess?: boolean;
    papersSolvedDetails?: mongoose.Types.ObjectId[];
    questionsSolvedDetails?: mongoose.Types.ObjectId[];
    selectedSubjects?: number[];
  }

  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      userName?: string;
      unrestrictedSums?: boolean;
      unrestrictedSubjects?: boolean;
      graderAccess?: boolean;
      papersSolvedDetails?: mongoose.Types.ObjectId[];
      questionsSolvedDetails?: mongoose.Types.ObjectId[];
      selectedSubjects?: number[];
    } & DefaultSession['user'];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    userName?: string;
    unrestrictedSums?: boolean;
    unrestrictedSubjects?: boolean;
    graderAccess?: boolean;
    papersSolvedDetails?: mongoose.Types.ObjectId[];
    questionsSolvedDetails?: mongoose.Types.ObjectId[];
    selectedSubjects?: number[];
  }
}
