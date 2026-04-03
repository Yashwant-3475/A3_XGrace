import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import {
    FiChevronLeft, FiChevronRight, FiCheckCircle,
    FiVolume2, FiSquare, FiClock, FiAlertTriangle,
} from 'react-icons/fi';

/* ─── Config ───────────────────────────────────────────────────── */
const SESSION_DURATION = 5 * 60; // 5 minutes
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

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

    const stop = useCallback(() => {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
    }, []);

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
                        background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
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

/* ─── Main Component ───────────────────────────────────────────── */
export default function InterviewPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [qIdx,       setQIdx]       = useState(0);
    const [answers,    setAnswers]    = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [showModal,  setShowModal]  = useState(false);
    const [overTime,   setOverTime]   = useState(false);

    const { sessionId, questions, role, totalQuestions } = location.state || {};
    const { isSpeaking, speak, stop, speed, setSpeed }   = useSpeech();
    const { timeLeft, getElapsed } = useTimer(SESSION_DURATION, () => setShowModal(true));

    /* redirect if no session */
    useEffect(() => {
        if (!sessionId || !questions?.length) navigate('/interview');
    }, [sessionId, questions, navigate]);

    /* initialise answers array */
    useEffect(() => {
        if (questions?.length) setAnswers(questions.map(q => ({ questionId: q._id, selectedAnswer: null })));
    }, [questions]);

    /* auto-read question */
    useEffect(() => {
        if (questions?.[qIdx]) speak(questions[qIdx].question);
    }, [qIdx]); // eslint-disable-line

    if (!sessionId || !questions) return null;

    const q          = questions[qIdx];
    const curAnswer  = answers[qIdx];
    const isFirst    = qIdx === 0;
    const isLast     = qIdx === totalQuestions - 1;
    const answered   = answers.filter(a => a.selectedAnswer !== null).length;

    /* timer colour */
    const pct        = (timeLeft / SESSION_DURATION) * 100;
    const tColor     = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';
    const tBg        = pct > 50 ? 'rgba(16,185,129,0.12)' : pct > 20 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.14)';
    const mm         = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const ss         = String(timeLeft % 60).padStart(2, '0');

    function selectOption(i) {
        const next = [...answers];
        next[qIdx] = { questionId: q._id, selectedAnswer: i };
        setAnswers(next);
    }

    async function doSubmit(isOver) {
        setSubmitting(true);
        const elapsed = getElapsed();
        try {
            const res = await api.post('/interview/submit', { sessionId, answers });
            navigate('/interview/report', {
                state: {
                    sessionId:      res.data.sessionId,
                    score:          res.data.score,
                    totalQuestions: res.data.totalQuestions,
                    correctAnswers: res.data.correctAnswers,
                    wrongAnswers:   res.data.wrongAnswers,
                    percentage:     res.data.percentage,
                    role,
                    evaluation:     res.data.evaluation || null,
                    timeTaken:      elapsed,
                    exceededTime:   isOver,
                },
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submit failed. Try again.');
            setSubmitting(false);
        }
    }

    function handleSubmit(forceExceeded = false) {
        setShowModal(false);
        const isOver = forceExceeded || overTime;

        if (!forceExceeded) {
            const unanswered = answers.filter(a => a.selectedAnswer === null).length;
            if (unanswered > 0) {
                toast.warn(
                    ({ closeToast }) => (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                                <FiAlertTriangle size={18} />
                                {unanswered} question{unanswered > 1 ? 's' : ''} unanswered
                            </div>
                            <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.85, lineHeight: 1.5 }}>
                                Are you sure you want to submit without answering all questions?
                            </p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                                <button
                                    onClick={() => { closeToast(); doSubmit(isOver); }}
                                    style={{
                                        flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none',
                                        background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                                        color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                                    }}
                                >Submit Anyway</button>
                                <button
                                    onClick={closeToast}
                                    style={{
                                        flex: 1, padding: '8px 0', borderRadius: '8px',
                                        border: '1.5px solid rgba(255,255,255,.2)', background: 'transparent',
                                        color: '#e2e8f0', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                                    }}
                                >Go Back</button>
                            </div>
                        </div>
                    ),
                    {
                        autoClose: false,
                        closeOnClick: false,
                        draggable: false,
                        closeButton: false,
                        position: 'top-center',
                        style: {
                            background: '#1c1c2e',
                            border: '1px solid rgba(245,158,11,0.3)',
                            borderRadius: '14px',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                            minWidth: '340px',
                        },
                    }
                );
                return;
            }
        }

        doSubmit(isOver);
    }

    /* ── Render ── */
    return (
        <>
            <style>{`
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(1.06)} }
                .opt-card { transition: transform .15s, border-color .15s, background .15s; }
                .opt-card:hover { transform: translateX(4px); border-color: rgba(139,92,246,.6) !important; background: rgba(139,92,246,.08) !important; }
                .qnav:hover { background: rgba(139,92,246,.22) !important; }
            `}</style>

            {showModal && (
                <TimerExpiredModal
                    onEndNow={() => handleSubmit(true)}
                    onContinue={() => { setOverTime(true); setShowModal(false); }}
                />
            )}

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
                    width: '42%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 28px',
                    borderRight: '1px solid rgba(139,92,246,.14)',
                    background: 'linear-gradient(155deg,#0d0d20 0%,#110f28 100%)',
                    overflow: 'hidden',
                    gap: '16px',
                }}>

                    {/* Row 1 – badge + counter */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <span style={{
                                background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)',
                                color: '#a78bfa', padding: '4px 12px', borderRadius: '20px',
                                fontSize: '0.72rem', fontWeight: 600, letterSpacing: '.04em',
                            }}>MCQ Interview</span>
                            <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem', marginTop: '8px' }}>
                                {role ? role.charAt(0).toUpperCase() + role.slice(1) : ''} Round
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1, color: '#a78bfa' }}>
                                {qIdx + 1}<span style={{ color: '#3f3a6e', fontSize: '1.3rem' }}>/{totalQuestions}</span>
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '0.7rem', marginTop: '2px' }}>Question</div>
                        </div>
                    </div>

                    {/* Row 2 – timer */}
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
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                color: '#ef4444', fontSize: '0.76rem', fontWeight: 600,
                            }}>
                                <FiAlertTriangle size={12} /> Over Time
                            </span>
                        )}
                    </div>

                    {/* Row 3 – progress */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>Progress</span>
                            <span style={{ color: '#a78bfa', fontSize: '0.7rem', fontWeight: 600 }}>{answered}/{totalQuestions} answered</span>
                        </div>
                        <div style={{ height: '5px', background: 'rgba(139,92,246,.15)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', borderRadius: '10px',
                                width: `${(answered / totalQuestions) * 100}%`,
                                background: 'linear-gradient(90deg,#6366f1,#a78bfa)',
                                transition: 'width .4s ease',
                            }} />
                        </div>
                    </div>

                    {/* Row 4 – question box (flex-grows to fill) */}
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
                                background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                            }}>Q</div>
                            <span style={{ color: '#6b7280', fontSize: '0.74rem', fontWeight: 600 }}>
                                Question {qIdx + 1} of {totalQuestions}
                            </span>
                        </div>

                        <p style={{
                            color: '#e2e8f0', fontWeight: 600, fontSize: '0.97rem',
                            lineHeight: 1.75, margin: 0, flex: 1,
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 6, WebkitBoxOrient: 'vertical',
                        }}>
                            {q.question}
                        </p>

                        {/* TTS */}
                        <div style={{
                            marginTop: '14px', paddingTop: '14px',
                            borderTop: '1px solid rgba(139,92,246,.12)',
                            display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
                        }}>
                            <FiVolume2 size={13} style={{ color: '#a78bfa' }} />
                            <select
                                value={speed} onChange={e => setSpeed(parseFloat(e.target.value))}
                                style={{
                                    fontSize: '0.72rem', border: '1px solid rgba(139,92,246,.25)',
                                    borderRadius: '6px', padding: '3px 7px',
                                    color: '#a78bfa', background: 'rgba(139,92,246,.1)',
                                    cursor: 'pointer', outline: 'none',
                                }}
                            >
                                <option value={0.75}>🐢 Slow</option>
                                <option value={1}>Normal</option>
                                <option value={1.5}>🐇 Fast</option>
                            </select>
                            <button
                                onClick={() => speak(q.question)} disabled={isSpeaking}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    fontSize: '0.72rem', fontWeight: 600,
                                    padding: '4px 11px', borderRadius: '8px', border: 'none',
                                    background: isSpeaking ? 'rgba(139,92,246,.2)' : 'rgba(139,92,246,.8)',
                                    color: '#fff', cursor: isSpeaking ? 'default' : 'pointer',
                                }}
                            >
                                <FiVolume2 size={12} />{isSpeaking ? 'Reading…' : 'Read Aloud'}
                            </button>
                            {isSpeaking && (
                                <button onClick={stop} style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    fontSize: '0.72rem', fontWeight: 600,
                                    padding: '4px 10px', borderRadius: '8px', border: 'none',
                                    background: 'rgba(239,68,68,.8)', color: '#fff', cursor: 'pointer',
                                }}>
                                    <FiSquare size={10} /> Stop
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Row 5 – Q navigator */}
                    <div>
                        <div style={{ color: '#4b5563', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Jump to question
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {questions.map((_, i) => {
                                const done    = answers[i]?.selectedAnswer !== null;
                                const current = i === qIdx;
                                return (
                                    <button key={i} className="qnav" onClick={() => setQIdx(i)} style={{
                                        width: '30px', height: '30px', borderRadius: '8px',
                                        border: current ? '2px solid #a78bfa' : '1.5px solid rgba(139,92,246,.2)',
                                        background: done ? 'rgba(16,185,129,.18)' : current ? 'rgba(139,92,246,.25)' : 'rgba(139,92,246,.05)',
                                        color: done ? '#10b981' : current ? '#a78bfa' : '#6b7280',
                                        fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                                    }}>{i + 1}</button>
                                );
                            })}
                        </div>
                    </div>
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
                    <div style={{ marginBottom: '18px' }}>
                        <div style={{ color: '#475569', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                            Select your answer
                        </div>
                    </div>

                    {/* Options */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', overflow: 'hidden' }}>
                        {q.options.map((opt, i) => {
                            const sel = curAnswer?.selectedAnswer === i;
                            return (
                                <div
                                    key={i}
                                    className="opt-card"
                                    onClick={() => selectOption(i)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                        padding: '14px 18px', borderRadius: '14px', cursor: 'pointer',
                                        border: sel ? '2px solid #8b5cf6' : '1.5px solid rgba(255,255,255,.07)',
                                        background: sel ? 'rgba(139,92,246,.14)' : 'rgba(255,255,255,.03)',
                                        boxShadow: sel ? '0 0 0 4px rgba(139,92,246,.1)' : 'none',
                                    }}
                                >
                                    <div style={{
                                        width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: sel ? 'linear-gradient(135deg,#6366f1,#a78bfa)' : 'rgba(139,92,246,.1)',
                                        color: sel ? '#fff' : '#a78bfa',
                                        fontWeight: 700, fontSize: '0.82rem',
                                        border: sel ? 'none' : '1px solid rgba(139,92,246,.2)',
                                    }}>{LETTERS[i]}</div>
                                    <span style={{ color: sel ? '#e2e8f0' : '#94a3b8', fontWeight: sel ? 600 : 400, fontSize: '0.93rem', lineHeight: 1.5 }}>
                                        {opt}
                                    </span>
                                    {sel && <FiCheckCircle size={17} style={{ marginLeft: 'auto', color: '#a78bfa', flexShrink: 0 }} />}
                                </div>
                            );
                        })}
                    </div>

                    {/* Navigation */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingTop: '20px', marginTop: '16px',
                        borderTop: '1px solid rgba(255,255,255,.06)',
                    }}>
                        <button
                            onClick={() => !isFirst && setQIdx(p => p - 1)}
                            disabled={isFirst}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '7px',
                                padding: '10px 20px', borderRadius: '10px',
                                border: '1.5px solid rgba(255,255,255,.1)', background: 'transparent',
                                color: isFirst ? '#2d3748' : '#94a3b8',
                                fontWeight: 600, fontSize: '0.88rem',
                                cursor: isFirst ? 'not-allowed' : 'pointer',
                            }}
                        ><FiChevronLeft size={17} /> Previous</button>

                        <span style={{ color: '#374151', fontSize: '0.8rem' }}>
                            <span style={{ color: '#10b981', fontWeight: 700 }}>{answered}</span> / {totalQuestions} answered
                        </span>

                        {!isLast ? (
                            <button
                                onClick={() => setQIdx(p => p + 1)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '7px',
                                    padding: '10px 24px', borderRadius: '10px', border: 'none',
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                                    cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,.35)',
                                }}
                            >Next <FiChevronRight size={17} /></button>
                        ) : (
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '7px',
                                    padding: '10px 24px', borderRadius: '10px', border: 'none',
                                    background: submitting ? '#1f2937' : 'linear-gradient(135deg,#10b981,#059669)',
                                    color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 14px rgba(16,185,129,.3)',
                                }}
                            >
                                {submitting
                                    ? <><span className="spinner-border spinner-border-sm me-1" /> Submitting…</>
                                    : <><FiCheckCircle size={16} /> Submit Interview</>
                                }
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
