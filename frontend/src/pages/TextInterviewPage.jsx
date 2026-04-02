import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import {
    FiCpu, FiArrowRight, FiCheckCircle, FiRotateCcw, FiHome,
    FiStar, FiAlertCircle, FiZap, FiVolume2, FiSquare,
    FiClock, FiAlertTriangle,
} from 'react-icons/fi';

/* ─── Config ───────────────────────────────────────────────────── */
const SESSION_DURATION = 5 * 60; // 5 minutes

/* ─── useTimer ─────────────────────────────────────────────────── */
function useTimer(initial, onExpire) {
    const [timeLeft, setTimeLeft] = useState(initial);
    const ref       = useRef(null);
    const startedAt = useRef(Date.now());

    useEffect(() => {
        startedAt.current = Date.now();
        ref.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(ref.current); onExpire(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(ref.current);
    }, []); // eslint-disable-line

    const getElapsed = useCallback(() => Math.floor((Date.now() - startedAt.current) / 1000), []);
    return { timeLeft, getElapsed };
}

/* ─── useSpeech ────────────────────────────────────────────────── */
function useSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speed,      setSpeed]      = useState(1);

    const speak = useCallback((text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = speed; u.pitch = 1; u.lang = 'en-US';
        u.onstart = () => setIsSpeaking(true);
        u.onend   = () => setIsSpeaking(false);
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
    }, [speed]);

    const stop = useCallback(() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); }, []);
    useEffect(() => () => window.speechSynthesis?.cancel(), []);
    return { isSpeaking, speak, stop, speed, setSpeed };
}

/* ─── TimerExpiredModal ────────────────────────────────────────── */
function TimerExpiredModal({ onEndNow, onContinue }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                background: '#1c1c2e', border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '18px', padding: '36px 40px',
                maxWidth: '380px', width: '92%', textAlign: 'center',
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            }}>
                <div style={{ fontSize: '2.8rem', marginBottom: '14px' }}>⏰</div>
                <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '1rem', marginBottom: '26px', lineHeight: 1.7 }}>
                    Time is over — do you want to end the interview or continue?
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button onClick={onEndNow} style={{
                        padding: '10px 24px', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                        color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                    }}>End Interview</button>
                    <button onClick={onContinue} style={{
                        padding: '10px 24px', borderRadius: '10px',
                        border: '1.5px solid rgba(255,255,255,0.15)',
                        background: 'transparent', color: '#94a3b8',
                        fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                    }}>Continue</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Helpers ──────────────────────────────────────────────────── */
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

const ROLE_NAMES = {
    frontend: 'Frontend Developer',
    backend:  'Backend Developer',
    mern:     'MERN Stack Developer',
    hr:       'HR Interview',
    aptitude: 'Aptitude & Reasoning',
};

const SCORE_COLOR = s => s >= 8 ? '#10b981' : s >= 5 ? '#f59e0b' : '#ef4444';
const SCORE_LABEL = s => s >= 8 ? 'Excellent' : s >= 5 ? 'Good' : s >= 3 ? 'Average' : 'Needs Work';
const fmtTime = s => {
    if (s == null) return '--:--';
    return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
};

/* ─── Main Component ───────────────────────────────────────────── */
export default function TextInterviewPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const role      = location.state?.role || 'hr';
    const questions = QUESTIONS_BY_ROLE[role] || QUESTIONS_BY_ROLE.hr;
    const totalQuestions = questions.length;
    const roleName  = ROLE_NAMES[role] || role;

    const { isSpeaking, speak, stop, speed, setSpeed } = useSpeech();

    const [currentIdx,    setCurrentIdx]   = useState(0);
    const [answerText,    setAnswerText]   = useState('');
    const [loading,       setLoading]      = useState(false);
    const [error,         setError]        = useState('');
    const [results,       setResults]      = useState([]);
    const [finished,      setFinished]     = useState(false);
    const [wordCount,     setWordCount]    = useState(0);
    const [lastSource,    setLastSource]   = useState(null);
    const [sessionSaved,  setSessionSaved] = useState(false);
    const [sessionSaving, setSessionSaving]= useState(false);

    const [showModal,   setShowModal]   = useState(false);
    const [overTime,    setOverTime]    = useState(false);
    const [timeTaken,   setTimeTaken]   = useState(null);

    const { timeLeft, getElapsed } = useTimer(SESSION_DURATION, () => setShowModal(true));

    /* timer colour helpers */
    const pct    = (timeLeft / SESSION_DURATION) * 100;
    const tColor = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';
    const tBg    = pct > 50 ? 'rgba(16,185,129,0.12)' : pct > 20 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.14)';
    const mm     = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const ss     = String(timeLeft % 60).padStart(2, '0');

    /* word count */
    useEffect(() => {
        setWordCount(answerText.trim().split(/\s+/).filter(Boolean).length);
    }, [answerText]);

    /* auto-read */
    useEffect(() => { speak(questions[currentIdx]); }, [currentIdx]); // eslint-disable-line

    /* modal handlers */
    const handleExpiredEnd = useCallback(() => {
        setTimeTaken(getElapsed());
        setOverTime(false);
        setShowModal(false);
        setFinished(true);
    }, [getElapsed]);

    const handleContinue = () => { setOverTime(true); setShowModal(false); };

    /* submit answer */
    const handleSubmitAnswer = async () => {
        if (answerText.trim().length < 10) {
            setError('Please write a more detailed answer (at least 10 characters).'); return;
        }
        setLoading(true); setError('');
        try {
            const res = await api.post('/evaluations', {
                question: questions[currentIdx], answerText: answerText.trim(),
            });
            const src = res.data.analysisSource || 'AI';
            setLastSource(src);
            const newResult = {
                question: questions[currentIdx], answerText: answerText.trim(),
                score: res.data.score, feedback: res.data.feedback, analysisSource: src,
            };
            const updatedResults = [...results, newResult];
            setResults(updatedResults);

            if (currentIdx + 1 >= totalQuestions) {
                setTimeTaken(getElapsed());
                setFinished(true);
                setSessionSaving(true);
                try {
                    const token = localStorage.getItem('authToken');
                    await api.post('/ai-interview/save-session', {
                        role,
                        answers: updatedResults.map(r => ({
                            question: r.question, answerText: r.answerText,
                            score: r.score, feedback: r.feedback, analysisSource: r.analysisSource,
                        })),
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    setSessionSaved(true);
                } catch (e) {
                    console.warn('Save failed:', e.message);
                } finally { setSessionSaving(false); }
            } else {
                setCurrentIdx(p => p + 1);
                setAnswerText('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to evaluate. Try again.');
        } finally { setLoading(false); }
    };

    const avgScore = results.length > 0
        ? (results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1) : 0;

    /* ── RESULTS SCREEN (unchanged styling) ─────────────────────── */
    if (finished) {
        return (
            <div className="container mt-5 mb-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="text-center mb-5">
                            <div className="mb-3"><FiCpu size={52} style={{ color: '#8b5cf6' }} /></div>
                            <h2 className="fw-bold gradient-text mb-2">Interview Complete! 🎉</h2>
                            <p className="text-muted">AI-powered evaluation for <strong>{roleName}</strong></p>

                            {timeTaken !== null && (
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                                    padding: '7px 18px', borderRadius: '20px', marginBottom: '10px',
                                    background: overTime ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                                    border: `1.5px solid ${overTime ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.35)'}`,
                                    color: overTime ? '#dc2626' : '#059669', fontWeight: 600, fontSize: '0.88rem',
                                }}>
                                    <FiClock size={14} />
                                    Time taken: {fmtTime(timeTaken)}{overTime && ' (exceeded 5-min limit)'}
                                </div>
                            )}

                            {overTime && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '10px 18px', borderRadius: '12px', marginTop: '4px',
                                    background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.35)',
                                    color: '#dc2626', fontWeight: 600, fontSize: '0.88rem',
                                }}>
                                    <FiAlertTriangle size={15} />
                                    ⚠️ Time limit exceeded — you continued after the 5-minute mark.
                                </div>
                            )}

                            <div className="card border-0 shadow-sm mt-4 mb-2"
                                style={{ background: 'linear-gradient(135deg,#1e1030,#2a1a4a)', color: '#fff' }}>
                                <div className="card-body py-4">
                                    <div className="d-flex align-items-center justify-content-center gap-4">
                                        <div className="text-center">
                                            <div style={{ fontSize: '3rem', fontWeight: 800, color: SCORE_COLOR(parseFloat(avgScore)) }}>{avgScore}</div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Average Score / 10</div>
                                        </div>
                                        <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.2)' }} />
                                        <div className="text-center">
                                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: SCORE_COLOR(parseFloat(avgScore)) }}>{SCORE_LABEL(parseFloat(avgScore))}</div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{totalQuestions} Questions Answered</div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-3" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                        {sessionSaving && <span>⏳ Saving to history...</span>}
                                        {sessionSaved  && <span>✅ Saved to your AI Interview History</span>}
                                        {!sessionSaving && !sessionSaved && <span>⚠️ Could not save to history</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h5 className="fw-bold mb-3">Detailed Feedback</h5>
                        {results.map((r, idx) => (
                            <div key={idx} className="card border-0 shadow-sm mb-4">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-start justify-content-between mb-3">
                                        <div className="flex-grow-1">
                                            <span className="badge mb-2" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>Q{idx + 1}</span>
                                            <p className="fw-semibold mb-0">{r.question}</p>
                                        </div>
                                        <div className="ms-3 text-center" style={{ minWidth: '60px' }}>
                                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: SCORE_COLOR(r.score) }}>{r.score}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#888' }}>/10</div>
                                        </div>
                                    </div>
                                    <div className="mb-3 p-3 rounded" style={{ background: 'rgba(0,0,0,0.04)', borderLeft: '3px solid #8b5cf6' }}>
                                        <div className="small text-muted mb-1 fw-semibold">Your Answer</div>
                                        <div className="small">{r.answerText}</div>
                                    </div>
                                    <div className="p-3 rounded" style={{ background: `${SCORE_COLOR(r.score)}10`, borderLeft: `3px solid ${SCORE_COLOR(r.score)}` }}>
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="small fw-semibold" style={{ color: SCORE_COLOR(r.score) }}>
                                                <FiStar size={13} className="me-1" />AI Feedback ({SCORE_LABEL(r.score)})
                                            </div>
                                            {r.analysisSource === 'AI'
                                                ? <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px' }}><FiZap size={10} className="me-1" />AI Evaluated</span>
                                                : <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px' }}><FiAlertCircle size={10} className="me-1" />Auto-Assessed</span>
                                            }
                                        </div>
                                        <div className="small">{r.feedback}</div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="d-flex gap-3 justify-content-center mt-2">
                            <button className="btn btn-outline-secondary px-4" onClick={() => navigate('/interview')}>
                                <FiHome size={15} className="me-2" />Back to Home
                            </button>
                            <button className="btn btn-outline-primary px-4" onClick={() => navigate('/ai-history')}>
                                View AI History
                            </button>
                            <button className="btn px-4"
                                style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff', border: 'none', borderRadius: '10px' }}
                                onClick={() => {
                                    setCurrentIdx(0); setAnswerText(''); setResults([]);
                                    setFinished(false); setError(''); setLastSource(null);
                                    setSessionSaved(false); setSessionSaving(false);
                                    setOverTime(false); setTimeTaken(null);
                                }}>
                                <FiRotateCcw size={15} className="me-2" />Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── INTERVIEW SCREEN — split-panel ─────────────────────────── */
    const canSubmit = answerText.trim().length >= 10 && !loading;
    const isLast    = currentIdx + 1 >= totalQuestions;

    return (
        <>
            <style>{`
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(1.06)} }
                .ai-textarea:focus { border-color: #8b5cf6 !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.18) !important; }
            `}</style>

            {showModal && <TimerExpiredModal onEndNow={handleExpiredEnd} onContinue={handleContinue} />}

            {/* ════════ SPLIT LAYOUT ════════ */}
            <div style={{
                display: 'flex',
                height: 'calc(100vh - 64px)',
                overflow: 'hidden',
                background: '#0b0b18',
                fontFamily: "'Inter', system-ui, sans-serif",
            }}>

                {/* ══ LEFT PANEL ══ */}
                <div style={{
                    width: '40%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 28px',
                    borderRight: '1px solid rgba(139,92,246,.14)',
                    background: 'linear-gradient(155deg,#0d0d20 0%,#110f28 100%)',
                    overflow: 'hidden',
                    gap: '16px',
                }}>

                    {/* Badge + counter */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <span style={{
                                background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)',
                                color: '#a78bfa', padding: '4px 12px', borderRadius: '20px',
                                fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.04em',
                            }}>
                                <FiCpu size={11} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                AI Text Interview
                            </span>
                            <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem', marginTop: '8px' }}>
                                {roleName}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1, color: '#a78bfa' }}>
                                {currentIdx + 1}<span style={{ color: '#3f3a6e', fontSize: '1.3rem' }}>/{totalQuestions}</span>
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '0.7rem', marginTop: '2px' }}>Question</div>
                        </div>
                    </div>

                    {/* Timer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            padding: '7px 16px', borderRadius: '30px',
                            background: tBg, border: `1.5px solid ${tColor}`,
                            color: tColor, fontWeight: 700, fontSize: '1.05rem',
                            ...(pct < 20 ? { animation: 'pulse 1s ease-in-out infinite' } : {}),
                        }}>
                            <FiClock size={15} />{mm}:{ss}
                            <span style={{ fontSize: '0.7rem', fontWeight: 500, opacity: .8 }}>remaining</span>
                        </span>
                        {overTime && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.76rem', fontWeight: 600 }}>
                                <FiAlertTriangle size={12} /> Over Time
                            </span>
                        )}
                    </div>

                    {/* Progress */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>Progress</span>
                            <span style={{ color: '#a78bfa', fontSize: '0.7rem', fontWeight: 600 }}>{results.length}/{totalQuestions} answered</span>
                        </div>
                        <div style={{ height: '5px', background: 'rgba(139,92,246,.15)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', borderRadius: '10px',
                                width: `${(results.length / totalQuestions) * 100}%`,
                                background: 'linear-gradient(90deg,#8b5cf6,#a78bfa)',
                                transition: 'width .5s ease',
                            }} />
                        </div>
                        {/* Previous score pills */}
                        {results.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                                {results.map((r, i) => (
                                    <span key={i} style={{
                                        padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
                                        background: `${SCORE_COLOR(r.score)}20`, color: SCORE_COLOR(r.score),
                                        border: `1px solid ${SCORE_COLOR(r.score)}40`,
                                    }}>Q{i + 1}: {r.score}/10</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Question box */}
                    <div style={{
                        flex: 1,
                        background: 'rgba(139,92,246,.06)',
                        border: '1px solid rgba(139,92,246,.15)',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        minHeight: 0,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                            }}>Q</div>
                            <span style={{ color: '#6b7280', fontSize: '0.74rem', fontWeight: 600 }}>
                                Question {currentIdx + 1} of {totalQuestions}
                            </span>
                        </div>

                        <p style={{
                            color: '#e2e8f0', fontWeight: 600, fontSize: '0.97rem',
                            lineHeight: 1.75, margin: 0, flex: 1,
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 6, WebkitBoxOrient: 'vertical',
                        }}>
                            {questions[currentIdx]}
                        </p>

                        {/* TTS */}
                        <div style={{
                            marginTop: '14px', paddingTop: '14px',
                            borderTop: '1px solid rgba(139,92,246,.12)',
                            display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
                        }}>
                            <FiVolume2 size={13} style={{ color: '#a78bfa' }} />
                            <select value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} style={{
                                fontSize: '0.72rem', border: '1px solid rgba(139,92,246,.25)',
                                borderRadius: '6px', padding: '3px 7px',
                                color: '#a78bfa', background: 'rgba(139,92,246,.1)',
                                cursor: 'pointer', outline: 'none',
                            }}>
                                <option value={0.75}>🐢 Slow</option>
                                <option value={1}>Normal</option>
                                <option value={1.5}>🐇 Fast</option>
                            </select>
                            <button onClick={() => speak(questions[currentIdx])} disabled={isSpeaking} style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                fontSize: '0.72rem', fontWeight: 600,
                                padding: '4px 11px', borderRadius: '8px', border: 'none',
                                background: isSpeaking ? 'rgba(139,92,246,.2)' : 'rgba(139,92,246,.8)',
                                color: '#fff', cursor: isSpeaking ? 'default' : 'pointer',
                            }}>
                                <FiVolume2 size={12} />{isSpeaking ? 'Reading…' : 'Read Aloud'}
                            </button>
                            {isSpeaking && (
                                <button onClick={stop} style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    fontSize: '0.72rem', fontWeight: 600,
                                    padding: '4px 10px', borderRadius: '8px', border: 'none',
                                    background: 'rgba(239,68,68,.8)', color: '#fff', cursor: 'pointer',
                                }}><FiSquare size={10} /> Stop</button>
                            )}
                        </div>
                    </div>

                    {/* Exit button */}
                    <button onClick={() => navigate('/interview')} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '8px', borderRadius: '10px',
                        border: '1.5px solid rgba(255,255,255,.08)',
                        background: 'transparent', color: '#4b5563',
                        fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                    }}>
                        <FiHome size={13} /> Exit Interview
                    </button>
                </div>

                {/* ══ RIGHT PANEL ══ */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 32px',
                    background: '#0f0f1e',
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: '14px' }}>
                        <div style={{ color: '#475569', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                            Your Answer
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                                Type your detailed answer below
                            </span>
                            <span style={{
                                color: wordCount >= 30 ? '#10b981' : wordCount >= 10 ? '#f59e0b' : '#6b7280',
                                fontSize: '0.78rem', fontWeight: 600,
                            }}>
                                {wordCount} words
                            </span>
                        </div>
                    </div>

                    {/* Textarea — takes remaining space */}
                    <textarea
                        className="ai-textarea"
                        value={answerText}
                        onChange={e => setAnswerText(e.target.value)}
                        disabled={loading}
                        placeholder="Type your answer here… Be as detailed and specific as possible. Groq AI will evaluate your response."
                        style={{
                            flex: 1,
                            width: '100%',
                            minHeight: 0,
                            resize: 'none',
                            borderRadius: '14px',
                            border: '2px solid rgba(139,92,246,.2)',
                            background: 'rgba(139,92,246,.04)',
                            color: '#e2e8f0',
                            fontSize: '0.95rem',
                            lineHeight: 1.7,
                            padding: '18px',
                            outline: 'none',
                            transition: 'border-color .2s, box-shadow .2s',
                            fontFamily: "'Inter', system-ui, sans-serif",
                        }}
                    />

                    {/* Status bar */}
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#4b5563', fontSize: '0.74rem' }}>
                            💡 Aim for at least 3–5 sentences
                        </span>
                        {lastSource === 'AI' && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '3px 10px', borderRadius: '20px',
                                background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)',
                                color: '#10b981', fontSize: '0.72rem', fontWeight: 600,
                            }}>
                                <FiZap size={11} /> Groq AI Active
                            </span>
                        )}
                        {lastSource === 'FALLBACK' && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '3px 10px', borderRadius: '20px',
                                background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)',
                                color: '#f59e0b', fontSize: '0.72rem', fontWeight: 600,
                            }}>
                                <FiAlertCircle size={11} /> AI Unavailable
                            </span>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            marginTop: '10px', padding: '10px 14px', borderRadius: '10px',
                            background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
                            color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            {error}
                            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
                        </div>
                    )}

                    {/* Submit row — pinned at bottom */}
                    <div style={{
                        display: 'flex', justifyContent: 'flex-end',
                        paddingTop: '16px', marginTop: '12px',
                        borderTop: '1px solid rgba(255,255,255,.06)',
                    }}>
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!canSubmit}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '12px 30px', borderRadius: '12px', border: 'none',
                                background: canSubmit
                                    ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)'
                                    : 'rgba(255,255,255,.07)',
                                color: canSubmit ? '#fff' : '#4b5563',
                                fontWeight: 700, fontSize: '0.95rem',
                                cursor: canSubmit ? 'pointer' : 'not-allowed',
                                boxShadow: canSubmit ? '0 4px 16px rgba(139,92,246,.35)' : 'none',
                                transition: 'all .25s',
                            }}
                        >
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm me-1" /> Evaluating with Groq AI…</>
                            ) : isLast ? (
                                <><FiCheckCircle size={17} /> Submit &amp; See Results</>
                            ) : (
                                <>Submit &amp; Next <FiArrowRight size={17} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
