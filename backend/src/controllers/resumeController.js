const pdfParse = require('pdf-parse');
const fs = require('fs');
const Resume = require('../models/Resume');
const { analyzeResumeText } = require('../services/resumeService');

// Upload works as before
const uploadResume = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  return res.status(200).json({
    message: 'Resume uploaded successfully',
    filename: req.file.originalname,
  });
};

// Hybrid AI + Fallback analyzer (never throws)
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
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        status: 'error',
        message: 'Failed to parse PDF. Please ensure the file is a valid PDF.',
      });
    }

    // 3. Analyze resume using hybrid service (AI + fallback)
    const analysis = await analyzeResumeText(resumeText);

    // 4. Save to database
    try {
      const resumeRecord = new Resume({
        filename: req.file.originalname,
        resumeText: resumeText.substring(0, 5000), // Store first 5000 chars
        analysis,
        analysisSource: analysis.analysisSource,
      });
      await resumeRecord.save();
      console.log('💾 Resume analysis saved to database');
    } catch (dbError) {
      console.error('⚠️ Database save failed:', dbError.message);
      // Continue anyway - don't fail the request
    }

    // 5. Clean up uploaded file
    fs.unlinkSync(filePath);

    // 6. Return analysis to frontend
    return res.status(200).json({
      status: 'success',
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

    // Clean up file if it still exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      status: 'error',
      message: 'An error occurred during resume analysis. Please try again.',
    });
  }
};

module.exports = {
  uploadResume,
  analyzeResume,
};

