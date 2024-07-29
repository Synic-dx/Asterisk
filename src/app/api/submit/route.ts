import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/question.model";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";
import {
  FREE_DAILY_QUESTION_LIMIT,
  FREE_SUBJECT_LIMIT,
} from "@/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

// Calculate user rating based on attempts and correct answers
export const calculateUserRating = (
  attempts: number,
  correctAnswers: number
): number => {
  return attempts === 0 ? 50 : Math.round((correctAnswers / attempts) * 100);
};

// Function to calculate percentile
const calculatePercentile = async (
  model: mongoose.Model<any>,
  field: string,
  value: number
): Promise<number> => {
  const count = await model.countDocuments({ [field]: { $gte: value } });
  const totalCount = await model.countDocuments();
  return totalCount === 0 ? 0 : (count / totalCount) * 100;
};

// Function to generate a new question
const generateNewQuestion = async (data: {
  subjectCode: string;
  subjectName: string;
  level: string;
  topic: string;
  subtopic: string;
  difficultyRating: number;
}) => {
  const generateQuestionApiUrl = `${process.env.BASE_URL}/api/generate-mcq`;

  try {
    const response = await fetch(generateQuestionApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || "Failed to generate new question");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating new question:", error);
    throw error;
  }
};

export async function POST(req: NextRequest) {
  await dbConnect();

  const { method } = req;

  if (method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  const {
    questionId,
    userAnswer,
    isCorrect,
    userQuestionTime,
    subjectCode,
    subjectName,
    level,
    topic,
    subtopic,
    difficultyRating,
  } = await req.json();

  // Authenticate the user
  const session = await getServerSession({ req, res: NextResponse, ...authOptions });
  if (!session || !session.user || !session.user._id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user._id;

  if (
    !questionId ||
    !userAnswer ||
    isCorrect === undefined ||
    !userQuestionTime ||
    !subjectCode ||
    !subjectName ||
    !level ||
    !topic ||
    !subtopic ||
    difficultyRating === undefined
  ) {
    return NextResponse.json({
      message: "All fields are required",
    }, { status: 400 });
  }

  try {
    const question = await QuestionModel.findById(questionId);
    const user = await UserModel.findById(userId);

    if (!question || !user) {
      return NextResponse.json({ message: "Question or User not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyAttemptsResult = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$questionsSolvedDetails" },
      { $match: { "questionsSolvedDetails.attemptedOn": { $gte: today } } },
      { $count: "dailyAttempts" },
    ]);

    const attemptsToday = dailyAttemptsResult.length > 0 ? dailyAttemptsResult[0].dailyAttempts : 0;

    if (!user.premiumAccess?.valid && attemptsToday >= FREE_DAILY_QUESTION_LIMIT) {
      return NextResponse.json({
        message: "Daily quota of questions reached. Upgrade to premium for unlimited access.",
      }, { status: 403 });
    }

    question.totalAttempts = (question.totalAttempts || 0) + 1;
    if (isCorrect) {
      question.totalCorrect = (question.totalCorrect || 0) + 1;
    }

    if (question.totalAttempts >= 10) {
      question.difficultyRating =
        ((question.totalAttempts - question.totalCorrect) / question.totalAttempts) * 100;
    }

    question.averageTimeTakenInSeconds = question.averageTimeTakenInSeconds
      ? (question.averageTimeTakenInSeconds * (question.totalAttempts - 1) + userQuestionTime) / question.totalAttempts
      : userQuestionTime;

    await question.save();

    user.questionsSolvedDetails.push({
      questionObjectId: question._id as mongoose.Types.ObjectId,
      subjectCode,
      userAnswer,
      userQuestionTime,
      isCorrect,
      attemptedOn: new Date(),
    });

    let subjectStats = user.selectedSubjects.find(
      (subject) => subject.subjectCode === subjectCode
    );

    if (subjectStats) {
      subjectStats.userAttempts += 1;
      if (isCorrect) {
        subjectStats.userCorrectAnswers += 1;
      }
      subjectStats.userRating = calculateUserRating(
        subjectStats.userAttempts,
        subjectStats.userCorrectAnswers
      );
    } else {
      if (
        !user.premiumAccess?.valid &&
        user.selectedSubjects.length >= FREE_SUBJECT_LIMIT
      ) {
        return NextResponse.json({ message: "Upgrade to premium to add more subjects." }, { status: 403 });
      }

      user.selectedSubjects.push({
        subjectObjectId: new mongoose.Types.ObjectId(subjectCode),
        subjectName,
        subjectCode,
        userRating: calculateUserRating(1, isCorrect ? 1 : 0),
        userAttempts: 1,
        userCorrectAnswers: isCorrect ? 1 : 0,
        dateAdded: new Date(),
      });

      subjectStats = user.selectedSubjects[user.selectedSubjects.length - 1];
    }

    const userRatingPercentile = await calculatePercentile(
      UserModel,
      "selectedSubjects.userRating",
      subjectStats.userRating
    );

    subjectStats.userPercentile = userRatingPercentile;

    user.userCumulativeAttempts = (user.userCumulativeAttempts || 0) + 1;
    if (isCorrect) {
      user.userCumulativeCorrects = (user.userCumulativeCorrects || 0) + 1;
    }

    user.userCumulativeRating = calculateUserRating(
      user.userCumulativeAttempts,
      user.userCumulativeCorrects || 0
    );

    user.userCumulativePercentile = await calculatePercentile(
      UserModel,
      "userCumulativeRating",
      user.userCumulativeRating
    );

    await user.save();

    const newQuestion = await generateNewQuestion({
      subjectCode,
      subjectName,
      level,
      topic,
      subtopic,
      difficultyRating,
    });

    return NextResponse.json({
      message: "Answer submitted successfully",
      newQuestion,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json({ message: "Error submitting answer", error: (error as Error).message }, { status: 500 });
  }
}
