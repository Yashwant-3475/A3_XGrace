import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FiAward, FiCheckCircle, FiXCircle, FiTrendingUp,
    FiAlertCircle, FiRefreshCw, FiHome, FiStar,
    FiClock, FiAlertTriangle,
} from 'react-icons/fi';

const formatTime = (secs) => {
    if (secs === null || secs === undefined) return '--:--';
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    return `${mm}:${ss}`;
};

const InterviewReportPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        percentage,
        role,
        evaluation,
        timeTaken,
        exceededTime,
    } = location.state || {};

    // Redirect if no data
    if (!location.state || totalQuestions === undefined) {
        navigate('/interview');
        return null;
    }

    const skillLevel   = evaluation?.skillLevel  || 'Unknown';
    const strengths    = evaluation?.strengths    || [];
    const weaknesses   = evaluation?.weaknesses   || [];
    const improvements = evaluation?.improvements || [];
    const summary      = evaluation?.summary      || 'Complete your interview to receive detailed feedback.';

    const getSkillLevelColor = (level) => {
        switch (level) {
            case 'Job Ready':    return 'success';
            case 'Intermediate': return 'warning';
            case 'Beginner':     return 'info';
            default:             return 'secondary';
        }
    };

    const skillColor = getSkillLevelColor(skillLevel);

    return (
        <div className="container mt-4 mb-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">

                    {/* ── Header ── */}
                    <div className="text-center mb-4">
                        <div className="d-inline-block mb-3">
                            <span className={`badge bg-${skillColor} rounded-pill px-4 py-2 fs-5`}>
                                {skillLevel}
                            </span>
                        </div>
                        <h1 className="fw-bold gradient-text mb-2">Interview Performance Report</h1>
                        <p className="text-muted fs-5">
                            {role && `${role.charAt(0).toUpperCase() + role.slice(1)} Interview`}
                        </p>

                        {/* Over-time warning */}
                        {exceededTime && (
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '10px 22px', borderRadius: '12px', marginTop: '8px',
                                background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.4)',
                                color: '#dc2626', fontWeight: 600, fontSize: '0.9rem',
                            }}>
                                <FiAlertTriangle size={16} />
                                ⚠️ Time limit exceeded — you continued answering after the 5-minute mark.
                            </div>
                        )}
                    </div>

                    {/* ── Score Summary Cards ── */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body text-center p-3">
                                    <h2 className="fw-bold mb-1" style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>
                                        {percentage}%
                                    </h2>
                                    <p className="text-muted mb-0 small">Overall Score</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body text-center p-3">
                                    <h2 className="fw-bold mb-1" style={{ fontSize: '2.5rem' }}>
                                        {score}/{totalQuestions}
                                    </h2>
                                    <p className="text-muted mb-0 small">Questions</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#d1fae5' }}>
                                <div className="card-body text-center p-3">
                                    <div className="d-flex align-items-center justify-content-center mb-1">
                                        <FiCheckCircle className="me-2 text-success" size={24} />
                                        <h2 className="fw-bold mb-0 text-success" style={{ fontSize: '2.5rem' }}>
                                            {correctAnswers}
                                        </h2>
                                    </div>
                                    <p className="text-muted mb-0 small">Correct</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#fee2e2' }}>
                                <div className="card-body text-center p-3">
                                    <div className="d-flex align-items-center justify-content-center mb-1">
                                        <FiXCircle className="me-2 text-danger" size={24} />
                                        <h2 className="fw-bold mb-0 text-danger" style={{ fontSize: '2.5rem' }}>
                                            {wrongAnswers}
                                        </h2>
                                    </div>
                                    <p className="text-muted mb-0 small">Wrong</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Time Taken Card ── */}
                    {timeTaken !== undefined && timeTaken !== null && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-3 d-flex align-items-center gap-3">
                                <FiClock
                                    size={22}
                                    style={{ color: exceededTime ? '#ef4444' : 'var(--primary-color)', flexShrink: 0 }}
                                />
                                <div>
                                    <div className="fw-bold" style={{ color: exceededTime ? '#ef4444' : 'inherit' }}>
                                        Time Taken: {formatTime(timeTaken)}
                                        {exceededTime && (
                                            <span className="ms-2 badge"
                                                style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626', fontSize: '0.75rem' }}>
                                                exceeded limit
                                            </span>
                                        )}
                                    </div>
                                    <div className="small text-muted">Session duration limit: 05:00</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── AI Summary ── */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                                <FiAward size={28} className="me-3" style={{ color: 'var(--primary-color)' }} />
                                <h4 className="mb-0 fw-bold">Performance Summary</h4>
                            </div>
                            <p className="mb-0 text-muted" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                                {summary}
                            </p>
                        </div>
                    </div>

                    {/* ── Strengths ── */}
                    {strengths.length > 0 && !strengths[0].includes('making progress') && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <FiStar size={28} className="me-3 text-success" />
                                    <h4 className="mb-0 fw-bold text-success">Strengths</h4>
                                </div>
                                <div className="row g-3">
                                    {strengths.map((s, i) => (
                                        <div key={i} className="col-md-6">
                                            <div className="p-3 rounded-3 h-100"
                                                style={{ backgroundColor: '#d1fae5', border: '2px solid #10b981' }}>
                                                <div className="d-flex align-items-start">
                                                    <FiCheckCircle className="me-2 mt-1 text-success flex-shrink-0" size={20} />
                                                    <span className="text-dark">{s}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Weaknesses ── */}
                    {weaknesses.length > 0 && !weaknesses[0].includes('No significant') && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <FiAlertCircle size={28} className="me-3 text-warning" />
                                    <h4 className="mb-0 fw-bold text-warning">Areas for Improvement</h4>
                                </div>
                                <div className="row g-3">
                                    {weaknesses.map((w, i) => (
                                        <div key={i} className="col-md-6">
                                            <div className="p-3 rounded-3 h-100"
                                                style={{ backgroundColor: '#fef3c7', border: '2px solid #f59e0b' }}>
                                                <div className="d-flex align-items-start">
                                                    <FiAlertCircle className="me-2 mt-1 text-warning flex-shrink-0" size={20} />
                                                    <span className="text-dark">{w}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Improvement Suggestions ── */}
                    {improvements.length > 0 && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <FiTrendingUp size={28} className="me-3" style={{ color: 'var(--primary-color)' }} />
                                    <h4 className="mb-0 fw-bold">Recommended Next Steps</h4>
                                </div>
                                <ul className="list-unstyled mb-0">
                                    {improvements.map((imp, i) => (
                                        <li key={i} className="mb-3 d-flex align-items-start">
                                            <span
                                                className="badge bg-primary rounded-circle me-3 mt-1"
                                                style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                {i + 1}
                                            </span>
                                            <span className="text-muted" style={{ lineHeight: '1.8' }}>{imp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* ── Action Buttons ── */}
                    <div className="d-flex justify-content-center gap-3 mb-4">
                        <button
                            className="btn btn-primary btn-lg d-flex align-items-center"
                            onClick={() => navigate('/interview')}
                        >
                            <FiRefreshCw className="me-2" size={20} />Take Another Interview
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-lg d-flex align-items-center"
                            onClick={() => navigate('/dashboard')}
                        >
                            <FiHome className="me-2" size={20} />Go to Dashboard
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default InterviewReportPage;
