import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/question.model";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";
import { FREE_DAILY_QUESTION_LIMIT, FREE_SUBJECT_LIMIT } from "@/constants";

// Calculate user rating based on attempts and correct answers
export const calculateUserRating = (
  attempts: number,
  correctAnswers: number
): number => {
  if (attempts === 0) return 50; // Default rating if no attempts
  const accuracy = correctAnswers / attempts;
  return Math.round(accuracy * 100); // Scale accuracy to a rating out of 100
};

// Function to calculate percentile
const calculatePercentile = async (
  model: mongoose.Model<any>, // The model type
  field: string, // The field in the document to calculate the percentile for
  value: number // The value to compare against
): Promise<number> => {
  const count = await model.countDocuments({ [field]: { $lte: value } });
  const totalCount = await model.countDocuments();
  return (count / totalCount) * 100;
};

// Function to generate a new question
const generateNewQuestion = async (data: {
  subjectCode: string;
  subjectName: string;
  level: string;
  topic: string;
  subtopic: string;
  difficultyRating: number;
}) => {
  const generateQuestionApiUrl = `${process.env.BASE_URL}/api/generate-question`;

  try {
    const response = await fetch(generateQuestionApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || "Failed to generate new question");
    }

    const newQuestion = await response.json();
    return newQuestion;
  } catch (error) {
    console.error("Error generating new question:", error);
    throw error;
  }
};

const submitAnswer = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    questionId,
    userAnswer,
    isCorrect,
    userQuestionTime,
    userId,
    subjectCode,
    subjectName,
    level,
    topic,
    subtopic,
    difficultyRating,
  } = req.body;

  if (
    !questionId ||
    !userAnswer ||
    isCorrect === undefined ||
    !userQuestionTime ||
    !userId ||
    !subjectCode ||
    !subjectName ||
    !level ||
    !topic ||
    !subtopic ||
    !difficultyRating
  ) {
    return res.status(400).json({
      message:
        "All fields (questionId, userAnswer, isCorrect, userQuestionTime, userId, subjectCode, subjectName, level, topic, subtopic, difficultyRating) are required",
    });
  }

  try {
    const question = await QuestionModel.findById(questionId);
    const user = await UserModel.findById(userId);

    if (!question || !user) {
      return res.status(404).json({ message: "Question or User not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day

    const dailyAttempts = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$questionsSolvedDetails" },
      { $match: { "questionsSolvedDetails.attemptedOn": { $gte: today } } },
      { $count: "dailyAttempts" }, // Count of total number of problems attempted today
    ]);

    const attemptsToday =
      dailyAttempts.length > 0 ? dailyAttempts[0].dailyAttempts : 0;

    if (!user.premiumAccess?.valid && attemptsToday >= FREE_DAILY_QUESTION_LIMIT) {
      return res.status(403).json({
        message:
          "Daily quota of questions reached. Upgrade to premium for unlimited access.",
      });
    }

    // Update question statistics
    question.totalAttempts += 1;
    if (isCorrect) {
      question.totalCorrect += 1;
    }

    // Calculate difficulty rating if attempts >= 10
    if (question.totalAttempts >= 10) {
      question.difficultyRating =
        ((question.totalAttempts - question.totalCorrect) /
          question.totalAttempts) *
        100;
    }

    // Update average time taken for the question
    if (question.averageTimeTakenInSeconds !== undefined) {
      question.averageTimeTakenInSeconds =
        (question.averageTimeTakenInSeconds * (question.totalAttempts - 1) +
          userQuestionTime) /
        question.totalAttempts;
    } else {
      question.averageTimeTakenInSeconds = userQuestionTime;
    }

    await question.save();

    // Update user's question solved details
    user.questionsSolvedDetails.push({
      questionObjectId: question._id as mongoose.Types.ObjectId, // Store the MongoDB ObjectId
      userAnswer,
      userQuestionTime,
      isCorrect,
      attemptedOn: new Date(), // Record the attempt time
    });

    // Update or add subject stats
    let subjectStats = user.selectedSubjects.find(
      (subject) =>
        subject.subjectCode === question.subject.subjectCode
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
      if (
        !user.premiumAccess?.valid &&
        user.selectedSubjects.length >= FREE_SUBJECT_LIMIT
      ) {
        return res
          .status(403)
          .json({ message: "Upgrade to premium to add more subjects." });
      } else {
        user.selectedSubjects.push({
          subjectObjectId: new mongoose.Types.ObjectId(
            question.subject.subjectCode
          ),
          subjectName: question.subject.name,
          subjectCode: question.subject.subjectCode,
          userRating: calculateUserRating(1, isCorrect ? 1 : 0),
          userAttempts: 1,
          userCorrectAnswers: isCorrect ? 1 : 0,
          dateAdded: new Date(),
        });

        subjectStats = user.selectedSubjects[user.selectedSubjects.length - 1];
      }
    }

    // Calculate and update user's rating percentile
    const userRatingPercentile = await calculatePercentile(
      UserModel,
      "selectedSubjects.userRating",
      subjectStats.userRating
    );

    subjectStats.userPercentile = userRatingPercentile;

    await user.save();

    // Generate a new question
    const newQuestion = await generateNewQuestion({
      subjectCode,
      subjectName,
      level,
      topic,
      subtopic,
      difficultyRating,
    });

    res.status(200).json({
      message: "Answer submitted successfully",
      newQuestion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting answer", error });
  }
};

export default submitAnswer;
