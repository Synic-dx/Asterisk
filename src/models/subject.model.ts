import mongoose, { Document, Schema } from 'mongoose';

type Subtopics = string[];
type Topics = {
  topicName: string;
  subtopics: Subtopics;
}[];

interface Level {
  levelName: string;
  topics: Topics;
}

interface Subject extends Document {
  subjectCode: string;
  subjectName: string;
  levels: Level[];
}

const SubtopicsSchema: Schema = new Schema({
  subtopics: { type: [String], required: true }
});

const TopicsSchema: Schema = new Schema({
  topicName: { type: String, required: true },
  subtopics: { type: [String], required: true }
});

const LevelsSchema: Schema = new Schema({
  levelName: { type: String, required: true },
  topics: { type: [TopicsSchema], required: true }
});

const SubjectSchema: Schema = new Schema({
  subjectCode: { type: String, required: true, unique: true },
  subjectName: { type: String, required: true, unique: true },
  levels: { type: [LevelsSchema], required: true }
});

const SubjectModel = mongoose.models.Subject || mongoose.model<Subject>("Subject", SubjectSchema);

export default SubjectModel;