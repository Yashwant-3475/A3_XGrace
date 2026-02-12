const mongoose = require('mongoose');

// Simple question model for mock interviews
// Each question has the text, a list of options, the index of the correct answer,
// and a difficulty level (e.g. 'easy', 'medium', 'hard').
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    // Store the index of the correct option in the `options` array (0, 1, 2, 3, ...)
    answer: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      default: 'easy',
    },
    // Role for which this question is relevant (frontend, backend, mern, hr, aptitude)
    role: {
      type: String,
      required: true,
    },
    // Category of the question (technical, hr, aptitude)
    category: {
      type: String,
      required: true,
    },
    // Optional explanation for the correct answer
    explanation: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;


