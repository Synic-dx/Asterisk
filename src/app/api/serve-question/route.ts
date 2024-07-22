import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/question.model";
import UserModel from "@/models/user.model";
import { FREE_DAILY_QUESTION_LIMIT, FREE_SUBJECT_LIMIT, QUESTION_DIFFICULTY_RANGE } from "@/constants";
import mongoose from "mongoose";

const serveQuestion = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "GET") {
    const { subjectCode, userId, userRating, onlyASLevel } = req.query;

    // Validate query parameters
    if (!subjectCode || !userId || userRating === undefined || userRating === null) {
      return res.status(400).json({
        message: "Subject code, user ID, and user rating are required",
      });
    }

    // Ensure userRating is a number
    const userRatingNumber = Number(userRating);
    if (isNaN(userRatingNumber)) {
      return res.status(400).json({
        message: "User rating must be a valid number",
      });
    }

    // Convert subjectCode to a string if necessary
    const subjectCodeString = Array.isArray(subjectCode) ? subjectCode[0] : subjectCode;

    const minDifficulty = userRatingNumber - QUESTION_DIFFICULTY_RANGE;
    const maxDifficulty = userRatingNumber + QUESTION_DIFFICULTY_RANGE;

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the user has exceeded the daily quota of questions
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of the day

      const dailyAttempts = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
        { $unwind: "$questionsSolvedDetails" },
        { $match: { "questionsSolvedDetails.attemptedOn": { $gte: today } } },
        { $count: "dailyAttempts" }, // count of total number of problems attempted today
      ]);

      const attemptsToday = dailyAttempts.length > 0 ? dailyAttempts[0].dailyAttempts : 0;

      if (!user.premiumAccess && attemptsToday >= FREE_DAILY_QUESTION_LIMIT) {
        return res.status(403).json({
          message: "Daily quota of questions reached. Upgrade to premium for unlimited access.",
        });
      }

      const subjectStats = user.selectedSubjects.find(
        (subject) => subject.subjectObjectId.toString() === subjectCodeString
      );

      if (!subjectStats) {
        if (!user.premiumAccess && user.selectedSubjects.length >= FREE_SUBJECT_LIMIT) {
          return res.status(403).json({
            message: "Max subject limit reached. Upgrade to premium to add more subjects.",
          });
        }
      }

      const solvedQuestionIds = user.questionsSolvedDetails.map(
        (detail) => detail.questionObjectId
      );

      const matchConditions: any = {
        "subject.subjectCode": subjectCodeString,
        _id: { $nin: solvedQuestionIds },
        difficultyRating: {
          $gte: Math.min(minDifficulty, 40),
          $lte: Math.max(maxDifficulty, 60),
        },
      };

      if (onlyASLevel === "true") {
        matchConditions["level"] = "AS-Level";
      }

      const pipeline = [
        { $match: matchConditions },
        { $sample: { size: 1 } }, // Randomly select one question
      ];

      const questions = await QuestionModel.aggregate(pipeline);

      if (questions.length === 0) {
        return res.status(404).json({
          message: "No more questions found for the specified criteria",
        });
      }

      const randomQuestion = questions[0];

      res.status(200).json(randomQuestion);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving questions", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default serveQuestion;
