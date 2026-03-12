const express = require('express');
const { evaluateAnswer, getEvaluations } = require('../controllers/evaluationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Send an answer to the AI model and store the evaluation
// POST /api/evaluations — requires auth so we can link the evaluation to a user
router.post('/', authMiddleware, evaluateAnswer);

// Get this user's stored AI evaluations only
// GET /api/evaluations — requires auth, returns only the caller's evaluations
router.get('/', authMiddleware, getEvaluations);

module.exports = router;


