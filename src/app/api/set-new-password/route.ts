import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Define schema for request body validation
const requestBodySchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
  confirmPassword: z.string()
    .min(6, { message: 'Confirm Password must be at least 6 characters long' })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'], // Highlight the confirmPassword field if passwords don't match
});

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const requestBody = await req.json(); // Parse the request body
    // Validate request body
    const parsedBody = requestBodySchema.parse(requestBody);
    const { email, password } = parsedBody;

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 400 });
    }

    // Hash new password and update user
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }

    console.error('Error updating password:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
