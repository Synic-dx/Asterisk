import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema({
    level: {type: String, required: true},
    subject: {type: String, required: true},
    subjectCode: {type: Number, required: true},
    examSession: {type: String, required: true},
    year: {type: Number, required: true},
    component: {type: Number, required: true},
    variant: {type: Number, required: true},
    paperID: {type: String, required: true}, //should be equal to {subjectCode-year-examSession-component+variant eg 9709-2023-MJ-12}
    userMarks: {
        type: Number,
        required: true,
        default: null
    },
    totalMarks: {
        type: Number,
        required: true
    },
    userTime: {
        type: Number,
        required: true,
        default: null
    },
    totalTime: {
        type: Number,
        required: true
    }
})

export const Paper = mongoose.model('Paper', paperSchema)