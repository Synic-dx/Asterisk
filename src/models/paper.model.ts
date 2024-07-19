import mongoose, { Schema, Document } from 'mongoose';

export interface Paper extends Document {
  level: 'IGCSE' | 'AS/A-Level';
  subject: string;
  subjectCode: number;
  examSession: string;
  year: number;
  component: number;
  variant: number;
  paperID: string;
  userMarks: number | null;
  totalMarks: number;
  userPaperTime: number | null;
  totalPaperTime: number;
}

const PaperSchema = new Schema({
  level: { type: String, enum: ['IGCSE', 'AS/A-Level'], required: true },
  subject: { type: String, required: true },
  subjectCode: { type: Number, required: true },
  examSession: { type: String, required: true },
  year: { type: Number, required: true },
  component: { type: Number, required: true },
  variant: { type: Number, required: true },
  paperID: { type: String, required: true },
  userMarks: { type: Number, default: null },
  totalMarks: { type: Number, required: true },
  userPaperTime: { type: Number, default: null },
  totalPaperTime: { type: Number, required: true }
});

// middleware to auto-make the paperID based on subjectCode, year, examSession, component & variant
PaperSchema.pre('save', function (next) {
  this.paperID = `${this.subjectCode}-${this.year}-${this.examSession}-${this.component}${this.variant}`;
  next();
});

const PaperModel = mongoose.models.Paper || mongoose.model<Paper>('Paper', PaperSchema);

export default PaperModel;

