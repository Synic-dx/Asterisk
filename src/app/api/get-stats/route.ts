import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

// Define the interface for the result of aggregated stats
interface StatsResult {
  _id: null | string;
  totalAttempts: number;
  totalCorrects: number;
}

interface DailyStats {
  date: string;
  userCumulativePercentile: number;
  userCumulativeRating: number;
  userCumulativeAttempts: number;
  userCumulativeCorrects: number;
  questionsAttempted: number;
}

// Handler for GET requests
export async function GET(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user._id;

    // Define date ranges for the last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of the day

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date;
    });

    // Helper function to get cumulative stats for a specific date
    const getCumulativeStatsByDate = async (date: Date): Promise<DailyStats> => {
      const stats = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        { $unwind: "$questionsSolvedDetails" },
        {
          $match: {
            "questionsSolvedDetails.attemptedOn": { $lte: date },
          },
        },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            totalCorrects: {
              $sum: { $cond: ["$questionsSolvedDetails.isCorrect", 1, 0] },
            },
          },
        },
      ]);

      const totalAttempts = stats.length > 0 ? stats[0].totalAttempts : 0;
      const totalCorrects = stats.length > 0 ? stats[0].totalCorrects : 0;
      const userCumulativeRating = totalAttempts === 0 ? 0 : (totalCorrects / totalAttempts) * 100;

      const userCumulativePercentile = await calculatePercentile(
        UserModel,
        "selectedSubjects.userRating",
        userCumulativeRating
      );

      // Calculate daily questions attempted
      const dailyAttempts = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        { $unwind: "$questionsSolvedDetails" },
        {
          $match: {
            "questionsSolvedDetails.attemptedOn": {
              $gte: new Date(date.getTime() - 24 * 60 * 60 * 1000),
              $lte: date,
            },
          },
        },
        { $count: "dailyAttempts" },
      ]);

      const questionsAttempted = dailyAttempts.length > 0 ? dailyAttempts[0].dailyAttempts : 0;

      return {
        date: date.toISOString().split("T")[0], // Format as YYYY-MM-DD
        userCumulativePercentile,
        userCumulativeRating,
        userCumulativeAttempts: totalAttempts,
        userCumulativeCorrects: totalCorrects,
        questionsAttempted,
      };
    };

    // Fetch cumulative stats for the last 7 days
    const cumulativeStats = await Promise.all(last7Days.map(date => getCumulativeStatsByDate(date)));

    // Helper function to get aggregated stats by date
    const getStatsByDate = async (startDate: Date): Promise<StatsResult[]> => {
      return UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        { $unwind: "$questionsSolvedDetails" },
        {
          $match: {
            "questionsSolvedDetails.attemptedOn": { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            totalCorrects: {
              $sum: { $cond: ["$questionsSolvedDetails.isCorrect", 1, 0] },
            },
          },
        },
      ]);
    };

    // Fetch stats for different periods
    const [dailyStats, weeklyStats, monthlyStats, overallStats] = await Promise.all([
      getStatsByDate(today),
      getStatsByDate(new Date(today.setDate(today.getDate() - today.getDay()))), // Start of the week
      getStatsByDate(new Date(today.getFullYear(), today.getMonth(), 1)), // Start of the month
      getStatsByDate(new Date(0)), // Get all data
    ]);

    // Format the stats to return
    const formatStats = (stats: StatsResult[]) => ({
      totalAttempts: stats.length > 0 ? stats[0].totalAttempts : 0,
      totalCorrects: stats.length > 0 ? stats[0].totalCorrects : 0,
    });

    const daily = formatStats(dailyStats);
    const weekly = formatStats(weeklyStats);
    const monthly = formatStats(monthlyStats);
    const overall = formatStats(overallStats);

    // Send the response with aggregated data
    res.status(200).json({
      cumulativeStats,
      totalDailyAttempts: daily.totalAttempts,
      totalDailyCorrects: daily.totalCorrects,
      totalWeeklyAttempts: weekly.totalAttempts,
      totalWeeklyCorrects: weekly.totalCorrects,
      totalMonthlyAttempts: monthly.totalAttempts,
      totalMonthlyCorrects: monthly.totalCorrects,
      totalAttempts: overall.totalAttempts,
      totalCorrects: overall.totalCorrects,
    });
  } catch (error) {
    console.error("Error retrieving stats:", error);
    res.status(500).json({ message: "Error retrieving stats", error });
  }
}

// Function to calculate percentile
const calculatePercentile = async (
  model: mongoose.Model<any>,
  field: string,
  value: number
): Promise<number> => {
  const countLower = await model.countDocuments({
    [field]: { $lt: value },
  });
  const total = await model.countDocuments({});
  return total > 0 ? (countLower / total) * 100 : 0;
};
