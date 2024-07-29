import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { FREE_SUBJECT_LIMIT } from "@/constants";
import mongoose from "mongoose";
import { authOptions } from "../auth/[...nextauth]/options";

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

export async function PUT(req: NextRequest) {
  await dbConnect();

  const session = await getServerSession({ req, res: NextResponse, ...authOptions });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user._id;
  const { selectedSubjects, currentPassword, newPassword } = await req.json() as {
    selectedSubjects?: Subject[];
    currentPassword?: string;
    newPassword?: string;
  };

  if (!userId || (!selectedSubjects && (!currentPassword || !newPassword))) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (selectedSubjects) {
      const currentTime = new Date();
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      if (!user.premiumAccess.valid) {
        if (selectedSubjects.length > FREE_SUBJECT_LIMIT) {
          return NextResponse.json({
            message: `Non-premium users can select up to ${FREE_SUBJECT_LIMIT} subjects only. Upgrade to premium for unlimited access.`,
          }, { status: 403 });
        }

        const recentSubjects = user.selectedSubjects.filter(
          (subject) => subject.dateAdded > twoMonthsAgo
        );

        if (
          recentSubjects.length < user.selectedSubjects.length &&
          selectedSubjects.length < user.selectedSubjects.length
        ) {
          return NextResponse.json({
            message: "You cannot remove subjects within 2 months of adding them.",
          }, { status: 403 });
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
        return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return NextResponse.json({ message: "Account details updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating account details:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
