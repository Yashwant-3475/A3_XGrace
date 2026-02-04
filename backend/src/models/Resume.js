const mongoose = require('mongoose');

// Resume model to store resume analysis data
const resumeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Optional - may not be authenticated
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
            enum: ['AI', 'FALLBACK'],
            required: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
