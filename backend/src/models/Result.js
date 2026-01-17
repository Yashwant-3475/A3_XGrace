const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    attemptedQuestions: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;

