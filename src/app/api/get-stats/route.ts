import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";

const getStats = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "GET") {
    // Remember to send session.user._Id from client side
    const { userId } = req.query;

    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of the day

      // Aggregation pipeline for daily stats
      const dailyStats = await UserModel.aggregate([
        { $match: { _id: userId } },
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

      const totalDailyAttempts = dailyStats.length > 0 ? dailyStats[0].totalDailyAttempts : 0;
      const totalDailyCorrects = dailyStats.length > 0 ? dailyStats[0].totalDailyCorrects : 0;

      // Aggregation pipeline for overall stats
      const overallStats = await UserModel.aggregate([
        { $match: { _id: userId } },
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

      const totalAttempts = overallStats.length > 0 ? overallStats[0].totalAttempts : 0;
      const totalCorrects = overallStats.length > 0 ? overallStats[0].totalCorrects : 0;

      // Subject-specific stats
      const subjectStats = user.selectedSubjects.map((subject) => ({
        subjectId: subject.subjectObjectId,
        userRating: subject.userRating,
        userAttempts: subject.userAttempts,
        userCorrectAnswers: subject.userCorrectAnswers,
      }));


      user.save;

      res.status(200).json({
        totalDailyAttempts,
        totalDailyCorrects,
        totalAttempts,
        totalCorrects,
        subjectStats,
      });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving stats", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default getStats;
