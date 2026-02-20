const express = require('express');
const { register, login, validateToken } = require('../controllers/authController');

// Create a new router object
const router = express.Router();

// Route for registering a new user
// POST /api/auth/register
router.post('/register', register);

// Route for logging in an existing user
// POST /api/auth/login
router.post('/login', login);

// Route for validating an existing JWT token
// GET /api/auth/validate
router.get('/validate', validateToken);

module.exports = router;


