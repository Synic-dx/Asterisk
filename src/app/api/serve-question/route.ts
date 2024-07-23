import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/question.model";
import UserModel from "@/models/user.model";
import {
  FREE_DAILY_QUESTION_LIMIT,
  FREE_SUBJECT_LIMIT,
  QUESTION_DIFFICULTY_RANGE,
} from "@/constants";
import mongoose from "mongoose";

const serveQuestion = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { subjectCode, userId, onlyASLevel, onlyALevel, topic, subtopic } =
    req.query;

  if (!subjectCode || !userId) {
    return res.status(400).json({
      message: "Subject code and user ID are required",
    });
  }

  const subjectCodeString = Array.isArray(subjectCode)
    ? subjectCode[0]
    : subjectCode;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyAttempts = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
      { $unwind: "$questionsSolvedDetails" },
      { $match: { "questionsSolvedDetails.attemptedOn": { $gte: today } } },
      { $count: "dailyAttempts" },
    ]);

    const attemptsToday =
      dailyAttempts.length > 0 ? dailyAttempts[0].dailyAttempts : 0;

    if (!user.premiumAccess && attemptsToday >= FREE_DAILY_QUESTION_LIMIT) {
      return res.status(403).json({
        message:
          "Daily quota of questions reached. Upgrade to premium for unlimited access.",
      });
    }

    const subjectStats = user.selectedSubjects.find(
      (subject) => subject.subjectObjectId.toString() === subjectCodeString
    );

    // If userPercentile is undefined, use a default value of 50
    const userPercentile = subjectStats?.userPercentile ?? 50;
    const minPercentile = Math.max(
      userPercentile - QUESTION_DIFFICULTY_RANGE,
      0
    );
    const maxPercentile = Math.min(
      userPercentile + QUESTION_DIFFICULTY_RANGE,
      100
    );

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

    const pipeline = [{ $match: matchConditions }, { $sample: { size: 1 } }];

    const questions = await QuestionModel.aggregate(pipeline);

    if (questions.length === 0) {
      return res.status(404).json({
        message: "No more questions found for the specified criteria",
      });
    }

    const randomQuestion = questions[0];

    return res.status(200).json(randomQuestion);
  } catch (error) {
    console.error("Error retrieving questions:", error); // Log the error for debugging
    return res
      .status(500)
      .json({ message: "Error retrieving questions", error });
  }
};

export default serveQuestion;
