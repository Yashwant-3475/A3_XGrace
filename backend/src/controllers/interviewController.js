const Question = require('../models/Question');
const InterviewSession = require('../models/InterviewSession');
const InterviewEvaluation = require('../models/InterviewEvaluation');
const { generateEvaluation } = require('../services/interviewEvaluationService');

// Get mock interview questions (EXISTING - unchanged)
const getInterviewQuestions = (req, res) => {
  try {
    const questions = [
      "Tell me about yourself and your experience.",
      "What are your strengths and weaknesses?",
      "Describe a challenging project you worked on and how you handled it.",
      "How do you handle working under pressure?",
      "What programming languages and technologies are you most comfortable with?",
      "Explain a time when you had to learn a new technology quickly.",
      "How do you approach debugging a complex issue?",
      "What development methodologies are you familiar with?",
      "How do you stay updated with the latest technologies?",
      "Where do you see yourself in 5 years?"
    ];

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error getting interview questions:', error);
    res.status(500).json({ message: 'Failed to fetch interview questions' });
  }
};

// Start a new interview session
// Fetches 10 random questions by role and creates a session
const startInterview = async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const validRoles = ['frontend', 'backend', 'mern', 'hr', 'aptitude'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Fetch 10 random questions using MongoDB aggregation
    const randomQuestions = await Question.aggregate([
      { $match: { role: role } },
      { $sample: { size: 10 } }
    ]);

    if (randomQuestions.length === 0) {
      return res.status(404).json({
        message: `No questions found for role: ${role}. Please ensure the database is seeded.`
      });
    }

    // Create interview session
    const session = new InterviewSession({
      role: role,
      questions: randomQuestions.map(q => ({
        questionId: q._id,
        selectedAnswer: null
      })),
      totalQuestions: randomQuestions.length,
      status: 'started'
    });

    await session.save();

    // Prepare questions for response (remove answer and explanation fields for security)
    const questionsForFrontend = randomQuestions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      role: q.role,
      category: q.category
      // answer and explanation are intentionally excluded
    }));

    res.status(200).json({
      sessionId: session._id,
      role: session.role,
      totalQuestions: session.totalQuestions,
      questions: questionsForFrontend
    });

  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ message: 'Failed to start interview session' });
  }
};

// Submit interview answers and calculate score
const submitInterview = async (req, res) => {
  try {
    const { sessionId, answers } = req.body;

    // Validate input
    if (!sessionId || !answers) {
      return res.status(400).json({ message: 'Session ID and answers are required' });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be an array' });
    }

    // Find the session
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    // Check if already completed
    if (session.status === 'completed') {
      return res.status(400).json({ message: 'This interview has already been submitted' });
    }

    // Get all question IDs from the session
    const questionIds = session.questions.map(q => q.questionId);

    // Fetch all correct answers from database
    const correctQuestions = await Question.find({ _id: { $in: questionIds } });

    // Create a map of questionId -> correct answer
    const answerMap = {};
    correctQuestions.forEach(q => {
      answerMap[q._id.toString()] = q.answer;
    });

    // Calculate score
    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;

    // Update session with submitted answers and calculate score
    answers.forEach(submittedAnswer => {
      const { questionId, selectedAnswer } = submittedAnswer;

      // Find the question in session
      const sessionQuestion = session.questions.find(
        q => q.questionId.toString() === questionId
      );

      if (sessionQuestion) {
        // Update selected answer in session
        sessionQuestion.selectedAnswer = selectedAnswer;

        // Compare with correct answer
        const correctAnswer = answerMap[questionId];
        if (selectedAnswer === correctAnswer) {
          score++;
          correctAnswers++;
        } else {
          wrongAnswers++;
        }
      }
    });

    // Update session
    session.score = score;
    session.status = 'completed';
    await session.save();

    // Calculate percentage
    const percentage = Math.round((score / session.totalQuestions) * 100);

    // Generate intelligent evaluation report
    let evaluation = null;
    try {
      // Prepare answers with correctness for evaluation
      const answersForEvaluation = answers.map(ans => {
        const correctAnswer = answerMap[ans.questionId];
        return {
          ...ans,
          isCorrect: ans.selectedAnswer === correctAnswer,
        };
      });

      // Generate evaluation using the service
      const evaluationData = generateEvaluation({
        questions: correctQuestions,
        answers: answersForEvaluation,
        role: session.role,
        score: score,
        totalQuestions: session.totalQuestions,
        percentage: percentage,
      });

      // Save evaluation to database
      const newEvaluation = new InterviewEvaluation({
        sessionId: session._id,
        role: session.role,
        score: score,
        percentage: percentage,
        strengths: evaluationData.strengths,
        weaknesses: evaluationData.weaknesses,
        skillLevel: evaluationData.skillLevel,
        improvements: evaluationData.improvements,
        summary: evaluationData.summary,
      });

      await newEvaluation.save();
      evaluation = evaluationData;

      console.log('Evaluation generated and saved for session:', session._id);
    } catch (evalError) {
      console.error('Error generating evaluation:', evalError);
      // Don't fail the whole request if evaluation fails
      // Just log the error and continue without evaluation
    }

    // Prepare response with backward compatibility
    const response = {
      sessionId: session._id,
      score: score,
      totalQuestions: session.totalQuestions,
      correctAnswers: correctAnswers,
      wrongAnswers: wrongAnswers,
      percentage: percentage,
      status: 'completed',
    };

    // Add evaluation if successfully generated
    if (evaluation) {
      response.evaluation = evaluation;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Error submitting interview:', error);
    res.status(500).json({ message: 'Failed to submit interview' });
  }
};

// Get recent interview sessions for dashboard
// Fetches completed sessions with evaluation data
const getRecentInterviews = async (req, res) => {
  try {
    // Fetch 5 most recent completed sessions
    const sessions = await InterviewSession.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (!sessions || sessions.length === 0) {
      return res.status(200).json([]);
    }

    // Get session IDs
    const sessionIds = sessions.map(s => s._id);

    // Fetch evaluations for these sessions
    const evaluations = await InterviewEvaluation.find({ sessionId: { $in: sessionIds } }).lean();

    // Create evaluation map for quick lookup
    const evalMap = {};
    evaluations.forEach(evaluation => {
      evalMap[evaluation.sessionId.toString()] = evaluation;
    });

    // Format response
    const results = sessions.map(session => {
      const evaluation = evalMap[session._id.toString()];

      return {
        sessionId: session._id,
        role: session.role,
        score: session.score,
        totalQuestions: session.totalQuestions,
        percentage: evaluation ? evaluation.percentage : Math.round((session.score / session.totalQuestions) * 100),
        skillLevel: evaluation ? evaluation.skillLevel : 'Unknown',
        createdAt: session.createdAt,
      };
    });

    res.status(200).json(results);

  } catch (error) {
    console.error('Error fetching recent interviews:', error);
    res.status(500).json({ message: 'Failed to fetch recent interviews' });
  }
};

// Get paginated interview history with filters
// Fetches completed sessions with evaluation data
const getInterviewHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = { status: 'completed' };

    // Apply score filter if provided
    if (req.query.minScore) {
      filter.score = { $gte: parseInt(req.query.minScore) };
    }

    // Apply date range filters if provided
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        // Set to end of day
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // Get total count for pagination
    const totalItems = await InterviewSession.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch paginated sessions
    const sessions = await InterviewSession.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!sessions || sessions.length === 0) {
      return res.status(200).json({
        page,
        totalPages: 0,
        totalItems: 0,
        interviews: [],
      });
    }

    // Get session IDs
    const sessionIds = sessions.map(s => s._id);

    // Fetch evaluations for these sessions
    const evaluations = await InterviewEvaluation.find({ sessionId: { $in: sessionIds } }).lean();

    // Create evaluation map for quick lookup
    const evalMap = {};
    evaluations.forEach(evaluation => {
      evalMap[evaluation.sessionId.toString()] = evaluation;
    });

    // Format response
    const interviews = sessions.map(session => {
      const evaluation = evalMap[session._id.toString()];

      return {
        sessionId: session._id,
        role: session.role,
        score: session.score,
        totalQuestions: session.totalQuestions,
        percentage: evaluation ? evaluation.percentage : Math.round((session.score / session.totalQuestions) * 100),
        skillLevel: evaluation ? evaluation.skillLevel : 'Unknown',
        createdAt: session.createdAt,
      };
    });

    res.status(200).json({
      page,
      totalPages,
      totalItems,
      interviews,
    });

  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({ message: 'Failed to fetch interview history' });
  }
};



module.exports = {
  getInterviewQuestions,
  startInterview,
  submitInterview,
  getRecentInterviews,
  getInterviewHistory,
};