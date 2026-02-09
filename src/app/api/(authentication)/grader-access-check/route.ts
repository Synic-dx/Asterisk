import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/(authentication)/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';

export async function GET(req: NextRequest) {
  // Get the session on the server side
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.userName) {
    return NextResponse.json({ hasGraderAccess: false }, { status: 401 });
  }

  try {
    await dbConnect(); // Ensure the database connection is established

    const user = await UserModel.findOne({ userName: session.user.userName });

    if (!user || !user.graderAccess.valid || (user.graderAccess.accessTill && user.graderAccess.accessTill <= new Date())) {
      return NextResponse.json({ hasGraderAccess: false }, { status: 403 });
    }

    return NextResponse.json({ hasGraderAccess: true }, { status: 200 });
  } catch (error) {
    console.error('Error checking grader access:', error);
    return NextResponse.json({ hasGraderAccess: false }, { status: 500 });
  }
}
