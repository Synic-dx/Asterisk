import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";

const getStats = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "GET") {
    const { userId } = req.query;

    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of the day

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Set to start of the week

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Set to start of the month

      // Aggregation pipeline for daily stats
      const dailyStats = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
        { $unwind: "$questionsSolvedDetails" },
        { $match: { "questionsSolvedDetails.attemptedOn": { $gte: today } } },
        {
          $group: {
            _id: null,
            totalDailyAttempts: { $sum: 1 },
            totalDailyCorrects: {
              $sum: {
                $cond: ["$questionsSolvedDetails.isCorrect", 1, 0],
              },
            },
          },
        },
      ]);

      const totalDailyAttempts =
        dailyStats.length > 0 ? dailyStats[0].totalDailyAttempts : 0;
      const totalDailyCorrects =
        dailyStats.length > 0 ? dailyStats[0].totalDailyCorrects : 0;

      // Aggregation pipeline for weekly stats
      const weeklyStats = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
        { $unwind: "$questionsSolvedDetails" },
        {
          $match: {
            "questionsSolvedDetails.attemptedOn": { $gte: startOfWeek },
          },
        },
        {
          $group: {
            _id: null,
            totalWeeklyAttempts: { $sum: 1 },
            totalWeeklyCorrects: {
              $sum: {
                $cond: ["$questionsSolvedDetails.isCorrect", 1, 0],
              },
            },
          },
        },
      ]);

      const totalWeeklyAttempts =
        weeklyStats.length > 0 ? weeklyStats[0].totalWeeklyAttempts : 0;
      const totalWeeklyCorrects =
        weeklyStats.length > 0 ? weeklyStats[0].totalWeeklyCorrects : 0;

      // Aggregation pipeline for monthly stats
      const monthlyStats = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
        { $unwind: "$questionsSolvedDetails" },
        {
          $match: {
            "questionsSolvedDetails.attemptedOn": { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalMonthlyAttempts: { $sum: 1 },
            totalMonthlyCorrects: {
              $sum: {
                $cond: ["$questionsSolvedDetails.isCorrect", 1, 0],
              },
            },
          },
        },
      ]);

      const totalMonthlyAttempts =
        monthlyStats.length > 0 ? monthlyStats[0].totalMonthlyAttempts : 0;
      const totalMonthlyCorrects =
        monthlyStats.length > 0 ? monthlyStats[0].totalMonthlyCorrects : 0;

      // Aggregation pipeline for overall stats
      const overallStats = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
        { $unwind: "$questionsSolvedDetails" },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            totalCorrects: {
              $sum: {
                $cond: ["$questionsSolvedDetails.isCorrect", 1, 0],
              },
            },
          },
        },
      ]);

      const totalAttempts =
        overallStats.length > 0 ? overallStats[0].totalAttempts : 0;
      const totalCorrects =
        overallStats.length > 0 ? overallStats[0].totalCorrects : 0;

      // Aggregation pipeline for daily subject-specific stats
      const dailySubjectStats = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
        { $unwind: "$questionsSolvedDetails" },
        { $match: { "questionsSolvedDetails.attemptedOn": { $gte: today } } },
        {
          $group: {
            _id: "$questionsSolvedDetails.subjectId",
            totalDailyAttempts: { $sum: 1 },
            totalDailyCorrects: {
              $sum: {
                $cond: ["$questionsSolvedDetails.isCorrect", 1, 0],
              },
            },
          },
        },
      ]);

      // Aggregation pipeline for weekly subject-specific stats
      const weeklySubjectStats = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
        { $unwind: "$questionsSolvedDetails" },
        {
          $match: {
            "questionsSolvedDetails.attemptedOn": { $gte: startOfWeek },
          },
        },
        {
          $group: {
            _id: "$questionsSolvedDetails.subjectId",
            totalWeeklyAttempts: { $sum: 1 },
            totalWeeklyCorrects: {
              $sum: {
                $cond: ["$questionsSolvedDetails.isCorrect", 1, 0],
              },
            },
          },
        },
      ]);

      // Aggregation pipeline for monthly subject-specific stats
      const monthlySubjectStats = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
        { $unwind: "$questionsSolvedDetails" },
        {
          $match: {
            "questionsSolvedDetails.attemptedOn": { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: "$questionsSolvedDetails.subjectId",
            totalMonthlyAttempts: { $sum: 1 },
            totalMonthlyCorrects: {
              $sum: {
                $cond: ["$questionsSolvedDetails.isCorrect", 1, 0],
              },
            },
          },
        },
      ]);

      // Aggregation pipeline for total subject-specific stats
      const totalSubjectStats = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
        { $unwind: "$questionsSolvedDetails" },
        {
          $group: {
            _id: "$questionsSolvedDetails.subjectId",
            totalAttempts: { $sum: 1 },
            totalCorrects: {
              $sum: {
                $cond: ["$questionsSolvedDetails.isCorrect", 1, 0],
              },
            },
          },
        },
      ]);

      // Merge stats with selected subjects
      const selectedSubjects = user.selectedSubjects.map((subject) => {
        const dailyStat = dailySubjectStats.find(
          (stat) => stat._id.toString() === subject.subjectObjectId.toString()
        ) || { totalDailyAttempts: 0, totalDailyCorrects: 0 };
        const weeklyStat = weeklySubjectStats.find(
          (stat) => stat._id.toString() === subject.subjectObjectId.toString()
        ) || { totalWeeklyAttempts: 0, totalWeeklyCorrects: 0 };
        const monthlyStat = monthlySubjectStats.find(
          (stat) => stat._id.toString() === subject.subjectObjectId.toString()
        ) || { totalMonthlyAttempts: 0, totalMonthlyCorrects: 0 };
        const totalStat = totalSubjectStats.find(
          (stat) => stat._id.toString() === subject.subjectObjectId.toString()
        ) || { totalAttempts: 0, totalCorrects: 0 };

        return {
          subjectId: subject.subjectObjectId,
          subjectName: subject.subjectName,
          totalDailyAttempts: dailyStat.totalDailyAttempts,
          totalDailyCorrects: dailyStat.totalDailyCorrects,
          totalWeeklyAttempts: weeklyStat.totalWeeklyAttempts,
          totalWeeklyCorrects: weeklyStat.totalWeeklyCorrects,
          totalMonthlyAttempts: monthlyStat.totalMonthlyAttempts,
          totalMonthlyCorrects: monthlyStat.totalMonthlyCorrects,
          totalAttempts: totalStat.totalAttempts,
          totalCorrects: totalStat.totalCorrects,
        };
      });

      res.status(200).json({
        totalDailyAttempts,
        totalDailyCorrects,
        totalWeeklyAttempts,
        totalWeeklyCorrects,
        totalMonthlyAttempts,
        totalMonthlyCorrects,
        totalAttempts,
        totalCorrects,
        selectedSubjects,
      });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving stats", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default getStats;
