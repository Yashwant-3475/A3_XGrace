// Hugging Face Inference API for AI-based resume analysis

// Keyword list for fallback analysis
const SKILL_KEYWORDS = [
    'javascript',
    'react',
    'node',
    'express',
    'mongodb',
    'html',
    'css',
    'git',
    'github',
    'rest',
    'api',
    'python',
    'java',
    'sql',
    'docker',
    'kubernetes',
    'aws',
    'azure',
    'typescript',
    'angular',
    'vue',
];

/**
 * AI-based resume analysis using Hugging Face Inference API (PRIMARY)
 * @param {string} resumeText - Extracted text from resume PDF
 * @returns {Promise<Object>} - Structured analysis object with source: 'AI'
 */
async function aiAnalyzeResume(resumeText) {
    if (!process.env.HUGGINGFACE_API_KEY) {
        throw new Error('Hugging Face API key not configured');
    }

    const prompt = `You are an expert HR analyst. Analyze the following resume and provide a structured analysis in JSON format.

Resume:
${resumeText}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown, no code blocks):
{
  "skills": ["skill1", "skill2", ...],
  "experienceSummary": "Brief summary of work experience",
  "roleSuitability": "Assessment of role suitability",
  "strengths": ["strength1", "strength2", ...],
  "weakAreas": ["area1", "area2", ...],
  "improvementSuggestions": ["suggestion1", "suggestion2", ...]
}`;

    try {
        // Using Hugging Face Inference API with a text generation model
        const response = await fetch(
            'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 1000,
                        temperature: 0.7,
                        return_full_text: false,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(
                `Hugging Face API request failed: ${response.status} ${response.statusText}`
            );
        }

        const result = await response.json();

        // Extract the generated text from response
        let generatedText = '';
        if (Array.isArray(result) && result[0]?.generated_text) {
            generatedText = result[0].generated_text;
        } else if (result.generated_text) {
            generatedText = result.generated_text;
        } else {
            throw new Error('Unexpected response format from Hugging Face API');
        }

        // Parse JSON from the generated text
        let analysisData;
        try {
            // Try to extract JSON from the response (might have extra text)
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysisData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Failed to parse Hugging Face response as JSON:', generatedText);
            throw new Error('AI returned invalid JSON');
        }

        // Add matched/missing skills for frontend compatibility
        const detectedSkills = (analysisData.skills || []).map((s) =>
            s.toLowerCase()
        );
        const matchedSkills = SKILL_KEYWORDS.filter((keyword) =>
            detectedSkills.some((skill) => skill.includes(keyword))
        );
        const missingSkills = SKILL_KEYWORDS.filter(
            (keyword) => !matchedSkills.includes(keyword)
        );

        return {
            ...analysisData,
            matchedSkills,
            missingSkills,
            analysisSource: 'AI',
        };
    } catch (error) {
        console.error('Hugging Face API error:', error.message);
        throw error;
    }
}

/**
 * Keyword-based fallback analysis (SECONDARY)
 * @param {string} resumeText - Extracted text from resume PDF
 * @returns {Object} - Structured analysis object with source: 'FALLBACK'
 */
function fallbackAnalyzeResume(resumeText) {
    const lowerText = resumeText.toLowerCase();

    // Match skills using keyword search
    const matchedSkills = SKILL_KEYWORDS.filter(keyword =>
        lowerText.includes(keyword)
    );

    const missingSkills = SKILL_KEYWORDS.filter(
        keyword => !matchedSkills.includes(keyword)
    );

    // Basic fallback analysis
    const skills = matchedSkills;
    const experienceSummary = matchedSkills.length > 5
        ? 'Candidate has diverse technical skills.'
        : 'Candidate has limited technical skills in our keyword list.';

    const roleSuitability = matchedSkills.length > 7
        ? 'Highly suitable for technical roles.'
        : matchedSkills.length > 3
            ? 'Moderately suitable for technical roles.'
            : 'May need additional skills for technical roles.';

    const strengths = matchedSkills.length > 0
        ? [`Proficient in: ${matchedSkills.slice(0, 5).join(', ')}`]
        : ['No matching skills detected from our keyword list'];

    const weakAreas = missingSkills.length > 0
        ? [`Could improve in: ${missingSkills.slice(0, 5).join(', ')}`]
        : [];

    const improvementSuggestions = missingSkills.length > 0
        ? [
            'Consider learning modern web technologies',
            'Explore cloud platforms like AWS or Azure',
            'Build projects to demonstrate practical skills',
        ]
        : ['Continue building on existing strengths'];

    return {
        skills,
        experienceSummary,
        roleSuitability,
        strengths,
        weakAreas,
        improvementSuggestions,
        matchedSkills,
        missingSkills,
        analysisSource: 'FALLBACK',
    };
}

/**
 * Main resume analysis function (HYBRID)
 * Always returns a valid analysis, never throws
 * @param {string} resumeText - Extracted text from resume PDF
 * @returns {Promise<Object>} - Analysis object with source: 'AI' or 'FALLBACK'
 */
async function analyzeResumeText(resumeText) {
    try {
        // Try AI analysis first
        console.log('🤖 Attempting AI-based resume analysis...');
        const aiResult = await aiAnalyzeResume(resumeText);
        console.log('✅ AI analysis successful');
        return aiResult;
    } catch (aiError) {
        // Fallback to keyword-based analysis
        console.warn('⚠️ AI analysis failed, using fallback:', aiError.message);
        console.log('🔄 Using keyword-based fallback analysis...');
        const fallbackResult = fallbackAnalyzeResume(resumeText);
        console.log('✅ Fallback analysis complete');
        return fallbackResult;
    }
}

module.exports = {
    analyzeResumeText,
};
