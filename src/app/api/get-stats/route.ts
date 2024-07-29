import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';

interface StatsResult {
  _id: null | string;
  totalAttempts: number;
  totalCorrects: number;
}

interface DailyStats {
  date: string;
  userCumulativePercentile: number;
  userCumulativeRating: number;
  userCumulativeAttempts: number;
  userCumulativeCorrects: number;
  questionsAttempted: number;
}

const calculatePercentile = async (
  model: mongoose.Model<any>,
  field: string,
  value: number
): Promise<number> => {
  try {
    const countLower = await model.countDocuments({
      [field]: { $lt: value },
    });
    const total = await model.countDocuments({});
    const percentile = total > 0 ? (countLower / total) * 100 : 0;
    console.log(`Calculated percentile: ${percentile}`);
    return percentile;
  } catch (error) {
    console.error('Error calculating percentile:', error);
    throw error;
  }
};

const getCumulativeStatsByDate = async (
  date: Date,
  userId: mongoose.Types.ObjectId
): Promise<DailyStats> => {
  console.log(`Getting cumulative stats for date: ${date.toISOString()}`);
  try {
    const stats = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$questionsSolvedDetails' },
      {
        $match: {
          'questionsSolvedDetails.attemptedOn': { $lte: date },
        },
      },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          totalCorrects: {
            $sum: { $cond: ['$questionsSolvedDetails.isCorrect', 1, 0] },
          },
        },
      },
    ]);

    console.log(`Stats for ${date.toISOString()}:`, stats);

    const totalAttempts = stats.length > 0 ? stats[0].totalAttempts : 0;
    const totalCorrects = stats.length > 0 ? stats[0].totalCorrects : 0;
    const userCumulativeRating =
      totalAttempts === 0 ? 0 : (totalCorrects / totalAttempts) * 100;

    const userCumulativePercentile = await calculatePercentile(
      UserModel,
      'selectedSubjects.userRating',
      userCumulativeRating
    );

    const dailyAttempts = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$questionsSolvedDetails' },
      {
        $match: {
          'questionsSolvedDetails.attemptedOn': {
            $gte: new Date(date.getTime() - 24 * 60 * 60 * 1000),
            $lte: date,
          },
        },
      },
      { $count: 'dailyAttempts' },
    ]);

    console.log(`Daily attempts for ${date.toISOString()}:`, dailyAttempts);

    const questionsAttempted =
      dailyAttempts.length > 0 ? dailyAttempts[0].dailyAttempts : 0;

    return {
      date: date.toISOString().split('T')[0],
      userCumulativePercentile,
      userCumulativeRating,
      userCumulativeAttempts: totalAttempts,
      userCumulativeCorrects: totalCorrects,
      questionsAttempted,
    };
  } catch (error) {
    console.error(`Error getting cumulative stats for ${date.toISOString()}:`, error);
    throw error;
  }
};

export async function GET(req: NextRequest) {
  console.log('GET /api/get-stats called');

  await dbConnect();

  try {
    // Authenticate user
    const session = await getServerSession({ req, ...authOptions });
    if (!session || !session.user || !session.user._id) {
      console.error('Unauthorized access');
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    const userId = session.user._id as mongoose.Types.ObjectId; // Cast user._id

    const { searchParams } = new URL(req.url);
    const userName = searchParams.get('userName');

    if (!userName) {
      console.error('Invalid or missing userName');
      return NextResponse.json({ message: 'Invalid userName' }, { status: 400 });
    }

    console.log(`User Name: ${userName}`);

    // Verify that the user is authorized to view the stats
    const user = await UserModel.findOne({ userName }).exec();
    if (!user || !user._id || user._id.toString() !== userId.toString()) {
      console.error('User not found or does not match session');
      return NextResponse.json({ message: 'User not found or does not match session' }, { status: 404 });
    }

    console.log(`User ID: ${userId}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date;
    });

    const cumulativeStats: DailyStats[] = await Promise.all(
      last30Days.map((date) => getCumulativeStatsByDate(date, userId))
    );

    console.log('Cumulative stats:', cumulativeStats);

    const getStatsByDate = async (startDate: Date): Promise<StatsResult[]> => {
      console.log(`Getting stats since date: ${startDate.toISOString()}`);

      try {
        return UserModel.aggregate([
          { $match: { _id: userId } },
          { $unwind: '$questionsSolvedDetails' },
          {
            $match: {
              'questionsSolvedDetails.attemptedOn': { $gte: startDate },
            },
          },
          {
            $group: {
              _id: null,
              totalAttempts: { $sum: 1 },
              totalCorrects: {
                $sum: { $cond: ['$questionsSolvedDetails.isCorrect', 1, 0] },
              },
            },
          },
        ]);
      } catch (error) {
        console.error(`Error getting stats since ${startDate.toISOString()}:`, error);
        throw error;
      }
    };

    const [dailyStats, weeklyStats, monthlyStats, overallStats] = await Promise.all([
      getStatsByDate(today),
      getStatsByDate(new Date(today.setDate(today.getDate() - today.getDay()))),
      getStatsByDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      getStatsByDate(new Date(0)),
    ]);

    console.log('Daily stats:', dailyStats);
    console.log('Weekly stats:', weeklyStats);
    console.log('Monthly stats:', monthlyStats);
    console.log('Overall stats:', overallStats);

    const formatStats = (stats: StatsResult[]) => ({
      totalAttempts: stats.length > 0 ? stats[0].totalAttempts : 0,
      totalCorrects: stats.length > 0 ? stats[0].totalCorrects : 0,
    });

    const daily = formatStats(dailyStats);
    const weekly = formatStats(weeklyStats);
    const monthly = formatStats(monthlyStats);
    const overall = formatStats(overallStats);

    return NextResponse.json({
      cumulativeStats,
      totalDailyAttempts: daily.totalAttempts,
      userCumulativePercentile: cumulativeStats.length > 0 ? cumulativeStats[cumulativeStats.length - 1].userCumulativePercentile : 0,
      totalDailyCorrects: daily.totalCorrects,
      totalWeeklyAttempts: weekly.totalAttempts,
      totalWeeklyCorrects: weekly.totalCorrects,
      totalMonthlyAttempts: monthly.totalAttempts,
      totalMonthlyCorrects: monthly.totalCorrects,
      totalAttempts: overall.totalAttempts,
      totalCorrects: overall.totalCorrects,
    });
  } catch (error: any) {
    console.error('Error retrieving stats:', error);
    return NextResponse.json({ message: 'Error retrieving stats', error: error.message }, { status: 500 });
  }
}
