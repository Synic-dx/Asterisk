import UserModel from '@/models/user.model';

const checkAndUpdateAccess = async () => {
  try {
    const now = new Date();

    // Find users with expired premium access
    const usersWithExpiredPremiumAccess = await UserModel.find({
      'premiumAccess.valid': true,
      'premiumAccess.accessTill': { $lte: now },
    });

    for (const user of usersWithExpiredPremiumAccess) {
      user.premiumAccess.valid = false;
      user.premiumAccess.accessTill = undefined;
      user.premiumAccess.accessModel = undefined;
      await user.save();
    }

    // Find users with expired grader access
    const usersWithExpiredGraderAccess = await UserModel.find({
      'graderAccess.valid': true,
      'graderAccess.accessTill': { $lte: now },
    });

    for (const user of usersWithExpiredGraderAccess) {
      user.graderAccess.valid = false;
      user.graderAccess.accessTill = undefined;
      user.graderAccess.model = undefined; // Corrected to use the property 'model'
      await user.save();
    }

    console.log('Access check and update completed.');
  } catch (error) {
    console.error('Error updating access:', error);
  }
};

export default checkAndUpdateAccess;
