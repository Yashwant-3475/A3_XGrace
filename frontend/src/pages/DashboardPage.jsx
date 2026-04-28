import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '../components/common/Skeleton';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { FiTrendingUp, FiTarget, FiCheckCircle, FiVideo, FiFileText, FiCalendar, FiAward, FiList, FiCpu, FiStar } from 'react-icons/fi';

/* ─── Inline styles for the v2 Dark + White design ─── */
const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--dark-color)',           // #0a0a1a — full dark navy
    padding: '1.5rem 0',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  sectionLabel: {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    marginBottom: '0.75rem',
    paddingLeft: '2px',
  },
  // White card — pops against dark bg
  whiteCard: {
    background: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    overflow: 'hidden',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  },
  whiteCardHoverable: {
    cursor: 'pointer',
  },
  // Stat card with purple left border
  statCard: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '1.1rem 1.25rem',
    borderLeft: '4px solid var(--primary-color)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    marginBottom: '1rem',
  },
  statLabel: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: '0.2rem',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '1.55rem',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1,
  },
  statIcon: {
    color: 'var(--primary-color)',
    opacity: 0.5,
  },
  cardBody: {
    padding: '1.25rem 1.5rem',
  },
  chartTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  // Section header row (AI section)
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    marginTop: '1.75rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#8b5cf6',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    margin: 0,
  },
  outlineBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.9rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 600,
    border: '1.5px solid rgba(124, 58, 237, 0.5)',
    color: 'var(--primary-color)',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  alertBox: {
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    marginBottom: '1.25rem',
    fontWeight: 600,
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [aiResults, setAiResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalInterviewCount, setTotalInterviewCount] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Authentication required. Please login again.');
          setLoading(false);
          return;
        }
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/interview/recent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const transformedResults = (response.data || []).map(session => ({
          score: session.score,
          totalQuestions: session.totalQuestions,
          accuracy: session.percentage,
          createdAt: session.createdAt,
          role: session.role,
          skillLevel: session.skillLevel,
        }));
        setResults(transformedResults);
        setError('');
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load performance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    const fetchTotalCount = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/interview/history?page=1&limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTotalInterviewCount(res.data.totalItems || 0);
      } catch (err) {
        console.error('Error fetching total count:', err);
      }
    };
    fetchTotalCount();

    const fetchAiResults = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ai-interview/recent`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAiResults(res.data || []);
      } catch (err) {
        console.error('Error fetching AI interview results:', err);
      }
    };
    fetchAiResults();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
        {error}
      </div>
    );
  }

  if (!results.length && !aiResults.length) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.4 }}>
          <FiTrendingUp />
        </div>
        <h1 style={{ ...styles.pageTitle, WebkitTextFillColor: 'unset', color: '#f1f5f9', marginBottom: '0.75rem' }}>
          Welcome to Your Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
          Start your first mock interview to unlock insights and track your progress!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="btn"
            style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => navigate('/interview')}
          >
            <FiVideo size={18} /> Start Mock Interview
          </button>
          <button
            className="btn"
            style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => navigate('/resume-analyzer')}
          >
            <FiFileText size={18} /> Analyze Resume
          </button>
        </div>
      </div>
    );
  }

  /* ── Derived stats ── */
  const totalInterviews = results.length;
  const averageAccuracy = totalInterviews > 0
    ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / totalInterviews)
    : 0;
  const bestScore = totalInterviews > 0 ? Math.max(...results.map(r => r.score)) : 0;
  const lastInterviewDate = results[0]?.createdAt
    ? new Date(results[0].createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

  let insightMessage = '';
  let insightBg = '';
  let insightColor = '';
  if (averageAccuracy > 70) {
    insightMessage = '🎉 Excellent! Accuracy above 70% — keep it up!';
    insightBg = 'linear-gradient(135deg, #d1fae5, #a7f3d0)';
    insightColor = '#065f46';
  } else if (averageAccuracy < 50) {
    insightMessage = '💡 Accuracy below 50% — review concepts and practice more.';
    insightBg = 'linear-gradient(135deg, #fef3c7, #fde68a)';
    insightColor = '#92400e';
  } else {
    insightMessage = '📈 Good progress! Keep practicing to push accuracy above 70%.';
    insightBg = 'linear-gradient(135deg, #dbeafe, #bfdbfe)';
    insightColor = '#1e40af';
  }

  /* ── Chart data ── */
  const chartData = [...results].reverse().map((r, i) => ({
    name: `#${i + 1}`,
    score: r.score,
    accuracy: r.accuracy,
  }));

  const aiChartData = [...aiResults].reverse().map((r, i) => ({
    name: `#${i + 1}`,
    avgScore: r.averageScore,
    percentage: r.percentage,
  }));

  const aiTotalSessions = aiResults.length;
  const aiBestScore = aiTotalSessions > 0 ? Math.max(...aiResults.map(r => r.averageScore)) : 0;
  const aiAvgScore = aiTotalSessions > 0
    ? (aiResults.reduce((s, r) => s + r.averageScore, 0) / aiTotalSessions).toFixed(1)
    : 0;

  /* Shared tooltip style for white cards */
  const tooltipStyle = { borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontSize: '0.8rem' };

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.headerRow}>
        <h1 style={styles.pageTitle}>Performance Dashboard</h1>
        <button
          id="view-all-history-btn"
          style={styles.outlineBtn}
          onClick={() => navigate('/history')}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <FiList size={15} /> View All History
        </button>
      </div>

      {/* ── Insight Alert ── */}
      <div style={{ ...styles.alertBox, background: insightBg, color: insightColor }}>
        <FiTarget size={16} />
        <span>{insightMessage}</span>
      </div>

      {/* ── MCQ Stat Cards (4 columns) ── */}
      <p style={styles.sectionLabel}>MCQ Interview — Overview</p>
      <div className="row g-3" style={{ marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Interviews', value: totalInterviewCount, icon: <FiVideo size={28} style={styles.statIcon} />, accent: 'var(--primary-color)' },
          { label: 'Avg Accuracy', value: `${averageAccuracy}%`, icon: <FiTarget size={28} style={styles.statIcon} />, accent: 'var(--secondary-color)' },
          { label: 'Best Score', value: bestScore, icon: <FiAward size={28} style={styles.statIcon} />, accent: 'var(--primary-color)' },
          { label: 'Last Interview', value: lastInterviewDate, icon: <FiCalendar size={28} style={{ color: 'var(--secondary-color)', opacity: 0.5 }} />, accent: 'var(--secondary-color)', small: true },
        ].map((s, i) => (
          <div className="col-md-3 col-sm-6" key={i}>
            <div
              style={{ ...styles.statCard, borderLeftColor: s.accent }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.14)'; }}
            >
              <div>
                <div style={styles.statLabel}>{s.label}</div>
                <div style={{ ...styles.statValue, fontSize: s.small ? '1rem' : '1.55rem', color: s.small ? '#374151' : '#111827' }}>
                  {s.value}
                </div>
              </div>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── MCQ Charts — Side by Side ── */}
      <div className="row g-3" style={{ marginBottom: '1.5rem' }}>
        {/* Score Trend */}
        <div className="col-md-6">
          <div style={styles.whiteCard}>
            <div style={styles.cardBody}>
              <div style={styles.chartTitle}>
                <FiTrendingUp style={{ color: 'var(--primary-color)' }} size={16} />
                MCQ — Score Trend
              </div>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--primary-color)"
                      strokeWidth={2.5}
                      name="Score"
                      dot={{ fill: 'var(--primary-color)', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Accuracy Trend */}
        <div className="col-md-6">
          <div style={styles.whiteCard}>
            <div style={styles.cardBody}>
              <div style={styles.chartTitle}>
                <FiCheckCircle style={{ color: '#10b981' }} size={16} />
                MCQ — Accuracy Trend
              </div>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Bar dataKey="accuracy" fill="#10b981" name="Accuracy (%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
           AI TEXT INTERVIEW SECTION
      ════════════════════════════════════════════════════════════ */}
      <div style={styles.sectionHeaderRow}>
        <h4 style={styles.sectionTitle}>
          <FiCpu size={18} /> AI Interview Performance
        </h4>
        <button
          id="view-ai-history-btn"
          style={styles.outlineBtn}
          onClick={() => navigate('/ai-history')}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <FiList size={15} /> Full AI History
        </button>
      </div>

      {aiTotalSessions === 0 ? (
        <div style={{ ...styles.whiteCard, textAlign: 'center', padding: '2.5rem 1.5rem', marginBottom: '1rem' }}>
          <FiCpu size={42} style={{ color: '#8b5cf6', opacity: 0.35, marginBottom: '0.75rem' }} />
          <h6 style={{ color: '#374151', fontWeight: 700, marginBottom: '0.3rem' }}>No AI interviews yet</h6>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', marginBottom: '1rem' }}>
            Take an AI-powered text interview to see your performance data here.
          </p>
          <button
            className="btn"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => navigate('/interview')}
          >
            <FiCpu size={14} /> Start AI Interview
          </button>
        </div>
      ) : (
        <>
          {/* AI Stat Cards (3 columns) */}
          <div className="row g-3" style={{ marginBottom: '1.25rem' }}>
            {[
              { label: 'AI Sessions', value: aiTotalSessions, icon: <FiCpu size={28} style={{ color: '#8b5cf6', opacity: 0.5 }} /> },
              { label: 'Avg AI Score', value: `${aiAvgScore} / 10`, icon: <FiStar size={28} style={{ color: '#8b5cf6', opacity: 0.5 }} /> },
              { label: 'Best AI Score', value: `${aiBestScore} / 10`, icon: <FiAward size={28} style={{ color: '#8b5cf6', opacity: 0.5 }} /> },
            ].map((s, i) => (
              <div className="col-md-4 col-sm-6" key={i}>
                <div
                  style={{ ...styles.statCard, borderLeftColor: '#8b5cf6' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.14)'; }}
                >
                  <div>
                    <div style={styles.statLabel}>{s.label}</div>
                    <div style={{ ...styles.statValue, color: '#8b5cf6' }}>{s.value}</div>
                  </div>
                  {s.icon}
                </div>
              </div>
            ))}
          </div>

          {/* AI Charts — Side by Side */}
          <div className="row g-3" style={{ marginBottom: '1.5rem' }}>
            {/* AI Score Trend */}
            <div className="col-md-6">
              <div style={styles.whiteCard}>
                <div style={styles.cardBody}>
                  <div style={styles.chartTitle}>
                    <FiCpu style={{ color: '#8b5cf6' }} size={16} />
                    AI — Avg Score Trend
                  </div>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <LineChart data={aiChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} domain={[0, 10]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                        <Line
                          type="monotone"
                          dataKey="avgScore"
                          stroke="#8b5cf6"
                          strokeWidth={2.5}
                          name="Avg Score (/10)"
                          dot={{ fill: '#8b5cf6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Score % Bar Chart */}
            <div className="col-md-6">
              <div style={styles.whiteCard}>
                <div style={styles.cardBody}>
                  <div style={styles.chartTitle}>
                    <FiTarget style={{ color: '#8b5cf6' }} size={16} />
                    AI — Score % Trend
                  </div>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart data={aiChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                        <Bar dataKey="percentage" fill="#8b5cf6" name="Score (%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
