// src/app/api/get-all-subjects/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth/next'; // Use getServerSession for server-side session
import { authOptions } from '../auth/[...nextauth]/options'; // Adjust the path if necessary to your authOptions
import SubjectModel from '@/models/subject.model'; // Adjust the path if needed

export async function GET() {
  try {
    // Get session using getServerSession (or your session handling method)
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Connect to the database
    await dbConnect();

    // Fetch all subjects from the database
    const subjects = await SubjectModel.find().exec();
    return NextResponse.json(subjects); // Return subjects as JSON
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
