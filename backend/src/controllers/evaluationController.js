const Evaluation = require('../models/Evaluation');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

// Build the evaluation prompt sent to Groq
const buildPrompt = (question, answerText) => {
    const questionLine = question ? `Interview Question: "${question}"\n\n` : '';
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

// Word-count-based fallback used when Groq is unavailable
const fallbackEvaluate = (answerText) => {
    const words = answerText.trim().split(/\s+/).filter(Boolean).length;
    if (words < 15)  return { score: 2, feedback: 'Your answer is too brief. Aim for at least 3-4 sentences.', source: 'CLASSIC' };
    if (words < 40)  return { score: 4, feedback: 'Your answer covers the basics but needs more depth and examples.', source: 'CLASSIC' };
    if (words < 80)  return { score: 6, feedback: 'Good effort! Add concrete examples and specific outcomes to score higher.', source: 'CLASSIC' };
    return { score: 7, feedback: 'Well-structured and detailed. Ensure examples are specific and quantifiable.', source: 'CLASSIC' };
};

// POST /api/evaluations — evaluate an answer via Groq AI (falls back to rule engine)
const evaluateAnswer = async (req, res) => {
    try {
        const { answerText, question } = req.body;

        if (!answerText || typeof answerText !== 'string' || !answerText.trim())
            return res.status(400).json({ message: 'answerText is required and must be a non-empty string.' });

        let aiScore, aiFeedback, analysisSource;

        if (process.env.GROQ_API_KEY) {
            try {
                const response = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: GROQ_MODEL,
                        messages: [{ role: 'user', content: buildPrompt(question, answerText) }],
                        temperature: 0.3,
                        max_tokens: 512,
                    }),
                });

                if (!response.ok) {
                    const errText = await response.text();
                    console.warn(`Groq API error ${response.status}: ${errText}`);
                    throw new Error(`Groq returned ${response.status}`);
                }

                const result = await response.json();
                const generatedText = result.choices?.[0]?.message?.content || '{}';
                const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
                const parsed   = JSON.parse(jsonMatch ? jsonMatch[0] : generatedText);

                aiScore = typeof parsed.score === 'number' ? Math.min(10, Math.max(0, parsed.score)) : 0;
                aiFeedback    = typeof parsed.feedback === 'string' ? parsed.feedback : 'No detailed feedback generated.';
                analysisSource = 'AI';

            } catch (groqError) {
                // Groq failed — use word-count fallback
                console.warn('Groq failed, using fallback evaluation:', groqError.message);
                const fb = fallbackEvaluate(answerText);
                aiScore = fb.score;
                aiFeedback = fb.feedback + '\n\n(Note: AI evaluation is temporarily unavailable.)';
                analysisSource = 'CLASSIC';
            }
        } else {
            // No API key configured — use fallback
            console.warn('GROQ_API_KEY not set, using fallback evaluation');
            const fb = fallbackEvaluate(answerText);
            aiScore = fb.score;
            aiFeedback = fb.feedback + '\n\n(Note: AI evaluation is not configured.)';
            analysisSource = 'CLASSIC';
        }

        const evaluation = await Evaluation.create({ user: req.user.id, answerText, feedback: aiFeedback, score: aiScore });
        res.status(201).json({ ...evaluation.toObject(), analysisSource });

    } catch (error) {
        console.error('Evaluation error:', error.message);
        res.status(500).json({ message: 'Failed to evaluate answer. Please try again.' });
    }
};

// GET /api/evaluations — return the current user's stored evaluations
const getEvaluations = async (req, res) => {
    try {
        const evaluations = await Evaluation.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(evaluations);
    } catch (error) {
        console.error('Get evaluations error:', error.message);
        res.status(500).json({ message: 'Failed to fetch evaluations.' });
    }
};

module.exports = { evaluateAnswer, getEvaluations };
