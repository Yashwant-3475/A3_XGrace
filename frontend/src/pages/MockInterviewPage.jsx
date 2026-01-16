import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MockInterviewPage = () => {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handleFinishInterview = async () => {
        try {
            setSubmitting(true);

            const totalQuestions = questions.length;
            const attemptedQuestions = questions.length;
            const correctAnswers = questions.length; // TEMP (logic later)
            const score = correctAnswers;
            const accuracy = Math.round(
                (correctAnswers / totalQuestions) * 100
            );

            await axios.post('http://localhost:5000/api/results', {
                score,
                totalQuestions,
                correctAnswers,
                attemptedQuestions,
                accuracy,
            });

            // Redirect to dashboard after saving
            navigate('/');
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
                <div className="spinner-border text-primary" />
                <p className="mt-2">Loading interview questions...</p>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (!questions.length) {
        return (
            <div className="alert alert-info">
                No interview questions available.
            </div>
        );
    }

    const isLastQuestion = currentIndex === questions.length - 1;
    const currentQuestion = questions[currentIndex];

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h4>Mock Interview</h4>
                            <small className="text-muted">
                                Question {currentIndex + 1} of {questions.length}
                            </small>
                        </div>

                        <div className="card-body">
                            <h5>{currentQuestion}</h5>
                        </div>

                        <div className="card-footer d-flex justify-content-end">
                            {!isLastQuestion ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleNext}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    className="btn btn-success"
                                    onClick={handleFinishInterview}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : 'Finish Interview'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockInterviewPage;
