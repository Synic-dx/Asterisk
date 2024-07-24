import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import checkAndUpdateAccess from '@/lib/checkAndUpdateAccess';
import cron from 'node-cron';

const runCron = async (req: NextApiRequest, res: NextApiResponse) => {
  // Connect to the database
  await dbConnect();

  // Schedule the access check to run daily at midnight (UTC time)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled access check...');
    try {
      await checkAndUpdateAccess();
      console.log('Access check and update completed.');
    } catch (error) {
      console.error('Error during access check and update:', error);
    }
  });

  res.status(200).json({ message: 'Cron job scheduled' });
};

export default runCron;
