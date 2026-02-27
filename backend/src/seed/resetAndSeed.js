/**
 * resetAndSeed.js
 * ---------------
 * Run this ONCE to clear the old question bank (where answer was always 0)
 * and re-insert all questions with randomized correct-answer positions.
 *
 * Usage:
 *   node src/seed/resetAndSeed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const seedQuestions = require('./seedQuestions');

const run = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');

        // Drop the existing questions so the seeder runs fresh
        const deleted = await Question.deleteMany({});
        console.log(`Cleared ${deleted.deletedCount} old questions`);

        // Run the seeder (now with shuffleOptions applied)
        await seedQuestions();

        console.log('Done! All questions re-seeded with randomized answer positions.');
    } catch (err) {
        console.error('Reset failed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
};

run();
