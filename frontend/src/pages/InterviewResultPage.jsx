import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiAward, FiRefreshCw, FiHome } from 'react-icons/fi';

const InterviewResultPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        percentage,
        role
    } = location.state || {};

    // Redirect if no result data
    if (!location.state || totalQuestions === undefined) {
        navigate('/interview');
        return null;
    }

    // Determine pass/fail status and color
    const getPerformanceLevel = (pct) => {
        if (pct >= 70) return { level: 'Excellent', color: 'success', emoji: '🎉' };
        if (pct >= 50) return { level: 'Good', color: 'warning', emoji: '👍' };
        return { level: 'Needs Improvement', color: 'danger', emoji: '💪' };
    };

    const performance = getPerformanceLevel(percentage);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {/* Success Header */}
                    <div className="text-center mb-5">
                        <div
                            className="d-inline-block p-4 rounded-circle mb-3"
                            style={{ backgroundColor: `var(--bs-${performance.color})`, opacity: 0.1 }}
                        >
                            <FiAward size={64} className={`text-${performance.color}`} />
                        </div>
                        <h1 className="fw-bold gradient-text mb-2">Interview Completed! {performance.emoji}</h1>
                        <p className="text-muted fs-5">
                            {role && `${role.charAt(0).toUpperCase() + role.slice(1)} Interview`}
                        </p>
                    </div>

                    {/* Score Card */}
                    <div className="card shadow-lg border-0 mb-4">
                        <div className="card-body p-5 text-center">
                            {/* Large Percentage Display */}
                            <div className="mb-4">
                                <h1
                                    className={`display-1 fw-bold text-${performance.color}`}
                                    style={{ fontSize: '5rem' }}
                                >
                                    {percentage}%
                                </h1>
                                <h4 className={`text-${performance.color} fw-semibold`}>
                                    {performance.level}
                                </h4>
                            </div>

                            <hr className="my-4" />

                            {/* Stats Row */}
                            <div className="row g-4 mt-4">
                                <div className="col-md-4">
                                    <div className="p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                        <h2 className="fw-bold mb-1">{score}/{totalQuestions}</h2>
                                        <p className="text-muted mb-0 small">Overall Score</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 rounded" style={{ backgroundColor: '#d1fae5' }}>
                                        <div className="d-flex align-items-center justify-content-center mb-1">
                                            <FiCheckCircle className="me-2 text-success" size={24} />
                                            <h2 className="fw-bold mb-0 text-success">{correctAnswers}</h2>
                                        </div>
                                        <p className="text-muted mb-0 small">Correct Answers</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 rounded" style={{ backgroundColor: '#fee2e2' }}>
                                        <div className="d-flex align-items-center justify-content-center mb-1">
                                            <FiXCircle className="me-2 text-danger" size={24} />
                                            <h2 className="fw-bold mb-0 text-danger">{wrongAnswers}</h2>
                                        </div>
                                        <p className="text-muted mb-0 small">Wrong Answers</p>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Message */}
                            <div className={`alert alert-${performance.color} mt-4`} role="alert">
                                <strong>
                                    {percentage >= 70 && "Congratulations! You've demonstrated excellent knowledge in this area."}
                                    {percentage >= 50 && percentage < 70 && "Good job! Keep practicing to improve your score."}
                                    {percentage < 50 && "Keep learning and practicing. You'll do better next time!"}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-center gap-3 mb-5">
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

export default InterviewResultPage;
