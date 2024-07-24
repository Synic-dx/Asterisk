'use client';

import Header from '@/components/Header';
import SignUpForm from '@/components/SignUpComponent';
import { NextPage } from 'next';

const SignUpPage: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col md:flex-row items-center p-8 rounded-lg shadow-lg">
          <img
            src="/Images/hourglassMan.png"
            alt="Graphic"
            className="w-1/2 md:w-1/3 mb-6 md:mb-0 md:mr-6"
          />
          <SignUpForm />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
