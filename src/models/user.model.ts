import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  userName: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  unrestrictedSums: boolean;
  unrestrictedSubjects: boolean;
  graderAccess: boolean;
  memberSince: Date;
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
    unrestrictedSums: { type: Boolean, required: true, default: false },
    unrestrictedSubjects: { type: Boolean, required: true, default: false },
    graderAccess: { type: Boolean, required: true, default: false },
    memberSince: { type: Date, required: true, default: Date.now },

    // Stats
    papersSolvedDetails: [{ type: Schema.Types.ObjectId, ref: "Paper" }],
    questionsSolvedDetails: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    selectedSubjects: [{ type: Number, default: null }],

    // Email verification
    verifyCode: { type: String, required: [true, 'Verify Code is required'] },
    verifyCodeExpiry: { type: Date, required: [true, 'Verify Code Expiry is required'] },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User as mongoose.Model<User> || mongoose.model<User>('User', UserSchema);

export default UserModel;
