import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import QuestionModel from '@/models/question.model';
import UserModel, { QuestionDetails, SelectedSubjectsAndStats } from '@/models/user.model';
import {
  FREE_DAILY_QUESTION_LIMIT,
  QUESTION_DIFFICULTY_RANGE,
} from '@/constants';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url || '', 'http://localhost');
    const subjectCode = searchParams.get('subjectCode');
    const onlyASLevel = searchParams.get('onlyASLevel');
    const topicsParam = searchParams.get('topics');
    const subtopicsParam = searchParams.get('subtopics');

    if (!subjectCode) {
      return NextResponse.json({ message: 'Subject code is required' }, { status: 400 });
    }

    // Convert topics and subtopics parameters from comma-separated strings to arrays
    const topics = topicsParam ? topicsParam.split(',') : [];
    const subtopics = subtopicsParam ? subtopicsParam.split(',') : [];

    // Get user session
    const session = await getServerSession({ req, ...authOptions });
    if (!session || !session.user || !session.user._id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user._id;

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check daily attempts
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyAttemptsResult = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$questionsSolvedDetails' },
      { $match: { 'questionsSolvedDetails.attemptedOn': { $gte: today } } },
      { $count: 'dailyAttempts' },
    ]);

    const attemptsToday = dailyAttemptsResult.length > 0 ? dailyAttemptsResult[0].dailyAttempts : 0;

    if (!user.premiumAccess?.valid && attemptsToday >= FREE_DAILY_QUESTION_LIMIT) {
      return NextResponse.json({
        message: 'Daily quota of questions reached. Upgrade to premium for unlimited access.',
      }, { status: 403 });
    }

    // Determine difficulty range
    const subjectStats = user.selectedSubjects.find(
      (subject: SelectedSubjectsAndStats) => subject.subjectObjectId.toString() === subjectCode
    );

    const userPercentile = subjectStats?.userPercentile ?? 50;
    const minPercentile = Math.max(userPercentile - QUESTION_DIFFICULTY_RANGE, 0);
    const maxPercentile = Math.min(userPercentile + QUESTION_DIFFICULTY_RANGE, 100);

    // Prepare query conditions
    const solvedQuestionIds = user.questionsSolvedDetails.map(
      (detail: QuestionDetails) => detail.questionObjectId
    );

    const matchConditions: any = {
      'subject.subjectCode': subjectCode,
      _id: { $nin: solvedQuestionIds },
      difficultyRatingPercentile: {
        $gte: minPercentile,
        $lte: maxPercentile,
      },
    };

    if (onlyASLevel === 'true') {
      matchConditions.level = 'AS-Level';
    }

    if (topics.length > 0) {
      matchConditions.topic = { $in: topics };
    }

    if (subtopics.length > 0) {
      matchConditions.subtopic = { $in: subtopics };
    }

    // Fetch a random question based on conditions
    const questions = await QuestionModel.aggregate([
      { $match: matchConditions },
      { $sample: { size: 1 } },
    ]);

    if (questions.length === 0) {
      return NextResponse.json({
        message: 'No more questions found for the specified criteria',
      }, { status: 404 });
    }

    return NextResponse.json(questions[0], { status: 200 });
  } catch (error: unknown) {
    console.error('Error retrieving questions:', error);
    if (error instanceof Error) {
      return NextResponse.json({
        message: 'Error retrieving questions',
        error: error.message,
      }, { status: 500 });
    }
    return NextResponse.json({
      message: 'An unknown error occurred',
    }, { status: 500 });
  }
}
