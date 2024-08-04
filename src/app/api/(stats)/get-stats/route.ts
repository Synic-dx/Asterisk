import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(authentication)/auth/[...nextauth]/options';

interface DailyStats {
  date: string;
  userCumulativePercentile: number;
  userCumulativeRating: number;
  userCumulativeAttempts: number;
  userCumulativeCorrects: number;
  questionsAttempted: number;
  totalDailyAttempts: number; // Include this field
}

const calculatePercentile = async (
  model: mongoose.Model<any>,
  field: string,
  value: number
): Promise<number> => {
  try {
    const countLower = await model.countDocuments({ [field]: { $lt: value } });
    const total = await model.countDocuments({});
    const percentile = total > 0 ? (countLower / total) * 100 : 0;
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
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate cumulative stats up to the end of the day
    const stats = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$questionsSolvedDetails' },
      {
        $match: {
          'questionsSolvedDetails.attemptedOn': { $lte: endOfDay },
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

    const totalAttempts = stats.length > 0 ? stats[0].totalAttempts : 0;
    const totalCorrects = stats.length > 0 ? stats[0].totalCorrects : 0;
    const userCumulativeRating =
      totalAttempts === 0 ? 0 : (totalCorrects / totalAttempts) * 100;

    const userCumulativePercentile = await calculatePercentile(
      UserModel,
      'selectedSubjects.userRating',
      userCumulativeRating
    );

    // Calculate daily attempts for the specific date
    const dailyAttempts = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$questionsSolvedDetails' },
      {
        $match: {
          'questionsSolvedDetails.attemptedOn': {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      { $count: 'totalDailyAttempts' },
    ]);

    const totalDailyAttempts =
      dailyAttempts.length > 0 ? dailyAttempts[0].totalDailyAttempts : 0;

    return {
      date: date.toISOString().split('T')[0],
      userCumulativePercentile,
      userCumulativeRating,
      userCumulativeAttempts: totalAttempts,
      userCumulativeCorrects: totalCorrects,
      questionsAttempted: totalDailyAttempts, // Total questions attempted on this day
      totalDailyAttempts, // Include this field
    };
  } catch (error) {
    console.error(`Error getting cumulative stats for ${date.toISOString()}:`, error);
    throw error;
  }
};

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // Authenticate user
    const session = await getServerSession({ req, ...authOptions });
    if (!session || !session.user || !session.user._id) {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    const userId = session.user._id as mongoose.Types.ObjectId; // Cast user._id

    const { searchParams } = new URL(req.url);
    const userName = searchParams.get('userName');

    if (!userName) {
      return NextResponse.json({ message: 'Invalid userName' }, { status: 400 });
    }

    const user = await UserModel.findOne({ userName }).exec();
    if (!user || !user._id || user._id.toString() !== userId.toString()) {
      return NextResponse.json({ message: 'User not found or does not match session' }, { status: 404 });
    }

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

    return NextResponse.json({
      cumulativeStats
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving stats', error: error.message }, { status: 500 });
  }
}
