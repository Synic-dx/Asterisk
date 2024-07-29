import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';

interface SubjectStats {
  totalAttempts: number;
  totalCorrects: number;
  userRating: number;
  userPercentile: number;
}

interface StatsByDate {
  date: string;
  subjectStats: {
    [subjectCode: string]: SubjectStats;
  };
}

interface TotalStats {
  totalAttempts: number;
  totalCorrects: number;
}

const calculatePercentile = async (model: mongoose.Model<any>, field: string, value: number): Promise<number> => {
  try {
    const countLower = await model.countDocuments({ [field]: { $lt: value } });
    const total = await model.countDocuments({});
    return total > 0 ? (countLower / total) * 100 : 0;
  } catch (error) {
    console.error('Error calculating percentile:', error);
    throw error;
  }
};

const getStatsByDate = async (userId: mongoose.Types.ObjectId, startDate: Date, endDate: Date): Promise<StatsByDate[]> => {
  try {
    const stats = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$selectedSubjects' },
      { $unwind: '$questionsSolvedDetails' },
      {
        $match: {
          'questionsSolvedDetails.attemptedOn': { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$questionsSolvedDetails.attemptedOn' } },
            subjectCode: '$selectedSubjects.subjectCode',
            userRating: '$selectedSubjects.userRating',
          },
          totalAttempts: { $sum: 1 },
          totalCorrects: {
            $sum: { $cond: ['$questionsSolvedDetails.isCorrect', 1, 0] },
          },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          subjectStats: {
            $push: {
              subjectCode: '$_id.subjectCode',
              totalAttempts: '$totalAttempts',
              totalCorrects: '$totalCorrects',
              userRating: '$_id.userRating',
            },
          },
        },
      },
      {
        $addFields: {
          subjectStats: {
            $arrayToObject: {
              $map: {
                input: '$subjectStats',
                as: 'item',
                in: {
                  k: '$$item.subjectCode',
                  v: {
                    totalAttempts: '$$item.totalAttempts',
                    totalCorrects: '$$item.totalCorrects',
                    userRating: '$$item.userRating',
                    userPercentile: {
                      $let: {
                        vars: {
                          percentile: {
                            $cond: [
                              { $gte: ['$userRating', 0] },
                              {
                                $multiply: [
                                  {
                                    $divide: [
                                      {
                                        $subtract: [
                                          {
                                            $size: {
                                              $filter: {
                                                input: '$subjectStats',
                                                cond: { $gte: ['$$this.userRating', '$$item.userRating'] },
                                              },
                                            },
                                          },
                                          {
                                            $size: '$subjectStats',
                                          },
                                        ],
                                      },
                                      {
                                        $size: '$subjectStats',
                                      },
                                    ],
                                  },
                                  100,
                                ],
                              },
                              0,
                            ],
                          },
                        },
                        in: '$$percentile',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          subjectStats: 1,
        },
      },
    ]);

    return stats.map(stat => ({
      date: stat.date,
      subjectStats: stat.subjectStats.reduce((acc: { [key: string]: SubjectStats }, curr: any) => {
        acc[curr.subjectCode] = {
          totalAttempts: curr.totalAttempts,
          totalCorrects: curr.totalCorrects,
          userRating: curr.userRating,
          userPercentile: curr.userPercentile,
        };
        return acc;
      }, {}),
    }));
  } catch (error) {
    console.error(`Error getting stats from ${startDate.toISOString()} to ${endDate.toISOString()}:`, error);
    throw error;
  }
};

const getTotalStats = async (userId: mongoose.Types.ObjectId, startDate: Date, endDate: Date): Promise<TotalStats> => {
  try {
    const stats = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$questionsSolvedDetails' },
      {
        $match: {
          'questionsSolvedDetails.attemptedOn': { $gte: startDate, $lte: endDate },
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

    if (stats.length > 0) {
      return {
        totalAttempts: stats[0].totalAttempts,
        totalCorrects: stats[0].totalCorrects,
      };
    } else {
      return {
        totalAttempts: 0,
        totalCorrects: 0,
      };
    }
  } catch (error) {
    console.error(`Error getting total stats from ${startDate.toISOString()} to ${endDate.toISOString()}:`, error);
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

    const statsByDate = await Promise.all(
      last30Days.map((date) => {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1); // End of the day

        return getStatsByDate(userId, startDate, endDate);
      })
    );

    const result = statsByDate.flat();

    // Total stats calculations
    const dailyStats = await getTotalStats(userId, today, today);
    const weeklyStats = await getTotalStats(userId, new Date(today.setDate(today.getDate() - today.getDay())), today);
    const monthlyStats = await getTotalStats(userId, new Date(today.getFullYear(), today.getMonth(), 1), today);
    const overallStats = await getTotalStats(userId, new Date(0), today);

    return NextResponse.json({
      cumulativeSubjectStats: result,
      totalDailyAttempts: dailyStats.totalAttempts,
      totalDailyCorrects: dailyStats.totalCorrects,
      totalWeeklyAttempts: weeklyStats.totalAttempts,
      totalWeeklyCorrects: weeklyStats.totalCorrects,
      totalMonthlyAttempts: monthlyStats.totalAttempts,
      totalMonthlyCorrects: monthlyStats.totalCorrects,
      totalAttempts: overallStats.totalAttempts,
      totalCorrects: overallStats.totalCorrects,
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving detailed stats', error: error.message }, { status: 500 });
  }
}
