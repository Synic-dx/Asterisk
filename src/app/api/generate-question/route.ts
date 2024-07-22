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
    const prompt = `Generate an ${level} ${subjectName} question on ${topic} (${subtopic}), difficulty ${difficultyRating}/100. Include 4 options (one correct) and a ${difficultyRating * 4}-word explanation. Use LaTex if necessary but correctly format it for json. Provide the question in an one line JSON code of this format: {"questionText":"What is the derivative of \\( f(x) = x^2 + 3x + 2 \\)?","explanation":"The derivative of \\( f(x) = x^2 + 3x + 2 \\) is found using the power rule: \\[ f'(x) = 2x + 3 \\]","options":[{"option":"A","text":"2x + 3"},{"option":"B","text":"x^2 + 3"},{"option":"C","text":"2x + 2"},{"option":"D","text":"x + 3"}],"correctOption":{"option":"A","text":"2x + 3"}}`;

    const response = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 1000,
    });

    const generatedText = response.text.trim();

    // Ensure the response is valid JSON
    let generatedJson;
    try {
      generatedJson = JSON.parse(generatedText);
    } catch (error) {
      throw new Error("Failed to parse JSON from AI response");
    }

    const { questionText, options, correctOption, explanation } = generatedJson;

    // Caching logic (if needed) could be added here

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
    console.error(error); // Add more detailed logging
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
