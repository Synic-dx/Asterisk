import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import UserModel from '@/models/user.model'; // Adjust the path if needed
import dbConnect from '@/lib/dbConnect';
import { authOptions } from '@/app/api/(authentication)/auth/[...nextauth]/options'; // Adjust the path if needed

type Data = {
  message: string;
};

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

export async function POST(req: NextApiRequest, res: NextApiResponse<Data>) {
  // Get the session on the server side
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.userName) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { userName } = session.user;
  const data: UpdateData = req.body;

  try {
    await dbConnect(); // Ensure the database connection is established

    const user = await UserModel.findOne({ userName });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user’s access details
    if (data.premiumAccess) {
      user.premiumAccess = data.premiumAccess;
    }

    if (data.graderAccess) {
      user.graderAccess = data.graderAccess;
    }

    await user.save();

    return res.status(200).json({ message: 'Access updated successfully' });
  } catch (error) {
    console.error('Error updating access:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
