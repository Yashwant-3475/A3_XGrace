import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
    FiGrid, FiUsers, FiList, FiDatabase,
    FiActivity, FiMessageSquare, FiTrash2,
    FiPlus, FiX, FiCpu, FiChevronUp,
    FiEye, FiDownload, FiSearch,
} from 'react-icons/fi';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import './Admin.css';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── Sidebar nav items ─────────────────────────────────────────────────────
const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', Icon: FiGrid },
    { key: 'users', label: 'Users', Icon: FiUsers },
    { key: 'questions', label: 'Question Bank', Icon: FiList },
    { key: 'ai-interviews', label: 'AI Interviews', Icon: FiCpu },
];

// ─── Confirmation Modal ─────────────────────────────────────────────────────
const ConfirmModal = ({ user, onConfirm, onCancel, isDeleting }) => (
    <div className="admin-modal-overlay" onClick={onCancel}>
        <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon">
                <FiTrash2 size={28} />
            </div>
            <h3 className="admin-modal-title">Delete Item</h3>
            <p className="admin-modal-body">
                Are you sure you want to delete{' '}
                <strong>{user.name}</strong>? This action cannot be undone.
            </p>
            <div className="admin-modal-actions">
                <button
                    className="admin-modal-btn admin-modal-btn--cancel"
                    onClick={onCancel}
                    disabled={isDeleting}
                >
                    Cancel
                </button>
                <button
                    className="admin-modal-btn admin-modal-btn--confirm"
                    onClick={onConfirm}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
            </div>
        </div>
    </div>
);

// ─── Add Question Modal ──────────────────────────────────────────────────────
const ROLES = ['frontend', 'backend', 'mern', 'hr', 'aptitude'];
const CATEGORIES = ['technical', 'hr', 'aptitude'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const addQuestionSchema = Yup.object({
    question: Yup.string().min(10, 'At least 10 characters').required('Question text is required'),
    option0: Yup.string().required('Option A is required'),
    option1: Yup.string().required('Option B is required'),
    option2: Yup.string().required('Option C is required'),
    option3: Yup.string().required('Option D is required'),
    answer: Yup.number().min(0).max(3).required('Correct answer is required'),
    difficulty: Yup.string().oneOf(DIFFICULTIES).required('Difficulty is required'),
    role: Yup.string().oneOf(ROLES).required('Role is required'),
    category: Yup.string().oneOf(CATEGORIES).required('Category is required'),
    explanation: Yup.string(),
});

const AddQuestionModal = ({ token, onAdd, onClose }) => {
    const formik = useFormik({
        initialValues: {
            question: '', option0: '', option1: '', option2: '', option3: '',
            answer: '', difficulty: '', role: '', category: '', explanation: '',
        },
        validationSchema: addQuestionSchema,
        onSubmit: async (values, { setSubmitting, setStatus }) => {
            try {
                const payload = {
                    question: values.question,
                    options: [values.option0, values.option1, values.option2, values.option3],
                    answer: Number(values.answer),
                    difficulty: values.difficulty,
                    role: values.role,
                    category: values.category,
                    explanation: values.explanation,
                };
                const { data } = await axios.post(`${BACKEND_URL}/api/admin/questions`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('New question added to the bank!');
                onAdd(data);
                onClose();
            } catch (err) {
                setStatus(err?.response?.data?.message || 'Failed to save question.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    const fe = formik.errors;
    const ft = formik.touched;

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
                <button className="admin-modal-close" onClick={onClose} title="Close"><FiX size={20} /></button>
                <h3 className="admin-modal-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <FiPlus size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Add New Question
                </h3>

                <form onSubmit={formik.handleSubmit} noValidate>
                    {/* Question text */}
                    <div className="admin-form-group">
                        <label className="admin-form-label">Question Text *</label>
                        <textarea
                            className={`admin-form-textarea ${ft.question && fe.question ? 'is-invalid' : ''}`}
                            name="question" rows={3}
                            placeholder="Enter the full question…"
                            value={formik.values.question}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {ft.question && fe.question && <div className="admin-form-error">{fe.question}</div>}
                    </div>

                    {/* Options grid */}
                    <div className="admin-form-grid-2">
                        {['A', 'B', 'C', 'D'].map((letter, i) => (
                            <div className="admin-form-group" key={i}>
                                <label className="admin-form-label">Option {letter} *</label>
                                <input
                                    className={`admin-form-input ${ft[`option${i}`] && fe[`option${i}`] ? 'is-invalid' : ''}`}
                                    type="text"
                                    name={`option${i}`}
                                    placeholder={`Option ${letter}`}
                                    value={formik.values[`option${i}`]}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {ft[`option${i}`] && fe[`option${i}`] && (
                                    <div className="admin-form-error">{fe[`option${i}`]}</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bottom selects row */}
                    <div className="admin-form-grid-2">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Correct Answer *</label>
                            <select
                                className={`admin-form-select ${ft.answer && fe.answer ? 'is-invalid' : ''}`}
                                name="answer"
                                value={formik.values.answer}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                <option value="">Select correct option</option>
                                {['A', 'B', 'C', 'D'].map((l, i) => (
                                    <option key={i} value={i}>Option {l}</option>
                                ))}
                            </select>
                            {ft.answer && fe.answer && <div className="admin-form-error">{fe.answer}</div>}
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Difficulty *</label>
                            <select
                                className={`admin-form-select ${ft.difficulty && fe.difficulty ? 'is-invalid' : ''}`}
                                name="difficulty"
                                value={formik.values.difficulty}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                <option value="">Select difficulty</option>
                                {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                            </select>
                            {ft.difficulty && fe.difficulty && <div className="admin-form-error">{fe.difficulty}</div>}
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Role *</label>
                            <select
                                className={`admin-form-select ${ft.role && fe.role ? 'is-invalid' : ''}`}
                                name="role"
                                value={formik.values.role}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                <option value="">Select role</option>
                                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                            </select>
                            {ft.role && fe.role && <div className="admin-form-error">{fe.role}</div>}
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Category *</label>
                            <select
                                className={`admin-form-select ${ft.category && fe.category ? 'is-invalid' : ''}`}
                                name="category"
                                value={formik.values.category}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                            {ft.category && fe.category && <div className="admin-form-error">{fe.category}</div>}
                        </div>
                    </div>

                    {/* Explanation (optional) */}
                    <div className="admin-form-group">
                        <label className="admin-form-label">Explanation <span style={{ color: '#9ca3af' }}>(optional)</span></label>
                        <textarea
                            className="admin-form-textarea"
                            name="explanation" rows={2}
                            placeholder="Why is this the correct answer?"
                            value={formik.values.explanation}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                    </div>

                    {formik.status && <div className="admin-form-error" style={{ marginBottom: '1rem' }}>{formik.status}</div>}

                    <div className="admin-modal-actions" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" className="admin-modal-btn admin-modal-btn--cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="admin-modal-btn btn-add-question"
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? 'Saving…' : '✚ Add Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

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
const UsersTab = ({ token, currentUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingDelete, setPendingDelete] = useState(null); // user object to delete
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        axios
            .get(`${BACKEND_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((r) => setUsers(r.data))
            .catch(() => setError('Failed to load users.'))
            .finally(() => setLoading(false));
    }, [token]);


    const handleDeleteClick = (user) => {
        setPendingDelete(user);
    };

    const handleDeleteCancel = () => {
        setPendingDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!pendingDelete) return;
        setIsDeleting(true);
        try {
            await axios.delete(`${BACKEND_URL}/api/admin/users/${pendingDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers((prev) => prev.filter((u) => u._id !== pendingDelete._id));
            toast.success(`User "${pendingDelete.name}" deleted successfully.`);
            setPendingDelete(null);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to delete user. Try again.';
            toast.error(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner-border spinner-border-sm" role="status" />
                Loading users…
            </div>
        );
    }
    if (error) return <div className="admin-error">{error}</div>;

    const isSelf = (u) => u._id === currentUser?._id || u._id === currentUser?.id;

    return (
        <>
            {pendingDelete && (
                <ConfirmModal
                    user={pendingDelete}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                    isDeleting={isDeleting}
                />
            )}

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
                            <th>Provider</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">
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
                                    <td>
                                        <span className={`role-badge ${u.provider === 'google' ? 'google-provider' : 'local-provider'}`}>
                                            {u.provider === 'google' ? '🔵 Google' : '🔑 Local'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteClick(u)}
                                            disabled={isSelf(u)}
                                            title={isSelf(u) ? "Can't delete your own account" : `Delete ${u.name}`}
                                        >
                                            <FiTrash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

// ─── Questions Tab ──────────────────────────────────────────────────────────
const QuestionsTab = ({ token }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [pendingDeleteQ, setPendingDeleteQ] = useState(null);
    const [isDeletingQ, setIsDeletingQ] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleAddQuestion = (newQ) => {
        setQuestions((prev) => [newQ, ...prev]);
    };

    useEffect(() => {
        axios
            .get(`${BACKEND_URL}/api/admin/questions`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((r) => setQuestions(r.data))
            .catch(() => setError('Failed to load questions.'))
            .finally(() => setLoading(false));
    }, [token]);

    const handleDeleteClick = (q) => {
        // ConfirmModal uses a `user` prop; pass a shaped object so modal text works
        setPendingDeleteQ({ ...q, name: q.question.length > 60 ? q.question.slice(0, 60) + '…' : q.question });
    };

    const handleDeleteCancel = () => setPendingDeleteQ(null);

    const handleDeleteConfirm = async () => {
        if (!pendingDeleteQ) return;
        setIsDeletingQ(true);
        try {
            await axios.delete(`${BACKEND_URL}/api/admin/questions/${pendingDeleteQ._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setQuestions((prev) => prev.filter((q) => q._id !== pendingDeleteQ._id));
            toast.success('Question deleted successfully.');
            setPendingDeleteQ(null);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to delete question. Try again.';
            toast.error(msg);
        } finally {
            setIsDeletingQ(false);
        }
    };

    const filtered = questions.filter((q) =>
        q.question.toLowerCase().includes(search.toLowerCase())
    );

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
        <>
            {pendingDeleteQ && (
                <ConfirmModal
                    user={pendingDeleteQ}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                    isDeleting={isDeletingQ}
                />
            )}

            {showAddModal && (
                <AddQuestionModal
                    token={token}
                    onAdd={handleAddQuestion}
                    onClose={() => setShowAddModal(false)}
                />
            )}

            <div className="admin-table-card">
                <div className="admin-table-header">
                    <h3><FiList className="me-2" size={16} />Question Bank</h3>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span className="admin-count-badge">
                            {filtered.length} / {questions.length} questions
                        </span>
                        <button
                            className="btn-add-question"
                            onClick={() => setShowAddModal(true)}
                        >
                            <FiPlus size={15} style={{ marginRight: 4 }} />
                            Add Question
                        </button>
                    </div>
                </div>

                <input
                    className="admin-search-bar"
                    type="text"
                    placeholder="🔍  Search by question text…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Question</th>
                            <th>Role</th>
                            <th>Category</th>
                            <th>Difficulty</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">
                                    {search ? 'No questions match your search.' : 'No questions found.'}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((q, i) => (
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
                                    <td>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteClick(q)}
                                            title={`Delete question`}
                                        >
                                            <FiTrash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

// ─── AI Interviews Tab ──────────────────────────────────────────────────────

// Skill level badge helper
const SkillBadge = ({ level }) => {
    const MAP = {
        Beginner:     { cls: 'skill-badge--beginner',     label: '🟡 Beginner' },
        Intermediate: { cls: 'skill-badge--intermediate', label: '🔵 Intermediate' },
        'Job Ready':  { cls: 'skill-badge--jobready',     label: '🟢 Job Ready' },
    };
    const b = MAP[level] || { cls: '', label: level };
    return <span className={`skill-badge ${b.cls}`}>{b.label}</span>;
};

// Donut chart custom label
const CHART_COLORS = ['#6F2DBD', '#A663CC', '#06b6d4', '#f97316', '#10b981'];

// ── Analytics Sub-Tab ────────────────────────────────────────────────────────
const AnalyticsSubTab = ({ token }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios
            .get(`${BACKEND_URL}/api/admin/ai-stats`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => setData(r.data))
            .catch(() => setError('Failed to load AI analytics.'))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div className="admin-loading"><div className="spinner-border spinner-border-sm" role="status" /> Loading analytics…</div>;
    if (error)   return <div className="admin-error">{error}</div>;

    const skillOrder = ['Beginner', 'Intermediate', 'Job Ready'];
    const skillData = skillOrder.map((s) => {
        const found = data.skillDistribution.find((x) => x.skillLevel === s);
        return { name: s, count: found ? found.count : 0 };
    });

    return (
        <>
            {/* Stat Cards */}
            <div className="admin-stat-grid ai-stat-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon purple"><FiCpu size={22} color="white" /></div>
                    <div>
                        <div className="admin-stat-value">{data.totalSessions}</div>
                        <div className="admin-stat-label">Total AI Sessions</div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon teal"><FiActivity size={22} color="white" /></div>
                    <div>
                        <div className="admin-stat-value">{data.platformAvgScore}<span style={{ fontSize: '1rem', color: '#6b7280' }}>/10</span></div>
                        <div className="admin-stat-label">Platform Avg Score</div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon orange"><FiList size={22} color="white" /></div>
                    <div>
                        <div className="admin-stat-value" style={{ textTransform: 'capitalize', fontSize: '1.4rem' }}>{data.mostPopularRole}</div>
                        <div className="admin-stat-label">Most Popular Role</div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}><FiUsers size={22} color="white" /></div>
                    <div>
                        <div className="admin-stat-value" style={{ fontSize: '1rem', lineHeight: 1.4 }}>{data.topPerformer ? data.topPerformer.name : '—'}</div>
                        <div className="admin-stat-label">Top Performer{data.topPerformer ? ` · ${data.topPerformer.avgScore}/10` : ''}</div>
                    </div>
                </div>
            </div>

            {/* Charts row */}
            <div className="ai-charts-grid">
                {/* Line Chart — daily activity */}
                <div className="admin-table-card ai-chart-card">
                    <div className="ai-chart-title">📈 Daily Sessions (Last 30 Days)</div>
                    {data.dailyActivity.length === 0 ? (
                        <div className="ai-chart-empty">No data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={data.dailyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => v.slice(5)} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                                <Line type="monotone" dataKey="count" stroke="#6F2DBD" strokeWidth={2.5} dot={{ r: 3, fill: '#6F2DBD' }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Donut — role distribution */}
                <div className="admin-table-card ai-chart-card">
                    <div className="ai-chart-title">🍕 Role Distribution</div>
                    {data.roleDistribution.length === 0 ? (
                        <div className="ai-chart-empty">No data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={data.roleDistribution} dataKey="count" nameKey="role" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                                    {data.roleDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(val, name) => [val, name.charAt(0).toUpperCase() + name.slice(1)]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                                <Legend formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} iconType="circle" iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Bar — skill level distribution */}
                <div className="admin-table-card ai-chart-card">
                    <div className="ai-chart-title">📊 Skill Level Distribution</div>
                    {skillData.every((s) => s.count === 0) ? (
                        <div className="ai-chart-empty">No data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={skillData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {skillData.map((s, i) => {
                                        const colorMap = { Beginner: '#f59e0b', Intermediate: '#06b6d4', 'Job Ready': '#10b981' };
                                        return <Cell key={i} fill={colorMap[s.name] || '#6F2DBD'} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </>
    );
};

// ── Sessions Log Sub-Tab ─────────────────────────────────────────────────────
const SessionsLogSubTab = ({ token }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Expanded row
    const [expandedId, setExpandedId] = useState(null);

    // Delete
    const [pendingDelete, setPendingDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchSessions = useCallback(async (pageNum = 1) => {
        setLoading(true);
        setError('');
        try {
            const params = { page: pageNum, limit: 10 };
            if (search)      params.search     = search;
            if (roleFilter)  params.role       = roleFilter;
            if (skillFilter) params.skillLevel = skillFilter;
            if (startDate)   params.startDate  = startDate;
            if (endDate)     params.endDate    = endDate;

            const { data } = await axios.get(`${BACKEND_URL}/api/admin/ai-sessions`, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            setSessions(data.sessions);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);
            setPage(data.page);
        } catch {
            setError('Failed to load sessions.');
        } finally {
            setLoading(false);
        }
    }, [token, search, roleFilter, skillFilter, startDate, endDate]);

    useEffect(() => { fetchSessions(1); }, [fetchSessions]);

    const handleDelete = async () => {
        if (!pendingDelete) return;
        setIsDeleting(true);
        try {
            await axios.delete(`${BACKEND_URL}/api/admin/ai-sessions/${pendingDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Session deleted successfully.');
            setPendingDelete(null);
            fetchSessions(page);
        } catch {
            toast.error('Failed to delete session.');
        } finally {
            setIsDeleting(false);
        }
    };

    // CSV export
    const handleExportCSV = async () => {
        try {
            // Fetch ALL sessions (no limit) for export
            const params = { page: 1, limit: 10000 };
            if (search)      params.search     = search;
            if (roleFilter)  params.role       = roleFilter;
            if (skillFilter) params.skillLevel = skillFilter;
            if (startDate)   params.startDate  = startDate;
            if (endDate)     params.endDate    = endDate;

            const { data } = await axios.get(`${BACKEND_URL}/api/admin/ai-sessions`, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });

            const rows = data.sessions.map((s, i) => ({
                '#': i + 1,
                Name: s.user?.name || 'Unknown',
                Email: s.user?.email || '—',
                Role: s.role,
                'Avg Score': s.averageScore,
                'Percentage (%)': s.percentage,
                'Skill Level': s.skillLevel,
                Date: new Date(s.createdAt).toLocaleDateString(),
            }));

            const headers = Object.keys(rows[0] || {});
            const csvLines = [
                headers.join(','),
                ...rows.map((r) => headers.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(',')),
            ];
            const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('CSV downloaded!');
        } catch {
            toast.error('Failed to export CSV.');
        }
    };

    const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

    return (
        <>
            {/* Delete confirm modal */}
            {pendingDelete && (
                <ConfirmModal
                    user={{ name: `session by ${pendingDelete.user?.name || 'Unknown'}` }}
                    onConfirm={handleDelete}
                    onCancel={() => setPendingDelete(null)}
                    isDeleting={isDeleting}
                />
            )}

            <div className="admin-table-card">
                {/* Header */}
                <div className="admin-table-header">
                    <h3><FiCpu className="me-2" size={16} />All AI Sessions</h3>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <span className="admin-count-badge">{totalItems} sessions</span>
                        <button className="btn-add-question" onClick={handleExportCSV}>
                            <FiDownload size={14} style={{ marginRight: 4 }} />Export CSV
                        </button>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="ai-filter-bar">
                    <div className="ai-filter-search">
                        <FiSearch size={14} className="ai-filter-icon" />
                        <input
                            className="ai-filter-input"
                            type="text"
                            placeholder="Search by name or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className="ai-filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">All Roles</option>
                        {['frontend', 'backend', 'mern', 'hr', 'aptitude'].map((r) => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                    </select>
                    <select className="ai-filter-select" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}>
                        <option value="">All Skill Levels</option>
                        {['Beginner', 'Intermediate', 'Job Ready'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <input type="date" className="ai-filter-select" value={startDate} onChange={(e) => setStartDate(e.target.value)} title="Start date" />
                    <input type="date" className="ai-filter-select" value={endDate} onChange={(e) => setEndDate(e.target.value)} title="End date" />
                </div>

                {loading ? (
                    <div className="admin-loading"><div className="spinner-border spinner-border-sm" role="status" /> Loading sessions…</div>
                ) : error ? (
                    <div className="admin-error">{error}</div>
                ) : (
                    <>
                        <div className="ai-sessions-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Score</th>
                                        <th>%</th>
                                        <th>Skill Level</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.length === 0 ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No sessions found.</td></tr>
                                    ) : sessions.map((s, i) => (
                                        <>
                                            <tr key={s._id} className={expandedId === s._id ? 'ai-row-expanded' : ''}>
                                                <td className="text-muted">{(page - 1) * 10 + i + 1}</td>
                                                <td>
                                                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.user?.name || 'Unknown'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{s.user?.email || '—'}</div>
                                                </td>
                                                <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{s.role}</td>
                                                <td><strong>{s.averageScore}</strong><span style={{ color: '#9ca3af', fontSize:'0.8rem' }}> / 10</span></td>
                                                <td>
                                                    <span className={`pct-badge pct-${s.percentage >= 75 ? 'high' : s.percentage >= 50 ? 'mid' : 'low'}`}>
                                                        {s.percentage}%
                                                    </span>
                                                </td>
                                                <td><SkillBadge level={s.skillLevel} /></td>
                                                <td style={{ fontSize: '0.82rem', color: '#6b7280' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        <button
                                                            className="btn-view"
                                                            onClick={() => toggleExpand(s._id)}
                                                            title="View Q&A"
                                                        >
                                                            {expandedId === s._id ? <FiChevronUp size={14} /> : <FiEye size={14} />}
                                                        </button>
                                                        <button
                                                            className="btn-delete"
                                                            onClick={() => setPendingDelete(s)}
                                                            title="Delete session"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedId === s._id && (
                                                <tr key={`${s._id}-exp`} className="ai-expand-row">
                                                    <td colSpan="8">
                                                        <div className="ai-qa-expand">
                                                            <div className="ai-qa-expand-title">📋 Questions &amp; Answers</div>
                                                            {(s.answers || []).map((ans, qi) => (
                                                                <div key={qi} className="ai-qa-card">
                                                                    <div className="ai-qa-question"><span>Q{qi + 1}.</span> {ans.question}</div>
                                                                    <div className="ai-qa-answer"><strong>Answer:</strong> {ans.answerText || <em style={{ color: '#9ca3af' }}>No answer provided</em>}</div>
                                                                    <div className="ai-qa-meta">
                                                                        <span className="ai-qa-score">Score: {ans.score}/10</span>
                                                                        <span className="ai-qa-source">{ans.analysisSource === 'CLASSIC' ? '📋 Classic' : '🤖 AI'}</span>
                                                                        <span className="ai-qa-feedback">{ans.feedback}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="ai-pagination">
                                <button className="ai-page-btn" disabled={page <= 1} onClick={() => fetchSessions(page - 1)}>← Prev</button>
                                <span className="ai-page-info">Page {page} of {totalPages}</span>
                                <button className="ai-page-btn" disabled={page >= totalPages} onClick={() => fetchSessions(page + 1)}>Next →</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

// ── Main AiInterviewsTab ──────────────────────────────────────────────────────
const AI_SUB_TABS = [
    { key: 'analytics', label: '📊 Analytics' },
    { key: 'sessions',  label: '📋 Sessions Log' },
];

const AiInterviewsTab = ({ token }) => {
    const [subTab, setSubTab] = useState('analytics');
    return (
        <>
            <div className="ai-sub-tabs">
                {AI_SUB_TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        className={`ai-sub-tab-btn ${subTab === key ? 'active' : ''}`}
                        onClick={() => setSubTab(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>
            {subTab === 'analytics' && <AnalyticsSubTab token={token} />}
            {subTab === 'sessions'  && <SessionsLogSubTab token={token} />}
        </>
    );
};


const AdminPage = () => {
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    const TAB_META = {
        dashboard:       { title: 'Dashboard',       subtitle: 'Platform-wide overview and statistics' },
        users:           { title: 'Users',           subtitle: 'Manage all registered users on the platform' },
        questions:       { title: 'Question Bank',   subtitle: 'Full question bank across all roles' },
        'ai-interviews': { title: 'AI Interviews',   subtitle: 'Control room for all AI text interview sessions' },
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

                {activeTab === 'dashboard'       && <DashboardTab token={token} />}
                {activeTab === 'users'           && <UsersTab token={token} currentUser={user} />}
                {activeTab === 'questions'       && <QuestionsTab token={token} />}
                {activeTab === 'ai-interviews'   && <AiInterviewsTab token={token} />}
            </main>
        </div>
    );
};

export default AdminPage;
