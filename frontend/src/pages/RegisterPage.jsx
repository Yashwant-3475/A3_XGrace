import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUserPlus, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './Auth.css';

// Yup validation schema for registration
const registerSchema = Yup.object({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters.')
        .max(50, 'Name must be at most 50 characters.')
        .required('Name is required.'),
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

const RegisterPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
        },
        validationSchema: registerSchema,
        onSubmit: async (values) => {
            setServerError('');
            setSuccess('');
            setLoading(true);
            try {
                const response = await axios.post('http://localhost:5000/api/auth/register', {
                    name: values.name,
                    email: values.email,
                    password: values.password,
                });

                const { token, user } = response.data;

                // Register immediately logs the user in
                login(token, user);

                setSuccess('Account created successfully! Redirecting...');

                setTimeout(() => {
                    navigate('/dashboard');
                }, 800);
            } catch (err) {
                const message =
                    err.response?.data?.message || 'Registration failed. Please try again.';
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
                        <FiUserPlus size={36} color="white" />
                    </div>
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Join us and start your interview prep</p>
                </div>

                {serverError && (
                    <div className="alert alert-danger auth-alert mb-3">{serverError}</div>
                )}
                {success && (
                    <div className="alert alert-success auth-alert mb-3">{success}</div>
                )}

                <form onSubmit={formik.handleSubmit} className="auth-form" noValidate>
                    {/* Name Field */}
                    <div className="mb-3">
                        <label htmlFor="registerName" className="form-label">
                            <FiUser className="me-2" size={16} /> Name
                        </label>
                        <input
                            type="text"
                            id="registerName"
                            name="name"
                            className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''
                                }`}
                            placeholder="Enter your name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <div className="invalid-feedback">{formik.errors.name}</div>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="mb-3">
                        <label htmlFor="registerEmail" className="form-label">
                            <FiMail className="me-2" size={16} /> Email
                        </label>
                        <input
                            type="email"
                            id="registerEmail"
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
                        <label htmlFor="registerPassword" className="form-label">
                            <FiLock className="me-2" size={16} /> Password
                        </label>
                        <input
                            type="password"
                            id="registerPassword"
                            name="password"
                            className={`form-control ${formik.touched.password && formik.errors.password
                                ? 'is-invalid'
                                : ''
                                }`}
                            placeholder="Create a password"
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
                        <Link to="/login" className="auth-link">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
