import mongoose, { Document, Schema } from "mongoose";

// Define the TypeScript types
export type Subtopics = string[]; // An array of subtopic names
export type Topic = {
  topicName: string; // Name of the topic
  subtopics: Subtopics; // Array of subtopics
};
export type Topics = Topic[]; // Array of Topic objects

export interface Level {
  levelName: string; // Name of the level (e.g., AS Level, A Level)
  topics: Topics; // Array of Topic objects
}

export interface Subject extends Document {
  subjectCode: string; // Unique code for the subject
  subjectName: string; // Name of the subject
  levels: Level[]; // Array of Level objects
}

// Define the Mongoose schemas
const SubtopicsSchema: Schema = new Schema({
  subtopics: { type: [String], required: true }, // Array of subtopic names
});

const TopicsSchema: Schema = new Schema({
  topicName: { type: String, required: true }, // Name of the topic
  subtopics: { type: [String], required: true }, // Array of subtopic names
});

const LevelsSchema: Schema = new Schema({
  levelName: { type: String, required: true }, // Name of the level
  topics: { type: [TopicsSchema], required: true }, // Array of Topic objects
});

const SubjectSchema: Schema = new Schema({
  subjectCode: { type: String, required: true, unique: true }, // Unique code for the subject
  subjectName: { type: String, required: true, unique: true }, // Name of the subject
  levels: { type: [LevelsSchema], required: true }, // Array of Level objects
});

// Create and export the model
const SubjectModel = mongoose.models.Subject || mongoose.model<Subject>("Subject", SubjectSchema);

export default SubjectModel;
