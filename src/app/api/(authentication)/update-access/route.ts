import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import UserModel from '@/models/user.model';
import dbConnect from '@/lib/dbConnect';
import { authOptions } from '@/app/api/(authentication)/auth/[...nextauth]/options';

type UpdateData = {
  premiumAccess?: {
    valid: boolean;
    accessTill?: Date;
    accessModel?: string;
  };
  graderAccess?: {
    valid: boolean;
    accessTill?: Date;
    model?: string;
    weeklyEssayLimit?: number;
  };
};

export async function POST(req: NextRequest) {
  // Get the session on the server side
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.userName) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { userName } = session.user;
  const data: UpdateData = await req.json();

  try {
    await dbConnect();

    const user = await UserModel.findOne({ userName });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update the user's access details
    if (data.premiumAccess) {
      user.premiumAccess = data.premiumAccess;
    }

    if (data.graderAccess) {
      user.graderAccess = data.graderAccess;
    }

    await user.save();

    return NextResponse.json({ message: 'Access updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating access:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
