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
    // Find the user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Generate a secure reset token and set expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    // Update the user document with the reset token and expiry
    user.forgotPasswordToken = resetToken;
    user.forgotPasswordTokenExpiry = resetTokenExpiry;

    await user.save();

    // Send the forgot password email
    const emailResponse = await sendForgotPasswordEmail(user.email, resetToken, user.userName);

    if (!emailResponse.success) {
      // If email sending fails, revert the changes
      user.forgotPasswordToken = undefined;
      user.forgotPasswordTokenExpiry = undefined;
      await user.save();
      return res.status(500).json({ message: 'Failed to send reset password email' });
    }

    return res.status(200).json({
      message: 'Reset password email sent. Please check your inbox.',
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default forgotPassword;
