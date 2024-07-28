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
  return attempts === 0 ? 50 : Math.round((correctAnswers / attempts) * 100);
};

// Function to calculate percentile
const calculatePercentile = async (
  model: mongoose.Model<any>,
  field: string,
  value: number
): Promise<number> => {
  // Count documents where the specified field value is greater than or equal to the given value
  const count = await model.countDocuments({ [field]: { $gte: value } });
  // Get the total count of documents in the collection
  const totalCount = await model.countDocuments();
  // Calculate and return the percentile
  return totalCount === 0 ? 0 : (count / totalCount) * 100;
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
  // Define the API endpoint to generate new questions
  const generateQuestionApiUrl = `${process.env.BASE_URL}/api/generate-mcq`;

  try {
    // Make a POST request to the API with the question generation data
    const response = await fetch(generateQuestionApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Check if the response is not OK
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || "Failed to generate new question");
    }

    // Return the generated question data
    return await response.json();
  } catch (error) {
    // Log and throw error if the request fails
    console.error("Error generating new question:", error);
    throw error;
  }
};

const submitAnswer = async (req: NextApiRequest, res: NextApiResponse) => {
  // Connect to the database
  await dbConnect();

  // Ensure the request method is POST
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

  // Validate the input data
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
      message: "All fields (questionId, userAnswer, isCorrect, userQuestionTime, userId, subjectCode, subjectName, level, topic, subtopic, difficultyRating) are required",
    });
  }

  try {
    // Find the question and user by their IDs
    const question = await QuestionModel.findById(questionId);
    const user = await UserModel.findById(userId);

    if (!question || !user) {
      return res.status(404).json({ message: "Question or User not found" });
    }

    // Check daily attempt limit for non-premium users
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of the day

    // Aggregate to count daily attempts
    const dailyAttempts = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$questionsSolvedDetails" },
      { $match: { "questionsSolvedDetails.attemptedOn": { $gte: today } } },
      { $count: "dailyAttempts" },
    ]);

    const attemptsToday = dailyAttempts.length > 0 ? dailyAttempts[0].dailyAttempts : 0;

    // Check if non-premium users have reached their daily limit
    if (!user.premiumAccess?.valid && attemptsToday >= FREE_DAILY_QUESTION_LIMIT) {
      return res.status(403).json({
        message: "Daily quota of questions reached. Upgrade to premium for unlimited access.",
      });
    }

    // Update question statistics
    question.totalAttempts = (question.totalAttempts || 0) + 1;
    if (isCorrect) {
      question.totalCorrect = (question.totalCorrect || 0) + 1;
    }

    if (question.totalAttempts >= 10) {
      question.difficultyRating =
        ((question.totalAttempts - question.totalCorrect) / question.totalAttempts) * 100;
    }

    question.averageTimeTakenInSeconds = question.averageTimeTakenInSeconds
      ? (question.averageTimeTakenInSeconds * (question.totalAttempts - 1) + userQuestionTime) / question.totalAttempts
      : userQuestionTime;

    await question.save();

    // Update user's question solved details
    user.questionsSolvedDetails.push({
      questionObjectId: question._id as mongoose.Types.ObjectId,
      subjectCode, // Include subjectCode for tracking
      userAnswer,
      userQuestionTime,
      isCorrect,
      attemptedOn: new Date(),
    });

    // Update or add subject stats
    let subjectStats = user.selectedSubjects.find(
      (subject) => subject.subjectCode === subjectCode
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
      // Check if non-premium users have reached the subject limit
      if (
        !user.premiumAccess?.valid &&
        user.selectedSubjects.length >= FREE_SUBJECT_LIMIT
      ) {
        return res
          .status(403)
          .json({ message: "Upgrade to premium to add more subjects." });
      }

      // Add new subject stats
      user.selectedSubjects.push({
        subjectObjectId: new mongoose.Types.ObjectId(subjectCode), // Updated to use subjectCode
        subjectName,
        subjectCode,
        userRating: calculateUserRating(1, isCorrect ? 1 : 0),
        userAttempts: 1,
        userCorrectAnswers: isCorrect ? 1 : 0,
        dateAdded: new Date(),
      });

      subjectStats = user.selectedSubjects[user.selectedSubjects.length - 1];
    }

    // Calculate and update user's rating percentile
    const userRatingPercentile = await calculatePercentile(
      UserModel,
      "selectedSubjects.userRating",
      subjectStats.userRating
    );

    subjectStats.userPercentile = userRatingPercentile;

    // Calculate cumulative data
    user.userCumulativeAttempts = (user.userCumulativeAttempts || 0) + 1;
    if (isCorrect) {
      user.userCumulativeCorrects = (user.userCumulativeCorrects || 0) + 1;
    }

    user.userCumulativeRating = calculateUserRating(
      user.userCumulativeAttempts,
      user.userCumulativeCorrects || 0
    );

    user.userCumulativePercentile = await calculatePercentile(
      UserModel,
      "userCumulativeRating",
      user.userCumulativeRating
    );

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

    // Respond with success message and new question
    res.status(200).json({
      message: "Answer submitted successfully",
      newQuestion,
    });
  } catch (error) {
    // Log and respond with error message if something goes wrong
    console.error("Error submitting answer:", error);
    res.status(500).json({ message: "Error submitting answer", error: (error as Error).message });
  }
};

export default submitAnswer;
