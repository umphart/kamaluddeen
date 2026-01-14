// src/components/Results/ResultsFilters.jsx
import React from 'react';
import { FaSearch, FaFilter, FaTimes, FaCalculator } from 'react-icons/fa';

const ResultsFilters = ({
  searchTerm,
  setSearchTerm,
  selectedClass,
  setSelectedClass,
  selectedTerm,
  setSelectedTerm,
  selectedSession,
  setSelectedSession,
  selectedStatus,
  setSelectedStatus,
  classes,
  terms,
  sessions,
  statuses,
  clearFilters,
  results,
  setShowCalculateModal
}) => {
  const filterGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    marginRight: 12,
    marginBottom: 8,
    minWidth: 120
  };

  const filterRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 10
  };

  const selectStyle = {
    padding: '4px 8px',
    borderRadius: 4,
    border: '1px solid #ccc',
    fontSize: 12,
    minWidth: 100
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 10px',
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12
  };

  const btnPrimaryStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: '#fff'
  };

  const btnSecondaryStyle = {
    ...buttonStyle,
    backgroundColor: '#e5e7eb',
    color: '#111'
  };

  const searchBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc',
    borderRadius: 6,
    padding: '4px 8px',
    marginBottom: 10,
    maxWidth: 360
  };

  const searchInputStyle = {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 12,
    padding: '4px 6px'
  };

  const clearSearchStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    color: '#555'
  };

  return (
    <div style={{ marginBottom: 15 }}>
      {/* Search Box */}
      <div style={searchBoxStyle}>
        <FaSearch style={{ marginRight: 6, color: '#555' }} />
        <input
          type="text"
          placeholder="Search by student name, ID, or class..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
        {searchTerm && (
          <button style={clearSearchStyle} onClick={() => setSearchTerm('')}>
            <FaTimes />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div style={filterRowStyle}>
        <div style={filterGroupStyle}>
          <label style={{ fontSize: 10, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FaFilter /> Class
          </label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={selectStyle}>
            <option value="all">All Classes</option>
            {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
          </select>
        </div>

        <div style={filterGroupStyle}>
          <label style={{ fontSize: 10, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FaFilter /> Term
          </label>
          <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} style={selectStyle}>
            <option value="all">All Terms</option>
            {terms.map(term => <option key={term} value={term}>{term}</option>)}
          </select>
        </div>

        <div style={filterGroupStyle}>
          <label style={{ fontSize: 10, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FaFilter /> Session
          </label>
          <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} style={selectStyle}>
            <option value="all">All Sessions</option>
            {sessions.map(session => <option key={session} value={session}>{session}</option>)}
          </select>
        </div>

        <div style={filterGroupStyle}>
          <label style={{ fontSize: 10, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FaFilter /> Status
          </label>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={selectStyle}>
            <option value="all">All Status</option>
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>

        <button style={btnSecondaryStyle} onClick={clearFilters}>
          <FaTimes /> Clear Filters
        </button>

        <button style={btnPrimaryStyle} onClick={() => setShowCalculateModal(true)} disabled={results.length === 0}>
          <FaCalculator /> Calculate Positions
        </button>
      </div>
    </div>
  );
};

export default ResultsFilters;
