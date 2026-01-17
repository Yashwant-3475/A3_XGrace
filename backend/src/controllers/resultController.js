const Result = require('../models/Result');

const createResult = async (req, res) => {
  try {
    const { score, totalQuestions, correctAnswers, attemptedQuestions, accuracy } = req.body;

    if (
      score === undefined ||
      totalQuestions === undefined ||
      correctAnswers === undefined ||
      attemptedQuestions === undefined ||
      accuracy === undefined
    ) {
      return res.status(400).json({ message: 'Missing result fields.' });
    }

    const result = await Result.create({
      userId: req.user.id,
      score,
      totalQuestions,
      correctAnswers,
      attemptedQuestions,
      accuracy,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Create result error:', error.message);
    res.status(500).json({ message: 'Failed to save result.' });
  }
};

const getResults = async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    console.error('Get results error:', error.message);
    res.status(500).json({ message: 'Failed to fetch results.' });
  }
};

const getRecentResults = async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(3);
    res.json(results);
  } catch (error) {
    console.error('Get recent results error:', error.message);
    res.status(500).json({ message: 'Failed to fetch recent results.' });
  }
};

const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 5;

    if (limit > 5) {
      limit = 5;
    }

    const skip = (page - 1) * limit;

    let query = { userId: req.user.id };

    if (req.query.minScore) {
      query.score = { $gte: parseInt(req.query.minScore) };
    }

    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const results = await Result.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Result.countDocuments(query);

    res.json({
      results,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    });
  } catch (error) {
    console.error('Get history error:', error.message);
    res.status(500).json({ message: 'Failed to fetch history.' });
  }
};

module.exports = {
  createResult,
  getResults,
  getRecentResults,
  getHistory,
};
