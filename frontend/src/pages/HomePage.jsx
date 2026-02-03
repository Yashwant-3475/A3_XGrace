import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiVideo, FiFileText, FiArrowRight, FiTrendingUp, FiClock } from 'react-icons/fi';
import '../HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Ace Your Next Interview with AI
                    </h1>
                    <p className="hero-subtitle">
                        Practice smarter with AI-powered mock interviews, intelligent resume analysis, and real-time performance tracking
                    </p>
                    <div className="hero-cta">
                        <button
                            className="btn btn-primary btn-lg cta-button"
                            onClick={() => navigate('/register')}
                        >
                            Get Started
                            <FiArrowRight className="ms-2" />
                        </button>
                        <button
                            className="btn btn-outline-primary btn-lg cta-button"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <div className="container">
                    <h2 className="features-title">Everything You Need to Succeed</h2>
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <FiVideo className="feature-icon" />
                                </div>
                                <h3 className="feature-heading">AI Mock Interviews</h3>
                                <p className="feature-description">
                                    Practice with personalized AI interviews and get instant feedback
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <FiFileText className="feature-icon" />
                                </div>
                                <h3 className="feature-heading">Resume Analyzer</h3>
                                <p className="feature-description">
                                    Optimize your resume with AI-powered insights and recommendations
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <FiTrendingUp className="feature-icon" />
                                </div>
                                <h3 className="feature-heading">Performance Tracking</h3>
                                <p className="feature-description">
                                    Monitor your progress with detailed analytics and improvement metrics
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <FiClock className="feature-icon" />
                                </div>
                                <h3 className="feature-heading">Interview History</h3>
                                <p className="feature-description">
                                    Review past sessions and track your improvement over time
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-content">
                    <h2 className="cta-title">Ready to Ace Your Next Interview?</h2>
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
