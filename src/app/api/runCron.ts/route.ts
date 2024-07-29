import { NextRequest, NextResponse } from 'next/server';
import cron from 'node-cron';
import checkAndUpdateAccess from '@/lib/checkAndUpdateAccess';

let isScheduled = false; // Flag to ensure the cron job is only scheduled once

export async function GET(req: NextRequest) {
  if (isScheduled) {
    return NextResponse.json({ message: 'Cron job is already scheduled' });
  }

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

  isScheduled = true; // Set the flag to indicate the cron job has been scheduled
  return NextResponse.json({ message: 'Cron job scheduled' });
}
