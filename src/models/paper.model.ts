import mongoose, { Schema, Document } from "mongoose";

// Array of covered subjects, this is where to arrive first when adding another subject to the database
const subjects = [
  {
    name: "Economics",
    level: "IGCSE",
    subjectCode: "0455",
  },
  {
    name: "Physics",
    level: "IGCSE",
    subjectCode: "0625",
  },
  {
    name: "Biology",
    level: "IGCSE",
    subjectCode: "0610",
  },
  {
    name: "Chemistry",
    level: "IGCSE",
    subjectCode: "0620",
  },
  {
    name: "Economics",
    level: "AS/A-Level",
    subjectCode: "9708",
  },
];

export interface Subject {
  name: string;
  level: "IGCSE" | "AS/A-Level";
  subjectCode: string;
}

export interface Paper extends Document {
  subject: Subject;
  examSession: "FM" | "MJ" | "ON";
  year: number;
  component: number;
  variant: 1 | 2 | 3;
  paperID: string;
  userMarks: number | null;
  totalMarks: number;
  userPaperTime: number | null;
  totalPaperTime: number;
}

const SubjectSchema = new Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ["IGCSE", "AS/A-Level"], required: true },
  subjectCode: { type: String, required: true },
});

const PaperSchema = new Schema({
  subject: { type: SubjectSchema, required: true },
  examSession: { type: String, enum: ["FM", "MJ", "ON"], required: true },
  year: { type: Number, required: true },
  component: { type: Number, required: true },
  variant: { type: Number, enum: [1, 2, 3], required: true },
  paperID: { type: String, required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  // userMarks: { type: Number, default: null },
  totalMarks: { type: Number, required: true },
  // userPaperTime: { type: Number, default: null },
  totalPaperTime: { type: Number, required: true },
});

// Middleware to search and find the full subject object from the array through just the subjectCode
// then auto-generate the paperID based on subjectCode, year, examSession, component & variant
PaperSchema.pre("save", function (next) {
  const paper = this as any; // Explicitly type `this` as `any` to avoid TypeScript issues
  const subject = subjects.find(
    (sub) => sub.subjectCode === paper.subject.subjectCode
  );
  if (subject) {
    paper.paperID = `${subject.subjectCode}-${paper.year}-${paper.examSession}-${paper.component}${paper.variant}`;
    paper.subject = subject; // Ensure the full subject object is stored
  }
  next();
});

const PaperModel =
  mongoose.models.Paper || mongoose.model<Paper>("Paper", PaperSchema);

const SubjectModel =
  mongoose.models.Subject || mongoose.model<Subject>("Subject", SubjectSchema);
// this export syntax is useful cuz nextjs apps arent connected to database the whole time, only when neccessary
// so it checks if the data is present already or not (if so then just modifies) or else creates another object

export { PaperModel, SubjectModel };

