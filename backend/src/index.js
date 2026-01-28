// Basic Express server setup (no business logic yet)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const resultRoutes = require('./routes/resultRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const app = express();

// Connect to MongoDB
connectDB();

// Enable CORS so the React frontend (usually on port 3000) can call the API
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Simple base route to check if the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running. Add your routes in src/routes.' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend is running'
  });
});

// Auth routes (register and login)
// Full paths will be:
// POST /api/auth/register
// POST /api/auth/login
app.use('/api/auth', authRoutes);


// Question routes for mock interview
// GET /api/questions
app.use('/api/questions', questionRoutes);

// Result routes for performance tracking
// POST /api/results
// GET /api/results
app.use('/api/results', resultRoutes);

// AI evaluation routes for HR-style answers
// POST /api/evaluations  -> send answer text, get feedback + score, store in DB
// GET  /api/evaluations  -> list past evaluations
app.use('/api/evaluations', evaluationRoutes);

// Resume skill analyzer routes
// POST /api/resume/analyze  -> upload PDF, extract text, match skills
app.use('/api/resume', resumeRoutes);

app.use('/api/interview', interviewRoutes);
// Start server on a default port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

