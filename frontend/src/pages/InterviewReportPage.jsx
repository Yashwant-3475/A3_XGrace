import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FiAward, FiCheckCircle, FiXCircle, FiTrendingUp,
    FiAlertCircle, FiRefreshCw, FiHome, FiStar
} from 'react-icons/fi';

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
    } = location.state || {};

    // Redirect if no data
    if (!location.state || totalQuestions === undefined) {
        navigate('/interview');
        return null;
    }

    // Use evaluation data if available, otherwise show basic results
    const skillLevel = evaluation?.skillLevel || 'Unknown';
    const strengths = evaluation?.strengths || [];
    const weaknesses = evaluation?.weaknesses || [];
    const improvements = evaluation?.improvements || [];
    const summary = evaluation?.summary || 'Complete your interview to receive detailed feedback.';

    // Determine color scheme based on skill level
    const getSkillLevelColor = (level) => {
        switch (level) {
            case 'Job Ready':
                return 'success';
            case 'Intermediate':
                return 'warning';
            case 'Beginner':
                return 'info';
            default:
                return 'secondary';
        }
    };

    const skillColor = getSkillLevelColor(skillLevel);

    return (
        <div className="container mt-4 mb-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    {/* Header with Skill Level Badge */}
                    <div className="text-center mb-4">
                        <div className="d-inline-block mb-3">
                            <span className={`badge bg-${skillColor} rounded-pill px-4 py-2 fs-5`}>
                                {skillLevel}
                            </span>
                        </div>
                        <h1 className="fw-bold gradient-text mb-2">Interview Performance Report</h1>
                        <p className="text-muted fs-5">{role && `${role.charAt(0).toUpperCase() + role.slice(1)} Interview`}</p>
                    </div>

                    {/* Score Summary Cards */}
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

                    {/* AI Summary */}
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

                    {/* Strengths Section */}
                    {strengths.length > 0 && !strengths[0].includes('making progress') && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <FiStar size={28} className="me-3 text-success" />
                                    <h4 className="mb-0 fw-bold text-success">Strengths</h4>
                                </div>
                                <div className="row g-3">
                                    {strengths.map((strength, index) => (
                                        <div key={index} className="col-md-6">
                                            <div
                                                className="p-3 rounded-3 h-100"
                                                style={{ backgroundColor: '#d1fae5', border: '2px solid #10b981' }}
                                            >
                                                <div className="d-flex align-items-start">
                                                    <FiCheckCircle className="me-2 mt-1 text-success flex-shrink-0" size={20} />
                                                    <span className="text-dark">{strength}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Weaknesses Section */}
                    {weaknesses.length > 0 && !weaknesses[0].includes('No significant') && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <FiAlertCircle size={28} className="me-3 text-warning" />
                                    <h4 className="mb-0 fw-bold text-warning">Areas for Improvement</h4>
                                </div>
                                <div className="row g-3">
                                    {weaknesses.map((weakness, index) => (
                                        <div key={index} className="col-md-6">
                                            <div
                                                className="p-3 rounded-3 h-100"
                                                style={{ backgroundColor: '#fef3c7', border: '2px solid #f59e0b' }}
                                            >
                                                <div className="d-flex align-items-start">
                                                    <FiAlertCircle className="me-2 mt-1 text-warning flex-shrink-0" size={20} />
                                                    <span className="text-dark">{weakness}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Improvement Suggestions */}
                    {improvements.length > 0 && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <FiTrendingUp size={28} className="me-3" style={{ color: 'var(--primary-color)' }} />
                                    <h4 className="mb-0 fw-bold">Recommended Next Steps</h4>
                                </div>
                                <ul className="list-unstyled mb-0">
                                    {improvements.map((improvement, index) => (
                                        <li key={index} className="mb-3 d-flex align-items-start">
                                            <span
                                                className="badge bg-primary rounded-circle me-3 mt-1"
                                                style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                {index + 1}
                                            </span>
                                            <span className="text-muted" style={{ lineHeight: '1.8' }}>{improvement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-center gap-3 mb-4">
                        <button
                            className="btn btn-primary btn-lg d-flex align-items-center"
                            onClick={() => navigate('/interview')}
                        >
                            <FiRefreshCw className="me-2" size={20} />
                            Take Another Interview
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-lg d-flex align-items-center"
                            onClick={() => navigate('/dashboard')}
                        >
                            <FiHome className="me-2" size={20} />
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewReportPage;
