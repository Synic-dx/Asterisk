// pages/api/forgot-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import crypto from 'crypto';
import { sendForgotPasswordEmail } from '@/helpers/sendForgotPasswordEmail';

const forgotPassword = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Valid email is required' });
  }

  try {
    const decodedEmail = decodeURIComponent(email);
    const user = await UserModel.findOne({ email: decodedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    user.forgotPasswordToken = resetToken;
    user.forgotPasswordTokenExpiry = resetTokenExpiry;

    await user.save();

    const emailResponse = await sendForgotPasswordEmail(user.email, resetToken, user.userName);

    if (!emailResponse.success) {
      user.forgotPasswordToken = undefined;
      user.forgotPasswordTokenExpiry = undefined;
      await user.save();
      return res.status(500).json({ message: 'Failed to send reset password email' });
    }

    return res.status(200).json({ message: 'Reset password email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default forgotPassword;
