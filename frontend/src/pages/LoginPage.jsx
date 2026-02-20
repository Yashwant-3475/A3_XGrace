import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiMail, FiLogIn } from 'react-icons/fi';
import './Auth.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

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
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });

            const { token, user } = response.data;

            login(token);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/dashboard');
        } catch (err) {
            const message =
                err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="text-center mb-4">
                    <div className="auth-icon-wrapper">
                        <FiLock size={36} color="white" />
                    </div>
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to continue your journey</p>
                </div>

                {error && <div className="alert alert-danger auth-alert mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="mb-3">
                        <label htmlFor="loginEmail" className="form-label">
                            <FiMail className="me-2" size={16} /> Email
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
                            <FiLock className="me-2" size={16} /> Password
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
                        className="btn auth-submit-btn w-100 d-flex align-items-center justify-content-center"
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
                    <p className="auth-footer-text">
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

