import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiLogIn } from 'react-icons/fi';

// Simple login page that talks to the backend API.
// It sends email/password, stores the JWT on success, and redirects to the dashboard.
const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Local state for showing basic error/success messages
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            // Call the backend login API
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });

            // The backend returns a token and user object
            const { token, user } = response.data;

            // Save the token (and optionally user info) to localStorage
            login(token);
            localStorage.setItem('user', JSON.stringify(user));


            // Redirect the user to the dashboard
            navigate('/dashboard');
        } catch (err) {
            // If the server sent a message, show it. Otherwise show a generic one.
            const message =
                err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-5 col-lg-4">
                <div className="card shadow-lg border-0">
                    <div className="card-body p-5">
                        <div className="text-center mb-4">
                            <div className="d-inline-block p-3 rounded-circle mb-3"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <FiLock size={32} color="white" />
                            </div>
                            <h2 className="fw-bold gradient-text">Welcome Back</h2>
                            <p className="text-muted">Sign in to continue your journey</p>
                        </div>

                        {/* Show a simple error message if something goes wrong */}
                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="loginEmail" className="form-label">
                                    <FiMail className="me-1" /> Email
                                </label>
                                <input
                                    type="email"
                                    id="loginEmail"
                                    name="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="loginPassword" className="form-label">
                                    <FiLock className="me-1" /> Password
                                </label>
                                <input
                                    type="password"
                                    id="loginPassword"
                                    name="password"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <FiLogIn className="me-2" />
                                        Login
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-4">
                            <p className="text-muted mb-0">
                                Don't have an account?{' '}
                                <a href="/register" className="fw-semibold" style={{ color: '#667eea', textDecoration: 'none' }}>
                                    Sign up
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
