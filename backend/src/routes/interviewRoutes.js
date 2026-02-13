const express = require('express');
const router = express.Router();
const { startInterview, submitInterview, getRecentInterviews, getInterviewHistory } = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/interview/start - Start a new interview session
router.post('/start', startInterview);

// POST /api/interview/submit - Submit interview answers and get results
router.post('/submit', submitInterview);

// GET /api/interview/recent - Get recent completed interview sessions (requires auth)
router.get('/recent', authMiddleware, getRecentInterviews);

// GET /api/interview/history - Get paginated interview history with filters (requires auth)
router.get('/history', authMiddleware, getInterviewHistory);

module.exports = router;