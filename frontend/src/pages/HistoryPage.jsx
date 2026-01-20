import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFilter, FiCalendar, FiTrendingUp, FiTarget } from 'react-icons/fi';

const HistoryPage = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const [filters, setFilters] = useState({
        minScore: '',
        startDate: '',
        endDate: '',
    });

    const fetchHistory = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError('Authentication required. Please login again.');
                setLoading(false);
                return;
            }

            let url = `http://localhost:5000/api/results/history?page=${page}&limit=5`;

            if (filters.minScore) {
                url += `&minScore=${filters.minScore}`;
            }
            if (filters.startDate) {
                url += `&startDate=${filters.startDate}`;
            }
            if (filters.endDate) {
                url += `&endDate=${filters.endDate}`;
            }

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setResults(response.data.results || []);
            setCurrentPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);
            setTotalResults(response.data.totalResults);
            setError('');
        } catch (err) {
            console.error('Error fetching history:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            setError('Failed to load interview history.');
        } finally {
            setLoading(false);
        }
    }, [filters.minScore, filters.startDate, filters.endDate]);

    useEffect(() => {
        fetchHistory(1);
    }, [fetchHistory]);

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const applyFilters = () => {
        setCurrentPage(1);
        fetchHistory(1);
    };

    const clearFilters = () => {
        setFilters({
            minScore: '',
            startDate: '',
            endDate: '',
        });
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            fetchHistory(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            fetchHistory(currentPage + 1);
        }
    };

    if (loading && currentPage === 1) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading interview history...</p>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger text-center">{error}</div>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="gradient-text fw-bold">Interview History</h1>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Dashboard
                </button>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3 d-flex align-items-center">
                        <FiFilter className="me-2" />
                        Filters
                    </h5>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Minimum Score</label>
                            <input
                                type="number"
                                className="form-control"
                                name="minScore"
                                value={filters.minScore}
                                onChange={handleFilterChange}
                                placeholder="e.g., 5"
                                min="0"
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Start Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-semibold">End Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                    <div className="mt-3 d-flex gap-2">
                        <button className="btn btn-primary" onClick={applyFilters}>
                            Apply Filters
                        </button>
                        <button className="btn btn-outline-secondary" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {results.length === 0 ? (
                <div className="text-center py-5">
                    <FiCalendar size={64} className="text-muted mb-3" />
                    <h4 className="text-muted">No interview results found</h4>
                    <p className="text-muted">Try adjusting your filters or take a new mock interview</p>
                </div>
            ) : (
                <>
                    <div className="mb-3 text-muted">
                        Showing {results.length} of {totalResults} results
                    </div>

                    <div className="row">
                        {results.map((result, index) => (
                            <div key={result._id} className="col-md-6 mb-3">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <h5 className="card-title mb-0">
                                                Interview #{totalResults - ((currentPage - 1) * 5 + index)}
                                            </h5>
                                            <span className="badge bg-primary">
                                                {new Date(result.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-6">
                                                <div className="d-flex align-items-center">
                                                    <FiTrendingUp className="me-2" style={{ color: 'var(--primary-color)' }} />
                                                    <div>
                                                        <small className="text-muted d-block">Score</small>
                                                        <strong style={{ color: 'var(--primary-color)' }}>
                                                            {result.score}/{result.totalQuestions}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-6">
                                                <div className="d-flex align-items-center">
                                                    <FiTarget className="me-2" style={{ color: 'var(--secondary-color)' }} />
                                                    <div>
                                                        <small className="text-muted d-block">Accuracy</small>
                                                        <strong style={{ color: 'var(--primary-color)' }}>{result.accuracy}%</strong>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-6">
                                                <small className="text-muted d-block">Attempted</small>
                                                <strong>{result.attemptedQuestions}</strong>
                                            </div>

                                            <div className="col-6">
                                                <small className="text-muted d-block">Correct</small>
                                                <strong className="text-success">{result.correctAnswers}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <button
                            className="btn btn-outline-primary d-flex align-items-center"
                            onClick={handlePrevious}
                            disabled={currentPage === 1 || loading}
                        >
                            <FiChevronLeft className="me-1" />
                            Previous
                        </button>

                        <span className="text-muted">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            className="btn btn-outline-primary d-flex align-items-center"
                            onClick={handleNext}
                            disabled={currentPage === totalPages || loading}
                        >
                            Next
                            <FiChevronRight className="ms-1" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default HistoryPage;
