import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import MockInterviewPage from './pages/MockInterviewPage.jsx';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import InterviewRolePage from './pages/InterviewRolePage.jsx';
import InterviewPage from './pages/InterviewPage.jsx';
import InterviewResultPage from './pages/InterviewResultPage.jsx';
import InterviewReportPage from './pages/InterviewReportPage.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { FiHome, FiLogOut, FiLogIn, FiUserPlus, FiFileText, FiVideo, FiBarChart2 } from 'react-icons/fi';
import './App.css';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 sticky-top">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <FiHome className="me-2" size={24} />
                    Interview Preparation
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <div className="navbar-nav ms-auto align-items-center">
                        {isAuthenticated ? (
                            <>
                                <Link className="nav-link d-flex align-items-center" to="/dashboard">
                                    <FiBarChart2 className="me-1" size={18} />
                                    Dashboard
                                </Link>
                                <Link className="nav-link d-flex align-items-center" to="/interview">
                                    <FiVideo className="me-1" size={18} />
                                    Mock Interview
                                </Link>
                                <Link className="nav-link d-flex align-items-center" to="/resume-analyzer">
                                    <FiFileText className="me-1" size={18} />
                                    Resume Analyzer
                                </Link>
                                <button
                                    className="btn btn-outline-danger ms-2 d-flex align-items-center"
                                    onClick={handleLogout}
                                >
                                    <FiLogOut className="me-1" size={18} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link className="nav-link d-flex align-items-center" to="/">
                                    <FiHome className="me-1" size={18} />
                                    Home
                                </Link>
                                <Link className="nav-link d-flex align-items-center" to="/login">
                                    <FiLogIn className="me-1" size={18} />
                                    Login
                                </Link>
                                <Link className="nav-link d-flex align-items-center" to="/register">
                                    <FiUserPlus className="me-1" size={18} />
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </nav>
    );
};

const App = () => {
    return (
        <>
            <Navbar />
            <div className="container">
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
                        path="/mock-interview"
                        element={
                            <ProtectedRoute>
                                <MockInterviewPage />
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
                </Routes>
            </div>
        </>
    );
};

export default App;
