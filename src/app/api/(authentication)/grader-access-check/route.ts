import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/(authentication)/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';

export async function GET(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the session on the server side
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.userName) {
    return res.status(401).json({ hasGraderAccess: false });
  }

  try {
    await dbConnect(); // Ensure the database connection is established

    const user = await UserModel.findOne({ userName: session.user.userName });

    if (!user || !user.graderAccess.valid || (user.graderAccess.accessTill && user.graderAccess.accessTill <= new Date())) {
      return res.status(403).json({ hasGraderAccess: false });
    }

    return res.status(200).json({ hasGraderAccess: true });
  } catch (error) {
    console.error('Error checking grader access:', error);
    return res.status(500).json({ hasGraderAccess: false });
  }
}
