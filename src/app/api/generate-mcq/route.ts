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

  const { subjectCode, subjectName, level, topic, subtopic, difficultyRating } = await req.json();

  if (!subjectCode || !subjectName || !level || !topic || !subtopic || !difficultyRating) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const prompt = `Generate an ${level} ${subjectName} MCQ on ${topic} (${subtopic}), difficulty ${difficultyRating}/100. Include 4 options (one correct) and a ${
      difficultyRating * 4
    }-word explanation. Use LaTex and Markdown for creating tables, diagrams, graphs and other models of graphics if necessary and absolutely relevant within the question and explanation strings themselves. Ensure the LaTex and Markdown is correctly formatted for JSON as well as proper display in the frontend.`;

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

    const { object: generatedQuestion } = await generateObject({
      model: openai("model"),
      schema,
      prompt,
    });

    const newQuestion = new QuestionModel({
      subject: { name: subjectName, subjectCode },
      level,
      difficultyRating,
      topic,
      subtopic,
      questionText: generatedQuestion.questionText,
      options: generatedQuestion.options,
      correctOption: generatedQuestion.correctOption,
      explanation: generatedQuestion.explanation,
      totalAttempts: 0,
      totalCorrect: 0,
    });

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