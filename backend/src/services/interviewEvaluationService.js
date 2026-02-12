/**
 * Interview Evaluation Service
 * 
 * Generates intelligent performance evaluations using rule-based semantic analysis.
 * Groups questions by topics, identifies strengths/weaknesses, and provides improvement suggestions.
 */

/**
 * Generate evaluation report for an interview session
 * @param {Object} params - Evaluation parameters
 * @param {Array} params.questions - Array of question objects with categories and difficulty
 * @param {Array} params.answers - Array of user answers with correctness
 * @param {String} params.role - Interview role (frontend, backend, mern, hr, aptitude)
 * @param {Number} params.score - Total correct answers
 * @param {Number} params.totalQuestions - Total number of questions
 * @param {Number} params.percentage - Score percentage
 * @returns {Object} Evaluation report with strengths, weaknesses, skillLevel, improvements, summary
 */
const generateEvaluation = ({ questions, answers, role, score, totalQuestions, percentage }) => {
    // Group questions by category and difficulty
    const topicStats = analyzeTopics(questions, answers);

    // Identify strengths (topics with >70% accuracy)
    const strengths = identifyStrengths(topicStats, role);

    // Identify weaknesses (topics with <50% accuracy)
    const weaknesses = identifyWeaknesses(topicStats, role);

    // Determine skill level based on overall percentage
    const skillLevel = determineSkillLevel(percentage);

    // Generate improvement suggestions based on weak areas
    const improvements = generateImprovements(weaknesses, topicStats, role);

    // Create summary paragraph
    const summary = generateSummary({
        role,
        score,
        totalQuestions,
        percentage,
        skillLevel,
        strengths,
        weaknesses,
    });

    return {
        strengths,
        weaknesses,
        skillLevel,
        improvements,
        summary,
    };
};

/**
 * Analyze questions by topics to calculate accuracy per category/difficulty
 */
const analyzeTopics = (questions, answers) => {
    const topics = {};

    questions.forEach((question, index) => {
        const answer = answers[index];
        const category = question.category || 'general';
        const difficulty = question.difficulty || 'medium';

        // Create topic key combining category and difficulty
        const topicKey = `${category}_${difficulty}`;
        const topicLabel = formatTopicLabel(category, difficulty);

        if (!topics[topicKey]) {
            topics[topicKey] = {
                label: topicLabel,
                category,
                difficulty,
                correct: 0,
                total: 0,
                questions: [],
            };
        }

        topics[topicKey].total++;
        topics[topicKey].questions.push(question.question);

        // Check if answer is correct
        if (answer && answer.selectedAnswer === question.answer) {
            topics[topicKey].correct++;
        }
    });

    // Calculate accuracy for each topic
    Object.keys(topics).forEach(key => {
        topics[key].accuracy = (topics[key].correct / topics[key].total) * 100;
    });

    return topics;
};

/**
 * Identify strengths (topics with >70% accuracy)
 */
const identifyStrengths = (topicStats, role) => {
    const strengths = [];

    Object.values(topicStats).forEach(topic => {
        if (topic.accuracy >= 70) {
            const strengthMessage = formatStrengthMessage(topic, role);
            strengths.push(strengthMessage);
        }
    });

    // If no specific strengths, add encouraging general message
    if (strengths.length === 0) {
        strengths.push('You are making progress! Keep practicing to build stronger competencies.');
    }

    return strengths;
};

/**
 * Identify weaknesses (topics with <50% accuracy)
 */
const identifyWeaknesses = (topicStats, role) => {
    const weaknesses = [];

    Object.values(topicStats).forEach(topic => {
        if (topic.accuracy < 50 && topic.total >= 2) {
            const weaknessMessage = formatWeaknessMessage(topic, role);
            weaknesses.push(weaknessMessage);
        }
    });

    // If no specific weaknesses, acknowledge good performance
    if (weaknesses.length === 0) {
        weaknesses.push('No significant weak areas identified. Great job!');
    }

    return weaknesses;
};

/**
 * Determine skill level based on percentage
 */
const determineSkillLevel = (percentage) => {
    if (percentage >= 70) return 'Job Ready';
    if (percentage >= 50) return 'Intermediate';
    return 'Beginner';
};

/**
 * Generate improvement suggestions based on weak areas
 */
const generateImprovements = (weaknesses, topicStats, role) => {
    const improvements = [];

    // Get weak topics
    const weakTopics = Object.values(topicStats).filter(t => t.accuracy < 50 && t.total >= 2);

    weakTopics.forEach(topic => {
        const suggestion = getSuggestionForTopic(topic, role);
        if (suggestion) {
            improvements.push(suggestion);
        }
    });

    // Add general improvement suggestions if no specific ones
    if (improvements.length === 0) {
        improvements.push('Continue practicing with more interview questions to maintain your skills.');
        improvements.push('Review advanced concepts to reach the next level of expertise.');
    }

    return improvements.slice(0, 5); // Limit to 5 suggestions
};

/**
 * Generate summary paragraph
 */
const generateSummary = ({ role, score, totalQuestions, percentage, skillLevel, strengths, weaknesses }) => {
    const roleName = role.charAt(0).toUpperCase() + role.slice(1);

    let summary = `You completed the ${roleName} interview with a score of ${score}/${totalQuestions} (${percentage}%). `;

    // Add skill level context
    if (skillLevel === 'Job Ready') {
        summary += 'Excellent work! You demonstrate strong competency in this area and appear ready for professional opportunities. ';
    } else if (skillLevel === 'Intermediate') {
        summary += 'Good performance! You have a solid foundation with room for growth. ';
    } else {
        summary += 'You\'re on the right path! Focus on building fundamental knowledge to improve your performance. ';
    }

    // Add strength context
    if (strengths.length > 0 && !strengths[0].includes('making progress')) {
        summary += `Your strengths include ${strengths.length} key area${strengths.length > 1 ? 's' : ''}. `;
    }

    // Add improvement context
    if (weaknesses.length > 0 && !weaknesses[0].includes('No significant')) {
        summary += `Focus on improving ${weaknesses.length} identified weak area${weaknesses.length > 1 ? 's' : ''} to enhance your overall competency. `;
    }

    summary += 'Keep practicing and learning to achieve your career goals!';

    return summary;
};

/**
 * Format topic label for display
 */
const formatTopicLabel = (category, difficulty) => {
    const categoryMap = {
        'technical': 'Technical',
        'hr': 'HR & Behavioral',
        'aptitude': 'Aptitude & Reasoning',
    };

    const difficultyMap = {
        'easy': 'Easy',
        'medium': 'Medium',
        'hard': 'Hard',
    };

    return `${categoryMap[category] || category} (${difficultyMap[difficulty] || difficulty})`;
};

/**
 * Format strength message
 */
const formatStrengthMessage = (topic, role) => {
    return `Strong performance in ${topic.label} - ${topic.correct}/${topic.total} correct`;
};

/**
 * Format weakness message
 */
const formatWeaknessMessage = (topic, role) => {
    return `Needs improvement in ${topic.label} - only ${topic.correct}/${topic.total} correct`;
};

/**
 * Get improvement suggestion for a specific topic
 */
const getSuggestionForTopic = (topic, role) => {
    const { category, difficulty } = topic;

    // Role-specific suggestions
    const suggestionMap = {
        frontend: {
            technical: {
                easy: 'Review fundamental HTML, CSS, and JavaScript concepts',
                medium: 'Practice React components, hooks, and state management',
                hard: 'Study advanced React patterns, performance optimization, and testing',
            },
        },
        backend: {
            technical: {
                easy: 'Strengthen basics of Node.js, Express, and REST APIs',
                medium: 'Practice middleware, authentication, and database integration',
                hard: 'Master advanced topics like microservices, caching, and scalability',
            },
        },
        mern: {
            technical: {
                easy: 'Review MERN stack fundamentals and full-stack architecture',
                medium: 'Practice building complete CRUD applications with MERN',
                hard: 'Study deployment, security, and production-ready MERN applications',
            },
        },
        hr: {
            hr: {
                easy: 'Prepare better answers for common behavioral questions',
                medium: 'Practice STAR method for situational questions',
                hard: 'Develop strong leadership and conflict resolution examples',
            },
        },
        aptitude: {
            aptitude: {
                easy: 'Practice basic logical reasoning and numerical problems',
                medium: 'Work on pattern recognition and analytical thinking',
                hard: 'Master complex problem-solving and advanced reasoning',
            },
        },
    };

    try {
        return suggestionMap[role]?.[category]?.[difficulty] ||
            `Improve your ${category} skills with focused practice and study`;
    } catch (error) {
        return `Review ${category} concepts to strengthen your knowledge`;
    }
};

module.exports = {
    generateEvaluation,
};
