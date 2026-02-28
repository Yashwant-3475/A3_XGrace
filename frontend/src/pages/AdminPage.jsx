import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
    FiGrid, FiUsers, FiList, FiDatabase,
    FiActivity, FiMessageSquare, FiTrash2, FiEye, FiEyeOff,
    FiPlus, FiX,
} from 'react-icons/fi';
import './Admin.css';

const BACKEND_URL = 'http://localhost:5000';

// ─── Sidebar nav items ─────────────────────────────────────────────────────
const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', Icon: FiGrid },
    { key: 'users', label: 'Users', Icon: FiUsers },
    { key: 'questions', label: 'Question Bank', Icon: FiList },
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
    const [visiblePasswords, setVisiblePasswords] = useState({});
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

    const togglePassword = (id) => {
        setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
    };

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
                            <th>Password</th>
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
                                        <div className="password-cell">
                                            <span className="password-mask">
                                                {visiblePasswords[u._id]
                                                    ? <span className="hash-text">{u.password || '(hash unavailable)'}</span>
                                                    : '••••••••'}
                                            </span>
                                            <button
                                                className="btn-password-toggle"
                                                onClick={() => togglePassword(u._id)}
                                                title={visiblePasswords[u._id] ? 'Hide' : 'Show'}
                                            >
                                                {visiblePasswords[u._id]
                                                    ? <FiEyeOff size={14} />
                                                    : <FiEye size={14} />
                                                }
                                            </button>
                                        </div>
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


// ─── Main AdminPage ─────────────────────────────────────────────────────────
const AdminPage = () => {
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    const TAB_META = {
        dashboard: { title: 'Dashboard', subtitle: 'Platform-wide overview and statistics' },
        users: { title: 'Users', subtitle: 'Manage all registered users on the platform' },
        questions: { title: 'Question Bank', subtitle: 'Full question bank across all roles' },
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
                {activeTab === 'users' && <UsersTab token={token} currentUser={user} />}
                {activeTab === 'questions' && <QuestionsTab token={token} />}
            </main>
        </div>
    );
};

export default AdminPage;
