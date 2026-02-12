const mongoose = require('mongoose');

// InterviewSession model for tracking interview attempts
// Stores the session details including questions, answers, score, and status
const interviewSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            required: true,
            enum: ['frontend', 'backend', 'mern', 'hr', 'aptitude'],
        },
        questions: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Question',
                    required: true,
                },
                selectedAnswer: {
                    type: Number,
                    default: null,
                },
            },
        ],
        score: {
            type: Number,
            default: 0,
        },
        totalQuestions: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['started', 'completed'],
            default: 'started',
        },
    },
    {
        timestamps: true,
    }
);

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

module.exports = InterviewSession;
