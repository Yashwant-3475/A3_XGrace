const Evaluation = require('../models/Evaluation');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Fast, free, generous limits on Groq

// Build the prompt sent to Groq
const buildPrompt = (question, answerText) => {
    const questionLine = question
        ? `Interview Question: "${question}"\n\n`
        : '';

    return `You are an expert HR interview evaluator.

${questionLine}Candidate's Answer: "${answerText}"

Evaluate this answer and respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "score": <number between 0 and 10>,
  "feedback": "<detailed, constructive feedback>"
}

Scoring guide:
- 0-3: Very weak (missing key points, unclear, or off-topic)
- 4-6: Average (covers some points but lacks depth or structure)
- 7-8: Good (clear, structured, covers main points)
- 9-10: Excellent (insightful, well-structured, complete answer)`;
};

// Simple rule-based fallback when Groq is unavailable
const fallbackEvaluate = (answerText) => {
    const words = answerText.trim().split(/\s+/).filter(Boolean).length;

    let score;
    let feedback;

    if (words < 15) {
        score = 2;
        feedback = 'Your answer is too brief. In an interview, aim to give detailed responses with examples. Try to write at least 3-4 sentences explaining your thoughts clearly.';
    } else if (words < 40) {
        score = 4;
        feedback = 'Your answer covers the basics but needs more depth. Try to include specific examples, explain your reasoning, and structure your response clearly using the STAR method (Situation, Task, Action, Result).';
    } else if (words < 80) {
        score = 6;
        feedback = 'Good effort! Your answer shows understanding. To score higher, add concrete examples from your experience and be more specific about the outcomes or results of your actions.';
    } else {
        score = 7;
        feedback = 'Well-structured and detailed answer. You covered the key points effectively. To make it even better, ensure your examples are specific and quantifiable where possible.';
    }

    return { score, feedback, source: 'FALLBACK' };
};

// @route   POST /api/evaluations
// @desc    Send an answer to Groq AI and store feedback + score in MongoDB
// @access  Private (requires JWT)
const evaluateAnswer = async (req, res) => {
    try {
        const { answerText, question } = req.body;

        // Basic validation
        if (!answerText || typeof answerText !== 'string' || !answerText.trim()) {
            return res.status(400).json({ message: 'answerText is required and must be a non-empty string.' });
        }

        let aiScore, aiFeedback, analysisSource;

        // ── Try Groq AI first ────────────────────────────────────────────────
        if (process.env.GROQ_API_KEY) {
            try {
                const response = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: GROQ_MODEL,
                        messages: [
                            {
                                role: 'user',
                                content: buildPrompt(question, answerText),
                            },
                        ],
                        temperature: 0.3,
                        max_tokens: 512,
                    }),
                });

                if (!response.ok) {
                    const errText = await response.text();
                    console.warn(`⚠️ Groq API error ${response.status}: ${errText}`);
                    throw new Error(`Groq returned ${response.status}`);
                }

                const result = await response.json();
                const generatedText = result.choices?.[0]?.message?.content || '{}';

                // Parse JSON from Groq's response
                const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
                const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : generatedText);

                aiScore = typeof parsed.score === 'number'
                    ? Math.min(10, Math.max(0, parsed.score))
                    : 0;
                aiFeedback = typeof parsed.feedback === 'string'
                    ? parsed.feedback
                    : 'No detailed feedback generated.';
                analysisSource = 'AI';
                console.log('✅ Groq evaluation successful, score:', aiScore);

            } catch (groqError) {
                // Groq failed → use fallback
                console.warn('⚠️ Groq failed, using fallback evaluation:', groqError.message);
                const fallback = fallbackEvaluate(answerText);
                aiScore = fallback.score;
                aiFeedback = fallback.feedback + '\n\n(Note: AI evaluation is temporarily unavailable. This is a basic automated assessment.)';
                analysisSource = 'FALLBACK';
            }
        } else {
            // No API key → use fallback
            console.warn('⚠️ GROQ_API_KEY not set, using fallback evaluation');
            const fallback = fallbackEvaluate(answerText);
            aiScore = fallback.score;
            aiFeedback = fallback.feedback + '\n\n(Note: AI evaluation is not configured. This is a basic automated assessment.)';
            analysisSource = 'FALLBACK';
        }

        // Save to MongoDB linked to the logged-in user
        const evaluation = await Evaluation.create({
            user: req.user.id,
            answerText,
            feedback: aiFeedback,
            score: aiScore,
        });

        res.status(201).json({
            ...evaluation.toObject(),
            analysisSource,
        });

    } catch (error) {
        console.error('❌ Evaluation error:', error.message);
        res.status(500).json({ message: 'Failed to evaluate answer. Please try again.' });
    }
};

// @route   GET /api/evaluations
// @desc    Get the current user's stored AI evaluations
// @access  Private (requires JWT)
const getEvaluations = async (req, res) => {
    try {
        const evaluations = await Evaluation.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(evaluations);
    } catch (error) {
        console.error('Get evaluations error:', error.message);
        res.status(500).json({ message: 'Failed to fetch evaluations.' });
    }
};

module.exports = {
    evaluateAnswer,
    getEvaluations,
};
