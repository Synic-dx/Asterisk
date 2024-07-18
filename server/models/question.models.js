import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    paper: {type: mongoose.Schema.Types.ObjectId, ref: 'Paper', required: true},
    questionID: {type: String, required: true}, // Should be equal to paperID+questionNumber eg 9709-2023-MJ-12-6 for 6th question
    questionNumber: {type: Number, required: true},
    questionText: {type: String, required: true},
    image: {type: String},
    options: {type: [Object], required: true},
    correctAnswer: {type: Object, required: true},
    userAnswer: {type: Object},
    userCorrect: {type: Boolean},
    userTime: {type: Number} // Time taken by user to answer in seconds
})

export const Question = mongoose.model('Question', questionSchema)