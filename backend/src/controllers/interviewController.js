const Question = require('../models/Question');
const InterviewSession = require('../models/InterviewSession');
const InterviewEvaluation = require('../models/InterviewEvaluation');
const { generateEvaluation } = require('../services/interviewEvaluationService');

// POST /api/interview/start — fetch 10 random questions by role/difficulty and create a session
const startInterview = async (req, res) => {
  try {
    const { role, difficulty } = req.body;

    if (!role) return res.status(400).json({ message: 'Role is required' });

    const validRoles = ['frontend', 'backend', 'mern', 'hr', 'aptitude'];
    if (!validRoles.includes(role))
      return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });

    if (difficulty) {
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty))
        return res.status(400).json({ message: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}` });
    }

    const matchQuery = { role };
    if (difficulty) matchQuery.difficulty = difficulty;

    let randomQuestions = await Question.aggregate([{ $match: matchQuery }, { $sample: { size: 10 } }]);

    // If no exact match, fall back to any difficulty for that role
    if (randomQuestions.length === 0 && difficulty) {
      console.warn(`No questions for role=${role}, difficulty=${difficulty}. Falling back to any difficulty.`);
      randomQuestions = await Question.aggregate([{ $match: { role } }, { $sample: { size: 10 } }]);
    }

    if (randomQuestions.length === 0)
      return res.status(404).json({ message: `No questions found for role: ${role}. Please seed the database.` });

    const session = new InterviewSession({
      userId: req.user.id,
      role,
      difficulty: difficulty || 'mixed',
      questions: randomQuestions.map(q => ({ questionId: q._id, selectedAnswer: null })),
      totalQuestions: randomQuestions.length,
      status: 'started',
    });
    await session.save();

    // Exclude correct answer and explanation from the client response
    const questionsForFrontend = randomQuestions.map(q => ({
      _id: q._id, question: q.question, options: q.options,
      difficulty: q.difficulty, role: q.role, category: q.category,
    }));

    res.status(200).json({ sessionId: session._id, role: session.role, difficulty, totalQuestions: session.totalQuestions, questions: questionsForFrontend });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ message: 'Failed to start interview session' });
  }
};

// POST /api/interview/submit — grade answers and generate an evaluation report
const submitInterview = async (req, res) => {
  try {
    const { sessionId, answers } = req.body;

    if (!sessionId || !answers || !Array.isArray(answers))
      return res.status(400).json({ message: 'Session ID and answers array are required' });

    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Interview session not found' });

    if (session.userId && session.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied. You can only submit your own sessions.' });

    if (session.status === 'completed')
      return res.status(400).json({ message: 'This interview has already been submitted' });

    const questionIds = session.questions.map(q => q.questionId);
    const correctQuestions = await Question.find({ _id: { $in: questionIds } });

    // Build a questionId → correctAnswer lookup map
    const answerMap = {};
    correctQuestions.forEach(q => { answerMap[q._id.toString()] = q.answer; });

    let score = 0, correctAnswers = 0, wrongAnswers = 0;

    answers.forEach(({ questionId, selectedAnswer }) => {
      const sessionQ = session.questions.find(q => q.questionId.toString() === questionId);
      if (sessionQ) {
        sessionQ.selectedAnswer = selectedAnswer;
        if (selectedAnswer === answerMap[questionId]) { score++; correctAnswers++; }
        else wrongAnswers++;
      }
    });

    session.score = score;
    session.status = 'completed';
    await session.save();

    const percentage = Math.round((score / session.totalQuestions) * 100);

    let evaluation = null;
    try {
      const answersForEvaluation = answers.map(ans => ({
        ...ans, isCorrect: ans.selectedAnswer === answerMap[ans.questionId],
      }));

      const evaluationData = generateEvaluation({ questions: correctQuestions, answers: answersForEvaluation, role: session.role, score, totalQuestions: session.totalQuestions, percentage });

      await new InterviewEvaluation({
        sessionId: session._id, role: session.role, score, percentage,
        strengths: evaluationData.strengths, weaknesses: evaluationData.weaknesses,
        skillLevel: evaluationData.skillLevel, improvements: evaluationData.improvements,
        summary: evaluationData.summary,
      }).save();

      evaluation = evaluationData;
      console.log('Evaluation saved for session:', session._id);
    } catch (evalError) {
      // Non-fatal: evaluation failure should not block the submission response
      console.error('Error generating evaluation:', evalError);
    }

    const response = { sessionId: session._id, score, totalQuestions: session.totalQuestions, correctAnswers, wrongAnswers, percentage, status: 'completed' };
    if (evaluation) response.evaluation = evaluation;

    res.status(200).json(response);
  } catch (error) {
    console.error('Error submitting interview:', error);
    res.status(500).json({ message: 'Failed to submit interview' });
  }
};

// GET /api/interview/recent — last 5 completed sessions for the dashboard
const getRecentInterviews = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ status: 'completed', userId: req.user.id }).sort({ createdAt: -1 }).limit(5).lean();

    if (!sessions?.length) return res.status(200).json([]);

    const sessionIds = sessions.map(s => s._id);
    const evaluations = await InterviewEvaluation.find({ sessionId: { $in: sessionIds } }).lean();

    const evalMap = {};
    evaluations.forEach(e => { evalMap[e.sessionId.toString()] = e; });

    const results = sessions.map(s => {
      const ev = evalMap[s._id.toString()];
      return {
        sessionId: s._id, role: s.role, score: s.score, totalQuestions: s.totalQuestions,
        percentage: ev ? ev.percentage : Math.round((s.score / s.totalQuestions) * 100),
        skillLevel: ev ? ev.skillLevel : 'Unknown',
        createdAt: s.createdAt,
      };
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching recent interviews:', error);
    res.status(500).json({ message: 'Failed to fetch recent interviews' });
  }
};

// GET /api/interview/history — paginated history with optional score/date filters
const getInterviewHistory = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip  = (page - 1) * limit;

    const filter = { status: 'completed', userId: req.user.id };

    if (req.query.minScore) filter.score = { $gte: parseInt(req.query.minScore) };

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const totalItems = await InterviewSession.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);
    const sessions   = await InterviewSession.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    if (!sessions?.length)
      return res.status(200).json({ page, totalPages: 0, totalItems: 0, interviews: [] });

    const sessionIds  = sessions.map(s => s._id);
    const evaluations = await InterviewEvaluation.find({ sessionId: { $in: sessionIds } }).lean();

    const evalMap = {};
    evaluations.forEach(e => { evalMap[e.sessionId.toString()] = e; });

    const interviews = sessions.map(s => {
      const ev = evalMap[s._id.toString()];
      return {
        sessionId: s._id, role: s.role, score: s.score, totalQuestions: s.totalQuestions,
        percentage: ev ? ev.percentage : Math.round((s.score / s.totalQuestions) * 100),
        skillLevel: ev ? ev.skillLevel : 'Unknown',
        createdAt: s.createdAt,
      };
    });

    res.status(200).json({ page, totalPages, totalItems, interviews });
  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({ message: 'Failed to fetch interview history' });
  }
};

module.exports = { startInterview, submitInterview, getRecentInterviews, getInterviewHistory };