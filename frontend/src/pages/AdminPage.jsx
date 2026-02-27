import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    FiGrid, FiUsers, FiList, FiDatabase,
    FiActivity, FiMessageSquare,
} from 'react-icons/fi';
import './Admin.css';

const BACKEND_URL = 'http://localhost:5000';

// ─── Sidebar nav items ─────────────────────────────────────────────────────
const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', Icon: FiGrid },
    { key: 'users', label: 'Users', Icon: FiUsers },
    { key: 'questions', label: 'Questions', Icon: FiList },
];

// ─── Dashboard Tab ─────────────────────────────────────────────────────────
const DashboardTab = ({ token }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios
            .get(`${BACKEND_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((r) => setStats(r.data))
            .catch(() => setError('Failed to load stats. Make sure your account has admin privileges.'))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner-border spinner-border-sm" role="status" />
                Loading stats…
            </div>
        );
    }
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <>
            <div className="admin-stat-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon purple">
                        <FiUsers size={22} color="white" />
                    </div>
                    <div>
                        <div className="admin-stat-value">{stats.totalUsers}</div>
                        <div className="admin-stat-label">Total Users</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon teal">
                        <FiMessageSquare size={22} color="white" />
                    </div>
                    <div>
                        <div className="admin-stat-value">{stats.totalQuestions}</div>
                        <div className="admin-stat-label">Questions</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon orange">
                        <FiActivity size={22} color="white" />
                    </div>
                    <div>
                        <div className="admin-stat-value">{stats.totalSessions}</div>
                        <div className="admin-stat-label">Interview Sessions</div>
                    </div>
                </div>
            </div>

            <div className="admin-table-card">
                <div className="admin-table-header">
                    <h3><FiDatabase className="me-2" size={16} />Platform Overview</h3>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Registered Users</td><td>{stats.totalUsers}</td></tr>
                        <tr><td>Question Bank Size</td><td>{stats.totalQuestions}</td></tr>
                        <tr><td>Total Interview Sessions</td><td>{stats.totalSessions}</td></tr>
                        <tr>
                            <td>Avg. Sessions per User</td>
                            <td>
                                {stats.totalUsers > 0
                                    ? (stats.totalSessions / stats.totalUsers).toFixed(1)
                                    : '—'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
};

// ─── Users Tab ──────────────────────────────────────────────────────────────
const UsersTab = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios
            .get(`${BACKEND_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((r) => setUsers(r.data))
            .catch(() => setError('Failed to load users.'))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner-border spinner-border-sm" role="status" />
                Loading users…
            </div>
        );
    }
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-table-card">
            <div className="admin-table-header">
                <h3><FiUsers className="me-2" size={16} />All Users</h3>
                <span className="admin-count-badge">{users.length} total</span>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center py-4 text-muted">
                                No users found.
                            </td>
                        </tr>
                    ) : (
                        users.map((u, i) => (
                            <tr key={u._id}>
                                <td className="text-muted">{i + 1}</td>
                                <td style={{ fontWeight: 600 }}>{u.name}</td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                                </td>
                                <td className="text-muted">
                                    {new Date(u.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'short', day: 'numeric',
                                    })}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

// ─── Questions Tab ──────────────────────────────────────────────────────────
const QuestionsTab = ({ token }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios
            .get(`${BACKEND_URL}/api/admin/questions`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((r) => setQuestions(r.data))
            .catch(() => setError('Failed to load questions.'))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner-border spinner-border-sm" role="status" />
                Loading questions…
            </div>
        );
    }
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-table-card">
            <div className="admin-table-header">
                <h3><FiList className="me-2" size={16} />All Questions</h3>
                <span className="admin-count-badge">{questions.length} total</span>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Question</th>
                        <th>Role</th>
                        <th>Category</th>
                        <th>Difficulty</th>
                    </tr>
                </thead>
                <tbody>
                    {questions.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center py-4 text-muted">
                                No questions found.
                            </td>
                        </tr>
                    ) : (
                        questions.map((q, i) => (
                            <tr key={q._id}>
                                <td className="text-muted">{i + 1}</td>
                                <td style={{ maxWidth: 360, fontSize: '0.88rem' }}>
                                    {q.question.length > 90
                                        ? q.question.slice(0, 90) + '…'
                                        : q.question}
                                </td>
                                <td style={{ textTransform: 'capitalize' }}>{q.role}</td>
                                <td style={{ textTransform: 'capitalize' }}>{q.category}</td>
                                <td>
                                    <span className={`diff-badge ${q.difficulty}`}>
                                        {q.difficulty}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

// ─── Main AdminPage ─────────────────────────────────────────────────────────
const AdminPage = () => {
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    const TAB_META = {
        dashboard: { title: 'Dashboard', subtitle: 'Platform-wide overview and statistics' },
        users: { title: 'Users', subtitle: 'All registered users on the platform' },
        questions: { title: 'Questions', subtitle: 'Full question bank across all roles' },
    };
    const { title, subtitle } = TAB_META[activeTab];

    return (
        <div className="admin-layout">
            {/* ── Sidebar ── */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <h2>Admin Panel</h2>
                    <span>{user?.name || 'Administrator'}</span>
                </div>

                <nav>
                    {NAV_ITEMS.map(({ key, label, Icon }) => (
                        <button
                            key={key}
                            className={`admin-nav-item ${activeTab === key ? 'active' : ''}`}
                            onClick={() => setActiveTab(key)}
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ── Main Content ── */}
            <main className="admin-main">
                <h1 className="admin-page-title">{title}</h1>
                <p className="admin-page-subtitle">{subtitle}</p>

                {activeTab === 'dashboard' && <DashboardTab token={token} />}
                {activeTab === 'users' && <UsersTab token={token} />}
                {activeTab === 'questions' && <QuestionsTab token={token} />}
            </main>
        </div>
    );
};

export default AdminPage;
