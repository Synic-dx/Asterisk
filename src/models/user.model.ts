import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  userName: string;
  email: string;
  password: string;
  verificationCode: string;
  verificationCodeExpiry: Date;
  isVerified: boolean;
  premiumAccess: boolean;
  papersSolvedDetails: mongoose.Types.ObjectId[];
  questionsSolvedDetails: mongoose.Types.ObjectId[];
  selectedSubjects: number[];
}

const UserSchema = new Schema(
  {
    // Signup essentials
    userName: { type: String, required: [true, 'Username is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true, match: [/.+\@.+\../, "Please enter a valid email"] },
    password: { type: String, required: [true, 'Password is required'] },

    // Membership details
    premiumAccess: { type: Boolean, default: false},

    // Stats
    papersSolvedDetails: [{ type: Schema.Types.ObjectId, ref: "Paper" }],
    questionsSolvedDetails: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    selectedSubjects: [{ type: Number, default: null }],

    // Email verification
    verificationCode: { type: String, required: [true, 'Verify Code is required'] },
    verificationCodeExpiry: { type: Date, required: [true, 'Verify Code Expiry is required'] },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User as mongoose.Model<User> || mongoose.model<User>('User', UserSchema);

export default UserModel;
