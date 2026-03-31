const AiInterviewSession = require('../models/AiInterviewSession');
const mongoose = require('mongoose');

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

// ─── GET /api/admin/ai-stats ────────────────────────────────────────────────
// Admin-only: platform-wide aggregate stats for AI interview analytics
const getAdminStats = async (req, res) => {
    try {
        const [totalSessions, avgScoreResult, roleDistRaw, skillDistRaw, topPerformerRaw, dailyRaw] = await Promise.all([
            // Total session count
            AiInterviewSession.countDocuments(),

            // Platform average score
            AiInterviewSession.aggregate([
                { $group: { _id: null, avg: { $avg: '$averageScore' } } },
            ]),

            // Sessions per role
            AiInterviewSession.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),

            // Sessions per skill level
            AiInterviewSession.aggregate([
                { $group: { _id: '$skillLevel', count: { $sum: 1 } } },
            ]),

            // Top performer: user with highest average score (min 1 session)
            AiInterviewSession.aggregate([
                { $group: { _id: '$userId', avgScore: { $avg: '$averageScore' }, totalSessions: { $sum: 1 } } },
                { $sort: { avgScore: -1 } },
                { $limit: 1 },
                { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                { $project: { avgScore: 1, totalSessions: 1, 'user.name': 1, 'user.email': 1 } },
            ]),

            // Daily sessions for last 30 days
            AiInterviewSession.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        const platformAvgScore = avgScoreResult.length > 0 ? parseFloat(avgScoreResult[0].avg.toFixed(2)) : 0;
        const mostPopularRole = roleDistRaw.length > 0 ? roleDistRaw[0]._id : '—';
        const topPerformer = topPerformerRaw.length > 0
            ? { name: topPerformerRaw[0].user?.name || 'Unknown', email: topPerformerRaw[0].user?.email || '', avgScore: parseFloat(topPerformerRaw[0].avgScore.toFixed(2)) }
            : null;

        res.json({
            totalSessions,
            platformAvgScore,
            mostPopularRole,
            topPerformer,
            roleDistribution: roleDistRaw.map((r) => ({ role: r._id, count: r.count })),
            skillDistribution: skillDistRaw.map((s) => ({ skillLevel: s._id, count: s.count })),
            dailyActivity: dailyRaw.map((d) => ({ date: d._id, count: d.count })),
        });
    } catch (error) {
        console.error('Error fetching admin AI stats:', error);
        res.status(500).json({ message: 'Failed to fetch AI interview stats.' });
    }
};

// ─── GET /api/admin/ai-sessions ─────────────────────────────────────────────
// Admin-only: paginated + filterable list of ALL sessions (all users)
const getAllSessions = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip  = (page - 1) * limit;

        const filter = {};
        if (req.query.role)       filter.role       = req.query.role;
        if (req.query.skillLevel) filter.skillLevel = req.query.skillLevel;
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
            if (req.query.endDate) {
                const end = new Date(req.query.endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        // User-name/email search via $lookup
        let pipeline = [
            { $match: filter },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        ];

        if (req.query.search) {
            const regex = new RegExp(req.query.search, 'i');
            pipeline.push({
                $match: {
                    $or: [{ 'user.name': regex }, { 'user.email': regex }],
                },
            });
        }

        // Count before pagination
        const countPipeline = [...pipeline, { $count: 'total' }];
        const [countResult, sessions] = await Promise.all([
            AiInterviewSession.aggregate(countPipeline),
            AiInterviewSession.aggregate([
                ...pipeline,
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        role: 1, averageScore: 1, percentage: 1, skillLevel: 1,
                        totalQuestions: 1, createdAt: 1, answers: 1,
                        'user.name': 1, 'user.email': 1, 'user._id': 1,
                    },
                },
            ]),
        ]);

        const totalItems = countResult.length > 0 ? countResult[0].total : 0;
        const totalPages = Math.ceil(totalItems / limit) || 0;

        res.json({ page, totalPages, totalItems, sessions });
    } catch (error) {
        console.error('Error fetching all AI sessions:', error);
        res.status(500).json({ message: 'Failed to fetch AI interview sessions.' });
    }
};

// ─── DELETE /api/admin/ai-sessions/:id ──────────────────────────────────────
// Admin-only: delete any session by ID
const deleteSession = async (req, res) => {
    try {
        const session = await AiInterviewSession.findByIdAndDelete(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found.' });
        res.json({ message: 'AI interview session deleted successfully.' });
    } catch (error) {
        console.error('Error deleting AI session:', error);
        res.status(500).json({ message: 'Failed to delete AI interview session.' });
    }
};

module.exports = { saveSession, getRecentSessions, getHistory, getAdminStats, getAllSessions, deleteSession };
