import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { FiCpu, FiArrowRight, FiCheckCircle, FiRotateCcw, FiHome, FiStar, FiAlertCircle, FiZap, FiVolume2, FiSquare } from 'react-icons/fi';

// ── Web Speech API TTS Hook ────────────────────────────────────────────────
const useSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speed, setSpeed] = useState(1);
    const utteranceRef = useRef(null);

    const speak = useCallback((text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = speed;
        utter.pitch = 1;
        utter.lang = 'en-US';
        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
        utteranceRef.current = utter;
        window.speechSynthesis.speak(utter);
    }, [speed]);

    const stop = useCallback(() => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    // Stop on unmount
    useEffect(() => () => window.speechSynthesis?.cancel(), []);

    return { isSpeaking, speak, stop, speed, setSpeed };
};
// ──────────────────────────────────────────────────────────────────────────

// Role-specific open-ended questions
const QUESTIONS_BY_ROLE = {
    frontend: [
        'Explain the difference between React state and props, and when you would use each.',
        'What is the Virtual DOM and how does it help with performance in React?',
        'Describe how you would optimize a slow-loading React application.',
        'What are CSS Flexbox and CSS Grid? When would you choose one over the other?',
        'Explain the concept of closures in JavaScript and give a practical example.',
    ],
    backend: [
        'Explain the REST architectural style and the key principles behind it.',
        'What is middleware in Express.js and how would you use it in a real project?',
        'How does JWT authentication work? Describe the full flow from login to protected route access.',
        'What is the difference between SQL and NoSQL databases? When would you choose MongoDB?',
        'Describe how you would handle errors in a Node.js Express application effectively.',
    ],
    mern: [
        'Explain the full MERN stack and how each component communicates with the others.',
        'How would you handle user authentication across the React frontend and Express backend?',
        'What is CORS and how do you resolve CORS errors in a MERN application?',
        'Describe how you would structure a large MERN project for scalability and maintainability.',
        'How would you deploy a MERN stack application to production?',
    ],
    hr: [
        'Tell me about yourself and why you are interested in this role.',
        'Describe a challenging situation you faced at work and how you resolved it.',
        'Where do you see yourself in the next 3-5 years professionally?',
        'How do you handle tight deadlines and pressure at work?',
        'Why should we hire you over other candidates with similar qualifications?',
    ],
    aptitude: [
        'Explain your approach to solving a complex logical problem step by step.',
        'You have a list of 1 million numbers. How would you find the top 10 largest numbers efficiently?',
        'Describe how you would debug a program that works correctly most of the time but occasionally produces wrong results.',
        'How would you design a system to handle 100,000 concurrent users?',
        'Explain the concept of time complexity and why it matters in software development.',
    ],
};

const DEFAULT_QUESTIONS = QUESTIONS_BY_ROLE.hr;

const SCORE_COLOR = (score) => {
    if (score >= 8) return '#10b981';
    if (score >= 5) return '#f59e0b';
    return '#ef4444';
};

const SCORE_LABEL = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 5) return 'Good';
    if (score >= 3) return 'Average';
    return 'Needs Work';
};

const TextInterviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const role = location.state?.role || 'hr';
    const questions = QUESTIONS_BY_ROLE[role] || DEFAULT_QUESTIONS;
    const { isSpeaking, speak, stop, speed, setSpeed } = useSpeech();

    const [currentIdx, setCurrentIdx] = useState(0);
    const [answerText, setAnswerText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState([]); // { question, answerText, score, feedback, analysisSource }
    const [finished, setFinished] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [lastSource, setLastSource] = useState(null); // 'AI' | 'FALLBACK' | null
    const [sessionSaved, setSessionSaved] = useState(false); // true once saved to DB
    const [sessionSaving, setSessionSaving] = useState(false);

    useEffect(() => {
        const words = answerText.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(words);
    }, [answerText]);

    // Auto-read question when it changes
    useEffect(() => {
        speak(questions[currentIdx]);
    }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

    const totalQuestions = questions.length;
    const progress = ((currentIdx) / totalQuestions) * 100;

    const handleSubmitAnswer = async () => {
        if (!answerText.trim() || answerText.trim().length < 10) {
            setError('Please write a more detailed answer (at least 10 characters).');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/evaluations', {
                question: questions[currentIdx],
                answerText: answerText.trim(),
            });

            const src = response.data.analysisSource || 'AI';
            setLastSource(src);

            const newResult = {
                question: questions[currentIdx],
                answerText: answerText.trim(),
                score: response.data.score,
                feedback: response.data.feedback,
                analysisSource: src,
            };

            const updatedResults = [...results, newResult];
            setResults(updatedResults);

            if (currentIdx + 1 >= totalQuestions) {
                setFinished(true);
                // ── Save entire session to DB ───────────────────────────────
                setSessionSaving(true);
                try {
                    const token = localStorage.getItem('authToken');
                    await api.post('/ai-interview/save-session', {
                        role,
                        answers: updatedResults.map(r => ({
                            question: r.question,
                            answerText: r.answerText,
                            score: r.score,
                            feedback: r.feedback,
                            analysisSource: r.analysisSource,
                        })),
                    }, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setSessionSaved(true);
                } catch (saveErr) {
                    console.warn('Could not save AI interview session to history:', saveErr.message);
                    // Don't block the results screen — just log it
                } finally {
                    setSessionSaving(false);
                }
                // ────────────────────────────────────────────────────────────
            } else {
                setCurrentIdx(prev => prev + 1);
                setAnswerText('');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to evaluate your answer. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const averageScore = results.length > 0
        ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)
        : 0;

    const roleName = {
        frontend: 'Frontend Developer',
        backend: 'Backend Developer',
        mern: 'MERN Stack Developer',
        hr: 'HR Interview',
        aptitude: 'Aptitude & Reasoning',
    }[role] || role;

    // ─── RESULTS SCREEN ───────────────────────────────────────────────────────
    if (finished) {
        return (
            <div className="container mt-5 mb-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        {/* Header */}
                        <div className="text-center mb-5">
                            <div className="mb-3">
                                <FiCpu size={52} style={{ color: '#8b5cf6' }} />
                            </div>
                            <h2 className="fw-bold gradient-text mb-2">Interview Complete! 🎉</h2>
                            <p className="text-muted">Here's your AI-powered evaluation for <strong>{roleName}</strong></p>

                            {/* Overall Score */}
                            <div className="card border-0 shadow-sm mt-4 mb-2" style={{ background: 'linear-gradient(135deg, #1e1030, #2a1a4a)', color: '#fff' }}>
                                <div className="card-body py-4">
                                    <div className="d-flex align-items-center justify-content-center gap-4">
                                        <div className="text-center">
                                            <div style={{ fontSize: '3rem', fontWeight: '800', color: SCORE_COLOR(parseFloat(averageScore)) }}>{averageScore}</div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Average Score / 10</div>
                                        </div>
                                        <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.2)' }} />
                                        <div className="text-center">
                                            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: SCORE_COLOR(parseFloat(averageScore)) }}>
                                                {SCORE_LABEL(parseFloat(averageScore))}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{totalQuestions} Questions Answered</div>
                                        </div>
                                    </div>
                                    {/* Session save status */}
                                    <div className="text-center mt-3" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                        {sessionSaving && <span>⏳ Saving to history...</span>}
                                        {sessionSaved && <span>✅ Saved to your AI Interview History</span>}
                                        {!sessionSaving && !sessionSaved && <span>⚠️ Could not save to history (check connection)</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Per-Question Results */}
                        <h5 className="fw-bold mb-3">Detailed Feedback</h5>
                        {results.map((result, idx) => (
                            <div key={idx} className="card border-0 shadow-sm mb-4">
                                <div className="card-body p-4">
                                    {/* Question header */}
                                    <div className="d-flex align-items-start justify-content-between mb-3">
                                        <div className="flex-grow-1">
                                            <span className="badge mb-2" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>Q{idx + 1}</span>
                                            <p className="fw-semibold mb-0">{result.question}</p>
                                        </div>
                                        <div className="ms-3 text-center" style={{ minWidth: '60px' }}>
                                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: SCORE_COLOR(result.score) }}>{result.score}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#888' }}>/10</div>
                                        </div>
                                    </div>

                                    {/* User's answer */}
                                    <div className="mb-3 p-3 rounded" style={{ background: 'rgba(0,0,0,0.04)', borderLeft: '3px solid #8b5cf6' }}>
                                        <div className="small text-muted mb-1 fw-semibold">Your Answer</div>
                                        <div className="small">{result.answerText}</div>
                                    </div>

                                    {/* AI Feedback */}
                                    <div className="p-3 rounded" style={{ background: `${SCORE_COLOR(result.score)}10`, borderLeft: `3px solid ${SCORE_COLOR(result.score)}` }}>
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="small fw-semibold" style={{ color: SCORE_COLOR(result.score) }}>
                                                <FiStar size={13} className="me-1" />AI Feedback ({SCORE_LABEL(result.score)})
                                            </div>
                                            {result.analysisSource === 'AI' ? (
                                                <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px' }}>
                                                    <FiZap size={10} className="me-1" />AI Evaluated
                                                </span>
                                            ) : (
                                                <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px' }}>
                                                    <FiAlertCircle size={10} className="me-1" />Auto-Assessed
                                                </span>
                                            )}
                                        </div>
                                        <div className="small">{result.feedback}</div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Action Buttons */}
                        <div className="d-flex gap-3 justify-content-center mt-2">
                            <button
                                className="btn btn-outline-secondary px-4"
                                onClick={() => navigate('/interview')}
                            >
                                <FiHome size={15} className="me-2" />
                                Back to Home
                            </button>
                            <button
                                className="btn btn-outline-primary px-4"
                                onClick={() => navigate('/ai-history')}
                            >
                                View AI History
                            </button>
                            <button
                                className="btn px-4"
                                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px' }}
                                onClick={() => {
                                    setCurrentIdx(0);
                                    setAnswerText('');
                                    setResults([]);
                                    setFinished(false);
                                    setError('');
                                    setLastSource(null);
                                    setSessionSaved(false);
                                    setSessionSaving(false);
                                }}
                            >
                                <FiRotateCcw size={15} className="me-2" />
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── INTERVIEW SCREEN ─────────────────────────────────────────────────────
    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">

                    {/* Header bar */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <span className="badge mb-1" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', padding: '6px 14px', borderRadius: '20px' }}>
                                <FiCpu size={12} className="me-1" />✨ AI Text Interview
                            </span>
                            <h5 className="fw-bold mb-0 mt-1">{roleName}</h5>
                        </div>
                        <div className="text-end">
                            <div className="fw-bold" style={{ color: '#8b5cf6' }}>
                                {currentIdx + 1} / {totalQuestions}
                            </div>
                            <div className="text-muted small">Questions</div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                        <div className="progress" style={{ height: '6px', borderRadius: '10px', background: 'rgba(139,92,246,0.15)' }}>
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)',
                                    borderRadius: '10px',
                                    transition: 'width 0.5s ease',
                                }}
                            />
                        </div>
                        {/* Previous results pills */}
                        {results.length > 0 && (
                            <div className="d-flex gap-2 flex-wrap mt-2">
                                {results.map((r, i) => (
                                    <span key={i} className="badge small" style={{ background: `${SCORE_COLOR(r.score)}20`, color: SCORE_COLOR(r.score) }}>
                                        Q{i + 1}: {r.score}/10
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Question Card */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">
                            {/* Question label */}
                            <span className="badge mb-3" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', fontSize: '0.82rem', padding: '5px 12px', borderRadius: '20px' }}>
                                Question {currentIdx + 1}
                            </span>

                            {/* Question text */}
                            <h5 className="fw-semibold mb-4" style={{ lineHeight: '1.7' }}>
                                {questions[currentIdx]}
                            </h5>

                            {/* TTS Toolbar */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                background: 'rgba(139,92,246,0.06)',
                                borderRadius: '12px',
                                border: '1px solid rgba(139,92,246,0.15)',
                                flexWrap: 'wrap',
                            }}>
                                <FiVolume2 size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600, marginRight: '4px' }}>Voice</span>

                                {/* Speed selector */}
                                <select
                                    value={speed}
                                    onChange={e => setSpeed(parseFloat(e.target.value))}
                                    style={{
                                        fontSize: '0.75rem',
                                        border: '1px solid rgba(139,92,246,0.3)',
                                        borderRadius: '8px',
                                        padding: '3px 8px',
                                        color: '#6d28d9',
                                        background: '#fff',
                                        cursor: 'pointer',
                                        outline: 'none',
                                    }}
                                    title="Reading speed"
                                >
                                    <option value={0.75}>🐢 Slow</option>
                                    <option value={1}>Normal</option>
                                    <option value={1.5}>🐇 Fast</option>
                                </select>

                                {/* Read / Reading button */}
                                <button
                                    onClick={() => speak(questions[currentIdx])}
                                    disabled={isSpeaking}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        fontSize: '0.78rem', fontWeight: 600,
                                        padding: '4px 12px', borderRadius: '8px',
                                        border: 'none', cursor: isSpeaking ? 'default' : 'pointer',
                                        background: isSpeaking ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.85)',
                                        color: '#fff',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    <FiVolume2 size={13} />
                                    {isSpeaking ? 'Reading…' : 'Read Aloud'}
                                </button>

                                {/* Stop button — only visible while speaking */}
                                {isSpeaking && (
                                    <button
                                        onClick={stop}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            fontSize: '0.78rem', fontWeight: 600,
                                            padding: '4px 12px', borderRadius: '8px',
                                            border: 'none', cursor: 'pointer',
                                            background: 'rgba(239,68,68,0.85)',
                                            color: '#fff',
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        <FiSquare size={11} /> Stop
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Answer Input */}
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="fw-semibold small">Your Answer</label>
                                <span className="text-muted small">{wordCount} words</span>
                            </div>
                            <textarea
                                className="form-control"
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                placeholder="Type your answer here... Be as detailed and specific as possible. Groq AI will evaluate your response."
                                rows={7}
                                style={{
                                    resize: 'vertical',
                                    borderRadius: '10px',
                                    border: '2px solid rgba(139,92,246,0.25)',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(139,92,246,0.25)'}
                                disabled={loading}
                            />
                            <div className="mt-2 text-muted small">
                                💡 Tip: Aim for at least 3-5 sentences for a good evaluation score.
                            </div>
                        </div>
                    </div>

                    {/* AI Status Banner */}
                    {lastSource === 'FALLBACK' && (
                        <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px' }}>
                            <FiAlertCircle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                            <div className="small" style={{ color: '#f59e0b' }}>
                                <strong>AI Unavailable:</strong> Groq AI is temporarily unavailable. Your answers are being scored by the built-in rule engine (word count only) until it recovers.
                            </div>
                        </div>
                    )}
                    {lastSource === 'AI' && (
                        <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px' }}>
                            <FiZap size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                            <div className="small" style={{ color: '#10b981' }}>
                                <strong>Groq AI Active:</strong> Your answers are being evaluated by real AI (LLaMA 3.3 70B).
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError('')} />
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="d-flex justify-content-between align-items-center">
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigate('/interview')}
                            disabled={loading}
                        >
                            <FiHome size={14} className="me-1" /> Exit
                        </button>
                        <button
                            className="btn btn-lg px-5"
                            style={{
                                background: answerText.trim().length >= 10
                                    ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                                    : '#ccc',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: answerText.trim().length >= 10 ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s ease',
                            }}
                            disabled={loading || answerText.trim().length < 10}
                            onClick={handleSubmitAnswer}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Evaluating with Groq AI...
                                </>
                            ) : currentIdx + 1 >= totalQuestions ? (
                                <>
                                    <FiCheckCircle className="me-2" />
                                    Submit & See Results
                                </>
                            ) : (
                                <>
                                    Submit & Next
                                    <FiArrowRight className="ms-2" />
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TextInterviewPage;
