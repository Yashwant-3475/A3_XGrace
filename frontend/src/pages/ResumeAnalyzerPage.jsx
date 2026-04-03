import React, { useState, useRef, useCallback, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import api from '../api';
import { toast } from 'react-toastify';
import {
  FiFileText, FiUpload, FiCheckCircle, FiXCircle,
  FiAlertCircle, FiInfo, FiTrash2, FiFile,
  FiClock, FiDownload, FiChevronDown
} from 'react-icons/fi';
import './ResumeHistory.css';
import { ResumeHistorySkeleton } from '../components/Skeleton';

/* ---- constants ---- */
const ALLOWED_MIME  = 'application/pdf';
const ALLOWED_EXT   = '.pdf';
const MAX_SIZE_MB   = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const HISTORY_LIMIT = 5;

/* ---- PDF report generator (runs entirely in-browser) ---- */
const generatePDF = (item) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PW = 210; // page width
  const M  = 18;  // margin
  const CW = PW - M * 2; // content width
  let y = M;

  const nextLine = (gap = 6) => { y += gap; };
  const checkPage = (need = 10) => {
    if (y + need > 285) { doc.addPage(); y = M; }
  };

  // ── Header bar ──
  doc.setFillColor(111, 45, 189);
  doc.rect(0, 0, PW, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('Resume Analysis Report', M, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, PW - M, 14, { align: 'right' });
  y = 30;

  // ── File metadata ──
  doc.setTextColor(30, 16, 48);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`File: ${item.filename}`, M, y);
  nextLine(5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 120);
  doc.text(`Analyzed: ${new Date(item.createdAt).toLocaleString()}   |   Source: ${item.analysisSource}`, M, y);
  nextLine(10);

  // ── Section helper ──
  const section = (title, items, color = [111, 45, 189]) => {
    checkPage(16);
    doc.setFillColor(...color);
    doc.roundedRect(M, y, CW, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), M + 4, y + 5.5);
    nextLine(11);
    if (!items || items.length === 0) {
      checkPage(8);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 160);
      doc.text('None listed.', M + 4, y);
      nextLine(8);
      return;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 30, 60);
    items.forEach((item) => {
      checkPage(7);
      const lines = doc.splitTextToSize(`• ${item}`, CW - 6);
      lines.forEach((l) => {
        doc.text(l, M + 4, y);
        nextLine(5);
      });
    });
    nextLine(3);
  };

  const textSection = (title, text, color = [111, 45, 189]) => {
    checkPage(16);
    doc.setFillColor(...color);
    doc.roundedRect(M, y, CW, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), M + 4, y + 5.5);
    nextLine(11);
    if (!text) {
      checkPage(8);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 160);
      doc.text('Not available.', M + 4, y);
      nextLine(8);
      return;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 30, 60);
    const lines = doc.splitTextToSize(text, CW - 6);
    lines.forEach((l) => {
      checkPage(6);
      doc.text(l, M + 4, y);
      nextLine(5);
    });
    nextLine(3);
  };

  const a = item.analysis || {};
  section('Matched Skills',          a.matchedSkills,         [22, 163, 74]);
  section('Missing Skills',          a.missingSkills,         [220, 38, 38]);
  section('All Detected Skills',     a.skills,                [111, 45, 189]);
  textSection('Experience Summary',  a.experienceSummary,     [79, 70, 229]);
  textSection('Role Suitability',    a.roleSuitability,       [79, 70, 229]);
  section('Strengths',               a.strengths,             [22, 163, 74]);
  section('Weak Areas',              a.weakAreas,             [220, 38, 38]);
  section('Improvement Suggestions', a.improvementSuggestions,[245, 158, 11]);

  // ── Footer ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 180);
    doc.text(`AI Interview Platform — Resume Report  |  Page ${i} of ${totalPages}`, PW / 2, 292, { align: 'center' });
  }

  const safeName = (item.filename || 'resume').replace(/\.pdf$/i, '');
  doc.save(`${safeName}_analysis_report.pdf`);
};

/* ════════════════════════════════════════════════════════
   HISTORY PANEL component
   ════════════════════════════════════════════════════════ */
const HistoryPanel = ({ history, onDelete }) => {
  const [open, setOpen] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  if (!history || history.length === 0) return null;

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/resume/history/${id}`);
      onDelete(id);
      toast.success('Resume record deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="rh-panel">
      {/* Toggle header */}
      <div
        className={`rh-panel__header${open ? ' rh-panel__header--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h3 className="rh-panel__title">
          <FiClock className="rh-panel__title-icon" size={18} />
          Resume History
          <span className="rh-panel__count">{history.length} / {HISTORY_LIMIT}</span>
        </h3>
        <FiChevronDown
          className={`rh-panel__chevron${open ? ' rh-panel__chevron--open' : ''}`}
          size={18}
        />
      </div>

      {/* Collapsible body */}
      {open && (
        <div className="rh-panel__body">
          <div className="rh-panel__inner">
            {history.map((item) => {
              const a = item.analysis || {};
              return (
                <div className="rh-item" key={item._id}>
                  {/* Top row */}
                  <div className="rh-item__top">
                    <div className="rh-item__file-icon">
                      <FiFile size={20} />
                    </div>
                    <div className="rh-item__info">
                      <p className="rh-item__filename">{item.filename}</p>
                      <p className="rh-item__date">{formatDate(item.createdAt)}</p>
                    </div>
                    <span className={`rh-item__badge rh-item__badge--${item.analysisSource === 'AI' ? 'ai' : 'fallback'}`}>
                      {item.analysisSource}
                    </span>
                    <button
                      className="rh-btn-delete"
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      title="Delete this record"
                    >
                      {deletingId === item._id
                        ? <span className="spinner-border spinner-border-sm" role="status" />
                        : <FiTrash2 size={14} />}
                    </button>
                  </div>

                  {/* Skill count chips */}
                  <div className="rh-item__chips">
                    {(a.matchedSkills?.length > 0) && (
                      <span className="rh-chip rh-chip--matched">
                        <FiCheckCircle size={11} />
                        {a.matchedSkills.length} matched
                      </span>
                    )}
                    {(a.missingSkills?.length > 0) && (
                      <span className="rh-chip rh-chip--missing">
                        <FiXCircle size={11} />
                        {a.missingSkills.length} missing
                      </span>
                    )}
                    {(a.skills?.length > 0) && (
                      <span className="rh-chip rh-chip--skills">
                        <FiFileText size={11} />
                        {a.skills.length} skills detected
                      </span>
                    )}
                  </div>

                  {/* Download button */}
                  <button
                    className="rh-btn-download"
                    onClick={() => generatePDF(item)}
                    title="Download analysis as PDF"
                  >
                    <FiDownload size={13} />
                    Download Report
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════ */
const ResumeAnalyzerPage = () => {
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory]   = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fileInputRef = useRef(null);

  /* ── Fetch history on mount ── */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/resume/history');
        setHistory(res.data.history || []);
      } catch (err) {
        // silently ignore — user may not be logged in or history is empty
        console.warn('Could not load resume history:', err.message);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  /* ---- client-side validation ---- */
  const validateFile = (f) => {
    if (!f) return 'Please select a file.';
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'));
    if (f.type !== ALLOWED_MIME && ext !== ALLOWED_EXT)
      return `Invalid file type "${f.type || ext}". Only PDF files are accepted.`;
    if (f.size > MAX_SIZE_BYTES) {
      const sizeMB = (f.size / 1024 / 1024).toFixed(2);
      return `File is too large (${sizeMB} MB). Maximum allowed size is ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const applyFile = (f) => {
    setAnalysis(null);
    const err = validateFile(f);
    if (err) { setError(err); setFile(null); return; }
    setError('');
    setFile(f);
  };

  const handleFileChange  = (e) => applyFile(e.target.files[0] || null);
  const handleDragOver    = useCallback((e) => { e.preventDefault(); setDragOver(true);  }, []);
  const handleDragLeave   = useCallback((e) => { e.preventDefault(); setDragOver(false); }, []);
  const handleDrop        = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    applyFile(e.dataTransfer.files[0] || null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearFile = () => {
    setFile(null); setError(''); setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ---- submit ---- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setAnalysis(null);
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
        const result = response.data;
        setAnalysis(result);

        // Prepend to history (optimistic update) and enforce limit
        const newRecord = {
          _id: result.id || Date.now().toString(),
          filename: result.filename || file.name,
          createdAt: new Date().toISOString(),
          analysisSource: result.analysisType?.toUpperCase() === 'AI' ? 'AI' : 'FALLBACK',
          analysis: {
            matchedSkills: result.matchedSkills,
            missingSkills: result.missingSkills,
            skills: result.skills,
            experienceSummary: result.experienceSummary,
            roleSuitability: result.roleSuitability,
            strengths: result.strengths,
            weakAreas: result.weakAreas,
            improvementSuggestions: result.improvementSuggestions,
          },
        };
        setHistory((prev) => [newRecord, ...prev].slice(0, HISTORY_LIMIT));
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

  /* ── Delete a history record ── */
  const handleDeleteRecord = (id) => {
    setHistory((prev) => prev.filter((item) => item._id !== id));
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="resume-analyzer-page">

      {/* ── Compact Header ── */}
      <div className="resume-page-header">
        <div className="resume-page-header__icon">
          <FiFileText size={24} color="white" />
        </div>
        <div>
          <h2 className="resume-page-header__title gradient-text">Resume Analyzer</h2>
          <p className="resume-page-header__sub">Upload your resume to get instant AI-powered skill analysis</p>
        </div>
      </div>

      {/* ── Error Alert ── */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-3">
          <FiAlertCircle className="me-2 flex-shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ── TOP ROW: Guidelines LEFT + Dropzone RIGHT ── */}
      <div className="resume-top-grid">

        {/* Left: Upload Guidelines */}
        <div className="resume-instructions-panel">
          <h6 className="resume-instructions-title">
            <FiInfo size={15} className="me-2" />
            Upload Guidelines
          </h6>
          <div className="resume-instructions-list">
            <div className="resume-instruction-item">
              <span className="resume-instruction-icon">📄</span>
              <div><strong>File Format</strong><p>PDF only (.pdf)</p></div>
            </div>
            <div className="resume-instruction-item">
              <span className="resume-instruction-icon">📦</span>
              <div><strong>Max File Size</strong><p>{MAX_SIZE_MB} MB</p></div>
            </div>
            <div className="resume-instruction-item">
              <span className="resume-instruction-icon">🔒</span>
              <div><strong>Privacy</strong><p>File deleted after analysis</p></div>
            </div>
            <div className="resume-instruction-item">
              <span className="resume-instruction-icon">✅</span>
              <div><strong>Best Results</strong><p>Use text-based (non-scanned) PDF</p></div>
            </div>
          </div>
        </div>

        {/* Right: Upload Dropzone */}
        <div className="resume-upload-panel">
          <form onSubmit={handleSubmit}>
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
                <div className="resume-file-preview">
                  <div className="resume-file-icon"><FiFile size={32} /></div>
                  <div className="resume-file-info">
                    <p className="resume-file-name">{file.name}</p>
                    <p className="resume-file-meta">{formatBytes(file.size)}&nbsp;&bull;&nbsp;PDF Document</p>
                  </div>
                  <button
                    type="button"
                    className="resume-file-clear"
                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                    title="Remove file"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ) : (
                <div className="resume-dropzone-placeholder">
                  <div className="resume-dropzone-icon"><FiUpload size={28} /></div>
                  <p className="resume-dropzone-primary">Drag &amp; drop your PDF here</p>
                  <p className="resume-dropzone-secondary">or <span className="resume-dropzone-browse">browse to upload</span></p>
                  <p className="resume-dropzone-hint">PDF only &bull; Max {MAX_SIZE_MB} MB</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              id="resumeFile"
              accept={ALLOWED_EXT}
              className="d-none"
              onChange={handleFileChange}
              disabled={loading}
            />

            <button
              type="submit"
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center mt-3"
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Analyzing…
                </>
              ) : (
                <>
                  <FiFileText className="me-2" size={18} />
                  Analyze Resume
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── Analysis Results ── */}
      {analysis && (
        <div className="analysis-results mt-4" style={{ animation: 'fadeIn 0.5s ease' }}>
          <div className="alert alert-info d-flex align-items-center mb-4">
            <FiCheckCircle className="me-2 flex-shrink-0" size={22} />
            <div>
              <strong>Analysis Type:</strong> {analysis.analysisType}
              {analysis.note && <div className="small text-muted mt-1">{analysis.note}</div>}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card border-0 shadow">
                <div className="card-header text-white" style={{ background: 'var(--primary-color)' }}>
                  <h5 className="mb-0 d-flex align-items-center">
                    <FiCheckCircle className="me-2" /> Matched Skills
                  </h5>
                </div>
                <div className="card-body">
                  {analysis.matchedSkills.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {analysis.matchedSkills.map((skill, i) => (
                        <span key={i} className="badge bg-success" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', fontWeight: 500 }}>
                          <FiCheckCircle className="me-1" size={14} />{skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0 d-flex align-items-center">
                      <FiAlertCircle className="me-2" /> No skills matched.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card border-0 shadow">
                <div className="card-header text-white" style={{ background: 'var(--secondary-color)' }}>
                  <h5 className="mb-0 d-flex align-items-center">
                    <FiXCircle className="me-2" /> Missing Skills
                  </h5>
                </div>
                <div className="card-body">
                  {analysis.missingSkills.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {analysis.missingSkills.map((skill, i) => (
                        <span key={i} className="badge bg-warning text-dark" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', fontWeight: 500 }}>
                          <FiXCircle className="me-1" size={14} />{skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0 d-flex align-items-center">
                      <FiCheckCircle className="me-2" /> No missing skills found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Resume History Panel ── */}
      {historyLoading
        ? <ResumeHistorySkeleton />
        : <HistoryPanel history={history} onDelete={handleDeleteRecord} />
      }

    </div>
  );

};

export default ResumeAnalyzerPage;
