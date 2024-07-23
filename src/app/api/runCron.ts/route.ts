// updates access

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import checkAndUpdateAccess from '@/lib/checkAndUpdateAccess';
import cron from 'node-cron';

const runCron = async (req: NextApiRequest, res: NextApiResponse) => {
  // Connect to the database
  await dbConnect();

  // Schedule the access check to run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled access check...');
    await checkAndUpdateAccess();
  });

  res.status(200).json({ message: 'Cron job scheduled' });
};

export default runCron;
