import React, { useState, useRef, useCallback } from 'react';
import api from '../api';
import {
  FiFileText, FiUpload, FiCheckCircle, FiXCircle,
  FiAlertCircle, FiInfo, FiTrash2, FiFile
} from 'react-icons/fi';

/* ---- constants that must match the backend multer config ---- */
const ALLOWED_MIME = 'application/pdf';
const ALLOWED_EXT  = '.pdf';
const MAX_SIZE_MB   = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const ResumeAnalyzerPage = () => {
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  /* ---- client-side validation ---- */
  const validateFile = (f) => {
    if (!f) return 'Please select a file.';
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'));
    if (f.type !== ALLOWED_MIME && ext !== ALLOWED_EXT) {
      return `Invalid file type "${f.type || ext}". Only PDF files are accepted.`;
    }
    if (f.size > MAX_SIZE_BYTES) {
      const sizeMB = (f.size / 1024 / 1024).toFixed(2);
      return `File is too large (${sizeMB} MB). Maximum allowed size is ${MAX_SIZE_MB} MB.`;
    }
    return null; // valid
  };

  const applyFile = (f) => {
    setAnalysis(null);
    const err = validateFile(f);
    if (err) { setError(err); setFile(null); return; }
    setError('');
    setFile(f);
  };

  /* ---- native input change ---- */
  const handleFileChange = (e) => applyFile(e.target.files[0] || null);

  /* ---- drag-and-drop ---- */
  const handleDragOver  = useCallback((e) => { e.preventDefault(); setDragOver(true);  }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setDragOver(false); }, []);
  const handleDrop      = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    applyFile(e.dataTransfer.files[0] || null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearFile = () => {
    setFile(null);
    setError('');
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ---- submit ---- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAnalysis(null);

    const clientErr = validateFile(file);
    if (clientErr) { setError(clientErr); return; }

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    try {
      const response = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status === 'success') {
        setAnalysis(response.data);
      } else {
        throw new Error(response.data.message || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to analyze resume. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---- helpers ---- */
  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-md-10 col-lg-9">

        {/* ---- Header ---- */}
        <div className="text-center mb-4">
          <div
            className="d-inline-block p-3 rounded-circle mb-3"
            style={{ background: 'var(--primary-color)' }}
          >
            <FiFileText size={32} color="white" />
          </div>
          <h2 className="fw-bold gradient-text">Resume Analyzer</h2>
          <p className="text-muted">Upload your resume to get instant skill analysis</p>
        </div>

        {/* ---- Upload Instructions Panel ---- */}
        <div className="resume-instructions-panel mb-4">
          <h6 className="resume-instructions-title">
            <FiInfo size={16} className="me-2" />
            Upload Guidelines
          </h6>
          <div className="resume-instructions-grid">
            <div className="resume-instruction-item">
              <span className="resume-instruction-icon">📄</span>
              <div>
                <strong>File Format</strong>
                <p>PDF only (.pdf)</p>
              </div>
            </div>
            <div className="resume-instruction-item">
              <span className="resume-instruction-icon">📦</span>
              <div>
                <strong>Max File Size</strong>
                <p>{MAX_SIZE_MB} MB</p>
              </div>
            </div>
            <div className="resume-instruction-item">
              <span className="resume-instruction-icon">🔒</span>
              <div>
                <strong>Privacy</strong>
                <p>File deleted after analysis</p>
              </div>
            </div>
            <div className="resume-instruction-item">
              <span className="resume-instruction-icon">✅</span>
              <div>
                <strong>Best Results</strong>
                <p>Use text-based (non-scanned) PDF</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Error Alert ---- */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-4">
            <FiAlertCircle className="me-2 flex-shrink-0" size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* ---- Upload Card ---- */}
        <div className="card shadow-lg border-0 mb-4">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>

              {/* Drag-and-drop zone */}
              <div
                className={`resume-dropzone${dragOver ? ' resume-dropzone--active' : ''}${file ? ' resume-dropzone--has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && !file && fileInputRef.current?.click()}
              >
                {file ? (
                  /* ---- File selected preview ---- */
                  <div className="resume-file-preview">
                    <div className="resume-file-icon">
                      <FiFile size={36} />
                    </div>
                    <div className="resume-file-info">
                      <p className="resume-file-name">{file.name}</p>
                      <p className="resume-file-meta">
                        {formatBytes(file.size)}
                        &nbsp;&bull;&nbsp;PDF Document
                      </p>
                    </div>
                    <button
                      type="button"
                      className="resume-file-clear"
                      onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      title="Remove file"
                      aria-label="Remove selected file"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ) : (
                  /* ---- Empty drop zone ---- */
                  <div className="resume-dropzone-placeholder">
                    <div className="resume-dropzone-icon">
                      <FiUpload size={32} />
                    </div>
                    <p className="resume-dropzone-primary">
                      Drag &amp; drop your PDF here
                    </p>
                    <p className="resume-dropzone-secondary">
                      or <span className="resume-dropzone-browse">browse to upload</span>
                    </p>
                    <p className="resume-dropzone-hint">
                      PDF only &bull; Max {MAX_SIZE_MB} MB
                    </p>
                  </div>
                )}
              </div>

              {/* Hidden native file input */}
              <input
                ref={fileInputRef}
                type="file"
                id="resumeFile"
                accept={ALLOWED_EXT}
                className="d-none"
                onChange={handleFileChange}
                disabled={loading}
              />

              {/* Submit button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg d-flex align-items-center mt-3"
                disabled={loading || !file}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Analyzing…
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

        {/* ---- Analysis Results ---- */}
        {analysis && (
          <div className="analysis-results" style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="alert alert-info d-flex align-items-center mb-4">
              <FiCheckCircle className="me-2 flex-shrink-0" size={24} />
              <div>
                <strong>Analysis Type:</strong> {analysis.analysisType}
                {analysis.note && (
                  <div className="small text-muted mt-1">{analysis.note}</div>
                )}
              </div>
            </div>

            <div className="row">
              {/* Matched Skills */}
              <div className="col-md-6 mb-4">
                <div className="card border-0 shadow">
                  <div
                    className="card-header text-white"
                    style={{ background: 'var(--primary-color)' }}
                  >
                    <h5 className="mb-0 d-flex align-items-center">
                      <FiCheckCircle className="me-2" />
                      Matched Skills
                    </h5>
                  </div>
                  <div className="card-body">
                    {analysis.matchedSkills.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {analysis.matchedSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="badge bg-success"
                            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', fontWeight: 500 }}
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

              {/* Missing Skills */}
              <div className="col-md-6 mb-4">
                <div className="card border-0 shadow">
                  <div
                    className="card-header text-white"
                    style={{ background: 'var(--secondary-color)' }}
                  >
                    <h5 className="mb-0 d-flex align-items-center">
                      <FiXCircle className="me-2" />
                      Missing Skills
                    </h5>
                  </div>
                  <div className="card-body">
                    {analysis.missingSkills.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {analysis.missingSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="badge bg-warning text-dark"
                            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', fontWeight: 500 }}
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
