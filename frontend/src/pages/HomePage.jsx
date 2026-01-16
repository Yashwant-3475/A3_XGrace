import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiVideo, FiFileText, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import '../HomePage.css';

// Public Landing Page for non-logged-in users
// Displays platform features and CTAs to login or register
const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        AI Interview Prep Platform
                    </h1>
                    <p className="hero-subtitle">
                        Master your interviews with AI-powered mock interviews and intelligent resume analysis
                    </p>
                    <div className="hero-cta">
                        <button
                            className="btn btn-primary btn-lg cta-button"
                            onClick={() => navigate('/login')}
                        >
                            Login
                            <FiArrowRight className="ms-2" />
                        </button>
                        <button
                            className="btn btn-outline-primary btn-lg cta-button"
                            onClick={() => navigate('/register')}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="features-title">What We Offer</h2>
                    <div className="row g-4">
                        {/* Mock Interview Feature */}
                        <div className="col-md-6">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <FiVideo className="feature-icon" size={40} />
                                </div>
                                <h3 className="feature-heading">AI Mock Interviews</h3>
                                <p className="feature-description">
                                    Practice with AI-powered mock interviews tailored to your target role.
                                    Get real-time feedback, improve your answers, and track your progress.
                                </p>
                                <ul className="feature-list">
                                    <li>
                                        <FiCheckCircle className="check-icon" />
                                        Personalized interview questions
                                    </li>
                                    <li>
                                        <FiCheckCircle className="check-icon" />
                                        Real-time AI feedback
                                    </li>
                                    <li>
                                        <FiCheckCircle className="check-icon" />
                                        Performance analytics
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Resume Analyzer Feature */}
                        <div className="col-md-6">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <FiFileText className="feature-icon" size={40} />
                                </div>
                                <h3 className="feature-heading">Resume Analyzer</h3>
                                <p className="feature-description">
                                    Upload your resume and get instant AI-powered insights.
                                    Optimize your resume with intelligent suggestions and industry best practices.
                                </p>
                                <ul className="feature-list">
                                    <li>
                                        <FiCheckCircle className="check-icon" />
                                        ATS compatibility check
                                    </li>
                                    <li>
                                        <FiCheckCircle className="check-icon" />
                                        Keyword optimization
                                    </li>
                                    <li>
                                        <FiCheckCircle className="check-icon" />
                                        Actionable recommendations
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call-to-Action Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2 className="cta-title">Ready to ace your next interview?</h2>
                    <p className="cta-text">Join hundreds of students preparing for their dream jobs</p>
                    <button
                        className="btn btn-light btn-lg"
                        onClick={() => navigate('/register')}
                    >
                        Get Started Now
                        <FiArrowRight className="ms-2" />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
