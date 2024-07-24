import mongoose, { Schema, Document } from "mongoose";

export interface Option {
  option: "A" | "B" | "C" | "D";
  text?: string;
  optionImage?: string;
}

export interface Subject {
  name: string;
  subjectCode: string;
}

export interface Question extends Document {
  subject: Subject; // Reference to the Subject
  level: "IGCSE" | "AS-Level" | "A-Level";
  difficultyRating?: number; // Difficulty level based on percentage wrong
  topic?: string; // Main topic of the question (if applicable)
  subtopic?: string; // Subtopic of the question (if applicable)
  questionText: string; // The question text
  graphics?: string[]; // Markdown for graphics
  explanation?: string;
  options: Option[]; // Array of options with text and image (if applicable)
  correctOption: Option; // The correct option with text and image (if applicable)
  totalAttempts: number; // Total number of users who attempted this question
  totalCorrect: number; // Total number of times it has been gotten correct
  averageTimeTakenInSeconds?: number;
  difficultyRatingPercentile?: number;
}

const OptionSchema = new Schema({
  option: { type: String, enum: ["A", "B", "C", "D"], required: true },
  text: { type: String },
  optionImage: { type: String },
});

const SubjectSchema = new Schema({
  name: { type: String, required: true },
  subjectCode: { type: String, required: true },
});

const QuestionSchema = new Schema<Question>({
  subject: { type: SubjectSchema, required: true },
  level: { type: String, enum: ["IGCSE", "AS-Level", "A-Level"], required: true },
  topic: { type: String },
  subtopic: { type: String },
  questionText: { type: String, required: true },
  graphics: { type: [String] },
  options: { type: [OptionSchema], required: true },
  correctOption: { type: OptionSchema, required: true },
  explanation: { type: String },

  // Ratings
  difficultyRating: {
    type: Number,
    default: 50,
  },
  totalAttempts: { type: Number, default: 0 },
  totalCorrect: { type: Number, default: 0 },
  averageTimeTakenInSeconds: { type: Number, required: false },
  difficultyRatingPercentile: { type: Number, required: false },
});

const QuestionModel =
  (mongoose.models.Question as mongoose.Model<Question>) ||
  mongoose.model<Question>("Question", QuestionSchema);

export default QuestionModel;
