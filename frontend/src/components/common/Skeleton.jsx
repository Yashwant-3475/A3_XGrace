import React from 'react';
import './Skeleton.css';

/* ── Primitive shimmer block ── */
export const SkBlock = ({
  width = '100%',
  height = '16px',
  borderRadius,
  className = '',
  style = {},
}) => (
  <span
    className={`sk-block ${className}`}
    style={{ width, height, borderRadius, display: 'block', ...style }}
  />
);

/* ══════════════════════════════════════════════════
   DASHBOARD SKELETON
   4 stat cards + 2 chart placeholders
   ══════════════════════════════════════════════════ */
export const DashboardSkeleton = () => (
  <div className="sk-dashboard" aria-busy="true" aria-label="Loading dashboard">

    {/* Page header */}
    <div className="sk-page-header">
      <SkBlock width="220px" height="36px" borderRadius="10px" />
      <SkBlock width="140px" height="36px" borderRadius="8px" />
    </div>

    {/* Insight alert bar */}
    <SkBlock
      height="52px"
      borderRadius="10px"
      style={{ marginBottom: '24px' }}
    />

    {/* 4 Stat cards */}
    <div className="sk-stat-grid">
      {[...Array(4)].map((_, i) => (
        <div className="sk-stat-card" key={i}>
          <SkBlock width="60%" height="13px" borderRadius="6px" />
          <SkBlock width="40%" height="32px" borderRadius="8px" />
        </div>
      ))}
    </div>

    {/* Score Trend chart card */}
    <div className="sk-chart-card">
      <SkBlock width="200px" height="20px" borderRadius="6px" style={{ marginBottom: '20px' }} />
      <SkBlock width="100%" height="280px" borderRadius="10px" />
    </div>

    {/* Accuracy chart card */}
    <div className="sk-chart-card">
      <SkBlock width="180px" height="20px" borderRadius="6px" style={{ marginBottom: '20px' }} />
      <SkBlock width="100%" height="280px" borderRadius="10px" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════
   HISTORY PAGE SKELETON
   Filter bar + 4 interview cards (2×2 grid)
   ══════════════════════════════════════════════════ */
export const HistorySkeleton = () => (
  <div className="sk-history" aria-busy="true" aria-label="Loading interview history">

    {/* Page header */}
    <div className="sk-page-header">
      <SkBlock width="200px" height="36px" borderRadius="10px" />
      <SkBlock width="150px" height="36px" borderRadius="8px" />
    </div>

    {/* Filter card */}
    <div className="sk-filter-card">
      <SkBlock width="80px" height="18px" borderRadius="6px" style={{ marginBottom: '16px' }} />
      <div className="sk-filter-row">
        <div>
          <SkBlock width="100px" height="13px" borderRadius="5px" style={{ marginBottom: '8px' }} />
          <SkBlock width="100%" height="38px" borderRadius="8px" />
        </div>
        <div>
          <SkBlock width="80px" height="13px" borderRadius="5px" style={{ marginBottom: '8px' }} />
          <SkBlock width="100%" height="38px" borderRadius="8px" />
        </div>
        <div>
          <SkBlock width="80px" height="13px" borderRadius="5px" style={{ marginBottom: '8px' }} />
          <SkBlock width="100%" height="38px" borderRadius="8px" />
        </div>
      </div>
      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <SkBlock width="120px" height="36px" borderRadius="8px" />
        <SkBlock width="120px" height="36px" borderRadius="8px" />
      </div>
    </div>

    {/* Result count line */}
    <SkBlock width="160px" height="13px" borderRadius="5px" style={{ marginBottom: '16px' }} />

    {/* 4 interview cards in 2×2 grid */}
    <div className="sk-card-grid">
      {[...Array(4)].map((_, i) => (
        <div className="sk-interview-card" key={i}>
          {/* Card header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <SkBlock width="130px" height="20px" borderRadius="6px" />
            <SkBlock width="80px" height="22px" borderRadius="999px" />
          </div>
          {/* Stats 2×2 */}
          <div className="sk-stats-row">
            {[...Array(4)].map((_, j) => (
              <div className="sk-stat-item" key={j}>
                <SkBlock width="60px" height="11px" borderRadius="4px" />
                <SkBlock width="80px" height="18px" borderRadius="5px" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════
   RESUME HISTORY PANEL SKELETON
   3 shimmer resume history items
   ══════════════════════════════════════════════════ */
export const ResumeHistorySkeleton = () => (
  <div className="sk-resume-panel" aria-busy="true" aria-label="Loading resume history">
    {/* Panel header */}
    <div className="sk-resume-panel__header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <SkBlock width="18px" height="18px" borderRadius="4px" />
        <SkBlock width="180px" height="18px" borderRadius="6px" />
      </div>
    </div>

    {/* 3 history item rows */}
    <div className="sk-resume-panel__body">
      {[...Array(3)].map((_, i) => (
        <div className="sk-resume-item" key={i}>
          {/* File icon */}
          <SkBlock
            width="40px"
            height="40px"
            borderRadius="10px"
            style={{ flexShrink: 0 }}
          />
          {/* Info: filename + date */}
          <div className="sk-resume-item__info">
            <SkBlock width="65%" height="14px" borderRadius="5px" />
            <SkBlock width="45%" height="11px" borderRadius="4px" />
          </div>
          {/* Badge */}
          <SkBlock width="55px" height="22px" borderRadius="999px" style={{ flexShrink: 0 }} />
          {/* Download button */}
          <SkBlock width="110px" height="30px" borderRadius="8px" style={{ flexShrink: 0 }} />
        </div>
      ))}
    </div>
  </div>
);

export default SkBlock;
