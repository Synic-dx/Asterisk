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
      difficultyRating
    } = await req.json();

    // Validate the required fields
    if (!subjectCode || !subjectName || !level || !topic || !subtopic || !difficultyRating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a new difficulty rating within ±35 range of the previous sum's difficultyRating
    const newDifficultyRating = Math.max(0, Math.min(100, difficultyRating + Math.floor(Math.random() * 71) - 35));

    // Prepare the prompt string
    const prompt = `Generate an ${level} ${subjectName} MCQ on ${topic} (${subtopic}), difficulty ${newDifficultyRating}/100. ` +
      `Include 4 options (one correct) and a ${difficultyRating * 4}-word explanation. ` +
      `Use LaTex and Markdown for creating tables, diagrams, graphs, and other models of graphics if necessary and absolutely relevant within the question and explanation strings themselves. ` +
      `Ensure the LaTex and Markdown is correctly formatted for JSON as well as proper display in the frontend.`;

    // Trim the prompt to remove any unwanted spaces or line breaks
    const trimmedPrompt = prompt.trim();

    // Define the schema for the generated response
    const schema = z.object({
      questionText: z.string(),
      explanation: z.string(),
      options: z.array(
        z.object({
          option: z.string(),
          text: z.string(),
        })
      ),
      correctOption: z.object({
        option: z.string(),
        text: z.string(),
      }),
    });

    // Generate the question using the AI model
    const { object: generatedQuestion } = await generateObject({
      model: openai("model"),
      schema,
      prompt: trimmedPrompt,
    });

    // Create a new question document
    const newQuestion = new QuestionModel({
      subject: { name: subjectName, subjectCode },
      level,
      difficultyRating: newDifficultyRating,
      topic,
      subtopic,
      questionText: generatedQuestion.questionText,
      options: generatedQuestion.options,
      correctOption: generatedQuestion.correctOption,
      explanation: generatedQuestion.explanation,
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
