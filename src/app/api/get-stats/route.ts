import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";

// Define the interface for the result of aggregated stats with question details
interface QuestionDetail {
  questionObjectId: mongoose.Types.ObjectId;
  userAnswer: string;
  userQuestionTime: number;
  isCorrect: boolean;
  attemptedOn: Date;
}

interface StatsResult {
  _id: null | string;
  totalAttempts: number;
  totalCorrects: number;
  questionsSolved: QuestionDetail[];
}

const getStats = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "GET") {
    const { userId } = req.query;

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId as string)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      // Find the user by userId
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Define date ranges
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of the day

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the week

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the month

      // Helper function to get aggregated stats by date
      const getStatsByDate = async (startDate: Date): Promise<StatsResult[]> => {
        return UserModel.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
          { $unwind: "$questionsSolvedDetails" },
          { $match: { "questionsSolvedDetails.attemptedOn": { $gte: startDate } } },
          {
            $group: {
              _id: null,
              totalAttempts: { $sum: 1 },
              totalCorrects: { $sum: { $cond: ["$questionsSolvedDetails.isCorrect", 1, 0] } },
              questionsSolved: { $push: "$questionsSolvedDetails" }
            }
          }
        ]);
      };

      // Fetch stats for different periods
      const [dailyStats, weeklyStats, monthlyStats, overallStats] = await Promise.all([
        getStatsByDate(today),
        getStatsByDate(startOfWeek),
        getStatsByDate(startOfMonth),
        getStatsByDate(new Date(0)) // Get all data
      ]);

      // Format the stats to return
      const formatStats = (stats: StatsResult[]) => ({
        totalAttempts: stats.length > 0 ? stats[0].totalAttempts : 0,
        totalCorrects: stats.length > 0 ? stats[0].totalCorrects : 0,
        questionsSolved: stats.length > 0 ? stats[0].questionsSolved : []
      });

      const daily = formatStats(dailyStats);
      const weekly = formatStats(weeklyStats);
      const monthly = formatStats(monthlyStats);
      const overall = formatStats(overallStats);

      // Function to group questions by subject
      const groupBySubject = (questions: any[]) => {
        return questions.reduce((acc: Record<string, any[]>, question: any) => {
          const subjectId = question.subjectId.toString();
          if (!acc[subjectId]) {
            acc[subjectId] = [];
          }
          acc[subjectId].push(question);
          return acc;
        }, {});
      };

      // Group questions by subject for each time period
      const dailyGroupedBySubject = groupBySubject(daily.questionsSolved);
      const weeklyGroupedBySubject = groupBySubject(weekly.questionsSolved);
      const monthlyGroupedBySubject = groupBySubject(monthly.questionsSolved);
      const overallGroupedBySubject = groupBySubject(overall.questionsSolved);

      // Send the response with all the aggregated data
      res.status(200).json({
        totalDailyAttempts: daily.totalAttempts,
        totalDailyCorrects: daily.totalCorrects,
        totalWeeklyAttempts: weekly.totalAttempts,
        totalWeeklyCorrects: weekly.totalCorrects,
        totalMonthlyAttempts: monthly.totalAttempts,
        totalMonthlyCorrects: monthly.totalCorrects,
        totalAttempts: overall.totalAttempts,
        totalCorrects: overall.totalCorrects,
        questionsSolvedToday: daily.questionsSolved,
        questionsSolvedThisWeek: weekly.questionsSolved,
        questionsSolvedThisMonth: monthly.questionsSolved,
        allQuestionsSolved: overall.questionsSolved,
        dailyGroupedBySubject,
        weeklyGroupedBySubject,
        monthlyGroupedBySubject,
        overallGroupedBySubject
      });
    } catch (error) {
      console.error("Error retrieving stats:", error);
      res.status(500).json({ message: "Error retrieving stats", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default getStats;
