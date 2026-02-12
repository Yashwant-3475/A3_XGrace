import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCode, FiServer, FiLayers, FiUsers, FiBriefcase, FiArrowRight } from 'react-icons/fi';

const InterviewRolePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const roles = [
        {
            id: 'frontend',
            name: 'Frontend',
            icon: FiCode,
            description: 'React, JavaScript, CSS, HTML',
            color: '#3b82f6'
        },
        {
            id: 'backend',
            name: 'Backend',
            icon: FiServer,
            description: 'Node.js, Express, MongoDB, APIs',
            color: '#10b981'
        },
        {
            id: 'mern',
            name: 'MERN Stack',
            icon: FiLayers,
            description: 'Full-stack MERN development',
            color: '#8b5cf6'
        },
        {
            id: 'hr',
            name: 'HR Interview',
            icon: FiUsers,
            description: 'Behavioral & situational questions',
            color: '#f59e0b'
        },
        {
            id: 'aptitude',
            name: 'Aptitude',
            icon: FiBriefcase,
            description: 'Logical reasoning & problem-solving',
            color: '#ef4444'
        }
    ];

    const handleRoleSelect = async (role) => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.post('http://localhost:5000/api/interview/start', {
                role: role
            });

            // Navigate to interview page with session data
            navigate('/interview/start', {
                state: {
                    sessionId: response.data.sessionId,
                    questions: response.data.questions,
                    role: response.data.role,
                    totalQuestions: response.data.totalQuestions
                }
            });

        } catch (err) {
            console.error('Error starting interview:', err);
            setError(err.response?.data?.message || 'Failed to start interview. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    {/* Header */}
                    <div className="text-center mb-5">
                        <h1 className="fw-bold gradient-text mb-3">Select Interview Role</h1>
                        <p className="text-muted fs-5">
                            Choose a role to start your interview session with 10 random questions
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            {error}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setError('')}
                            ></button>
                        </div>
                    )}

                    {/* Role Cards Grid */}
                    <div className="row g-4">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            return (
                                <div key={role.id} className="col-md-6">
                                    <div
                                        className="card h-100 border-0 shadow-sm hover-lift"
                                        style={{
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            opacity: loading ? 0.6 : 1
                                        }}
                                        onClick={() => !loading && handleRoleSelect(role.id)}
                                    >
                                        <div className="card-body p-4">
                                            <div className="d-flex align-items-center mb-3">
                                                <div
                                                    className="rounded-circle p-3 me-3"
                                                    style={{
                                                        backgroundColor: `${role.color}15`,
                                                        border: `2px solid ${role.color}`
                                                    }}
                                                >
                                                    <Icon size={32} color={role.color} />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h4 className="mb-1 fw-bold">{role.name}</h4>
                                                    <p className="text-muted mb-0 small">{role.description}</p>
                                                </div>
                                                <FiArrowRight size={24} style={{ color: role.color }} />
                                            </div>
                                            <div className="mt-3 pt-3 border-top">
                                                <div className="d-flex justify-content-between text-muted small">
                                                    <span>📝 10 Questions</span>
                                                    <span>⏱️ ~15 min</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center mt-5">
                            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted fw-semibold">Preparing your interview...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewRolePage;
