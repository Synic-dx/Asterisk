// src/app/api/forgot-password/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import { sendForgotPasswordEmail } from '@/helpers/sendForgotPasswordEmail';

export async function POST(req: Request) {
  await dbConnect();

  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  const { email } = await req.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ message: 'Valid email is required' }, { status: 400 });
  }

  try {
    const decodedEmail = decodeURIComponent(email);
    const user = await UserModel.findOne({ email: decodedEmail });

    if (!user) {
      return NextResponse.json({ message: 'No user found with this email' }, { status: 404 });
    }

    const resetToken = (Math.floor(Math.random() * 900000) + 100000).toString();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    user.forgotPasswordToken = resetToken;
    user.forgotPasswordTokenExpiry = resetTokenExpiry;

    await user.save();

    const emailResponse = await sendForgotPasswordEmail(user.email, resetToken, user.userName);

    if (!emailResponse.success) {
      // Reset token fields on failure to send email
      user.forgotPasswordToken = undefined;
      user.forgotPasswordTokenExpiry = undefined;
      await user.save();
      return NextResponse.json({ message: 'Failed to send reset password email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Reset password email sent. Please check your inbox.' }, { status: 200 });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
