import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export async function POST(req: NextRequest) {
  const { question, totalMarks, userEssay, subjectName, subjectCode, questionType } = await req.json();

  // Validate input
  if (!question || totalMarks === undefined || !userEssay || !subjectName || !subjectCode) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // Create the prompt based on the provided essay question, user's response, grading criteria, subject details
    const prompt = `
      Evaluate the following essay question, user's response, based on the appropriate grading criteria:
      Subject: ${subjectName} (${subjectCode})
      Essay Question: ${question}
      Type of Question: ${questionType}
      User's Essay: ${userEssay}
      Total Marks: ${totalMarks}
      Provide the following:
      1. A grade out of ${totalMarks} for the user's essay, strictly based on the grading criteria of this type of question.
      2. Detailed feedback on the essay and reasoning behind each grade component.
    `.trim().replace(/\s+/g, ' ');

    // Define the Zod schema
    const schema = z.object({
      grade: z.string(),
      feedback: z.string(),
    });

    // Generate the response using OpenAI
    const { object: generatedResponse } = await generateObject({
      model: openai("fine-tuned-model"), // to be replaced after payment
      schema,
      prompt,
    });

    const { grade, feedback } = generatedResponse;

    // Return the generated result
    return NextResponse.json({ grade, feedback }, { status: 200 });
  } catch (error) {
    console.error(error); // Add more detailed logging
    return NextResponse.json(
      { error: "Failed to generate grading and feedback" },
      { status: 500 }
    );
  }
}
