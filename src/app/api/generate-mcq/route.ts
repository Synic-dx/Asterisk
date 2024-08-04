import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/question.model";
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import dotenv from "dotenv";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import { QUESTION_DIFFICULTY_RANGE } from "@/constants";

dotenv.config();

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ error: "Database connection error" }, { status: 500 });
  }

  let session;
  try {
    // Retrieve session
    session = await getServerSession({ req, ...authOptions });
  } catch (error) {
    console.error("Session retrieval error:", error);
    return NextResponse.json({ error: "Failed to retrieve session" }, { status: 500 });
  }

  // Validate session
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Retrieve and validate request data
    const {
      subjectCode,
      subjectName,
      level,
      topic,
      subtopic,
      difficultyRating,
    } = await req.json();

    if (
      !subjectCode ||
      !subjectName ||
      !level ||
      !topic ||
      !subtopic ||
      !difficultyRating
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a new difficulty rating within ±35 range of the previous sum's difficultyRating
    const newDifficultyRating = Math.max(
      0,
      Math.min(100, difficultyRating + Math.floor(Math.random() * ((2 * QUESTION_DIFFICULTY_RANGE) + 1)) - QUESTION_DIFFICULTY_RANGE)
    );

    // Prepare the prompt string
    const prompt = `Generate a ${level} ${subjectName} MCQ on ${topic} (${subtopic}) with a difficulty of ${newDifficultyRating}/100. Include 4 options (one correct) and a ${difficultyRating * 3}-word explanation. Use Markdown and Unicode math symbols (e.g. + − × ÷ % ½ ⅓ x² x³ x₁ x₂ ₀ α β γ Δ π σ ω θ Θ ∫ ∑ ∏ ∇ ∞ ≈ ≠ ≤ ≥ ＜ ＞ ∠ ° → ↔ ⟶ ⟹ ⟺ ∈ ∉ ∪ ∩ ∀ ∃ ⊆ ⊇ ⊂ ⊃ ⊄ ⊅ ∅ ⌒ ⟋ ⟌ ⟒  ⃗ ⃖ │ └ ┌ ⟉ ⟄ ⟅ ⁿCᵣ ⁿPᵣ). Avoid quotation marks and use \n for line breaks and DO NOT USE LATEX also produce diagrams/curves using Markdown without linking external images. Ensure Markdown formatting is JSON-compatible.`;

    // Trim the prompt to remove any unwanted spaces or line breaks
    const trimmedPrompt = prompt.trim();

    // Define the schema for the generated response
    const schema = z.object({
      questionText: z.string().min(1, "Question text is required"),
      explanation: z.string().min(1, "Explanation is required"),
      options: z
        .array(
          z.object({
            option: z.string().min(1, "Option identifier is required"),
            text: z.string().min(1, "Option text is required"),
          })
        )
        .length(4, "There should be exactly 4 options"),
      correctOption: z.object({
        option: z.string().min(1, "Correct option identifier is required"),
        text: z.string().min(1, "Correct option text is required"),
      }),
    });

    // Generate the question using the AI model
    const { object: generatedQuestion } = await generateObject({
      model: openai("model"),
      schema,
      prompt: trimmedPrompt,
    });

    // Validate generated question
    const validationResult = schema.safeParse(generatedQuestion);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Generated question did not match the schema" },
        { status: 500 }
      );
    }

    // Create a new question document
    const newQuestion = new QuestionModel({
      subject: { name: subjectName, subjectCode },
      level,
      difficultyRating: newDifficultyRating,
      topic,
      subtopic,
      questionText: generatedQuestion.questionText.trim(),
      options: generatedQuestion.options.map((option) => ({
        option: option.option.trim(),
        text: option.text.trim(),
      })),
      correctOption: {
        option: generatedQuestion.correctOption.option.trim(),
        text: generatedQuestion.correctOption.text.trim(),
      },
      explanation: generatedQuestion.explanation.trim(),
      totalAttempts: 0,
      totalCorrect: 0,
    });

    // Save the new question document to the database
    try {
      await newQuestion.save();
    } catch (error) {
      console.error("Error saving question:", error);
      return NextResponse.json(
        { error: "Failed to save question" },
        { status: 500 }
      );
    }

    return NextResponse.json(newQuestion, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
