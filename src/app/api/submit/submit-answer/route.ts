import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/question.model";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";

const submitAnswer = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "POST") {
    const { questionID, userAnswer, isCorrect, userQuestionTime } = req.body;

    try {
      // Get the session data
      const session = await getSession({ req });
      if (!session) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const question = await QuestionModel.findOne({ questionID });
      const user = await UserModel.findById(session.user._id);

      if (question && user) {
        // Update question statistics
        question.totalAttempts += 1;
        if (isCorrect) {
          question.totalCorrect += 1;
        }

        // Calculate difficultyRating
        if (question.totalAttempts > 0) {
          question.difficultyRating =
            ((question.totalAttempts - question.totalCorrect) /
              question.totalAttempts) *
            100;
        } else {
          question.difficultyRating = 0;
        }

        await question.save();

        // Update user model with question details
        if (!Array.isArray(user.questionsSolvedDetails)) {
          user.questionsSolvedDetails = [];
        }
        user.questionsSolvedDetails.push({
          questionId: question.questionID, // Store the distinct questionId
          questionObjectId: question._id as mongoose.Types.ObjectId, // Store the MongoDB ObjectId
          userAnswer,
          userQuestionTime,
          isCorrect,
        });

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
