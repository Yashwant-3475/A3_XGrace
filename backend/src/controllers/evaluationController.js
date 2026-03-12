const openai = require('../../config/aiClient');
const Evaluation = require('../models/Evaluation');

// Helper: build a clear system prompt so the AI knows what to do
const buildSystemPrompt = () => {
  return `
You are an HR expert evaluating answers to common HR interview questions.

You MUST respond in JSON only, with this exact shape:
{
  "score": number between 0 and 10,
  "feedback": string with clear, beginner-friendly feedback
}

Scoring rules (keep it simple):
- 0–3: Very weak answer (missing key points, unclear, off-topic)
- 4–6: Average answer (covers some points but lacks depth or clarity)
- 7–8: Good answer (covers main ideas with clear structure)
- 9–10: Excellent answer (very clear, structured, and insightful)

Do NOT include any extra keys. Do NOT include explanations outside of JSON.
`;
};

// @route   POST /api/evaluations
// @desc    Send an HR-style answer to OpenAI and store feedback + score in MongoDB
// @access  Public (you can secure this later)
const evaluateAnswer = async (req, res) => {
  try {
    const { answerText } = req.body;

    // 1. Basic input check (no advanced validation)
    if (!answerText || typeof answerText !== 'string') {
      return res
        .status(400)
        .json({ message: 'answerText is required and should be a string.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        message:
          'OPENAI_API_KEY is not configured on the server. Ask the admin to set it in the .env file.',
      });
    }

    // 2. Call OpenAI API with a simple prompt
    // We ask it to return a small JSON object so it is easy to parse.
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or another model you prefer
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        {
          role: 'user',
          content: `Here is the candidate's HR answer:\n\n"""${answerText}"""`,
        },
      ],
      // Asking for a JSON-style response makes parsing easier
      response_format: { type: 'json_object' },
      temperature: 0.3, // low temperature for more consistent scoring
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';

    // 3. Safely parse JSON from the AI response
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (error) {
      console.error('Failed to parse AI JSON response:', rawContent);
      return res.status(500).json({ message: 'Invalid response from AI evaluation.' });
    }

    // Ensure score and feedback exist; apply simple defaults if missing
    const aiScore = typeof parsed.score === 'number' ? parsed.score : 0;
    const aiFeedback =
      typeof parsed.feedback === 'string'
        ? parsed.feedback
        : 'No detailed feedback was generated.';

    // 4. Store evaluation result in MongoDB, linked to the authenticated user
    const evaluation = await Evaluation.create({
      user: req.user.id,
      answerText,
      feedback: aiFeedback,
      score: aiScore,
    });

    // 5. Return the saved evaluation to the client
    res.status(201).json(evaluation);
  } catch (error) {
    console.error('AI evaluation error:', error.message);
    res.status(500).json({ message: 'Failed to evaluate answer.' });
  }
};

// @route   GET /api/evaluations
// @desc    Get the current user's stored AI evaluations only
// @access  Private (requires JWT)
const getEvaluations = async (req, res) => {
  try {
    // Only return evaluations belonging to the authenticated user
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


