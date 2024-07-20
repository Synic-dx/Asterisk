import mongoose, { Schema, Document } from "mongoose";

export interface QuestionDetails {
  questionObjectId: mongoose.Types.ObjectId;
  questionId: string;
  userAnswer: string;
  userQuestionTime: number;
  isCorrect: boolean;
}

const QuestionDetailsSchema = new Schema({
  questionId: { type: String, required: true },
  questionObjectId: { type: mongoose.Types.ObjectId, required: true },
  userAnswer: { type: String, required: true },
  userQuestionTime: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
});

export interface PaperSolvedDetails {
  paperObjectId: mongoose.Types.ObjectId;
  paperId: string;
  userMarks: number;
  userPaperTime: number;
  accuracy: number;
}

const PaperSolvedDetailsSchema = new Schema({
  paperObjectId: { type: mongoose.Types.ObjectId, required: true },
  paperId: { type: String, required: true },
  userMarks: { type: Number, required: true },
  userPaperTime: { type: Number, required: true },
  accuracy: { type: Number, required: true },
});

export interface User extends Document {
  userName: string;
  email: string;
  password: string;
  verificationCode: string;
  verificationCodeExpiry: Date;
  isVerified: boolean;
  premiumAccess: boolean;
  papersSolvedDetails: PaperSolvedDetails[]; // Updated to use PaperSolvedDetails[]
  questionsSolvedDetails: QuestionDetails[];
  selectedSubjects: mongoose.Types.ObjectId[];
  forgotPasswordToken?: string; // Optional
  forgotPasswordTokenExpiry?: Date; // Optional
}

const UserSchema = new Schema(
  {
    // Signup essentials
    userName: { type: String, required: [true, "Username is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/.+\@.+\../, "Please enter a valid email"],
    },
    password: { type: String, required: [true, "Password is required"] },

    // Membership details
    premiumAccess: { type: Boolean, default: false },

    // Stats
    papersSolvedDetails: [PaperSolvedDetailsSchema], // Use the PaperSolvedDetailsSchema here
    questionsSolvedDetails: [QuestionDetailsSchema], // Use the QuestionDetailsSchema here
    selectedSubjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }], // Reference SubjectSchema

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
