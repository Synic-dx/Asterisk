import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/question.model";
import UserModel from "@/models/user.model";
import {
  FREE_DAILY_QUESTION_LIMIT,
  QUESTION_DIFFICULTY_RANGE,
} from "@/constants";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

const serveQuestion = async (req: NextApiRequest, res: NextApiResponse) => {
  // Connect to the database
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { subjectCode, onlyASLevel, onlyALevel, topic, subtopic } = req.query;

  // Validate required fields
  if (!subjectCode) {
    return res.status(400).json({
      message: "Subject code is required",
    });
  }

  const subjectCodeString = Array.isArray(subjectCode)
    ? subjectCode[0]
    : subjectCode;

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user._id;

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check daily attempts
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
      return res.status(403).json({
        message:
          "Daily quota of questions reached. Upgrade to premium for unlimited access.",
      });
    }

    // Determine difficulty range
    const subjectStats = user.selectedSubjects.find(
      (subject) => subject.subjectObjectId.toString() === subjectCodeString
    );

    const userPercentile = subjectStats?.userPercentile ?? 50;
    const minPercentile = Math.max(userPercentile - QUESTION_DIFFICULTY_RANGE, 0);
    const maxPercentile = Math.min(userPercentile + QUESTION_DIFFICULTY_RANGE, 100);

    // Prepare query conditions
    const solvedQuestionIds = user.questionsSolvedDetails.map(
      (detail) => detail.questionObjectId
    );

    const matchConditions: any = {
      "subject.subjectCode": subjectCodeString,
      _id: { $nin: solvedQuestionIds },
      difficultyRatingPercentile: {
        $gte: minPercentile,
        $lte: maxPercentile,
      },
    };

    if (onlyASLevel === "true") {
      matchConditions.level = "AS-Level";
    }

    if (onlyALevel === "true") {
      matchConditions.level = "A-Level";
    }

    if (topic) {
      matchConditions.topic = topic;
    }

    if (subtopic) {
      matchConditions.subtopic = subtopic;
    }

    // Fetch a random question based on conditions
    const questions = await QuestionModel.aggregate([
      { $match: matchConditions },
      { $sample: { size: 1 } },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        message: "No more questions found for the specified criteria",
      });
    }

    return res.status(200).json(questions[0]);
  } catch (error: unknown) {
    console.error("Error retrieving questions:", error);
    if (error instanceof Error) {
      return res.status(500).json({
        message: "Error retrieving questions",
        error: error.message,
      });
    }
    return res.status(500).json({
      message: "An unknown error occurred",
    });
  }
};

export default serveQuestion;
