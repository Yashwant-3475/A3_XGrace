import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
            navigate('/');
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
        <div className="row justify-content-center">
            <div className="col-md-4">
                <h2 className="mb-3 text-center">Login</h2>

                {/* Show a simple error message if something goes wrong */}
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="loginEmail" className="form-label">
                            Email
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
                    <div className="mb-3">
                        <label htmlFor="loginPassword" className="form-label">
                            Password
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
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;


