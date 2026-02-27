const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const User = require('../models/User');
const Question = require('../models/Question');
const InterviewSession = require('../models/InterviewSession');

// Apply authMiddleware + isAdmin to every route in this file
router.use(authMiddleware, isAdmin);

// @route   GET /api/admin/stats
// @desc    Get platform-wide stats for the admin dashboard
// @access  Admin only
router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, totalQuestions, totalSessions] = await Promise.all([
            User.countDocuments(),
            Question.countDocuments(),
            InterviewSession.countDocuments(),
        ]);

        res.json({ totalUsers, totalQuestions, totalSessions });
    } catch (error) {
        console.error('Admin stats error:', error.message);
        res.status(500).json({ message: 'Error fetching admin stats.' });
    }
});

// @route   GET /api/admin/users
// @desc    Get a list of all registered users
// @access  Admin only
router.get('/users', async (req, res) => {
    try {
        // Never return passwords
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Admin users error:', error.message);
        res.status(500).json({ message: 'Error fetching users.' });
    }
});

// @route   GET /api/admin/questions
// @desc    Get a list of all questions in the system
// @access  Admin only
router.get('/questions', async (req, res) => {
    try {
        const questions = await Question.find().sort({ role: 1, difficulty: 1 });
        res.json(questions);
    } catch (error) {
        console.error('Admin questions error:', error.message);
        res.status(500).json({ message: 'Error fetching questions.' });
    }
});

module.exports = router;
