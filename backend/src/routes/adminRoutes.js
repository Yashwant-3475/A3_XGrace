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
        // Include password hash for admin audit purposes (bcrypt — not reversible)
        const users = await User.find().sort({ createdAt: -1 });
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

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user by ID
// @access  Admin only
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (req.user.id === id || req.user._id?.toString() === id) {
            return res.status(400).json({ message: 'You cannot delete your own admin account.' });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ message: `User "${user.name}" deleted successfully.` });
    } catch (error) {
        console.error('Admin delete user error:', error.message);
        res.status(500).json({ message: 'Error deleting user.' });
    }
});

// @route   DELETE /api/admin/questions/:id
// @desc    Delete a question by ID
// @access  Admin only
router.delete('/questions/:id', async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        res.json({ message: 'Question deleted successfully.' });
    } catch (error) {
        console.error('Admin delete question error:', error.message);
        res.status(500).json({ message: 'Error deleting question.' });
    }
});

// @route   POST /api/admin/questions
// @desc    Add a new question to the bank
// @access  Admin only
router.post('/questions', async (req, res) => {
    try {
        const { question, options, answer, difficulty, role, category, explanation } = req.body;

        if (!question || !options || options.length !== 4 || answer === undefined || !difficulty || !role || !category) {
            return res.status(400).json({ message: 'All required fields must be provided.' });
        }

        const newQuestion = new Question({
            question,
            options,
            answer: Number(answer),
            difficulty,
            role,
            category,
            explanation: explanation || '',
        });

        const saved = await newQuestion.save();
        res.status(201).json(saved);
    } catch (error) {
        console.error('Admin add question error:', error.message);
        res.status(500).json({ message: 'Error saving question.' });
    }
});

module.exports = router;


