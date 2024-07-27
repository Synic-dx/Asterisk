import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/question.model";
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const {
      subjectCode,
      subjectName,
      level,
      topic,
      subtopic,
      difficultyRating,
    } = await req.json();

    // Validate the required fields
    if (
      !subjectCode ||
      !subjectName ||
      !level ||
      !topic ||
      !subtopic ||
      !difficultyRating
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a new difficulty rating within ±35 range of the previous sum's difficultyRating
    const newDifficultyRating = Math.max(
      0,
      Math.min(100, difficultyRating + Math.floor(Math.random() * 71) - 35)
    );

    // Prepare the prompt string
    const prompt = `Generate a ${level} ${subjectName} MCQ on ${topic} (${subtopic}) with a difficulty of ${newDifficultyRating}/100. Include 4 options (one correct) and a ${difficultyRating * 4}-word explanation. Use Markdown and Unicode math symbols (e.g. + − × ÷ % ½ ⅓ ¼ ¾ x² x³ x₁ x₂ x₃ ₀ α β γ Δ π σ ω θ Θ ∫ ∑ ∏ ∇ ∞ ≈ ≠ ≤ ≥ ＜ ＞ ∠ ° → ↔ ⟶ ⟹ ⟺ ∈ ∉ ∪ ∩ ∀ ∃ ⊆ ⊇ ⊂ ⊃ ⊄ ⊅ ∅ ⌒ ⟋ ⟌ ⟒  ⃗ ⃖ │ └ ┌ ⟉ ⟄ ⟅ ⁿCₖ ⁿPₖ). Avoid quotation marks and use /n for line breaks. Ensure Markdown formatting is JSON-compatible.`;

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
    await newQuestion.save();

    return NextResponse.json(newQuestion, { status: 200 });
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
