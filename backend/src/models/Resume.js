const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true, // All analyses must be tied to a logged-in user
            index: true,    // Index for fast per-user queries
        },
        filename: {
            type: String,
            required: true,
        },
        resumeText: {
            type: String,
            required: true,
        },
        analysis: {
            skills: [String],
            experienceSummary: String,
            roleSuitability: String,
            strengths: [String],
            weakAreas: [String],
            improvementSuggestions: [String],
            matchedSkills: [String],
            missingSkills: [String],
        },
        analysisSource: {
            type: String,
            enum: ['AI', 'CLASSIC'],
            required: true,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
