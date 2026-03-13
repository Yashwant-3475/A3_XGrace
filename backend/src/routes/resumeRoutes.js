const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const { analyzeResume, getResumeHistory } = require('../controllers/resumeController');

const router = express.Router();

// Configure Multer — temp storage in the uploads folder
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed.'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// POST /api/resume/analyze  — Protected: must be logged in to save history
router.post('/analyze', authMiddleware, upload.single('resume'), analyzeResume);

// GET /api/resume/history  — Protected: returns last 5 analyses for the user
router.get('/history', authMiddleware, getResumeHistory);

module.exports = router;
