import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"; // Adjust the import path based on your setup
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      question,
      totalMarks,
      userEssay,
      subjectName,
      subjectCode,
      questionType,
      userId,
    } = req.body;

    // Validate required fields
    if (
      !question ||
      totalMarks === undefined ||
      !userEssay ||
      !subjectName ||
      !subjectCode ||
      !questionType ||
      !userId
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch user
    const user = await UserModel.findById(userId);

    if (!user || !user.graderAccess || !user.graderAccess.model) {
      return res
        .status(403)
        .json({ error: "Grader access required or not found" });
    }

    // Check if grader access is still valid
    const now = new Date();
    if (user.graderAccess.accessTill && user.graderAccess.accessTill < now) {
      return res.status(403).json({ error: "Grader access has expired" });
    }

    // Check weekly essay limit
    const weeklyEssayLimit = user.graderAccess.weeklyEssayLimit;
    if (weeklyEssayLimit === undefined) {
      return res
        .status(500)
        .json({ error: "Weekly essay limit is not defined" });
    }

    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const essaysGradedThisWeek = user.essaysGraded.filter(
      (essay) => new Date(essay.date) >= weekStart
    ).length;

    if (essaysGradedThisWeek >= weeklyEssayLimit) {
      return res.status(403).json({ error: "Weekly essay limit reached" });
    }

    // Create grading prompt
    const prompt =
      `Evaluate the following descriptive writing based on the provided grading criteria: Subject: ${subjectName}
      Essay Type: ${questionType}
      User's Essay: ${userEssay}
      Total Marks: ${totalMarks}
      Provide:
      1. A grade out of ${totalMarks} for the user's descriptive writing, strictly based on the grading criteria of this type of writing.
      2. Detailed feedback on the writing and reasoning behind each grade component, the criteria of the grading scheme it succeeded and/or failed to achieve, using properly formatted Markdown for JSON. Do not use quotation marks (use italics if suitable instead) and use /n instead of linebreaks.`.trim();

    // Define response schema
    const schema = z.object({
      grade: z.string().min(1, "Grade is required"),
      feedback: z.string().min(1, "Feedback is required"),
    });

    // Generate grading response
    const { object: generatedResponse } = await generateObject({
      model: openai(user.graderAccess.model),
      schema,
      prompt,
    });

    const { grade, feedback } = schema.parse(generatedResponse);

    // Generate a unique essay ID and save grading information
    const essayId = new mongoose.Types.ObjectId();

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

    return res.status(200).json({ grade, feedback });
  } catch (error) {
    console.error("Error grading essay:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate grading and feedback" });
  }
}
