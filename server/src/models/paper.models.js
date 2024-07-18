import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema({
    level: {type: String, required: true},
    subject: {type: String, required: true},
    subjectCode: {type: Number, required: true},
    examSession: {type: String, required: true},
    year: {type: Number, required: true},
    component: {type: Number, required: true},
    variant: {type: Number, required: true},
    paperID: {type: String, required: true},
    userMarks: {
        type: Number,
        required: true,
        default: null
    },
    totalMarks: {
        type: Number,
        required: true
    },
    userPaperTime: {
        type: Number,
        required: true,
        default: null
    },
    totalPaperTime: {
        type: Number,
        required: true
    }
})

//paperID should be equal to {subjectCode-year-examSession-component+variant eg 9709-2023-MJ-12}
paperSchema.pre('save', function(next) {
    this.paperID = `${this.subjectCode}-${this.year}-${this.examSession}-${this.component}${this.variant}`;
    next();
  });

export const Paper = mongoose.model('Paper', paperSchema)