import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus, FiMail, FiLock, FiUser } from 'react-icons/fi';
import './Auth.css';

const RegisterPage = () => {
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const formData = new FormData(event.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password,
            });

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setSuccess('Account created successfully! Redirecting...');

            setTimeout(() => {
                navigate('/');
            }, 800);
        } catch (err) {
            const message =
                err.response?.data?.message || 'Registration failed. Please try again.';
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
                        <FiUserPlus size={36} color="white" />
                    </div>
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Join us and start your interview prep</p>
                </div>

                {error && <div className="alert alert-danger auth-alert mb-3">{error}</div>}
                {success && <div className="alert alert-success auth-alert mb-3">{success}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="mb-3">
                        <label htmlFor="registerName" className="form-label">
                            <FiUser className="me-2" size={16} /> Name
                        </label>
                        <input
                            type="text"
                            id="registerName"
                            name="name"
                            className="form-control"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="registerEmail" className="form-label">
                            <FiMail className="me-2" size={16} /> Email
                        </label>
                        <input
                            type="email"
                            id="registerEmail"
                            name="email"
                            className="form-control"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="registerPassword" className="form-label">
                            <FiLock className="me-2" size={16} /> Password
                        </label>
                        <input
                            type="password"
                            id="registerPassword"
                            name="password"
                            className="form-control"
                            placeholder="Create a password"
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
                                Creating account...
                            </>
                        ) : (
                            <>
                                <FiUserPlus className="me-2" />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p className="auth-footer-text">
                        Already have an account?{' '}
                        <a href="/login" className="auth-link">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

