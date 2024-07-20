import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { PaperModel } from "@/models/paper.model";

const submitMock = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === "POST") {
    const { paperID } = req.body;

    try {
      // Get the session data
      const session = await getSession({ req });
      if (!session) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Fetch the paper
      const paper = await PaperModel.findOne({ paperID }).populate("questions");
      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      // Fetch the user using session data
      const user = await UserModel.findById(session.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate the number of correct answers and total time taken
      let correctAnswers = 0;
      let totalTimeTaken = 0;
      for (const question of paper.questions) {
        const userAnswer = user.questionsSolvedDetails.find(
          (q) => q.questionObjectId.toString() === question._id.toString()
        );
        if (userAnswer) {
          totalTimeTaken += userAnswer.userQuestionTime;
          if (userAnswer.isCorrect) {
            correctAnswers++;
          }
        }
      }

      // Calculate user marks and accuracy
      const totalMarks = paper.totalMarks;
      const userMarks = correctAnswers; // Assuming each correct answer is worth 1 mark
      const accuracy = (correctAnswers / totalMarks) * 100;

      // Update the user's paperSolvedDetails
      user.papersSolvedDetails.push({
        paperObjectId: paper._id,
        paperId: paper.paperID,
        userMarks,
        userPaperTime: totalTimeTaken,
        accuracy,
      });

      await user.save();

      // Respond with the accuracy and total time taken
      res.status(200).json({ accuracy, totalTimeTaken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default submitMock;
