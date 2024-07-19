import mongoose, { Schema, Document } from "mongoose";

export interface Option {
  option: "A" | "B" | "C" | "D";
  text: string;
  image?: string; // Optional
}

export interface Question extends Document {
  paper: mongoose.Types.ObjectId; // Reference to the Paper document
  questionID: string; // Unique identifier for the question
  difficultyLevel: "conceptual" | "easy" | "medium" | "hard"; // Difficulty level
  topic: string; // Main topic of the question
  subtopic?: string; // Subtopic of the question (if applicable)
  questionNumber: number; // Question number within the paper
  questionText: string; // The question text
  image?: string; // URL or path to the question image (if applicable)
  options: Option[]; // Array of options with text and image (if applicable)
  correctOption: Option; // The correct option with text and image (if applicable)
  userAnswer?: Option; // The user's answer with text and image (if applicable)
  userCorrect?: boolean; // Whether the user's answer is correct
  userQuestionTime?: number; // Time taken by user to answer in seconds
}

const QuestionSchema = new Schema({
  paper: { type: Schema.Types.ObjectId, ref: "Paper", required: true },
  questionID: { type: String, required: true },
  difficultyLevel: {
    type: String,
    enum: ["conceptual", "easy", "medium", "hard"],
    required: true,
  },
  topic: { type: String, required: true },
  subtopic: { type: String },
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  image: { type: String },
  options: { type: [Object], required: true },
  correctOption: { type: Object, required: true },
  userAnswer: { type: Object, default: null },
  userCorrect: { type: Boolean, default: null },
  userQuestionTime: { type: Number, default: null },
});

// Should be equal to paperID-QquestionNumber e.g., 9709-2023-MJ-12-Q6 for 6th question, everything before Q6 is imported via paperID
QuestionSchema.pre("save", async function (next) {
    if (this.isNew || this.isModified("questionNumber")) {
      const paper = await mongoose.model('Paper').findById(this.paper);
      if (paper) {
        this.questionID = `${paper.paperID}-Q${this.questionNumber}`;
      }
    }
    next();
  });

const QuestionModel =
  (mongoose.models.Question as mongoose.Model<Question>) ||
  mongoose.model<Question>("Question", QuestionSchema);

export default QuestionModel;
