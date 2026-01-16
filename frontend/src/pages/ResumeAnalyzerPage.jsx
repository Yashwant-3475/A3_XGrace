import React, { useState } from 'react';
import axios from 'axios';

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
        <div className="row justify-content-center">
            <div className="col-md-8">
                <h2 className="mb-3 text-center">Resume Analyzer</h2>

                {error && <div className="alert alert-danger mb-3">{error}</div>}

                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="mb-3">
                        <label htmlFor="resumeFile" className="form-label">
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
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !file}
                    >
                        {loading ? 'Analyzing...' : 'Analyze Resume'}
                    </button>
                </form>

                {analysis && (
                    <div className="analysis-results">
                        <div className="alert alert-info">
                            <strong>Analysis Type:</strong> {analysis.analysisType}
                            {analysis.note && <div className="small text-muted">{analysis.note}</div>}
                        </div>

                        <div className="row mt-4">
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-header bg-success text-white">
                                        <h5 className="mb-0">Matched Skills</h5>
                                    </div>
                                    <div className="card-body">
                                        {analysis.matchedSkills.length > 0 ? (
                                            <ul className="list-group list-group-flush">
                                                {analysis.matchedSkills.map((skill, index) => (
                                                    <li key={index} className="list-group-item">
                                                        {skill}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-muted">No skills matched.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-header bg-warning text-dark">
                                        <h5 className="mb-0">Missing Skills</h5>
                                    </div>
                                    <div className="card-body">
                                        {analysis.missingSkills.length > 0 ? (
                                            <ul className="list-group list-group-flush">
                                                {analysis.missingSkills.map((skill, index) => (
                                                    <li key={index} className="list-group-item">
                                                        {skill}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-muted">No missing skills found.</p>
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
