import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    FiChevronLeft, FiChevronRight, FiFilter, FiCalendar,
    FiTrendingUp, FiTarget, FiCpu, FiZap, FiAlertCircle,
    FiStar, FiX, FiEye, FiAward
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
    'Job Ready':    { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: '🏅 Job Ready' },
    'Intermediate': { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', label: '📈 Intermediate' },
    'Beginner':     { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444', label: '🌱 Beginner' },
};

const SCORE_COLOR = (s) => {
    if (s >= 7.5) return '#10b981';
    if (s >= 5)   return '#f59e0b';
    return '#ef4444';
};

// ── Breakdown Modal ───────────────────────────────────────────────────────────

const BreakdownModal = ({ session, rank, onClose }) => {
    if (!session) return null;
    const badge = SKILL_BADGE[session.skillLevel] || SKILL_BADGE['Beginner'];

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 1050,
                    animation: 'fadeInBackdrop 0.2s ease',
                }}
            />

            {/* Modal Panel */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'min(700px, 95vw)',
                    maxHeight: '85vh',
                    background: '#1a1a2e',
                    borderRadius: '20px',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
                    zIndex: 1060,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slideUpModal 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    border: '1px solid rgba(139,92,246,0.25)',
                }}
            >
                {/* Modal Header */}
                <div
                    style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid rgba(139,92,246,0.15)',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.08))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                    }}
                >
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <FiAward style={{ color: '#8b5cf6' }} size={18} />
                            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                                Session #{rank} — {ROLE_LABEL[session.role] || session.role}
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span style={{
                                background: badge.bg, color: badge.color,
                                padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600
                            }}>{badge.label}</span>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 36, height: 36,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'inherit',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Modal Body – scrollable */}
                <div className="ai-modal-body" style={{ overflowY: 'auto', padding: '20px 24px', flex: 1, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {session.answers && session.answers.length > 0 ? (
                        session.answers.map((ans, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: 16,
                                    padding: '16px',
                                    borderRadius: '14px',
                                    background: 'rgba(139,92,246,0.05)',
                                    border: '1px solid rgba(139,92,246,0.12)',
                                }}
                            >
                                {/* Q header */}
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span style={{
                                        background: 'rgba(139,92,246,0.2)', color: '#8b5cf6',
                                        padding: '2px 10px', borderRadius: '20px',
                                        fontSize: '0.75rem', fontWeight: 700,
                                    }}>Q{i + 1}</span>
                                    <span style={{ fontWeight: 800, color: SCORE_COLOR(ans.score), fontSize: '1.1rem' }}>
                                        {ans.score}<span style={{ fontSize: '0.72rem', color: '#888' }}>/10</span>
                                    </span>
                                </div>

                                {/* Question text */}
                                <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 10 }}>{ans.question}</p>

                                {/* Answer */}
                                <div style={{
                                    background: 'rgba(0,0,0,0.15)',
                                    borderLeft: '3px solid #8b5cf6',
                                    padding: '8px 12px',
                                    borderRadius: '0 8px 8px 0',
                                    marginBottom: 10,
                                }}>
                                    <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 700, marginBottom: 4 }}>YOUR ANSWER</div>
                                    <div style={{ fontSize: '0.83rem' }}>{ans.answerText}</div>
                                </div>

                                {/* Feedback */}
                                <div style={{
                                    background: `${SCORE_COLOR(ans.score)}14`,
                                    borderLeft: `3px solid ${SCORE_COLOR(ans.score)}`,
                                    padding: '8px 12px',
                                    borderRadius: '0 8px 8px 0',
                                }}>
                                    <div style={{ fontSize: '0.72rem', color: SCORE_COLOR(ans.score), fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <FiStar size={11} /> AI FEEDBACK
                                    </div>
                                    <div style={{ fontSize: '0.83rem' }}>{ans.feedback}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted text-center py-4">No answer data available for this session.</p>
                    )}
                </div>

                {/* Modal Footer */}
                <div style={{
                    padding: '14px 24px',
                    borderTop: '1px solid rgba(139,92,246,0.12)',
                    display: 'flex',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <button
                        className="btn"
                        onClick={onClose}
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                            color: '#fff', border: 'none',
                            borderRadius: '10px', padding: '8px 28px',
                            fontWeight: 600, fontSize: '0.88rem',
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Keyframe animations */}
            <style>{`
                @keyframes fadeInBackdrop { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUpModal {
                    from { opacity: 0; transform: translate(-50%, -44%); }
                    to   { opacity: 1; transform: translate(-50%, -50%); }
                }
                .ai-modal-body::-webkit-scrollbar { display: none; }
            `}</style>
        </>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const AiInterviewHistoryPage = () => {
    const navigate = useNavigate();

    const [sessions, setSessions]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const [totalItems, setTotalItems]   = useState(0);

    // Modal state
    const [modalSession, setModalSession] = useState(null);
    const [modalRank, setModalRank]       = useState(null);

    const [draftFilters, setDraftFilters] = useState({ role: '', minScore: '', startDate: '', endDate: '' });
    const [filters, setFilters]           = useState({ role: '', minScore: '', startDate: '', endDate: '' });

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

    const handleFilterChange = (e) =>
        setDraftFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const applyFilters = () => { setFilters({ ...draftFilters }); setCurrentPage(1); };
    const clearFilters = () => {
        const empty = { role: '', minScore: '', startDate: '', endDate: '' };
        setDraftFilters(empty); setFilters(empty);
    };

    const openModal  = (session, rank) => { setModalSession(session); setModalRank(rank); };
    const closeModal = ()              => { setModalSession(null); setModalRank(null); };

    // ── Loading / Error ───────────────────────────────────────────────────────
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

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        <>
            {/* Breakdown Modal */}
            <BreakdownModal session={modalSession} rank={modalRank} onClose={closeModal} />

            <div>
                {/* Header */}
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

                {/* Filters */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-3 d-flex align-items-center">
                            <FiFilter className="me-2" /> Filters
                        </h5>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Role</label>
                                <select className="form-select" name="role" value={draftFilters.role} onChange={handleFilterChange}>
                                    <option value="">All Roles</option>
                                    {Object.entries(ROLE_LABEL).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Min Avg Score (0–10)</label>
                                <input
                                    type="number" className="form-control" name="minScore"
                                    value={draftFilters.minScore} onChange={handleFilterChange}
                                    placeholder="e.g. 5" min="0" max="10" step="0.5"
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Start Date</label>
                                <input type="date" className="form-control" name="startDate" value={draftFilters.startDate} onChange={handleFilterChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">End Date</label>
                                <input type="date" className="form-control" name="endDate" value={draftFilters.endDate} onChange={handleFilterChange} />
                            </div>
                        </div>
                        <div className="mt-3 d-flex gap-2">
                            <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
                            <button className="btn btn-outline-secondary" onClick={clearFilters}>Clear Filters</button>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
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
                        <div className="mb-3 text-muted" style={{ fontSize: '0.9rem' }}>
                            Showing {sessions.length} of {totalItems} sessions
                        </div>

                        {/* ── 2-Column Grid of Session Cards ── */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '20px',
                        }}>
                            {sessions.map((session, index) => {
                                const badge = SKILL_BADGE[session.skillLevel] || SKILL_BADGE['Beginner'];
                                const rank  = (currentPage - 1) * 4 + index + 1;
                                const isAI  = session.answers && session.answers.some(a => a.analysisSource === 'AI');

                                return (
                                    <div
                                        key={session._id}
                                        className="card border-0 shadow-sm"
                                        style={{
                                            borderRadius: '16px',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            cursor: 'default',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.18)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '';
                                        }}
                                    >
                                        <div className="card-body p-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                                            {/* Card Top: Rank + Date */}
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
                                                        Session #{rank}
                                                    </div>
                                                    <h6 className="fw-bold mb-1" style={{ fontSize: '0.97rem', lineHeight: 1.3 }}>
                                                        {ROLE_LABEL[session.role] || session.role}
                                                    </h6>
                                                    <span style={{
                                                        background: badge.bg, color: badge.color,
                                                        padding: '2px 10px', borderRadius: '20px',
                                                        fontSize: '0.72rem', fontWeight: 600,
                                                    }}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <div className="text-end">
                                                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 4 }}>
                                                        {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    {isAI ? (
                                                        <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: '20px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                                                            <FiZap size={10} /> AI Evaluated
                                                        </span>
                                                    ) : (
                                                        <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: '20px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                                                            <FiAlertCircle size={10} /> Auto-Assessed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div style={{ height: 1, background: 'rgba(139,92,246,0.1)', marginBottom: 16 }} />

                                            {/* Stats Row */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 'auto' }}>
                                                {/* Avg Score */}
                                                <div style={{
                                                    background: `${SCORE_COLOR(session.averageScore)}14`,
                                                    borderRadius: 12, padding: '10px 8px', textAlign: 'center',
                                                }}>
                                                    <FiStar size={15} style={{ color: SCORE_COLOR(session.averageScore), marginBottom: 4, display: 'block', margin: '0 auto 4px' }} />
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: SCORE_COLOR(session.averageScore), lineHeight: 1 }}>
                                                        {session.averageScore}
                                                    </div>
                                                    <div style={{ fontSize: '0.68rem', color: '#888', marginTop: 2 }}>Avg&nbsp;Score</div>
                                                </div>

                                                {/* Percentage */}
                                                <div style={{
                                                    background: 'rgba(139,92,246,0.08)',
                                                    borderRadius: 12, padding: '10px 8px', textAlign: 'center',
                                                }}>
                                                    <FiTarget size={15} style={{ color: '#8b5cf6', marginBottom: 4, display: 'block', margin: '0 auto 4px' }} />
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8b5cf6', lineHeight: 1 }}>
                                                        {session.percentage}%
                                                    </div>
                                                    <div style={{ fontSize: '0.68rem', color: '#888', marginTop: 2 }}>Score&nbsp;%</div>
                                                </div>

                                                {/* Questions */}
                                                <div style={{
                                                    background: 'rgba(107,114,128,0.08)',
                                                    borderRadius: 12, padding: '10px 8px', textAlign: 'center',
                                                }}>
                                                    <FiTrendingUp size={15} style={{ color: '#6b7280', marginBottom: 4, display: 'block', margin: '0 auto 4px' }} />
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6b7280', lineHeight: 1 }}>
                                                        {session.totalQuestions}
                                                    </div>
                                                    <div style={{ fontSize: '0.68rem', color: '#888', marginTop: 2 }}>Questions</div>
                                                </div>
                                            </div>

                                            {/* View Breakdown Button */}
                                            <button
                                                onClick={() => openModal(session, rank)}
                                                style={{
                                                    marginTop: 18,
                                                    width: '100%',
                                                    padding: '9px 0',
                                                    background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.1))',
                                                    border: '1px solid rgba(139,92,246,0.3)',
                                                    borderRadius: '10px',
                                                    color: '#8b5cf6',
                                                    fontWeight: 600,
                                                    fontSize: '0.83rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 6,
                                                    transition: 'background 0.2s, border-color 0.2s',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.28), rgba(109,40,217,0.2))';
                                                    e.currentTarget.style.borderColor = '#8b5cf6';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.1))';
                                                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
                                                }}
                                            >
                                                <FiEye size={14} />
                                                View Question Breakdown
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
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
        </>
    );
};

export default AiInterviewHistoryPage;
