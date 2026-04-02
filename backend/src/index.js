require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB        = require('../config/db');
const authRoutes       = require('./routes/authRoutes');
const questionRoutes   = require('./routes/questionRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const resumeRoutes     = require('./routes/resumeRoutes');
const interviewRoutes  = require('./routes/interviewRoutes');
const aiInterviewRoutes = require('./routes/aiInterviewRoutes');
const adminRoutes      = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB then seed questions if the collection is empty
connectDB().then(() => { require('./seed/seedQuestions')(); });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Backend is running.' }));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/auth',         authRoutes);
app.use('/api/questions',    questionRoutes);
app.use('/api/evaluations',  evaluationRoutes);
app.use('/api/resume',       resumeRoutes);
app.use('/api/interview',    interviewRoutes);
app.use('/api/ai-interview', aiInterviewRoutes);
app.use('/api/admin',        adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
