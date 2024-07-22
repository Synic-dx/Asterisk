import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/question.model";
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import dotenv from "dotenv";

dotenv.config();

export async function POST(req: NextRequest) {
  await dbConnect();

  const { subjectCode, subjectName, level, topic, subtopic, difficultyRating } =
    await req.json();

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

  try {
    const prompt = `Generate an ${level} ${subjectName} question on ${topic}, ${subtopic}, difficulty ${difficultyRating}/100. Include 4 options (one correct) and a ${
      difficultyRating * 4
    }-word explanation. Use LaTeX if needed. Return in JSON format: {"questionText":"What is the capital of France?","options":[{"option":"A","text":"Paris"},{"option":"B","text":"London"},{"option":"C","text":"Berlin"},{"option":"D","text":"Madrid"}],"correctOption":{"option":"A","text":"Paris"},"explanation":"Paris is the capital of France."}
`;

    const response = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 600,
    });

    const generatedText = response.text.trim();
    const generatedJson = JSON.parse(generatedText);

    const { questionText, options, correctOption, explanation } = generatedJson;

    const newQuestion = new QuestionModel({
      subject: { name: subjectName, subjectCode },
      level,
      difficultyRating,
      topic,
      subtopic,
      questionText,
      options,
      correctOption,
      explanation,
      totalAttempts: 0,
      totalCorrect: 0,
    });

    await newQuestion.save();

    return NextResponse.json(newQuestion, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
