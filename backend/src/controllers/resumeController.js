const pdfParse = require('pdf-parse');
const fs = require('fs');
const Resume = require('../models/Resume');
const { analyzeResumeText } = require('../services/resumeService');

const HISTORY_LIMIT = 5; // Max resume analyses stored per user

// @route   POST /api/resume/analyze
// @desc    Analyze a resume PDF, save to DB (linked to user), enforce 5-record limit
// @access  Private (authMiddleware required)
const analyzeResume = async (req, res) => {
  console.log('📄 Resume analysis endpoint hit');

  if (!req.file) {
    return res.status(400).json({ message: 'No resume file uploaded' });
  }

  try {
    // 1. Read the uploaded PDF file
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    // 2. Extract text from PDF
    let resumeText = '';
    try {
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text;
      console.log(`✅ Extracted ${resumeText.length} characters from PDF`);
    } catch (pdfError) {
      console.error('❌ PDF parsing failed:', pdfError.message);
      fs.unlinkSync(filePath);
      return res.status(400).json({
        status: 'error',
        message: 'Failed to parse PDF. Please ensure the file is a valid PDF.',
      });
    }

    // 3. Analyze resume using hybrid service (AI + fallback)
    const analysis = await analyzeResumeText(resumeText);

    // 4. Save to database, linked to the logged-in user
    let savedId = null;
    try {
      const resumeRecord = new Resume({
        userId: req.user.id,                          // ← link to user
        filename: req.file.originalname,
        resumeText: resumeText.substring(0, 5000),
        analysis,
        analysisSource: analysis.analysisSource,
      });
      const saved = await resumeRecord.save();
      savedId = saved._id;
      console.log('💾 Resume analysis saved to database');

      // 5. Enforce 5-record limit — delete oldest if over the cap
      const count = await Resume.countDocuments({ userId: req.user.id });
      if (count > HISTORY_LIMIT) {
        const oldest = await Resume.findOne(
          { userId: req.user.id },
          '_id',
          { sort: { createdAt: 1 } }           // oldest first
        );
        if (oldest) {
          await Resume.findByIdAndDelete(oldest._id);
          console.log(`🗑️  Deleted oldest resume record (limit ${HISTORY_LIMIT} enforced)`);
        }
      }
    } catch (dbError) {
      console.error('⚠️ Database save failed:', dbError.message);
      // Continue anyway — don't fail the whole request
    }

    // 6. Clean up uploaded file from disk
    fs.unlinkSync(filePath);

    // 7. Return analysis to frontend
    return res.status(200).json({
      status: 'success',
      id: savedId,
      filename: req.file.originalname,
      analysisType: analysis.analysisSource.toLowerCase(),
      matchedSkills: analysis.matchedSkills || [],
      missingSkills: analysis.missingSkills || [],
      skills: analysis.skills || [],
      experienceSummary: analysis.experienceSummary || '',
      roleSuitability: analysis.roleSuitability || '',
      strengths: analysis.strengths || [],
      weakAreas: analysis.weakAreas || [],
      improvementSuggestions: analysis.improvementSuggestions || [],
      note:
        analysis.analysisSource === 'AI'
          ? 'AI-powered semantic analysis'
          : 'Fallback analysis used (AI service unavailable)',
    });
  } catch (error) {
    console.error('❌ Resume analysis error:', error);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred during resume analysis. Please try again.',
    });
  }
};

// @route   GET /api/resume/history
// @desc    Get the last 5 resume analyses for the logged-in user
// @access  Private
const getResumeHistory = async (req, res) => {
  try {
    const records = await Resume.find(
      { userId: req.user.id },
      'filename analysisSource analysis createdAt'  // only send needed fields
    )
      .sort({ createdAt: -1 })   // newest first
      .limit(HISTORY_LIMIT);

    return res.status(200).json({ history: records });
  } catch (error) {
    console.error('❌ Get resume history error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch resume history.' });
  }
};

// @route   DELETE /api/resume/history/:id
// @desc    Delete a single resume history record (must belong to logged-in user)
// @access  Private
const deleteResumeRecord = async (req, res) => {
  try {
    const record = await Resume.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Resume record not found.' });
    }

    // Security: ensure the record belongs to the requesting user
    if (record.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorised to delete this record.' });
    }

    await Resume.findByIdAndDelete(req.params.id);
    console.log(`🗑️  Resume record ${req.params.id} deleted by user ${req.user.id}`);

    return res.status(200).json({ message: 'Resume record deleted successfully.' });
  } catch (error) {
    console.error('❌ Delete resume record error:', error.message);
    return res.status(500).json({ message: 'Failed to delete resume record.' });
  }
};

module.exports = {
  analyzeResume,
  getResumeHistory,
  deleteResumeRecord,
};
