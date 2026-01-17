const express = require('express');
const { createResult, getResults, getRecentResults, getHistory } = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createResult);

router.get('/', authMiddleware, getResults);

router.get('/recent', authMiddleware, getRecentResults);

router.get('/history', authMiddleware, getHistory);

module.exports = router;
