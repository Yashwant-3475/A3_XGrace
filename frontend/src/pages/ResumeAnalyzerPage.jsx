import React, { useState } from 'react';
import axios from 'axios';
import { FiFileText, FiUpload, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const ResumeAnalyzerPage = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysis, setAnalysis] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0] || null);
        setError('');
        setAnalysis(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setAnalysis(null);

        if (!file) {
            setError('Please select a PDF resume to analyze.');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:5000/api/resume/analyze',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.status === 'success') {
                setAnalysis(response.data);
            } else {
                throw new Error(response.data.message || 'Analysis failed');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row justify-content-center mt-4">
            <div className="col-md-10 col-lg-9">
                <div className="text-center mb-4">
                    <div className="d-inline-block p-3 rounded-circle mb-3"
                        style={{ background: 'var(--primary-color)' }}>
                        <FiFileText size={32} color="white" />
                    </div>
                    <h2 className="fw-bold gradient-text">Resume Analyzer</h2>
                    <p className="text-muted">Upload your resume to get instant skill analysis</p>
                </div>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center mb-4">
                        <FiAlertCircle className="me-2" size={24} />
                        {error}
                    </div>
                )}

                <div className="card shadow-lg border-0 mb-4">
                    <div className="card-body p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="resumeFile" className="form-label fw-semibold">
                                    <FiUpload className="me-2" />
                                    Upload your PDF resume
                                </label>
                                <input
                                    type="file"
                                    id="resumeFile"
                                    accept=".pdf"
                                    className="form-control"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />
                                {file && (
                                    <small className="text-muted d-block mt-2">
                                        Selected: <strong>{file.name}</strong>
                                    </small>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg d-flex align-items-center"
                                disabled={loading || !file}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <FiFileText className="me-2" size={20} />
                                        Analyze Resume
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {analysis && (
                    <div className="analysis-results" style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div className="alert alert-info d-flex align-items-center mb-4">
                            <FiCheckCircle className="me-2" size={24} />
                            <div>
                                <strong>Analysis Type:</strong> {analysis.analysisType}
                                {analysis.note && <div className="small text-muted mt-1">{analysis.note}</div>}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <div className="card border-0 shadow">
                                    <div className="card-header text-white"
                                        style={{ background: 'var(--primary-color)' }}>
                                        <h5 className="mb-0 d-flex align-items-center">
                                            <FiCheckCircle className="me-2" />
                                            Matched Skills
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        {analysis.matchedSkills.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-2">
                                                {analysis.matchedSkills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="badge bg-success"
                                                        style={{
                                                            fontSize: '0.9rem',
                                                            padding: '0.5rem 1rem',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        <FiCheckCircle className="me-1" size={14} />
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted mb-0 d-flex align-items-center">
                                                <FiAlertCircle className="me-2" />
                                                No skills matched.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 mb-4">
                                <div className="card border-0 shadow">
                                    <div className="card-header text-white"
                                        style={{ background: 'var(--secondary-color)' }}>
                                        <h5 className="mb-0 d-flex align-items-center">
                                            <FiXCircle className="me-2" />
                                            Missing Skills
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        {analysis.missingSkills.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-2">
                                                {analysis.missingSkills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="badge bg-warning text-dark"
                                                        style={{
                                                            fontSize: '0.9rem',
                                                            padding: '0.5rem 1rem',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        <FiXCircle className="me-1" size={14} />
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted mb-0 d-flex align-items-center">
                                                <FiCheckCircle className="me-2" />
                                                No missing skills found.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeAnalyzerPage;
