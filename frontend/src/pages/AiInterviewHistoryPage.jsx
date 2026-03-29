import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    FiChevronLeft, FiChevronRight, FiFilter, FiCalendar,
    FiTrendingUp, FiTarget, FiCpu, FiChevronDown, FiChevronUp,
    FiZap, FiAlertCircle, FiStar
} from 'react-icons/fi';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_LABEL = {
    frontend: 'Frontend Developer',
    backend: 'Backend Developer',
    mern: 'MERN Stack Developer',
    hr: 'HR Interview',
    aptitude: 'Aptitude & Reasoning',
};

const SKILL_BADGE = {
    'Job Ready':    { bg: '#10b98120', color: '#10b981', label: '🏅 Job Ready' },
    'Intermediate': { bg: '#f59e0b20', color: '#f59e0b', label: '📈 Intermediate' },
    'Beginner':     { bg: '#ef444420', color: '#ef4444', label: '🌱 Beginner' },
};

const SCORE_COLOR = (s) => {
    if (s >= 7.5) return '#10b981';
    if (s >= 5)   return '#f59e0b';
    return '#ef4444';
};

// ─────────────────────────────────────────────────────────────────────────────

const AiInterviewHistoryPage = () => {
    const navigate = useNavigate();

    const [sessions, setSessions]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const [totalItems, setTotalItems]   = useState(0);
    const [expanded, setExpanded]       = useState({}); // sessionId → bool

    const [draftFilters, setDraftFilters] = useState({ role: '', minScore: '', startDate: '', endDate: '' });
    const [filters, setFilters]           = useState({ role: '', minScore: '', startDate: '', endDate: '' });

    // ── Fetch ───────────────────────────────────────────────────────────────
    const fetchHistory = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) { setError('Authentication required. Please login again.'); setLoading(false); return; }

            let url = `${API}/api/ai-interview/history?page=${page}&limit=4`;
            if (filters.role)      url += `&role=${filters.role}`;
            if (filters.minScore)  url += `&minScore=${filters.minScore}`;
            if (filters.startDate) url += `&startDate=${filters.startDate}`;
            if (filters.endDate)   url += `&endDate=${filters.endDate}`;

            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

            setSessions(res.data.sessions || []);
            setCurrentPage(res.data.page);
            setTotalPages(res.data.totalPages);
            setTotalItems(res.data.totalItems);
            setError('');
        } catch (err) {
            console.error('AI history fetch error:', err);
            setError('Failed to load AI interview history.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchHistory(1); }, [fetchHistory]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleFilterChange = (e) =>
        setDraftFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const applyFilters = () => { setFilters({ ...draftFilters }); setCurrentPage(1); };
    const clearFilters = () => {
        const empty = { role: '', minScore: '', startDate: '', endDate: '' };
        setDraftFilters(empty); setFilters(empty);
    };

    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading && currentPage === 1) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" style={{ color: '#8b5cf6' }} role="status" />
                <p className="mt-3 text-muted">Loading AI interview history…</p>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger text-center mt-5">{error}</div>;
    }

    return (
        <div>
            {/* ── Header ── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span
                        className="badge mb-2"
                        style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', padding: '6px 14px', borderRadius: '20px' }}
                    >
                        <FiCpu size={13} className="me-1" /> AI Text Interview
                    </span>
                    <h1 className="gradient-text fw-bold mb-0">AI Interview History</h1>
                </div>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </button>
            </div>

            {/* ── Filters ── */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3 d-flex align-items-center">
                        <FiFilter className="me-2" /> Filters
                    </h5>
                    <div className="row g-3">
                        {/* Role */}
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Role</label>
                            <select
                                className="form-select"
                                name="role"
                                value={draftFilters.role}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Roles</option>
                                {Object.entries(ROLE_LABEL).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                        {/* Min Score */}
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Min Avg Score (0–10)</label>
                            <input
                                type="number" className="form-control" name="minScore"
                                value={draftFilters.minScore} onChange={handleFilterChange}
                                placeholder="e.g. 5" min="0" max="10" step="0.5"
                            />
                        </div>
                        {/* Start Date */}
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Start Date</label>
                            <input
                                type="date" className="form-control" name="startDate"
                                value={draftFilters.startDate} onChange={handleFilterChange}
                            />
                        </div>
                        {/* End Date */}
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">End Date</label>
                            <input
                                type="date" className="form-control" name="endDate"
                                value={draftFilters.endDate} onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                    <div className="mt-3 d-flex gap-2">
                        <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
                        <button className="btn btn-outline-secondary" onClick={clearFilters}>Clear Filters</button>
                    </div>
                </div>
            </div>

            {/* ── Empty State ── */}
            {sessions.length === 0 ? (
                <div className="text-center py-5">
                    <FiCalendar size={64} className="text-muted mb-3" />
                    <h4 className="text-muted">No AI interview sessions found</h4>
                    <p className="text-muted">Try adjusting your filters or take a new AI interview</p>
                    <button
                        className="btn mt-2"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px' }}
                        onClick={() => navigate('/interview')}
                    >
                        <FiCpu size={15} className="me-2" /> Start AI Interview
                    </button>
                </div>
            ) : (
                <>
                    <div className="mb-3 text-muted">
                        Showing {sessions.length} of {totalItems} sessions
                    </div>

                    {/* ── Session Cards ── */}
                    {sessions.map((session, index) => {
                        const badge = SKILL_BADGE[session.skillLevel] || SKILL_BADGE['Beginner'];
                        const isOpen = expanded[session._id];
                        const rank = (currentPage - 1) * 4 + index + 1;

                        return (
                            <div key={session._id} className="card mb-3 border-0 shadow-sm">
                                <div className="card-body p-4">
                                    {/* Top row */}
                                    <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                                        <div>
                                            <h5 className="mb-1 fw-bold">
                                                Session #{rank} — {ROLE_LABEL[session.role] || session.role}
                                            </h5>
                                            <span
                                                className="badge"
                                                style={{ background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: '20px' }}
                                            >
                                                {badge.label}
                                            </span>
                                        </div>
                                        <span className="badge bg-primary">
                                            {new Date(session.createdAt).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {/* Stats row */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-6 col-md-3">
                                            <div className="d-flex align-items-center">
                                                <FiStar className="me-2" style={{ color: SCORE_COLOR(session.averageScore) }} />
                                                <div>
                                                    <small className="text-muted d-block">Avg Score</small>
                                                    <strong style={{ color: SCORE_COLOR(session.averageScore) }}>
                                                        {session.averageScore} / 10
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <div className="d-flex align-items-center">
                                                <FiTarget className="me-2" style={{ color: '#8b5cf6' }} />
                                                <div>
                                                    <small className="text-muted d-block">Score %</small>
                                                    <strong style={{ color: '#8b5cf6' }}>{session.percentage}%</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <div className="d-flex align-items-center">
                                                <FiTrendingUp className="me-2" style={{ color: '#6b7280' }} />
                                                <div>
                                                    <small className="text-muted d-block">Questions</small>
                                                    <strong>{session.totalQuestions}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            {/* AI source indicator */}
                                            {session.answers && session.answers.some(a => a.analysisSource === 'AI') ? (
                                                <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: '20px', padding: '6px 12px' }}>
                                                    <FiZap size={11} className="me-1" /> AI Evaluated
                                                </span>
                                            ) : (
                                                <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: '20px', padding: '6px 12px' }}>
                                                    <FiAlertCircle size={11} className="me-1" /> Auto-Assessed
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expand / Collapse per-question breakdown */}
                                    <button
                                        className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => toggleExpand(session._id)}
                                    >
                                        {isOpen ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
                                        {isOpen ? 'Hide' : 'Show'} Question-by-Question Breakdown
                                    </button>

                                    {/* Expanded breakdown */}
                                    {isOpen && session.answers && (
                                        <div className="mt-3">
                                            {session.answers.map((ans, i) => (
                                                <div key={i} className="mb-3 p-3 rounded" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.1)' }}>
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>Q{i + 1}</span>
                                                        <span style={{ fontWeight: 800, color: SCORE_COLOR(ans.score), fontSize: '1.1rem' }}>
                                                            {ans.score}<span style={{ fontSize: '0.75rem', color: '#888' }}>/10</span>
                                                        </span>
                                                    </div>
                                                    <p className="fw-semibold mb-2 small">{ans.question}</p>
                                                    <div className="mb-2 p-2 rounded" style={{ background: 'rgba(0,0,0,0.04)', borderLeft: '3px solid #8b5cf6' }}>
                                                        <div className="small text-muted mb-1 fw-semibold">Your Answer</div>
                                                        <div className="small">{ans.answerText}</div>
                                                    </div>
                                                    <div className="p-2 rounded" style={{ background: `${SCORE_COLOR(ans.score)}10`, borderLeft: `3px solid ${SCORE_COLOR(ans.score)}` }}>
                                                        <div className="small fw-semibold mb-1" style={{ color: SCORE_COLOR(ans.score) }}>
                                                            <FiStar size={12} className="me-1" /> AI Feedback
                                                        </div>
                                                        <div className="small">{ans.feedback}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* ── Pagination ── */}
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <button
                            className="btn btn-outline-primary d-flex align-items-center"
                            onClick={() => fetchHistory(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                        >
                            <FiChevronLeft className="me-1" /> Previous
                        </button>
                        <span className="text-muted">Page {currentPage} of {totalPages || 1}</span>
                        <button
                            className="btn btn-outline-primary d-flex align-items-center"
                            onClick={() => fetchHistory(currentPage + 1)}
                            disabled={currentPage >= totalPages || loading}
                        >
                            Next <FiChevronRight className="ms-1" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AiInterviewHistoryPage;
