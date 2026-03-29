const express = require('express');
const { saveSession, getRecentSessions, getHistory } = require('../controllers/aiInterviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/ai-interview/save-session  — save a completed AI text interview
router.post('/save-session', authMiddleware, saveSession);

// GET  /api/ai-interview/recent        — last 5 sessions for dashboard charts
router.get('/recent', authMiddleware, getRecentSessions);

// GET  /api/ai-interview/history       — paginated + filtered history
router.get('/history', authMiddleware, getHistory);

module.exports = router;
