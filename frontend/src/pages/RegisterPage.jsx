import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Simple register page that talks to the backend API.
// It sends name/email/password and can log the user in immediately (store token)
// and redirect to the dashboard.
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
            // Call the backend register API
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password,
            });

            const { token, user } = response.data;

            // Option 1: automatically log the user in after registration
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setSuccess('Account created successfully! Redirecting...');

            // Redirect to dashboard after a short delay so the user can see the message
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
        <div className="row justify-content-center">
            <div className="col-md-4">
                <h2 className="mb-3 text-center">Register</h2>

                {/* Basic error and success messages */}
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="registerName" className="form-label">
                            Name
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
                            Email
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
                    <div className="mb-3">
                        <label htmlFor="registerPassword" className="form-label">
                            Password
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
                    <button type="submit" className="btn btn-success w-100" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;


