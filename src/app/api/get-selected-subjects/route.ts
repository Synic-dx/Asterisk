import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();
    console.log('Database connection established.');

    // Get user session
    const session = await getServerSession({ req, ...authOptions });
    console.log('Session retrieved:', session);

    if (!session || !session.user || !session.user.userName) {
      console.warn('Session or userName not found.');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userName = session.user.userName;
    console.log('User Name:', userName);

    let user;
    try {
      // Fetch user and their selected subjects by userName
      user = await UserModel.aggregate([
        { $match: { userName: userName } },
        {
          $lookup: {
            from: 'subjects', // Name of the subjects collection
            let: { selectedSubjects: '$selectedSubjects' }, // Use let to reference local field
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', '$$selectedSubjects.subjectObjectId'] // Match subjectObjectId with _id
                  }
                }
              }
            ],
            as: 'fullSelectedSubjects', // Resulting field
          },
        },
        {
          $project: {
            _id: 0,
            fullSelectedSubjects: 1, // Include only the fullSelectedSubjects
          },
        },
      ]);
      console.log('User and subjects fetched:', user);
    } catch (dbError) {
      console.error('Database error while fetching user and subjects:', dbError);
      return NextResponse.json({ message: 'Database error' }, { status: 500 });
    }

    if (user.length === 0) {
      console.warn('User not found with userName:', userName);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Selected subjects retrieved successfully',
        selectedSubjects: user[0].fullSelectedSubjects,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error retrieving selected subjects:', error);

    // Type guard to check if error is an instance of Error
    if (error instanceof Error) {
      return NextResponse.json(
        { message: 'Internal server error', error: error.message },
        { status: 500 }
      );
    }

    // Fallback for unknown errors
    return NextResponse.json(
      { message: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
