import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { getSession } from "next-auth/react";
import { FREE_SUBJECT_LIMIT } from "@/constants";
import mongoose from "mongoose";

// Define the Subject interface for type-checking, updated to reflect the new structure
export interface Subtopic {
  name: string;
}

export interface Topic {
  name: string;
  subtopics: Subtopic[];
}

export interface Subject {
  subjectObjectId: mongoose.Types.ObjectId;
  subjectName: string;
  subjectCode: string;
  userRating: number;
  userAttempts: number;
  userCorrectAnswers: number;
  userPercentile?: number;
  dateAdded: Date;
  topics?: Topic[];  // Updated to include topics
}

const updateAccountDetails = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user._id;
  const { selectedSubjects, currentPassword, newPassword } = req.body as {
    selectedSubjects?: Subject[];
    currentPassword?: string;
    newPassword?: string;
  };

  if (!userId || (!selectedSubjects && (!currentPassword || !newPassword))) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (selectedSubjects) {
      const currentTime = new Date();
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      if (!user.premiumAccess.valid) {
        if (selectedSubjects.length > FREE_SUBJECT_LIMIT) {
          return res.status(403).json({
            message: `Non-premium users can select up to ${FREE_SUBJECT_LIMIT} subjects only. Upgrade to premium for unlimited access.`,
          });
        }

        const recentSubjects = user.selectedSubjects.filter(
          (subject) => subject.dateAdded > twoMonthsAgo
        );

        if (
          recentSubjects.length < user.selectedSubjects.length &&
          selectedSubjects.length < user.selectedSubjects.length
        ) {
          return res.status(403).json({
            message: "You cannot remove subjects within 2 months of adding them.",
          });
        }
      }

      // Map the updated subjects with topics
      user.selectedSubjects = selectedSubjects.map((subject) => {
        const existingSubject = user.selectedSubjects.find(
          (s) => s.subjectObjectId.toString() === subject.subjectObjectId.toString()
        );
        return {
          ...subject,
          dateAdded: existingSubject ? existingSubject.dateAdded : currentTime,
        };
      });
    }

    if (currentPassword && newPassword) {
      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return res.status(200).json({ message: "Account details updated successfully" });
  } catch (error) {
    console.error("Error updating account details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default updateAccountDetails;
