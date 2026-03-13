const express = require('express');
const { register, login, validateToken, googleAuth, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

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

// Route for Google OAuth sign-in / sign-up
// POST /api/auth/google
router.post('/google', googleAuth);

// Route for updating user profile (name and/or password)
// PUT /api/auth/profile  (Protected)
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;


