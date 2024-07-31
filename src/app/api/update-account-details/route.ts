import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import SubjectModel from "@/models/subject.model";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "../auth/[...nextauth]/options";
import { FREE_SUBJECT_LIMIT } from "@/constants";

export interface SubjectPayload {
  subjectCode: string;
  subjectName: string;
  dateAdded: Date;
}

export interface SelectedSubjectsAndStats {
  subjectObjectId: mongoose.Types.ObjectId;
  userRating: number;
  userAttempts: number;
  userCorrectAnswers: number;
  userPercentile: number;
  dateAdded: Date;
}

export async function PUT(req: NextRequest) {
  await dbConnect();

  try {
    // Get user session
    const session = await getServerSession({
      req,
      res: NextResponse,
      ...authOptions,
    });

    if (!session || !session.user || !session.user._id) {
      console.error("Session or user not found.");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user._id;
    const { subjectsToUpdate, subjectsToDelete, currentPassword, newPassword } =
      (await req.json()) as {
        subjectsToUpdate?: SubjectPayload[];
        subjectsToDelete?: string[];
        currentPassword?: string;
        newPassword?: string;
      };

    // Fetch user from the database
    let user;
    try {
      user = await UserModel.findById(userId);
    } catch (dbError) {
      console.error("Database error while fetching user:", dbError);
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    if (!user) {
      console.error("User not found with ID:", userId);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if the user has premium access
    const hasValidPremiumAccess =
      user.premiumAccess.valid &&
      user.premiumAccess.accessTill &&
      user.premiumAccess.accessTill > new Date();

    // Handle subject updates
    if (subjectsToUpdate && subjectsToUpdate.length > 0) {
      // Get existing subject codes
      const existingSubjectCodes = user.selectedSubjects.map(
        (subject: SelectedSubjectsAndStats) =>
          subject.subjectObjectId.toString()
      );

      // Filter out subjects that are already in the user's selected subjects
      const newSubjects = subjectsToUpdate.filter(
        (subject: SubjectPayload) =>
          !existingSubjectCodes.includes(subject.subjectCode)
      );

      // Calculate the total number of subjects after the update
      const totalSubjectsAfterUpdate =
        user.selectedSubjects.length + newSubjects.length;

      // Check if the user exceeds the free subject limit
      if (
        !hasValidPremiumAccess &&
        totalSubjectsAfterUpdate > FREE_SUBJECT_LIMIT
      ) {
        return NextResponse.json(
          {
            message: `Free users can only select up to ${FREE_SUBJECT_LIMIT} subjects`,
          },
          { status: 403 }
        );
      }

      // Proceed with updating subjects if limit is not exceeded
      try {
        const subjectCodes = newSubjects.map((subject) => subject.subjectCode);

        // Fetch subjects from the database that match the subject codes
        const existingSubjects = await SubjectModel.find({
          subjectCode: { $in: subjectCodes },
        }).exec();

        // Create a mapping of subject code to ObjectId
        const subjectMap = existingSubjects.reduce((acc, subject) => {
          acc[subject.subjectCode] = subject._id;
          return acc;
        }, {} as Record<string, mongoose.Types.ObjectId>);

        // Update user's selectedSubjects
        const updatedSubjects = newSubjects.map((subject: SubjectPayload) => ({
          subjectObjectId:
            subjectMap[subject.subjectCode] || new mongoose.Types.ObjectId(), // Use existing or create new ObjectId
          userRating: 50, // Default value
          userAttempts: 0, // Default value
          userCorrectAnswers: 0, // Default value
          userPercentile: 50, // Default value
          dateAdded: subject.dateAdded || new Date(),
        })) as SelectedSubjectsAndStats[];

        user.selectedSubjects.push(...updatedSubjects);

        // Save user to the database after updating subjects
        try {
          await user.save();
          console.log("User updated with subjects:", user);
        } catch (saveError) {
          console.error(
            "Error saving user after updating subjects:",
            saveError
          );
          return NextResponse.json(
            { message: "Error saving user" },
            { status: 500 }
          );
        }
      } catch (updateError) {
        console.error("Error updating subjects:", updateError);
        return NextResponse.json(
          { message: "Error updating subjects" },
          { status: 500 }
        );
      }
    }

    // Handle subject deletions
if (subjectsToDelete && subjectsToDelete.length > 0) {
  try {
    // Fetch the subjects to delete from the database
    const subjectsToDeleteData = await SubjectModel.find({
      subjectCode: { $in: subjectsToDelete },
    }).exec();

    // Create a mapping of subjectObjectId to subjectCode
    const subjectObjectIdToCodeMap = subjectsToDeleteData.reduce(
      (acc, subject) => {
        acc[subject._id.toString()] = subject.subjectCode;
        return acc;
      },
      {} as Record<string, string>
    );

    // Get current date for comparison
    const currentDate = new Date();

    // Filter subjects to delete based on the date added and user's premium access
    const filteredSubjectsToDelete = user.selectedSubjects.filter(
      (subject: SelectedSubjectsAndStats) => {
        const dateAdded = new Date(subject.dateAdded);
        const isLessThan2Months = new Date(dateAdded.setMonth(dateAdded.getMonth() + 2)) > currentDate;

        // Check if the subject should not be deleted unless the user has premium access
        return !(isLessThan2Months && !hasValidPremiumAccess);
      }
    );

    // Check if any subjects were actually removed
    const subjectsRemoved = user.selectedSubjects.filter(
      (subject: SelectedSubjectsAndStats) =>
        !filteredSubjectsToDelete.some(
          (filteredSubject: SelectedSubjectsAndStats) =>
            filteredSubject.subjectObjectId.toString() === subject.subjectObjectId.toString()
        )
    );

    // Remove subjects from user's selectedSubjects by subjectObjectId
    user.selectedSubjects = filteredSubjectsToDelete.filter(
      (subject: SelectedSubjectsAndStats) =>
        !subjectObjectIdToCodeMap[subject.subjectObjectId.toString()]
    );

    // Save user to the database after deleting subjects
    try {
      await user.save();
      console.log("User updated with deleted subjects:", user);
      return NextResponse.json(
        {
          message: "Subjects deleted successfully",
          deletedSubjects: subjectsRemoved.map((subject: SelectedSubjectsAndStats) => subject.subjectObjectId.toString()),
        },
        { status: 200 }
      );
    } catch (saveError) {
      console.error(
        "Error saving user after deleting subjects:",
        saveError
      );
      return NextResponse.json(
        { message: "Error saving user" },
        { status: 500 }
      );
    }
  } catch (deleteError) {
    console.error("Error deleting subjects:", deleteError);
    return NextResponse.json(
      { message: "Error deleting subjects" },
      { status: 500 }
    );
  }
}


    // Handle password update
    if (currentPassword && newPassword) {
      if (!user.password) {
        console.error("User password is not set.");
        return NextResponse.json(
          { message: "User password not set" },
          { status: 400 }
        );
      }

      try {
        const isPasswordCorrect = await bcrypt.compare(
          currentPassword,
          user.password
        );

        if (!isPasswordCorrect) {
          console.error("Current password is incorrect.");
          return NextResponse.json(
            { message: "Current password is incorrect" },
            { status: 400 }
          );
        }

        user.password = await bcrypt.hash(newPassword, 10);
        console.log("User password hashed.");
      } catch (bcryptError) {
        console.error("Error processing password:", bcryptError);
        return NextResponse.json(
          { message: "Error processing password" },
          { status: 500 }
        );
      }

      // Save user after password update
      try {
        await user.save();
        console.log("User password updated and saved.");
      } catch (saveError) {
        console.error("Error saving user after updating password:", saveError);
        return NextResponse.json(
          { message: "Error saving user" },
          { status: 500 }
        );
      }
    }

    // Update session to reflect new user data
    try {
      const updatedSession = await getServerSession({
        req,
        res: NextResponse,
        ...authOptions,
      });

      return NextResponse.json(
        {
          message: "Account details updated successfully",
          user: updatedSession?.user, // Include the updated session user data
        },
        { status: 200 }
      );
    } catch (sessionError) {
      console.error("Error updating session:", sessionError);
      return NextResponse.json(
        { message: "Error updating session" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Unexpected error updating account details:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Internal server error", error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
