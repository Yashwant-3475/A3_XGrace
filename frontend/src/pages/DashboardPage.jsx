import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '../components/Skeleton';
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

const DashboardPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [aiResults, setAiResults] = useState([]);   // AI interview sessions
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

        // Use new interview session endpoint
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/interview/recent`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Transform data to match dashboard format
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
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        setError('Failed to load performance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    // Fetch the real total count from history endpoint
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

    // Fetch recent AI text interview sessions for dashboard
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  if (!results.length && !aiResults.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <FiTrendingUp />
        </div>
        <h1 className="mb-3 gradient-text">Welcome to Your Dashboard</h1>
        <p className="lead text-muted mb-4">
          Start your first mock interview to unlock insights and track your progress!
        </p>

        <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
          <button
            className="btn btn-success btn-lg d-flex align-items-center"
            onClick={() => navigate('/interview')}
          >
            <FiVideo className="me-2" size={20} />
            Start Mock Interview
          </button>

          <button
            className="btn btn-primary btn-lg d-flex align-items-center"
            onClick={() => navigate('/resume-analyzer')}
          >
            <FiFileText className="me-2" size={20} />
            Analyze Resume
          </button>
        </div>
      </div>
    );
  }

  const totalInterviews = results.length;
  const averageAccuracy = Math.round(
    results.reduce((sum, r) => sum + r.accuracy, 0) / totalInterviews
  );
  const bestScore = Math.max(...results.map(r => r.score));
  const lastInterviewDate = results[0].createdAt
    ? new Date(results[0].createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    : 'N/A';

  let insightMessage = '';
  let insightType = 'info';

  if (averageAccuracy > 70) {
    insightMessage = '🎉 Excellent work! Your accuracy is above 70%. Keep up the great performance!';
    insightType = 'success';
  } else if (averageAccuracy < 50) {
    insightMessage = '💡 Your accuracy is below 50%. Consider reviewing core concepts and practicing more interviews.';
    insightType = 'warning';
  } else {
    insightMessage = '📈 Good progress! Keep practicing to improve your accuracy above 70%.';
    insightType = 'info';
  }

  // AI chart data (score over time, 0-10 scale → multiply by 10 for %)
  const aiChartData = [...aiResults]
    .reverse()
    .map((r, index) => ({
      name: `#${index + 1}`,
      avgScore: r.averageScore,
      percentage: r.percentage,
    }));

  const aiTotalSessions = aiResults.length;
  const aiBestScore    = aiTotalSessions > 0 ? Math.max(...aiResults.map(r => r.averageScore)) : 0;
  const aiAvgScore     = aiTotalSessions > 0
    ? (aiResults.reduce((s, r) => s + r.averageScore, 0) / aiTotalSessions).toFixed(1)
    : 0;

  const chartData = [...results]
    .reverse()
    .map((r, index) => ({
      name: `#${index + 1}`,
      score: r.score,
      accuracy: r.accuracy,
    }));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="gradient-text fw-bold">Performance Dashboard</h1>
        <button
          className="btn btn-outline-primary d-flex align-items-center"
          onClick={() => navigate('/history')}
        >
          <FiList className="me-2" size={18} />
          View All History
        </button>
      </div>

      <div className={`alert alert-${insightType} d-flex align-items-center mb-4`} role="alert">
        <FiTarget className="me-2" size={20} />
        <div className="fw-semibold">{insightMessage}</div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1 fw-semibold">Recent Interviews</h6>
                <h2 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}>
                  {totalInterviewCount}
                </h2>
              </div>
              <div>
                <FiVideo size={36} style={{ color: 'var(--primary-color)', opacity: 0.6 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card stat-card" style={{ borderLeftColor: 'var(--secondary-color)' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1 fw-semibold">Avg Accuracy</h6>
                <h2 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}>
                  {averageAccuracy}%
                </h2>
              </div>
              <div>
                <FiTarget size={36} style={{ color: 'var(--primary-color)', opacity: 0.6 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card stat-card" style={{ borderLeftColor: 'var(--primary-color)' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1 fw-semibold">Best Score</h6>
                <h2 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}>
                  {bestScore}
                </h2>
              </div>
              <div>
                <FiAward size={36} style={{ color: 'var(--primary-color)', opacity: 0.6 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card stat-card" style={{ borderLeftColor: 'var(--secondary-color)' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1 fw-semibold">Last Interview</h6>
                <p className="mb-0 fw-bold" style={{ color: 'var(--dark-color)', fontSize: '0.9rem' }}>
                  {lastInterviewDate}
                </p>
              </div>
              <div>
                <FiCalendar size={36} style={{ color: 'var(--secondary-color)', opacity: 0.6 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MCQ charts (existing) ── */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-4 fw-bold d-flex align-items-center">
            <FiTrendingUp className="me-2" style={{ color: 'var(--primary-color)' }} />
            MCQ Interview — Score Trend
          </h5>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--primary-color)"
                  strokeWidth={3}
                  name="Score"
                  dot={{ fill: 'var(--primary-color)', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-4 fw-bold d-flex align-items-center">
            <FiCheckCircle className="me-2" style={{ color: '#10b981' }} />
            MCQ Interview — Accuracy Trend
          </h5>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar
                  dataKey="accuracy"
                  fill="#10b981"
                  name="Accuracy (%)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
           AI TEXT INTERVIEW SECTION
      ════════════════════════════════════════════════════════════════ */}
      <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
        <h4 className="fw-bold d-flex align-items-center mb-0" style={{ color: '#8b5cf6' }}>
          <FiCpu className="me-2" size={22} /> AI Interview Performance
        </h4>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => navigate('/ai-history')}
        >
          View Full AI History
        </button>
      </div>

      {aiTotalSessions === 0 ? (
        <div className="card mb-4">
          <div className="card-body text-center py-5">
            <FiCpu size={48} className="mb-3" style={{ color: '#8b5cf6', opacity: 0.4 }} />
            <h5 className="text-muted">No AI interviews yet</h5>
            <p className="text-muted small">Take an AI-powered text interview to see your performance data here.</p>
            <button
              className="btn btn-sm mt-1"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px' }}
              onClick={() => navigate('/interview')}
            >
              <FiCpu size={13} className="me-2" /> Start AI Interview
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* AI Stat Cards */}
          <div className="row mb-4">
            <div className="col-md-4 col-sm-6 mb-3">
              <div className="card stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1 fw-semibold">AI Sessions</h6>
                    <h2 className="mb-0 fw-bold" style={{ color: '#8b5cf6' }}>{aiTotalSessions}</h2>
                  </div>
                  <FiCpu size={36} style={{ color: '#8b5cf6', opacity: 0.6 }} />
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-6 mb-3">
              <div className="card stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1 fw-semibold">Avg AI Score</h6>
                    <h2 className="mb-0 fw-bold" style={{ color: '#8b5cf6' }}>{aiAvgScore} / 10</h2>
                  </div>
                  <FiStar size={36} style={{ color: '#8b5cf6', opacity: 0.6 }} />
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-6 mb-3">
              <div className="card stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1 fw-semibold">Best AI Score</h6>
                    <h2 className="mb-0 fw-bold" style={{ color: '#8b5cf6' }}>{aiBestScore} / 10</h2>
                  </div>
                  <FiAward size={36} style={{ color: '#8b5cf6', opacity: 0.6 }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Score Trend Line Chart */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-4 fw-bold d-flex align-items-center">
                <FiCpu className="me-2" style={{ color: '#8b5cf6' }} />
                AI Interview — Average Score Trend
              </h5>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={aiChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      name="Avg Score (/10)"
                      dot={{ fill: '#8b5cf6', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Score % Bar Chart */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-4 fw-bold d-flex align-items-center">
                <FiTarget className="me-2" style={{ color: '#8b5cf6' }} />
                AI Interview — Score Percentage Trend
              </h5>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={aiChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar
                      dataKey="percentage"
                      fill="#8b5cf6"
                      name="Score (%)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
