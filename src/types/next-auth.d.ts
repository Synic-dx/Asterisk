// src/types/next-auth.d.ts

import "next-auth";
import mongoose from "mongoose";

declare module "next-auth" {
  interface User {
    _id?: string;
    isVerified?: boolean;
    userName?: string;
    premiumAccess?: {
      valid: boolean;
      accessTill?: Date;
      accessModel?: string;
    };
    graderAccess?: {
      valid: boolean;
      accessTill?: Date;
      model?: string;
      weeklyEssayLimit?: number;
    };
    questionsSolvedDetails?: {
      questionObjectId: mongoose.Types.ObjectId;
      userAnswer: string;
      userQuestionTime: number;
      isCorrect: boolean;
      attemptedOn: Date;
      averageTimeTaken?: number;
    }[];
    selectedSubjects?: {
      subjectObjectId: mongoose.Types.ObjectId;
      subjectName: string;
      subjectCode: string;
      userRating: number;
      userAttempts: number;
      userCorrectAnswers: number;
      userPercentile?: number;
      dateAdded: Date;
    }[];
    forgotPasswordToken?: string;
    forgotPasswordTokenExpiry?: Date;
    isAdmin?: boolean;
    essaysGraded?: {
      essayId: mongoose.Types.ObjectId;
      date: Date;
      question: string;
      subjectName: string;
      subjectCode: string;
      questionType: string;
      userEssay: string;
      totalMarks: number;
      grade: string;
      feedback: string;
    }[];
  }

  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      userName?: string;
      premiumAccess?: {
        valid: boolean;
        accessTill?: Date;
        accessModel?: string;
      };
      graderAccess?: {
        valid: boolean;
        accessTill?: Date;
        model?: string;
        weeklyEssayLimit?: number;
      };
      questionsSolvedDetails?: {
        questionObjectId: mongoose.Types.ObjectId;
        userAnswer: string;
        userQuestionTime: number;
        isCorrect: boolean;
        attemptedOn: Date;
        averageTimeTaken?: number;
      }[];
      selectedSubjects?: {
        subjectObjectId: mongoose.Types.ObjectId;
        subjectName: string;
        subjectCode: string;
        userRating: number;
        userAttempts: number;
        userCorrectAnswers: number;
        userPercentile?: number;
        dateAdded: Date;
      }[];
      forgotPasswordToken?: string;
      forgotPasswordTokenExpiry?: Date;
      isAdmin?: boolean;
      essaysGraded?: {
        essayId: mongoose.Types.ObjectId;
        date: Date;
        question: string;
        subjectName: string;
        subjectCode: string;
        questionType: string;
        userEssay: string;
        totalMarks: number;
        grade: string;
        feedback: string;
      }[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    userName?: string;
    premiumAccess?: {
      valid: boolean;
      accessTill?: Date;
      accessModel?: string;
    };
    graderAccess?: {
      valid: boolean;
      accessTill?: Date;
      model?: string;
      weeklyEssayLimit?: number;
    };
    questionsSolvedDetails?: {
      questionObjectId: mongoose.Types.ObjectId;
      userAnswer: string;
      userQuestionTime: number;
      isCorrect: boolean;
      attemptedOn: Date;
      averageTimeTaken?: number;
    }[];
    selectedSubjects?: {
      subjectObjectId: mongoose.Types.ObjectId;
      subjectName: string;
      subjectCode: string;
      userRating: number;
      userAttempts: number;
      userCorrectAnswers: number;
      userPercentile?: number;
      dateAdded: Date;
    }[];
    forgotPasswordToken?: string;
    forgotPasswordTokenExpiry?: Date;
    isAdmin?: boolean;
  }
}
