import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    //signup essentials
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    //membership details
    unrestrictedSums: { type: Boolean, required: true, default: false },
    unrestrictedSubjects: { type: Boolean, required: true, default: false },
    graderAccess: { type: Boolean, required: true, default: false },
    newUser: { type: Boolean, required: true, default: true },
    //stats
    papersSolvedDetails: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Paper" },
    ],
    questionsSolvedDetails: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    ],
    selectedSubjects: [{ type: Number, default: null }],
  },
  { timestamps: true }
);

// Encrypting passwords via bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //encrypt only when modified

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//decrypting and authenticating password after user input
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//access tokens and refresh tokens
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
