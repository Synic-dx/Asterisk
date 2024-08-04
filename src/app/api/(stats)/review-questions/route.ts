import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next'; // Ensure this import is correct
import { authOptions } from '../../(authentication)/auth/[...nextauth]/options'; // Ensure this import is correct

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
function groupBySubjectCode(questions: QuestionDetail[]) {
  return questions.reduce<Record<string, QuestionDetail[]>>((acc, question) => {
    const { subjectCode } = question;
    if (!acc[subjectCode]) {
      acc[subjectCode] = [];
    }
    acc[subjectCode].push(question);
    return acc;
  }, {});
}

// Helper function to get aggregated stats by date range
async function getStatsByDate(userId: mongoose.Types.ObjectId, startDate: Date): Promise<QuestionDetail[]> {
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
}

export async function GET(req: NextRequest) {
  await dbConnect();

  // Retrieve session
  const session = await getServerSession({ req, ...authOptions }); // Use spread operator

  // Validate session
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = new mongoose.Types.ObjectId(session.user.id);

  try {
    // Find the user by userId
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if the user has premium access and if it is still valid
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of the day
    if (!user.premiumAccess.valid || (user.premiumAccess.accessTill && user.premiumAccess.accessTill <= today)) {
      return NextResponse.json({ message: "Premium access required or access expired" }, { status: 403 });
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
    return NextResponse.json({
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
    return NextResponse.json({ message: "Error retrieving review data", error }, { status: 500 });
  }
}
