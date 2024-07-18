import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    unrestrictedSums: {type: Boolean, required: true, default: false},
    unrestrictedSubjects: {type: Boolean, required: true, default: false},
    graderAccess: {type: Boolean, required: true, default: false},
    newUser: {type: Boolean, required: true, default: true},
    paperSolvedDetails: {type: [Object]},
    questionsSolvedDetails: {type: [Object]}
},
{timestamps : true})

export const User = mongoose.model('User', userSchema)