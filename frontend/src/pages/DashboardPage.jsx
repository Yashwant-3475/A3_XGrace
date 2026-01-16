import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Dashboard page that shows basic performance stats
// - Fetches past mock interview results from the backend
// - Shows latest score and accuracy
// - Displays a simple bar chart of recent attempts
// - Shows CTA buttons when no attempts exist
const DashboardPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/results');
        setResults(response.data || []);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load performance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return <div className="text-center">Loading performance data...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  // ✅ NO RESULTS → SHOW CTA BUTTONS
  if (!results.length) {
    return (
      <div className="text-center">
        <h1 className="mb-3">Dashboard</h1>
        <p className="lead">
          No interview attempts yet. Take a mock interview to see your performance here.
        </p>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <button
            className="btn btn-success"
            onClick={() => navigate('/mock-interview')}
          >
            Start Mock Interview
          </button>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/resume-analyzer')}
          >
            Analyze Resume
          </button>
        </div>
      </div>
    );
  }

  // Use the most recent result for quick stats
  const latest = results[0];

  // Prepare simple chart data (show up to last 5 attempts)
  const chartData = results
    .slice(0, 5)
    .map((r, index) => ({
      name: `Attempt ${results.length - index}`,
      score: r.score,
      accuracy: r.accuracy,
    }))
    .reverse();

  const attemptedVsCorrect = {
    attempted: latest.attemptedQuestions,
    correct: latest.correctAnswers,
  };

  return (
    <div>
      <h1 className="mb-3 text-center">Performance Dashboard</h1>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Last Score</h5>
              <p className="display-6 mb-0">
                {latest.score}/{latest.totalQuestions}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Accuracy</h5>
              <p className="display-6 mb-0">{latest.accuracy}%</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Attempted vs Correct</h5>
              <p className="mb-0">
                Attempted: <strong>{attemptedVsCorrect.attempted}</strong>
              </p>
              <p className="mb-0">
                Correct: <strong>{attemptedVsCorrect.correct}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title text-center mb-4">Recent Attempts</h5>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#0d6efd" name="Score" />
                <Bar dataKey="accuracy" fill="#198754" name="Accuracy (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
