import mongoose, { Schema, Document } from "mongoose";

export interface Option {
  option: "A" | "B" | "C" | "D";
  text?: string;
  image?: string; // The ? is appended to each optional datapoint
}

export interface Question extends Document {
  paper: mongoose.Types.ObjectId; // Reference to the Paper document
  questionID: string; // Unique identifier for the question
  difficultyLevel: "conceptual" | "easy" | "medium" | "hard"; // Difficulty level
  topic?: string; // Main topic of the question (if applicable)
  subtopic?: string; // Subtopic of the question (if applicable)
  questionNumber: number; // Question number within the paper
  questionText: string; // The question text
  questionImages?: string[]; // URL or path to the question image (if applicable)
  options: Option[]; // Array of options with text and image (if applicable)
  correctOption: Option; // The correct option with text and image (if applicable)
  userAnswer?: Option; // The user's answer with text and image (if applicable)
  userCorrect?: boolean; // Whether the user's answer is correct
  userQuestionTime?: number; // Time taken by user to answer in seconds
}

const OptionSchema = new Schema({
  option: { type: String, enum: ["A", "B", "C", "D"], required: true },
  text: { type: String },
  optionImage: { type: String }
});

const QuestionSchema = new Schema<Question>({
  paper: { type: Schema.Types.ObjectId, ref: "Paper", required: true },
  questionID: { type: String, required: true, unique: true },
  difficultyLevel: {
    type: String,
    enum: ["conceptual", "easy", "medium", "hard"]
  },
  topic: { type: String },
  subtopic: { type: String },
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  questionImages: { type: [String] }, // This is an array cuz some questions have multiple images. The images will be served via a CDN/Gitub Raw file link
  options: { type: [OptionSchema], required: true },
  correctOption: { type: OptionSchema, required: true },
  userAnswer: { type: OptionSchema, default: null },
  userCorrect: { type: Boolean, default: null },
  userQuestionTime: { type: Number, default: null },
});

// Middleware to ensure questionID is equal to paperID-QquestionNumber e.g., 9709-2023-MJ-12-Q6 for 6th question, everything before Q6 is imported via paperID
QuestionSchema.pre("save", async function (next) {
  const question = this as Question;
  if (question.isNew || question.isModified("questionNumber")) {
    const paper = await mongoose.model('Paper').findById(question.paper);
    if (paper) {
      question.questionID = `${paper.paperID}-Q${question.questionNumber}`;
    }
  }
  next();
});

const QuestionModel = mongoose.models.Question as mongoose.Model<Question> || mongoose.model<Question>("Question", QuestionSchema);
// this export syntax is useful cuz nextjs apps arent connected to database the whole time, only when neccessary
// so it checks if the data is present already or not (if so then just modifies) or else creates another object

export default QuestionModel;


