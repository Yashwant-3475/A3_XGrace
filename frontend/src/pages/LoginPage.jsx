import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiMail, FiLogIn } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './Auth.css';

// Yup validation schema for login
const loginSchema = Yup.object({
    email: Yup.string()
        .email('Please enter a valid email address (e.g., user@example.com).')
        .min(6, 'Email must be at least 6 characters.')
        .max(50, 'Email must be at most 50 characters.')
        .required('Email is required.'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters.')
        .max(8, 'Password must be at most 8 characters.')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter.')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter.')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character (e.g. @, #, !).')
        .required('Password is required.'),
});

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: loginSchema,
        onSubmit: async (values) => {
            setServerError('');
            setLoading(true);
            try {
                const response = await axios.post('http://localhost:5000/api/auth/login', {
                    email: values.email,
                    password: values.password,
                });

                const { token, user } = response.data;

                login(token, user);

                // Redirect admins to their panel, regular users to dashboard
                navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
            } catch (err) {
                const message =
                    err.response?.data?.message || 'Login failed. Please check your credentials.';
                setServerError(message);
            } finally {
                setLoading(false);
            }
        },
    });

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

                {serverError && (
                    <div className="alert alert-danger auth-alert mb-4">{serverError}</div>
                )}

                <form onSubmit={formik.handleSubmit} className="auth-form" noValidate>
                    {/* Email Field */}
                    <div className="mb-3">
                        <label htmlFor="loginEmail" className="form-label">
                            <FiMail className="me-2" size={16} /> Email
                        </label>
                        <input
                            type="email"
                            id="loginEmail"
                            name="email"
                            className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''
                                }`}
                            placeholder="Enter your email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="invalid-feedback">{formik.errors.email}</div>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="mb-4">
                        <label htmlFor="loginPassword" className="form-label">
                            <FiLock className="me-2" size={16} /> Password
                        </label>
                        <input
                            type="password"
                            id="loginPassword"
                            name="password"
                            className={`form-control ${formik.touched.password && formik.errors.password
                                ? 'is-invalid'
                                : ''
                                }`}
                            placeholder="Enter your password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <div className="invalid-feedback">{formik.errors.password}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn auth-submit-btn w-100 d-flex align-items-center justify-content-center"
                        disabled={loading || formik.isSubmitting}
                    >
                        {loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
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
