import mongoose, { Schema, Document } from "mongoose";

export interface QuestionDetails {
  questionObjectId: mongoose.Types.ObjectId;
  userAnswer: string;
  userQuestionTime: number;
  isCorrect: boolean;
  attemptedOn: Date;
}

export interface SelectedSubjectsAndStats {
  subjectObjectId: mongoose.Types.ObjectId;
  userRating: number;
  userAttempts: number;
  userCorrectAnswers: number;
}

const QuestionDetailsSchema = new Schema({
  questionObjectId: { type: mongoose.Types.ObjectId, required: true },
  userAnswer: { type: String, required: true },
  userQuestionTime: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  attemptedOn: { type: Date, required: true, default: Date.now },
});

const SelectedSubjectsAndStatsSchema = new Schema({
  subjectObjectId: { type: mongoose.Types.ObjectId, required: true },
  userRating: { type: Number, default: 50 },
  userAttempts: { type: Number, default: 0 },
  userCorrectAnswers: { type: Number, default: 0 },
});

export interface User extends Document {
  userName: string;
  email: string;
  password: string;
  verificationCode: string;
  verificationCodeExpiry: Date;
  isVerified: boolean;
  premiumAccess: boolean;
  questionsSolvedDetails: QuestionDetails[];
  selectedSubjects: SelectedSubjectsAndStats[];
  forgotPasswordToken?: string; // Optional
  forgotPasswordTokenExpiry?: Date; // Optional
  isAdmin?: boolean;
}

const UserSchema = new Schema(
  {
    // Signup essentials
    userName: { type: String, required: [true, "Username is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Please enter a valid email",
      ],
    },
    password: { type: String, required: [true, "Password is required"] },

    // Access details
    premiumAccess: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },

    // Stats
    questionsSolvedDetails: [QuestionDetailsSchema], // Use the QuestionDetailsSchema here
    selectedSubjects: [SelectedSubjectsAndStatsSchema], // Reference SubjectSchema

    // Email verification
    verificationCode: { type: String, required: true },
    verificationCodeExpiry: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },

    // Forgot password
    forgotPasswordToken: { type: String, required: false },
    forgotPasswordTokenExpiry: { type: Date, required: false },
  },
  { timestamps: true }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
