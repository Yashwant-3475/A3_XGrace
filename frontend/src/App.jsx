import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import MockInterviewPage from './pages/MockInterviewPage.jsx';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
            <div className="container">
                <a className="navbar-brand" href="/">
                    Interview Prep
                </a>
                <div className="navbar-nav align-items-center">
                    {isAuthenticated ? (
                        <>
                            <a className="nav-link" href="/mock-interview">
                                Mock Interview
                            </a>
                            <a className="nav-link" href="/resume-analyzer">
                                Resume Analyzer
                            </a>
                            <button
                                className="btn btn-outline-danger ms-2"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <a className="nav-link" href="/login">Login</a>
                            <a className="nav-link" href="/register">Register</a>
                        </>
                    )}
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
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
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
                </Routes>
            </div>
        </>
    );
};

export default App;
