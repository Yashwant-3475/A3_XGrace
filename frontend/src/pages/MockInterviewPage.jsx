import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiVideo, FiArrowRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const MockInterviewPage = () => {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [currentAnswer, setCurrentAnswer] = useState('');

    // Predefined correct answers/keywords for each question
    const questionKeywords = {
        0: ['react', 'library', 'javascript', 'ui', 'component'],
        1: ['virtual dom', 'performance', 'reconciliation', 'diffing'],
        2: ['state', 'data', 'component', 'mutable', 'setstate'],
        3: ['props', 'properties', 'parent', 'child', 'immutable'],
        4: ['useeffect', 'side effects', 'lifecycle', 'hook'],
        5: ['usestate', 'state', 'hook', 'functional component'],
        6: ['jsx', 'javascript xml', 'syntax', 'extension'],
        7: ['component', 'reusable', 'independent', 'building block'],
        8: ['key', 'unique', 'identifier', 'list', 'reconciliation'],
        9: ['event handling', 'onclick', 'onchange', 'synthetic events']
    };

    // Fetch interview questions
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:5000/api/interview/questions'
                );
                setQuestions(response.data || []);
            } catch (err) {
                console.error(err);
                setError('Failed to load interview questions.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    // Load saved answer when changing questions
    useEffect(() => {
        setCurrentAnswer(userAnswers[currentIndex] || '');
    }, [currentIndex, userAnswers]);

    const handleAnswerChange = (e) => {
        setCurrentAnswer(e.target.value);
    };

    const handleNext = () => {
        // Save current answer
        setUserAnswers((prev) => ({
            ...prev,
            [currentIndex]: currentAnswer
        }));

        // Move to next question
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const checkAnswer = (questionIndex, answer) => {
        // Get keywords for this question
        const keywords = questionKeywords[questionIndex] || [];

        // Convert answer to lowercase for case-insensitive matching
        const lowerAnswer = answer.toLowerCase();

        // Check if answer contains any of the keywords
        const hasKeyword = keywords.some(keyword =>
            lowerAnswer.includes(keyword.toLowerCase())
        );

        return hasKeyword;
    };

    const handleFinishInterview = async () => {
        try {
            setSubmitting(true);

            // Save final answer
            const finalAnswers = {
                ...userAnswers,
                [currentIndex]: currentAnswer
            };

            // Calculate results
            const totalQuestions = questions.length;
            let correctAnswers = 0;
            let attemptedQuestions = 0;

            // Check each answer
            for (let i = 0; i < totalQuestions; i++) {
                const answer = finalAnswers[i] || '';

                if (answer.trim() !== '') {
                    attemptedQuestions++;

                    // Check if answer is correct based on keywords
                    if (checkAnswer(i, answer)) {
                        correctAnswers++;
                    }
                }
            }

            const score = correctAnswers;
            const accuracy = totalQuestions > 0
                ? Math.round((correctAnswers / totalQuestions) * 100)
                : 0;

            const token = localStorage.getItem('authToken');

            await axios.post('http://localhost:5000/api/results', {
                score,
                totalQuestions,
                correctAnswers,
                attemptedQuestions,
                accuracy,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Redirect to dashboard after saving
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to save result:', err);
            alert('Failed to save interview result.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted fw-semibold">Loading interview questions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger d-flex align-items-center">
                <FiAlertCircle className="me-2" size={24} />
                {error}
            </div>
        );
    }

    if (!questions.length) {
        return (
            <div className="alert alert-info d-flex align-items-center">
                <FiAlertCircle className="me-2" size={24} />
                No interview questions available.
            </div>
        );
    }

    const isLastQuestion = currentIndex === questions.length - 1;
    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isAnswerEmpty = currentAnswer.trim() === '';

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-9 col-lg-8">
                    <div className="text-center mb-4">
                        <div className="d-inline-block p-3 rounded-circle mb-3"
                            style={{ background: 'var(--primary-color)' }}>
                            <FiVideo size={32} color="white" />
                        </div>
                        <h2 className="fw-bold gradient-text">Mock Interview</h2>
                        <p className="text-muted">
                            Question <strong>{currentIndex + 1}</strong> of <strong>{questions.length}</strong>
                        </p>

                        {/* Progress bar */}
                        <div className="progress" style={{ height: '8px' }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${progress}%` }}
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                    </div>

                    <div className="card shadow-lg border-0">
                        <div className="card-body p-5">
                            <div className="d-flex align-items-start mb-4">
                                <div className="me-3 mt-1">
                                    <div className="d-flex align-items-center justify-content-center rounded-circle"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            background: 'var(--primary-color)'
                                        }}>
                                        <span className="text-white fw-bold">Q</span>
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <h4 className="mb-0 fw-semibold" style={{ lineHeight: '1.6' }}>
                                        {currentQuestion}
                                    </h4>
                                </div>
                            </div>

                            {/* Answer textarea */}
                            <div className="mt-4">
                                <label htmlFor="answer" className="form-label fw-semibold">
                                    Your Answer:
                                </label>
                                <textarea
                                    id="answer"
                                    className="form-control"
                                    rows="6"
                                    placeholder="Type your answer here..."
                                    value={currentAnswer}
                                    onChange={handleAnswerChange}
                                    style={{
                                        resize: 'vertical',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6'
                                    }}
                                ></textarea>
                            </div>

                            <div className="d-flex justify-content-end mt-5 pt-4 border-top">
                                {!isLastQuestion ? (
                                    <button
                                        className="btn btn-primary btn-lg d-flex align-items-center"
                                        onClick={handleNext}
                                        disabled={isAnswerEmpty}
                                    >
                                        Next Question
                                        <FiArrowRight className="ms-2" size={20} />
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-success btn-lg d-flex align-items-center"
                                        onClick={handleFinishInterview}
                                        disabled={submitting || isAnswerEmpty}
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FiCheckCircle className="me-2" size={20} />
                                                Finish Interview
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockInterviewPage;
