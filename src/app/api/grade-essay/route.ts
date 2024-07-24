import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import UserModel from "@/models/user.model";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export async function POST(req: NextRequest) {
  const {
    question,
    totalMarks,
    userEssay,
    subjectName,
    subjectCode,
    questionType,
    userId,
  } = await req.json();

  if (
    !question ||
    totalMarks === undefined ||
    !userEssay ||
    !subjectName ||
    !subjectCode ||
    !questionType ||
    !userId
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const user = await UserModel.findById(userId);

    if (!user || !user.graderAccess || !user.graderAccess.graderAccessModel) {
      return NextResponse.json(
        { error: "Grader access required or not found" },
        { status: 403 }
      );
    }

    const now = new Date();
    if (user.graderAccess.accessTill && user.graderAccess.accessTill < now) {
      return NextResponse.json(
        { error: "Grader access has expired" },
        { status: 403 }
      );
    }

    const weeklyEssayLimit =
      user.graderAccess.graderAccessModel.weeklyEssayLimit;
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const essaysGradedThisWeek = user.essaysGraded.filter(
      (essay) => new Date(essay.date) >= weekStart
    ).length;

    if (essaysGradedThisWeek >= weeklyEssayLimit) {
      return NextResponse.json(
        { error: "Weekly essay limit reached" },
        { status: 403 }
      );
    }

    const prompt = `Evaluate the following descriptive writing based on the provided grading criteria:\n\nSubject: ${subjectName}\nEssay Type: ${questionType}\nUser's Essay: ${userEssay}\nTotal Marks: ${totalMarks}\n\nProvide:\n1. A grade out of ${totalMarks} for the user's descriptive writing, strictly based on the grading criteria of this type of writing.\n2. Detailed feedback on the writing and reasoning behind each grade component.`;

    const schema = z.object({
      grade: z.string(),
      feedback: z.string(),
    });

    const { object: generatedResponse } = await generateObject({
      model: openai(user.graderAccess.graderAccessModel.model),
      schema,
      prompt,
    });

    const { grade, feedback } = generatedResponse;

    // Generate a unique essay ID
    const essayId = new mongoose.Types.ObjectId();

    // Save grading information
    user.essaysGraded.push({
      essayId,
      date: new Date(),
      question,
      subjectName,
      subjectCode,
      questionType,
      userEssay,
      totalMarks,
      grade,
      feedback,
    });
    await user.save();

    return NextResponse.json({ grade, feedback }, { status: 200 });
  } catch (error) {
    console.error("Error grading essay:", error);
    return NextResponse.json(
      { error: "Failed to generate grading and feedback" },
      { status: 500 }
    );
  }
}
