import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiVideo, FiFileText, FiArrowRight, FiTrendingUp, FiClock, FiCpu, FiVolume2, FiBarChart2, FiUserPlus, FiCheckCircle } from 'react-icons/fi';
import '../HomePage.css';
import appLogo from '../assets/app-logo.png';
import Particles from '../components/Particles';


const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <section className="hero-section">
                {/* Particles background */}
                <Particles
                    particleCount={200}
                    particleSpread={10}
                    speed={0.1}
                    particleColors={["#a78bfa", "#7c3aed", "#ffffff"]}
                    moveParticlesOnHover={false}
                    particleHoverFactor={1}
                    alphaParticles={true}
                    particleBaseSize={80}
                    sizeRandomness={1}
                    cameraDistance={20}
                    disableRotation={false}
                    className="hero-particles"
                />
                <div className="hero-content">
                    {/* Platform Logo */}
                    <div className="hero-logo-wrapper">
                        <img
                            src={appLogo}
                            alt="AI Interview Platform Logo"
                            className="hero-logo"
                        />
                    </div>

                    {/* Hero badge */}
                    <div className="hero-badge" aria-hidden="true">
                        <span className="hero-badge-dot"></span>
                        AI-Powered Platform
                    </div>

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

                    {/* Feature pills — compact visual summary inside hero */}
                    <div className="hero-features" aria-hidden="true">
                        <span className="hero-feature-pill"><FiVideo size={13} /> Mock Interviews</span>
                        <span className="hero-feature-pill"><FiFileText size={13} /> Resume Analyzer</span>
                        <span className="hero-feature-pill"><FiTrendingUp size={13} /> Performance Tracking</span>
                        <span className="hero-feature-pill"><FiClock size={13} /> Interview History</span>
                    </div>
                </div>
            </section>


            <section className="features-section">
                <div className="container">
                    <h2 className="features-title">Everything You Need to Succeed</h2>
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <FiVideo className="feature-icon" />
                                </div>
                                <h3 className="feature-heading">MCQ Mock Interviews</h3>
                                <p className="feature-description">
                                    Take role-based multiple choice interviews across Frontend, Backend, MERN, HR and Aptitude tracks.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <FiCpu className="feature-icon" />
                                </div>
                                <h3 className="feature-heading">AI Text Interview</h3>
                                <p className="feature-description">
                                    Answer open-ended questions and get scored and evaluated in real-time by AI.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <FiFileText className="feature-icon" />
                                </div>
                                <h3 className="feature-heading">Resume Analyzer</h3>
                                <p className="feature-description">
                                    Optimize your resume with AI-powered insights, scoring, and recommendations.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <FiVolume2 className="feature-icon" />
                                </div>
                                <h3 className="feature-heading">Voice-Assisted Questions</h3>
                                <p className="feature-description">
                                    Every interview question is read aloud automatically — feel the real interview pressure.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <FiBarChart2 className="feature-icon" />
                                </div>
                                <h3 className="feature-heading">Performance Dashboard</h3>
                                <p className="feature-description">
                                    Monitor your scores and accuracy with detailed charts and improvement metrics.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <FiClock className="feature-icon" />
                                </div>
                                <h3 className="feature-heading">Interview History</h3>
                                <p className="feature-description">
                                    Review every past session with full Q&amp;A details and AI feedback reports.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How It Works ────────────────────────────────────── */}
            <section className="how-section">
                <div className="container">
                    <h2 className="features-title">How It Works</h2>
                    <p className="how-subtitle">Get started in four simple steps</p>
                    <div className="how-steps">
                        <div className="how-step">
                            <div className="how-step__number">1</div>
                            <div className="how-step__icon-wrap">
                                <FiUserPlus size={28} />
                            </div>
                            <h4 className="how-step__title">Create Your Account</h4>
                            <p className="how-step__desc">Sign up for free in seconds. No credit card required.</p>
                        </div>

                        <div className="how-connector" aria-hidden="true">
                            <span /><span /><span />
                        </div>

                        <div className="how-step">
                            <div className="how-step__number">2</div>
                            <div className="how-step__icon-wrap">
                                <FiCpu size={28} />
                            </div>
                            <h4 className="how-step__title">Practice Interviews</h4>
                            <p className="how-step__desc">Choose MCQ or AI text interviews by role and difficulty level.</p>
                        </div>

                        <div className="how-connector" aria-hidden="true">
                            <span /><span /><span />
                        </div>

                        <div className="how-step">
                            <div className="how-step__number">3</div>
                            <div className="how-step__icon-wrap">
                                <FiFileText size={28} />
                            </div>
                            <h4 className="how-step__title">Analyze Your Resume</h4>
                            <p className="how-step__desc">Get AI-powered resume feedback and tips to stand out to recruiters.</p>
                        </div>

                        <div className="how-connector" aria-hidden="true">
                            <span /><span /><span />
                        </div>

                        <div className="how-step">
                            <div className="how-step__number">4</div>
                            <div className="how-step__icon-wrap">
                                <FiCheckCircle size={28} />
                            </div>
                            <h4 className="how-step__title">Track &amp; Improve</h4>
                            <p className="how-step__desc">Review AI feedback, scores and charts to improve every session.</p>
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

            {/* ── Footer ──────────────────────────────────────────── */}
            <footer className="home-footer">
                <div className="home-footer__inner">
                    <div className="home-footer__brand">
                        <FiCpu size={18} style={{ color: '#a78bfa', marginRight: '8px' }} />
                        <span>AI Interview Platform</span>
                    </div>
                    <div className="home-footer__copy">
                        &copy; {new Date().getFullYear()} AI Interview Platform. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
