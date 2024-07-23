import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import dotenv from "dotenv";

dotenv.config();

export async function POST(req: NextRequest) {
  const { question, totalMarks, userEssay, subjectName, subjectCode } =
    await req.json();

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
    You are an CIE examiner. Evaluate the following essay question, user's response, and grading criteria:
    
    Subject: ${subjectName} (${subjectCode})
    Essay Question: ${question}
    User's Essay: ${userEssay}
    Total Marks: ${totalMarks}
    
    Provide the following:
    1. A grade out of ${totalMarks} for the user's essay, strictly based on the grading criteria described in the marking scheme.
    2. Detailed feedback on the essay and reasoning behind each grade component.
    3. An example of an optimal essay response for the given question.
    
    Format your response as follows, single line json document with JSON optimized Latext Text:
    {
      "grade": "<grade out of totalMarks>",
      "feedback": "<detailed feedback>",
    }
    `;

    // Generate the response using OpenAI
    const response = await generateText({
      model: openai("gpt-4o-mini"), // or any other model you are using
      prompt,
      maxTokens: 1500, // Adjust the max tokens based on expected length
    });

    const generatedText = response.text.trim();

    // Ensure the response is valid JSON
    let generatedJson;
    try {
      generatedJson = JSON.parse(generatedText);
    } catch (error) {
      throw new Error("Failed to parse JSON from AI response");
    }

    const { grade, feedback, optimalEssay } = generatedJson;

    // Return the generated result
    return NextResponse.json({ grade, feedback, optimalEssay }, { status: 200 });
  } catch (error) {
    console.error(error); // Add more detailed logging
    return NextResponse.json(
      { error: "Failed to generate grading and feedback" },
      { status: 500 }
    );
  }
}
