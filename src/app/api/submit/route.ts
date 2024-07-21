import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/question.model";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";
import { FREE_DAILY_QUESTION_LIMIT, FREE_SUBJECT_LIMIT } from "@/constants";

export const calculateUserRating = (
  attempts: number,
  correctAnswers: number
): number => {
  if (attempts === 0) return 50; // Default rating if no attempts
  const accuracy = correctAnswers / attempts;
  return Math.round(accuracy * 100); // Scale accuracy to a rating out of 100
};

const submitAnswer = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "POST") {
    // questionId will be GETted as well as POSTed.
    // userId to be POSTted from the client side after getting the values from
    // client stored session tokens instead of dual way communication per question
    // the other three values will be generated from frontend and POSTed here
    const { questionId, userAnswer, isCorrect, userQuestionTime, userId } =
      req.body;

    if (
      !questionId ||
      !userAnswer ||
      isCorrect === undefined ||
      !userQuestionTime ||
      !userId
    ) {
      return res.status(400).json({
        message:
          "All fields (questionId, userAnswer, isCorrect, userQuestionTime, userId) are required",
      });
    }

    try {
      const question = await QuestionModel.findById(questionId);
      const user = await UserModel.findById(userId);

      if (question && user) {
        // Check if the user is not a premium user and has exceeded the daily quota of questions
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the day

        const dailyAttempts = await UserModel.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(userId as string) } },
          { $unwind: "$questionsSolvedDetails" },
          { $match: { "questionsSolvedDetails.attemptedOn": { $gte: today } } },
          { $count: "dailyAttempts" }, // count of total number of problems attempted today
        ]);

        const attemptsToday =
          dailyAttempts.length > 0 ? dailyAttempts[0].dailyAttempts : 0;

        if (!user.premiumAccess && attemptsToday >= FREE_DAILY_QUESTION_LIMIT) {
          return res.status(403).json({
            message:
              "Daily quota of questions reached. Upgrade to premium for unlimited access.",
          });
        }

        question.totalAttempts += 1;
        if (isCorrect) {
          question.totalCorrect += 1;
        }

        // Update question statistics only if totalAttempts is over 10
        if (question.totalAttempts >= 10) {
          // Calculate difficultyRating
          question.difficultyRating =
            ((question.totalAttempts - question.totalCorrect) /
              question.totalAttempts) *
            100;
        }
        await question.save();

        // Update user model with question details
        if (!Array.isArray(user.questionsSolvedDetails)) {
          user.questionsSolvedDetails = [];
        }
        user.questionsSolvedDetails.push({
          questionObjectId: question._id as mongoose.Types.ObjectId, // Store the MongoDB ObjectId
          userAnswer,
          userQuestionTime,
          isCorrect,
          attemptedOn: new Date(), // Record the attempt time
        });

        // Update selectedSubjects stats
        const subjectStats = user.selectedSubjects.find(
          (subject) =>
            subject.subjectObjectId.toString() === question.subject.subjectCode
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
          // Check if the user is not a premium user and already has more than or equal to allowed number of subjects
          if (
            !user.premiumAccess &&
            user.selectedSubjects.length >= FREE_SUBJECT_LIMIT
          ) {
            return res
              .status(403)
              .json({ message: "Upgrade to premium to add more subjects." });
          }

          // For when user attempts the first question of a new subject
          user.selectedSubjects.push({
            subjectObjectId: new mongoose.Types.ObjectId(
              question.subject.subjectCode
            ),
            userRating: calculateUserRating(1, isCorrect ? 1 : 0),
            userAttempts: 1,
            userCorrectAnswers: isCorrect ? 1 : 0,
          });
        }

        await user.save();

        res.status(200).json({ message: "Answer submitted successfully" });
      } else {
        res.status(404).json({ message: "Question or User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error submitting answer", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default submitAnswer;
