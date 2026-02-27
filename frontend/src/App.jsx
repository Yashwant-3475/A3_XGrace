import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import InterviewRolePage from './pages/InterviewRolePage.jsx';
import InterviewPage from './pages/InterviewPage.jsx';
import InterviewResultPage from './pages/InterviewResultPage.jsx';
import InterviewReportPage from './pages/InterviewReportPage.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminPage from './pages/AdminPage.jsx';
import { FiLogOut, FiLogIn, FiUserPlus, FiFileText, FiVideo, FiBarChart2, FiShield, FiMenu, FiX, FiCpu } from 'react-icons/fi';
import './App.css';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const getUserInitial = () => {
        if (user?.name) return user.name.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    };

    return (
        <nav className={`app-navbar${scrolled ? ' app-navbar--scrolled' : ''}`}>
            <div className="app-navbar__inner">
                {/* Brand */}
                <Link className="app-navbar__brand" to="/">
                    <span className="app-navbar__brand-icon">
                        <FiCpu size={22} />
                    </span>
                    <span className="app-navbar__brand-text">
                        AI<span className="app-navbar__brand-accent">Interview</span>
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="app-navbar__links">
                    {isAuthenticated ? (
                        <>
                            <Link className={`app-navbar__link${isActive('/dashboard') ? ' app-navbar__link--active' : ''}`} to="/dashboard">
                                <FiBarChart2 size={16} />
                                Dashboard
                            </Link>
                            <Link className={`app-navbar__link${isActive('/interview') ? ' app-navbar__link--active' : ''}`} to="/interview">
                                <FiVideo size={16} />
                                Mock Interview
                            </Link>
                            <Link className={`app-navbar__link${isActive('/resume-analyzer') ? ' app-navbar__link--active' : ''}`} to="/resume-analyzer">
                                <FiFileText size={16} />
                                Resume Analyzer
                            </Link>
                            {user?.role === 'admin' && (
                                <Link className={`app-navbar__link app-navbar__link--admin${isActive('/admin') ? ' app-navbar__link--active' : ''}`} to="/admin">
                                    <FiShield size={16} />
                                    Admin
                                </Link>
                            )}
                        </>
                    ) : (
                        <>
                            <Link className={`app-navbar__link${isActive('/') ? ' app-navbar__link--active' : ''}`} to="/">
                                Home
                            </Link>
                        </>
                    )}
                </div>

                {/* Right side actions */}
                <div className="app-navbar__actions">
                    {isAuthenticated ? (
                        <>
                            <div className="app-navbar__user-pill">
                                <span className="app-navbar__avatar">{getUserInitial()}</span>
                                <span className="app-navbar__username">
                                    {user?.name || user?.email?.split('@')[0] || 'User'}
                                </span>
                            </div>
                            <button className="app-navbar__btn app-navbar__btn--logout" onClick={handleLogout}>
                                <FiLogOut size={15} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link className="app-navbar__btn app-navbar__btn--ghost" to="/login">
                                <FiLogIn size={15} />
                                Login
                            </Link>
                            <Link className="app-navbar__btn app-navbar__btn--primary" to="/register">
                                <FiUserPlus size={15} />
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button className="app-navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                    {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                </button>
            </div>

            {/* Mobile dropdown */}
            <div className={`app-navbar__mobile${menuOpen ? ' app-navbar__mobile--open' : ''}`}>
                {isAuthenticated ? (
                    <>
                        <Link className={`app-navbar__mobile-link${isActive('/dashboard') ? ' active' : ''}`} to="/dashboard"><FiBarChart2 size={16} /> Dashboard</Link>
                        <Link className={`app-navbar__mobile-link${isActive('/interview') ? ' active' : ''}`} to="/interview"><FiVideo size={16} /> Mock Interview</Link>
                        <Link className={`app-navbar__mobile-link${isActive('/resume-analyzer') ? ' active' : ''}`} to="/resume-analyzer"><FiFileText size={16} /> Resume Analyzer</Link>
                        {user?.role === 'admin' && (
                            <Link className={`app-navbar__mobile-link app-navbar__mobile-link--admin${isActive('/admin') ? ' active' : ''}`} to="/admin"><FiShield size={16} /> Admin Panel</Link>
                        )}
                        <div className="app-navbar__mobile-divider" />
                        <button className="app-navbar__mobile-logout" onClick={handleLogout}><FiLogOut size={16} /> Logout</button>
                    </>
                ) : (
                    <>
                        <Link className={`app-navbar__mobile-link${isActive('/') ? ' active' : ''}`} to="/">Home</Link>
                        <Link className={`app-navbar__mobile-link${isActive('/login') ? ' active' : ''}`} to="/login"><FiLogIn size={16} /> Login</Link>
                        <Link className={`app-navbar__mobile-link${isActive('/register') ? ' active' : ''}`} to="/register"><FiUserPlus size={16} /> Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const App = () => {
    return (
        <>
            <Navbar />
            <div className="app-content">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            <ProtectedRoute>
                                <HistoryPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/resume-analyzer"
                        element={
                            <ProtectedRoute>
                                <ResumeAnalyzerPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/interview"
                        element={
                            <ProtectedRoute>
                                <InterviewRolePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/interview/start"
                        element={
                            <ProtectedRoute>
                                <InterviewPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/interview/result"
                        element={
                            <ProtectedRoute>
                                <InterviewResultPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/interview/report"
                        element={
                            <ProtectedRoute>
                                <InterviewReportPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminPage />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </div>
        </>
    );
};

export default App;
