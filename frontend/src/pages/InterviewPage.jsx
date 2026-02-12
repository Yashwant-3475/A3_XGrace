import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight, FiCheckCircle } from 'react-icons/fi';

const InterviewPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Get session data from navigation state
    const { sessionId, questions, role, totalQuestions } = location.state || {};

    useEffect(() => {
        // Redirect if no session data
        if (!sessionId || !questions || questions.length === 0) {
            navigate('/interview');
        }
    }, [sessionId, questions, navigate]);

    // Initialize answers array
    useEffect(() => {
        if (questions && questions.length > 0) {
            setAnswers(questions.map(q => ({
                questionId: q._id,
                selectedAnswer: null
            })));
        }
    }, [questions]);

    if (!sessionId || !questions) {
        return null; // Will redirect in useEffect
    }

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    const handleOptionSelect = (optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = {
            questionId: currentQuestion._id,
            selectedAnswer: optionIndex
        };
        setAnswers(newAnswers);
    };

    const handlePrevious = () => {
        if (!isFirstQuestion) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (!isLastQuestion) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            // Check if all questions are answered
            const unansweredCount = answers.filter(a => a.selectedAnswer === null).length;
            if (unansweredCount > 0) {
                const confirmSubmit = window.confirm(
                    `You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`
                );
                if (!confirmSubmit) {
                    setSubmitting(false);
                    return;
                }
            }

            const response = await axios.post('http://localhost:5000/api/interview/submit', {
                sessionId,
                answers
            });

            // Navigate to report page with results and evaluation
            navigate('/interview/report', {
                state: {
                    sessionId: response.data.sessionId,
                    score: response.data.score,
                    totalQuestions: response.data.totalQuestions,
                    correctAnswers: response.data.correctAnswers,
                    wrongAnswers: response.data.wrongAnswers,
                    percentage: response.data.percentage,
                    role,
                    evaluation: response.data.evaluation || null
                }
            });

        } catch (err) {
            console.error('Error submitting interview:', err);
            alert(err.response?.data?.message || 'Failed to submit interview. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-9">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h2 className="fw-bold gradient-text mb-2">
                            {role && role.charAt(0).toUpperCase() + role.slice(1)} Interview
                        </h2>
                        <p className="text-muted">
                            Question <strong>{currentQuestionIndex + 1}</strong> of <strong>{totalQuestions}</strong>
                        </p>

                        {/* Progress Bar */}
                        <div className="progress" style={{ height: '8px' }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="card shadow-lg border-0 mb-4">
                        <div className="card-body p-4 p-md-5">
                            {/* Question */}
                            <div className="mb-4">
                                <div className="d-flex align-items-start mb-3">
                                    <div
                                        className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            background: 'var(--primary-color)',
                                            flexShrink: 0
                                        }}
                                    >
                                        <span className="text-white fw-bold">Q</span>
                                    </div>
                                    <h4 className="mb-0 fw-semibold" style={{ lineHeight: '1.6' }}>
                                        {currentQuestion.question}
                                    </h4>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="mt-4">
                                <label className="form-label fw-semibold mb-3">Select your answer:</label>
                                <div className="d-flex flex-column gap-3">
                                    {currentQuestion.options.map((option, index) => (
                                        <div
                                            key={index}
                                            className={`form-check p-3 rounded border ${currentAnswer?.selectedAnswer === index
                                                ? 'border-primary bg-primary bg-opacity-10'
                                                : 'border-secondary'
                                                }`}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
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

                            {/* Navigation Buttons */}
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
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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

                    {/* Question Navigator */}
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-3">
                            <p className="mb-2 small fw-semibold text-muted">Question Progress:</p>
                            <div className="d-flex flex-wrap gap-2">
                                {questions.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`btn btn-sm ${answers[index]?.selectedAnswer !== null
                                            ? 'btn-success'
                                            : index === currentQuestionIndex
                                                ? 'btn-primary'
                                                : 'btn-outline-secondary'
                                            }`}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        style={{ width: '40px', height: '40px' }}
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
