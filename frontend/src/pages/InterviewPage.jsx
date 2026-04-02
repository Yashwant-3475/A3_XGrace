import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiVolume2, FiSquare, FiClock, FiAlertTriangle } from 'react-icons/fi';

// ── Timer Config ────────────────────────────────────────────────────────────
const SESSION_DURATION = 5 * 60; // 5 minutes — change this value to adjust
// ───────────────────────────────────────────────────────────────────────────

// ── useTimer Hook ────────────────────────────────────────────────────────────
const useTimer = (initialSeconds, onExpire) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const intervalRef = useRef(null);
    const startedAt = useRef(Date.now());

    useEffect(() => {
        startedAt.current = Date.now();
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    onExpire();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const getElapsed = useCallback(
        () => Math.floor((Date.now() - startedAt.current) / 1000),
        []
    );

    return { timeLeft, getElapsed };
};
// ───────────────────────────────────────────────────────────────────────────

// ── TimerBadge ───────────────────────────────────────────────────────────────
const TimerBadge = ({ timeLeft, totalSeconds }) => {
    const pct = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
    const color = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';
    const bg    = pct > 50 ? 'rgba(16,185,129,0.1)' : pct > 20 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.12)';
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const ss = String(timeLeft % 60).padStart(2, '0');
    const pulseStyle = pct < 20
        ? { animation: 'timerPulse 1s ease-in-out infinite' }
        : {};

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 16px', borderRadius: '20px',
            background: bg, border: `1.5px solid ${color}`,
            color, fontWeight: 700, fontSize: '1rem',
            ...pulseStyle,
        }}>
            <FiClock size={15} />
            {mm}:{ss}
            <span style={{ fontSize: '0.72rem', fontWeight: 500, opacity: 0.8, marginLeft: '2px' }}>
                remaining
            </span>
        </span>
    );
};
// ───────────────────────────────────────────────────────────────────────────

// ── TimerExpiredModal ────────────────────────────────────────────────────────
const TimerExpiredModal = ({ onEndNow, onContinue }) => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
        <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px 36px',
            maxWidth: '380px', width: '92%', textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        }}>
            <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>⏰</div>
            <p style={{ color: '#374151', fontWeight: 600, fontSize: '1rem', marginBottom: '24px', lineHeight: '1.6' }}>
                Time is over — do you want to end the interview or continue?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                    onClick={onEndNow}
                    style={{
                        padding: '10px 24px', borderRadius: '12px', border: 'none',
                        background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                        color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                    }}
                >
                    End Interview
                </button>
                <button
                    onClick={onContinue}
                    style={{
                        padding: '10px 24px', borderRadius: '12px',
                        border: '1.5px solid #d1d5db',
                        background: '#fff', color: '#374151',
                        fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                    }}
                >
                    Continue
                </button>
            </div>
        </div>
    </div>
);
// ───────────────────────────────────────────────────────────────────────────

// ── Web Speech API TTS Hook ─────────────────────────────────────────────────
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

    useEffect(() => () => window.speechSynthesis?.cancel(), []);

    return { isSpeaking, speak, stop, speed, setSpeed };
};
// ───────────────────────────────────────────────────────────────────────────

const InterviewPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Timer-related state
    const [showExpiredModal, setShowExpiredModal] = useState(false);
    const [exceededTime, setExceededTime] = useState(false);

    const { sessionId, questions, role, totalQuestions } = location.state || {};
    const { isSpeaking, speak, stop, speed, setSpeed } = useSpeech();

    // Session timer — fires onExpire when 5 min is up
    const { timeLeft, getElapsed } = useTimer(SESSION_DURATION, () => {
        setShowExpiredModal(true);
    });

    useEffect(() => {
        if (!sessionId || !questions || questions.length === 0) {
            navigate('/interview');
        }
    }, [sessionId, questions, navigate]);

    useEffect(() => {
        if (questions && questions.length > 0) {
            setAnswers(questions.map(q => ({ questionId: q._id, selectedAnswer: null })));
        }
    }, [questions]);

    useEffect(() => {
        if (questions && questions[currentQuestionIndex]) {
            speak(questions[currentQuestionIndex].question);
        }
    }, [currentQuestionIndex]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!sessionId || !questions) return null;

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer   = answers[currentQuestionIndex];
    const progress        = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion  = currentQuestionIndex === totalQuestions - 1;

    const handleOptionSelect = (optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = {
            questionId: currentQuestion._id,
            selectedAnswer: optionIndex,
        };
        setAnswers(newAnswers);
    };

    const handlePrevious = () => { if (!isFirstQuestion) setCurrentQuestionIndex(p => p - 1); };
    const handleNext     = () => { if (!isLastQuestion)  setCurrentQuestionIndex(p => p + 1); };

    // Core submit logic — forceExceeded=true when user clicks "End Interview Now"
    const handleSubmit = async (forceExceeded = false) => {
        try {
            setSubmitting(true);
            setShowExpiredModal(false);

            const isOverTime = forceExceeded || exceededTime;
            const timeTaken  = getElapsed();

            // Unanswered-question confirm (skip when timer forces submit)
            if (!forceExceeded) {
                const unansweredCount = answers.filter(a => a.selectedAnswer === null).length;
                if (unansweredCount > 0) {
                    const ok = window.confirm(
                        `You have ${unansweredCount} unanswered question(s). Submit anyway?`
                    );
                    if (!ok) { setSubmitting(false); return; }
                }
            }

            const response = await api.post('/interview/submit', { sessionId, answers });

            navigate('/interview/report', {
                state: {
                    sessionId:      response.data.sessionId,
                    score:          response.data.score,
                    totalQuestions: response.data.totalQuestions,
                    correctAnswers: response.data.correctAnswers,
                    wrongAnswers:   response.data.wrongAnswers,
                    percentage:     response.data.percentage,
                    role,
                    evaluation:     response.data.evaluation || null,
                    timeTaken,
                    exceededTime:   isOverTime,
                },
            });
        } catch (err) {
            console.error('Error submitting interview:', err);
            alert(err.response?.data?.message || 'Failed to submit interview. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExpiredEnd       = () => handleSubmit(true);
    const handleContinueAfterExpiry = () => { setExceededTime(true); setShowExpiredModal(false); };

    return (
        <div className="container mt-4">

            {/* Pulse keyframe */}
            <style>{`
                @keyframes timerPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.72; transform: scale(1.05); }
                }
            `}</style>

            {/* Time's Up modal */}
            {showExpiredModal && (
                <TimerExpiredModal
                    onEndNow={handleExpiredEnd}
                    onContinue={handleContinueAfterExpiry}
                />
            )}

            <div className="row justify-content-center">
                <div className="col-lg-9">

                    {/* ── Header ── */}
                    <div className="text-center mb-4">
                        <h2 className="fw-bold gradient-text mb-1">
                            {role && role.charAt(0).toUpperCase() + role.slice(1)} Interview
                        </h2>
                        <p className="text-muted mb-3">
                            Question <strong>{currentQuestionIndex + 1}</strong> of <strong>{totalQuestions}</strong>
                        </p>

                        {/* Timer row */}
                        <div className="d-flex justify-content-center align-items-center gap-3 mb-3 flex-wrap">
                            <TimerBadge timeLeft={timeLeft} totalSeconds={SESSION_DURATION} />
                            {exceededTime && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                    padding: '5px 13px', borderRadius: '20px',
                                    background: 'rgba(239,68,68,0.1)', border: '1.5px solid #ef4444',
                                    color: '#ef4444', fontWeight: 600, fontSize: '0.82rem',
                                }}>
                                    <FiAlertTriangle size={13} /> Over Time
                                </span>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div className="progress" style={{ height: '8px' }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            />
                        </div>
                    </div>

                    {/* ── Question Card ── */}
                    <div className="card shadow-lg border-0 mb-4">
                        <div className="card-body p-4 p-md-5">

                            {/* Question text */}
                            <div className="mb-4">
                                <div className="d-flex align-items-start mb-3">
                                    <div
                                        className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '40px', height: '40px',
                                            background: 'var(--primary-color)', flexShrink: 0,
                                        }}
                                    >
                                        <span className="text-white fw-bold">Q</span>
                                    </div>
                                    <h4 className="mb-0 fw-semibold" style={{ lineHeight: '1.6' }}>
                                        {currentQuestion.question}
                                    </h4>
                                </div>

                                {/* TTS Toolbar */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '8px 12px',
                                    background: 'rgba(var(--primary-rgb,99,102,241),0.06)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(var(--primary-rgb,99,102,241),0.18)',
                                    flexWrap: 'wrap', marginLeft: '52px',
                                }}>
                                    <FiVolume2 size={14} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600, marginRight: '4px' }}>Voice</span>
                                    <select
                                        value={speed}
                                        onChange={e => setSpeed(parseFloat(e.target.value))}
                                        style={{
                                            fontSize: '0.75rem',
                                            border: '1px solid rgba(99,102,241,0.3)',
                                            borderRadius: '8px', padding: '3px 8px',
                                            color: 'var(--primary-color)', background: '#fff',
                                            cursor: 'pointer', outline: 'none',
                                        }}
                                        title="Reading speed"
                                    >
                                        <option value={0.75}>🐢 Slow</option>
                                        <option value={1}>Normal</option>
                                        <option value={1.5}>🐇 Fast</option>
                                    </select>
                                    <button
                                        onClick={() => speak(currentQuestion.question)}
                                        disabled={isSpeaking}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            fontSize: '0.78rem', fontWeight: 600,
                                            padding: '4px 12px', borderRadius: '8px', border: 'none',
                                            cursor: isSpeaking ? 'default' : 'pointer',
                                            background: isSpeaking ? 'rgba(99,102,241,0.25)' : 'var(--primary-color)',
                                            color: '#fff', transition: 'background 0.2s',
                                        }}
                                    >
                                        <FiVolume2 size={13} />
                                        {isSpeaking ? 'Reading…' : 'Read Aloud'}
                                    </button>
                                    {isSpeaking && (
                                        <button
                                            onClick={stop}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                fontSize: '0.78rem', fontWeight: 600,
                                                padding: '4px 12px', borderRadius: '8px', border: 'none',
                                                cursor: 'pointer',
                                                background: 'rgba(239,68,68,0.85)', color: '#fff',
                                                transition: 'background 0.2s',
                                            }}
                                        >
                                            <FiSquare size={11} /> Stop
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Options */}
                            <div className="mt-4">
                                <label className="form-label fw-semibold mb-3">Select your answer:</label>
                                <div className="d-flex flex-column gap-3">
                                    {currentQuestion.options.map((option, index) => (
                                        <div
                                            key={index}
                                            className={`form-check p-3 rounded border ${
                                                currentAnswer?.selectedAnswer === index
                                                    ? 'border-primary bg-primary bg-opacity-10'
                                                    : 'border-secondary'
                                            }`}
                                            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                            onClick={() => handleOptionSelect(index)}
                                        >
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="answer"
                                                id={`option-${index}`}
                                                checked={currentAnswer?.selectedAnswer === index}
                                                onChange={() => handleOptionSelect(index)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <label
                                                className="form-check-label ms-2 w-100"
                                                htmlFor={`option-${index}`}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {option}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                                <button
                                    className="btn btn-outline-secondary d-flex align-items-center"
                                    onClick={handlePrevious}
                                    disabled={isFirstQuestion}
                                >
                                    <FiChevronLeft className="me-2" size={20} />
                                    Previous
                                </button>

                                {!isLastQuestion ? (
                                    <button
                                        className="btn btn-primary d-flex align-items-center"
                                        onClick={handleNext}
                                    >
                                        Next
                                        <FiChevronRight className="ms-2" size={20} />
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-success btn-lg d-flex align-items-center"
                                        onClick={() => handleSubmit(false)}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <FiCheckCircle className="me-2" size={20} />
                                                Submit Interview
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Question Navigator ── */}
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-3">
                            <p className="mb-2 small fw-semibold text-muted">Question Progress:</p>
                            <div className="d-flex flex-wrap gap-2">
                                {questions.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`btn btn-sm ${
                                            answers[index]?.selectedAnswer !== null
                                                ? 'btn-success'
                                                : index === currentQuestionIndex
                                                    ? 'btn-primary'
                                                    : 'btn-outline-secondary'
                                        }`}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        style={{ minWidth: '40px', height: '40px', whiteSpace: 'nowrap' }}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default InterviewPage;
