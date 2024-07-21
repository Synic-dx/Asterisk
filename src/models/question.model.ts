import mongoose, { Schema, Document } from "mongoose";

export interface Option {
  option: "A" | "B" | "C" | "D";
  text?: string;
  optionImage?: string;
}

export interface Subject {
  name: string;
  level: "IGCSE" | "AS-Level" | "A-Level";
  subjectCode: string;
}

export interface Question extends Document {
  subject: Subject; // Reference to the Subject
  difficultyRating?: number; // Difficulty level based on percentage wrong
  topic?: string; // Main topic of the question (if applicable)
  subtopic?: string; // Subtopic of the question (if applicable)
  questionText: string; // The question text
  questionImages?: string[]; // URL or path to the question image (if applicable)
  explanation?: string;
  options: Option[]; // Array of options with text and image (if applicable)
  correctOption: Option; // The correct option with text and image (if applicable)
  totalAttempts: number; // Total number of users who attempted this question
  totalCorrect: number; // Total number of times it has been gotten correct
}

const OptionSchema = new Schema({
  option: { type: String, enum: ["A", "B", "C", "D"], required: true },
  text: { type: String },
  optionImage: { type: String },
});

const SubjectSchema = new Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ["IGCSE", "AS/A-Level"], required: true },
  subjectCode: { type: String, required: true },
});

const QuestionSchema = new Schema<Question>({
  subject: { type: SubjectSchema, required: true },
  topic: { type: String },
  subtopic: { type: String },
  questionText: { type: String, required: true },
  questionImages: { type: [String] },
  options: { type: [OptionSchema], required: true },
  correctOption: { type: OptionSchema, required: true },
  explanation: { type: String },

  // Ratings
  difficultyRating: {
    type: Number,
    default: 50,
  },
  totalAttempts: { type: Number, default: null },
  totalCorrect: { type: Number, default: null },
});

const QuestionModel =
  (mongoose.models.Question as mongoose.Model<Question>) ||
  mongoose.model<Question>("Question", QuestionSchema);
// this export syntax is useful cuz nextjs apps arent connected to database the whole time, only when neccessary
// so it checks if the data is present already or not (if so then just modifies) or else creates another object

export default QuestionModel;
