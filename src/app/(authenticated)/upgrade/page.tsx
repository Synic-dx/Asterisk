'use client'
import { NextPage } from 'next';
import axios from 'axios';

const Upgrade: NextPage = () => {
  const currentDate = new Date;

  const handlePremiumAccess = async () => {
    try {
      const data = {
        premiumAccess: {
          valid: true,
          accessTill: new Date(currentDate.getTime() + 60 * 60 * 1000),
          model: 'GPT-4o-mini'
        }
      };
      await axios.post('/api/update-access', data);
      alert('Premium Access activated successfully!');
    } catch (error) {
      console.error('Error updating Premium Access', error);
      alert('Failed to update Premium Access');
    }
  };

  const handleGraderAccess = async () => {
    try {
      const data = {
        graderAccess: {
          valid: true,
          accessTill: new Date,
          weeklyEssayLimit: 10,
          model: 'GPT-4o-mini'
        }
      };
      await axios.post('/api/update-access', data);
      alert('Grader Access activated successfully!');
    } catch (error) {
      console.error('Error updating Grader Access', error);
      alert('Failed to update Grader Access');
    }
  };

  return (
    <div>
      <h1>Upgrade</h1>
      <p>This is a basic Next.js page with upgrade options.</p>
      <button onClick={handlePremiumAccess}>Premium Access</button>
      <button onClick={handleGraderAccess}>Grader Access</button>
    </div>
  );
};

export default Upgrade;
