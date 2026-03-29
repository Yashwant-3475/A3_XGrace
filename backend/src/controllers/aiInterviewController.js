const AiInterviewSession = require('../models/AiInterviewSession');

// Helper: compute skill level from average score (0-10 scale)
const computeSkillLevel = (avgScore) => {
    if (avgScore >= 7.5) return 'Job Ready';
    if (avgScore >= 5)   return 'Intermediate';
    return 'Beginner';
};

// ─── POST /api/ai-interview/save-session ────────────────────────────────────
// Called once at the end of the AI text interview with all 5 answers
const saveSession = async (req, res) => {
    try {
        const { role, answers } = req.body;

        if (!role || !answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: 'role and answers array are required.' });
        }

        const validRoles = ['frontend', 'backend', 'mern', 'hr', 'aptitude'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
        }

        // Validate each answer has required fields
        for (const ans of answers) {
            if (!ans.question || ans.score === undefined || !ans.feedback) {
                return res.status(400).json({ message: 'Each answer must have question, score, and feedback.' });
            }
        }

        // Compute aggregate stats
        const totalQuestions = answers.length;
        const sumScores = answers.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
        const averageScore = parseFloat((sumScores / totalQuestions).toFixed(2));
        const percentage = Math.round(averageScore * 10); // 0-10 → 0-100%
        const skillLevel = computeSkillLevel(averageScore);

        const session = await AiInterviewSession.create({
            userId: req.user.id,
            role,
            answers,
            totalQuestions,
            averageScore,
            percentage,
            skillLevel,
        });

        res.status(201).json({
            sessionId: session._id,
            role: session.role,
            averageScore: session.averageScore,
            percentage: session.percentage,
            skillLevel: session.skillLevel,
            totalQuestions: session.totalQuestions,
            createdAt: session.createdAt,
        });

    } catch (error) {
        console.error('Error saving AI interview session:', error);
        res.status(500).json({ message: 'Failed to save AI interview session.' });
    }
};

// ─── GET /api/ai-interview/recent ───────────────────────────────────────────
// Returns last 5 completed AI sessions for the authenticated user (used by dashboard)
const getRecentSessions = async (req, res) => {
    try {
        const sessions = await AiInterviewSession.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('-answers') // don't send full answers to dashboard
            .lean();

        res.status(200).json(sessions);
    } catch (error) {
        console.error('Error fetching recent AI sessions:', error);
        res.status(500).json({ message: 'Failed to fetch recent AI interview sessions.' });
    }
};

// ─── GET /api/ai-interview/history ──────────────────────────────────────────
// Paginated, filterable history for the authenticated user
const getHistory = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 4;
        const skip  = (page - 1) * limit;

        // Build filter
        const filter = { userId: req.user.id };

        if (req.query.role) {
            filter.role = req.query.role;
        }

        if (req.query.minScore) {
            filter.averageScore = { $gte: parseFloat(req.query.minScore) };
        }

        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) {
                filter.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                const endDate = new Date(req.query.endDate);
                endDate.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = endDate;
            }
        }

        const totalItems = await AiInterviewSession.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / limit) || 0;

        const sessions = await AiInterviewSession.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({
            page,
            totalPages,
            totalItems,
            sessions,
        });

    } catch (error) {
        console.error('Error fetching AI interview history:', error);
        res.status(500).json({ message: 'Failed to fetch AI interview history.' });
    }
};

module.exports = { saveSession, getRecentSessions, getHistory };
