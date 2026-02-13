import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCode, FiServer, FiLayers, FiUsers, FiBriefcase, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const InterviewRolePage = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('');
    const [difficulty, setDifficulty] = useState('');
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

    const difficultyLevels = [
        { value: 'easy', label: 'Easy', emoji: '🟢', description: 'Beginner-friendly questions' },
        { value: 'medium', label: 'Medium', emoji: '🟡', description: 'Intermediate level' },
        { value: 'hard', label: 'Hard', emoji: '🔴', description: 'Advanced challenges' }
    ];

    const handleStartInterview = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.post('http://localhost:5000/api/interview/start', {
                role: selectedRole,
                difficulty: difficulty
            });

            // Navigate to interview page with session data
            navigate('/interview/start', {
                state: {
                    sessionId: response.data.sessionId,
                    questions: response.data.questions,
                    role: response.data.role,
                    difficulty: response.data.difficulty,
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

    const getSelectedRoleData = () => {
        return roles.find(r => r.id === selectedRole);
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    {/* Header */}
                    <div className="text-center mb-5">
                        <h1 className="fw-bold gradient-text mb-3">Select Interview Role</h1>
                        <p className="text-muted fs-5">
                            Choose a role and difficulty to start your interview session
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

                    {/* Step 1: Role Selection */}
                    {!selectedRole && (
                        <div className="row g-4">
                            {roles.map((role) => {
                                const Icon = role.icon;
                                return (
                                    <div key={role.id} className="col-md-6">
                                        <div
                                            className="card h-100 border-0 shadow-sm hover-lift"
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={() => setSelectedRole(role.id)}
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
                    )}

                    {/* Step 2: Difficulty Selection */}
                    {selectedRole && (
                        <div>
                            {/* Selected Role Display */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <div
                                                className="rounded-circle p-3 me-3"
                                                style={{
                                                    backgroundColor: `${getSelectedRoleData().color}15`,
                                                    border: `2px solid ${getSelectedRoleData().color}`
                                                }}
                                            >
                                                {React.createElement(getSelectedRoleData().icon, {
                                                    size: 32,
                                                    color: getSelectedRoleData().color
                                                })}
                                            </div>
                                            <div>
                                                <h5 className="mb-1 fw-bold">{getSelectedRoleData().name}</h5>
                                                <p className="text-muted mb-0 small">{getSelectedRoleData().description}</p>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => {
                                                setSelectedRole('');
                                                setDifficulty('');
                                            }}
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Difficulty Selection */}
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-4">Select Difficulty Level</h5>
                                    <div className="row g-3">
                                        {difficultyLevels.map((level) => (
                                            <div key={level.value} className="col-md-4">
                                                <div
                                                    className={`card h-100 border-2 ${difficulty === level.value
                                                            ? 'border-primary'
                                                            : 'border-light'
                                                        }`}
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        transform: difficulty === level.value ? 'scale(1.05)' : 'scale(1)'
                                                    }}
                                                    onClick={() => setDifficulty(level.value)}
                                                >
                                                    <div className="card-body text-center p-4">
                                                        <div className="mb-3">
                                                            <span style={{ fontSize: '3rem' }}>{level.emoji}</span>
                                                        </div>
                                                        <h5 className="fw-bold mb-2">
                                                            {level.label}
                                                            {difficulty === level.value && (
                                                                <FiCheckCircle
                                                                    className="ms-2 text-primary"
                                                                    size={20}
                                                                />
                                                            )}
                                                        </h5>
                                                        <p className="text-muted small mb-0">{level.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Start Interview Button */}
                                    <div className="text-center mt-4">
                                        <button
                                            className="btn btn-primary btn-lg px-5"
                                            disabled={!difficulty || loading}
                                            onClick={handleStartInterview}
                                            style={{
                                                opacity: !difficulty ? 0.5 : 1,
                                                cursor: !difficulty ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Starting...
                                                </>
                                            ) : (
                                                <>
                                                    Start Interview
                                                    <FiArrowRight className="ms-2" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewRolePage;
