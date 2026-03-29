const mongoose = require('mongoose');

// AiInterviewSession: groups one complete AI text interview attempt
// Each session holds all 5 Q&A pairs + computed stats
const aiInterviewSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['frontend', 'backend', 'mern', 'hr', 'aptitude'],
        },
        // All answers for this session
        answers: [
            {
                question: { type: String, required: true },
                answerText: { type: String, required: true },
                score: { type: Number, required: true },       // 0-10 from Groq
                feedback: { type: String, required: true },
                analysisSource: { type: String, enum: ['AI', 'FALLBACK'], default: 'AI' },
            },
        ],
        totalQuestions: { type: Number, required: true },
        averageScore: { type: Number, required: true },        // 0-10
        percentage: { type: Number, required: true },          // 0-100
        skillLevel: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Job Ready'],
            required: true,
        },
    },
    {
        timestamps: true, // createdAt = when interview was completed
    }
);

const AiInterviewSession = mongoose.model('AiInterviewSession', aiInterviewSessionSchema);

module.exports = AiInterviewSession;
