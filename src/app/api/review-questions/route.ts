import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";
import { getSession } from "next-auth/react";

// Define the interface for question details
interface QuestionDetail {
  questionObjectId: mongoose.Types.ObjectId;
  subjectCode: string;
  userAnswer: string;
  userQuestionTime: number;
  isCorrect: boolean;
  attemptedOn: Date;
  averageTimeTaken?: number;
}

// Helper function to group questions by subjectCode
const groupBySubjectCode = (questions: QuestionDetail[]) => {
  return questions.reduce<Record<string, QuestionDetail[]>>((acc, question) => {
    const { subjectCode } = question;
    if (!acc[subjectCode]) {
      acc[subjectCode] = [];
    }
    acc[subjectCode].push(question);
    return acc;
  }, {});
};

// Helper function to get aggregated stats by date range
const getStatsByDate = async (userId: mongoose.Types.ObjectId, startDate: Date): Promise<QuestionDetail[]> => {
  const stats = await UserModel.aggregate([
    { $match: { _id: userId } },
    { $unwind: "$questionsSolvedDetails" },
    {
      $match: {
        "questionsSolvedDetails.attemptedOn": { $gte: startDate },
      },
    },
    {
      $project: {
        _id: 0,
        questionObjectId: "$questionsSolvedDetails.questionObjectId",
        subjectCode: "$questionsSolvedDetails.subjectCode",
        userAnswer: "$questionsSolvedDetails.userAnswer",
        userQuestionTime: "$questionsSolvedDetails.userQuestionTime",
        isCorrect: "$questionsSolvedDetails.isCorrect",
        attemptedOn: "$questionsSolvedDetails.attemptedOn",
        averageTimeTaken: "$questionsSolvedDetails.averageTimeTaken",
      },
    },
    {
      $group: {
        _id: null,
        questionsSolved: { $push: "$$ROOT" },
      },
    },
  ]);
  return stats[0]?.questionsSolved || [];
};

const getReviewData = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Retrieve session
  const session = await getSession({ req });

  // Validate session
  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = new mongoose.Types.ObjectId(session.user.id);

  try {
    // Find the user by userId
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has premium access and if it is still valid
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of the day
    if (!user.premiumAccess.valid || (user.premiumAccess.accessTill && user.premiumAccess.accessTill <= today)) {
      return res.status(403).json({ message: "Premium access required or access expired" });
    }

    // Define date ranges
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the week
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the month
    const startOfYear = new Date(today.getFullYear(), 0, 1); // Start of the year

    // Fetch stats for different periods
    const [dailyQuestions, weeklyQuestions, monthlyQuestions, yearlyQuestions] = await Promise.all([
      getStatsByDate(userId, today),
      getStatsByDate(userId, startOfWeek),
      getStatsByDate(userId, startOfMonth),
      getStatsByDate(userId, startOfYear),
    ]);

    // Group questions by subjectCode for each time period
    const groupedBySubjectCode = (questions: QuestionDetail[]) => groupBySubjectCode(questions);

    // Send the response with all aggregated data
    res.status(200).json({
      allQuestionsSolved: {
        daily: dailyQuestions,
        weekly: weeklyQuestions,
        monthly: monthlyQuestions,
        yearly: yearlyQuestions,
      },
      groupedBySubjectCode: {
        daily: groupedBySubjectCode(dailyQuestions),
        weekly: groupedBySubjectCode(weeklyQuestions),
        monthly: groupedBySubjectCode(monthlyQuestions),
        yearly: groupedBySubjectCode(yearlyQuestions),
      },
    });
  } catch (error) {
    console.error("Error retrieving review data:", error);
    res.status(500).json({ message: "Error retrieving review data", error });
  }
};

export default getReviewData;
