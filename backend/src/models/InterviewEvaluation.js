const mongoose = require('mongoose');

// InterviewEvaluation model for storing detailed performance analysis
// Generated after interview completion with strengths, weaknesses, and improvement suggestions
const interviewEvaluationSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewSession',
            required: true,
            unique: true,
        },
        role: {
            type: String,
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
        percentage: {
            type: Number,
            required: true,
        },
        strengths: {
            type: [String],
            default: [],
        },
        weaknesses: {
            type: [String],
            default: [],
        },
        skillLevel: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Job Ready'],
            required: true,
        },
        improvements: {
            type: [String],
            default: [],
        },
        summary: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const InterviewEvaluation = mongoose.model('InterviewEvaluation', interviewEvaluationSchema);

module.exports = InterviewEvaluation;
