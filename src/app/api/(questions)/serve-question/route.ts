import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import QuestionModel from "@/models/question.model";
import UserModel, {
  QuestionDetails,
  SelectedSubjectsAndStats,
} from "@/models/user.model";
import SubjectModel from "@/models/subject.model";
import { generateQuestion } from "@/lib/generateQuestion"; // Import from the utility file
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../(authentication)/auth/[...nextauth]/options";
import { FREE_DAILY_QUESTION_LIMIT, QUESTION_DIFFICULTY_RANGE } from "@/constants";

interface MatchConditions {
  "subject.subjectCode": string;
  _id: { $nin: mongoose.Types.ObjectId[] };
  difficultyRatingPercentile: {
    $gte: number;
    $lte: number;
  };
  level?: string;
  topic?: string | { $in: string[] };
  subtopic?: string | { $in: string[] };
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url || "", "http://localhost");
    const subjectCode = searchParams.get("subjectCode");
    const onlyASLevel = searchParams.get("onlyASLevel");
    const topicsParam = searchParams.get("topics");
    const onlyALevel = searchParams.get("onlyALevel");
    const subtopicsParam = searchParams.get("subtopics");

    if (!subjectCode) {
      return NextResponse.json(
        { message: "Subject code is required" },
        { status: 400 }
      );
    }

    const topics = topicsParam ? topicsParam.split(",") : [];
    const subtopics = subtopicsParam ? subtopicsParam.split(",") : [];

    const session = await getServerSession({ req, ...authOptions });
    if (!session || !session.user || !session.user._id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyAttemptsResult = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$questionsSolvedDetails" },
      { $match: { "questionsSolvedDetails.attemptedOn": { $gte: today } } },
      { $count: "dailyAttempts" },
    ]);

    const attemptsToday =
      dailyAttemptsResult.length > 0 ? dailyAttemptsResult[0].dailyAttempts : 0;

    if (
      !user.premiumAccess?.valid &&
      attemptsToday >= FREE_DAILY_QUESTION_LIMIT
    ) {
      return NextResponse.json(
        {
          message:
            "Daily quota of questions reached. Upgrade to premium for unlimited access.",
        },
        { status: 403 }
      );
    }

    const subject = await SubjectModel.findOne({ subjectCode });
    if (!subject) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 }
      );
    }

    // Use subject._id.toString() for the ObjectId
    const subjectObjectId = subject._id.toString();

    const subjectStats = user.selectedSubjects.find(
      (subject: SelectedSubjectsAndStats) =>
        subject.subjectObjectId.toString() === subjectObjectId
    );

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
      (detail: QuestionDetails) => detail.questionObjectId
    );

    const matchConditions: MatchConditions = {
      "subject.subjectCode": subjectCode,
      _id: { $nin: solvedQuestionIds },
      difficultyRatingPercentile: {
        $gte: minPercentile,
        $lte: maxPercentile,
      },
      level:
        onlyASLevel === "true"
          ? "AS-Level"
          : onlyALevel === "true"
          ? "A-Level"
          : undefined,
      topic: topics.length > 0 ? { $in: topics } : undefined,
      subtopic: subtopics.length > 0 ? { $in: subtopics } : undefined,
    };

    const subtopicFilter = matchConditions.subtopic;
    let subtopicString: string = "";

    if (typeof subtopicFilter === "string") {
      subtopicString = subtopicFilter;
    } else if (subtopicFilter && "$in" in subtopicFilter) {
      const subtopicsArray = subtopicFilter.$in;
      if (subtopicsArray.length > 0) {
        subtopicString =
          subtopicsArray[Math.floor(Math.random() * subtopicsArray.length)];
      }
    }

    const questions = await QuestionModel.aggregate([
      { $match: { ...matchConditions, subtopic: subtopicString } },
      { $sample: { size: 1 } },
    ]);

    if (questions.length === 0) {
      const generatedQuestion = await generateQuestion({
        subjectCode,
        subjectName: subject.subjectName,
        level:
          typeof matchConditions.level === "string"
            ? matchConditions.level
            : "",
        topic:
          typeof matchConditions.topic === "string"
            ? matchConditions.topic
            : "",
        subtopic: subtopicString,
        difficultyRating: userPercentile,
      });

      if (!generatedQuestion) {
        return NextResponse.json(
          {
            message:
              "No more questions found for the specified criteria, and failed to generate a new question",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(generatedQuestion, { status: 200 });
    }

    return NextResponse.json(questions[0], { status: 200 });
  } catch (error: unknown) {
    console.error("Error retrieving questions:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Error retrieving questions",
          error: error.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        message: "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
