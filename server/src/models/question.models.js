import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    paper: {type: mongoose.Schema.Types.ObjectId, ref: 'Paper', required: true},
    questionID: {type: String, required: true}, // Should be equal to paperIDQquestionNumber eg 9709-2023-MJ-12-Q6 for 6th question
    difficultyLevel: {type: String, enum: ['conceptual', 'easy', 'medium', 'hard'], required: true},
    topic: {type: String, required: true},
    subtopic: {type: String},
    questionNumber: {type: Number, required: true},
    questionText: {type: String, required: true},
    image: {type: String},
    options: {type: [Object], required: true},
    correctAnswer: {type: Object, required: true},
    userAnswer: {type: Object, required: true, default: null},
    userCorrect: {type: Boolean, required: true, default: null},
    userTime: {type: Number, required: true, default: null} // Time taken by user to answer in seconds
})

export const Question = mongoose.model('Question', questionSchema)