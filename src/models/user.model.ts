import mongoose, { Schema, Document } from "mongoose";

export interface QuestionDetails {
  questionObjectId: mongoose.Types.ObjectId;
  subjectCode: string;
  userAnswer: string;
  userQuestionTime: number;
  isCorrect: boolean;
  attemptedOn: Date;
  averageTimeTaken?: number;
}

export interface SelectedSubjectsAndStats {
  subjectObjectId: mongoose.Types.ObjectId;
  subjectName: string;
  subjectCode: string;
  userRating: number;
  userAttempts: number;
  userCorrectAnswers: number;
  userPercentile?: number;
  dateAdded: Date;
}

export interface EssayGraded {
  essayId: mongoose.Types.ObjectId;
  date: Date;
  question: string;
  subjectName: string;
  subjectCode: string;
  questionType: string;
  userEssay: string;
  totalMarks: number;
  grade: string;
  feedback: string;
}

const QuestionDetailsSchema = new Schema<QuestionDetails>({
  questionObjectId: { type: Schema.Types.ObjectId, required: true, ref: 'Question' },
  subjectCode: { type: String, required: true },
  userAnswer: { type: String, required: true },
  userQuestionTime: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  attemptedOn: { type: Date, required: true, default: Date.now },
  averageTimeTaken: { type: Number },
});

const SelectedSubjectsAndStatsSchema = new Schema<SelectedSubjectsAndStats>({
  subjectObjectId: { type: Schema.Types.ObjectId, required: true, ref: 'Subject' },
  subjectName: { type: String, required: true },
  subjectCode: { type: String, required: true },
  userRating: { type: Number, default: 50 },
  userAttempts: { type: Number, default: 0 },
  userCorrectAnswers: { type: Number, default: 0 },
  userPercentile: { type: Number, default: 50 },
  dateAdded: { type: Date, required: true, default: Date.now },
});

const PremiumAccessDetailsSchema = new Schema({
  valid: { type: Boolean, required: true, default: false },
  accessTill: { type: Date },
  accessModel: { type: String },
});

const GraderAccessDetailsSchema = new Schema({
  valid: { type: Boolean, required: true, default: false },
  accessTill: { type: Date },
  model: {
    type: String,
    enum: ["GPT-4o", "GPT-4o-mini"],
    required: false,
  },
  weeklyEssayLimit: {
    type: Number,
    enum: [10, 20],
    required: false,
  },
});

export interface User extends Document {
  userName: string;
  email: string;
  password: string;
  verificationCode: string;
  verificationCodeExpiry: Date;
  isVerified: boolean;
  premiumAccess: {
    valid: boolean;
    accessTill?: Date;
    accessModel?: string;
  };
  graderAccess: {
    valid: boolean;
    accessTill?: Date;
    model?: string;
    weeklyEssayLimit?: number;
  };
  questionsSolvedDetails: QuestionDetails[];
  selectedSubjects: SelectedSubjectsAndStats[];
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  isAdmin?: boolean;
  essaysGraded: EssayGraded[];
  userCumulativePercentile?: number; // Optional field
  userCumulativeRating?: number; // Optional field
  userCumulativeAttempts?: number; // Optional field
  userCumulativeCorrects?: number; // Optional field
}

const UserSchema = new Schema<User>(
  {
    userName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
    },
    password: { type: String, required: true },
    premiumAccess: { type: PremiumAccessDetailsSchema, required: true },
    graderAccess: { type: GraderAccessDetailsSchema, required: true },
    isAdmin: { type: Boolean, default: false },
    questionsSolvedDetails: [QuestionDetailsSchema],
    selectedSubjects: [SelectedSubjectsAndStatsSchema],
    verificationCode: { type: String, required: true },
    verificationCodeExpiry: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    forgotPasswordToken: { type: String },
    forgotPasswordTokenExpiry: { type: Date },
    essaysGraded: [
      {
        essayId: { type: Schema.Types.ObjectId, required: true, default: new mongoose.Types.ObjectId },
        date: { type: Date, required: true },
        question: { type: String, required: true },
        subjectName: { type: String, required: true },
        subjectCode: { type: String, required: true },
        questionType: { type: String, required: true },
        userEssay: { type: String, required: true },
        totalMarks: { type: Number, required: true },
        grade: { type: String, required: true },
        feedback: { type: String, required: true },
      }
    ],
    userCumulativePercentile: { type: Number }, // Optional field
    userCumulativeRating: { type: Number }, // Optional field
    userCumulativeAttempts: { type: Number }, // Optional field
    userCumulativeCorrects: { type: Number }, // Optional field
  },
  { timestamps: true }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
