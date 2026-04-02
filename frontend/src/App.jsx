import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import TextInterviewPage from './pages/TextInterviewPage.jsx';
import AiInterviewHistoryPage from './pages/AiInterviewHistoryPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminPage from './pages/AdminPage.jsx';
import { FiLogOut, FiLogIn, FiUserPlus, FiFileText, FiVideo, FiBarChart2, FiShield, FiMenu, FiX, FiCpu, FiUser, FiChevronDown } from 'react-icons/fi';
import './App.css';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location.pathname]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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

                <Link className="app-navbar__brand" to="/">
                    <span className="app-navbar__brand-icon">
                        <FiCpu size={22} />
                    </span>
                    <span className="app-navbar__brand-text">
                        AI<span className="app-navbar__brand-accent">Interview Platform</span>
                    </span>
                </Link>


                <div className="app-navbar__links">
                    {isAuthenticated ? (
                        <>
                            {user?.role !== 'admin' && (
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

                                </>
                            )}
                            {user?.role === 'admin' && (
                                <Link className={`app-navbar__link app-navbar__link--admin${isActive('/admin') ? ' app-navbar__link--active' : ''}`} to="/admin">
                                    <FiShield size={16} />
                                    Admin Panel
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


                <div className="app-navbar__actions">
                    {isAuthenticated ? (
                        <>
                            <div className="app-navbar__user-dropdown" ref={dropdownRef}>
                                <button
                                    className="app-navbar__user-pill"
                                    onClick={() => setDropdownOpen((v) => !v)}
                                    aria-haspopup="true"
                                    aria-expanded={dropdownOpen}
                                >
                                    <span className="app-navbar__avatar">{getUserInitial()}</span>
                                    <span className="app-navbar__username">
                                        {user?.name || user?.email?.split('@')[0] || 'User'}
                                    </span>
                                    <FiChevronDown size={13} style={{ opacity: 0.6, marginLeft: '2px', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                </button>
                                {dropdownOpen && (
                                    <div className="app-navbar__dropdown-menu">
                                        <Link className="app-navbar__dropdown-item" to="/profile">
                                            <FiUser size={14} />
                                            My Profile
                                        </Link>
                                        <div className="app-navbar__dropdown-divider" />
                                        <button className="app-navbar__dropdown-item app-navbar__dropdown-item--logout" onClick={handleLogout}>
                                            <FiLogOut size={14} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
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


                <button className="app-navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                    {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                </button>
            </div>


            <div className={`app-navbar__mobile${menuOpen ? ' app-navbar__mobile--open' : ''}`}>
                {isAuthenticated ? (
                    <>
                        {user?.role !== 'admin' && (
                            <>
                                <Link className={`app-navbar__mobile-link${isActive('/dashboard') ? ' active' : ''}`} to="/dashboard"><FiBarChart2 size={16} /> Dashboard</Link>
                                <Link className={`app-navbar__mobile-link${isActive('/interview') ? ' active' : ''}`} to="/interview"><FiVideo size={16} /> Mock Interview</Link>
                                <Link className={`app-navbar__mobile-link${isActive('/resume-analyzer') ? ' active' : ''}`} to="/resume-analyzer"><FiFileText size={16} /> Resume Analyzer</Link>

                                <Link className={`app-navbar__mobile-link${isActive('/profile') ? ' active' : ''}`} to="/profile"><FiUser size={16} /> My Profile</Link>
                            </>
                        )}
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
                        path="/ai-history"
                        element={
                            <ProtectedRoute>
                                <AiInterviewHistoryPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/interview/text"
                        element={
                            <ProtectedRoute>
                                <TextInterviewPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
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
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme="dark"
                toastStyle={{
                    background: 'linear-gradient(135deg, #1e1030, #2a1a4a)',
                    border: '1px solid rgba(111,45,189,0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                }}
            />
        </>
    );
};

export default App;
