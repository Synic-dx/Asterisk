import mongoose, { Schema, Document } from "mongoose";

// in TypeScript we have a buffer measure (Type Safety) to ensure all datapoints are entered in the intended types
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
    papersSolvedDetails: [{ type: Schema.Types.ObjectId, ref: "Paper" }],
    questionsSolvedDetails: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    selectedSubjects: [{ type: Number, default: null }],

    // Email verification
    verificationCode: {
      type: String,
      required: [true, "Verify Code is required"],
    },
    verificationCodeExpiry: {
      type: Date,
      required: [true, "Verify Code Expiry is required"],
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true } // automatically creates a createdAt and updatedAt datapoints based on user creation and modified dates
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);
// this export syntax is useful cuz nextjs apps arent connected to database the whole time, only when neccessary
// so it checks if the data is present already or not (if so then just modifies) or else creates another object

export default UserModel;
