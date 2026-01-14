import React from 'react';

const AcademicsFilters = ({
  searchTerm,
  setSearchTerm,
  selectedLevel,
  setSelectedLevel,
  selectedStatus,
  setSelectedStatus,
  activeTab,
  clearFilters
}) => {
  const levels = [
    { code: 'all', name: 'All Levels' },
    { code: 'PN', name: 'Pre-Nursery' },
    { code: 'NU', name: 'Nursery' },
    { code: 'PR', name: 'Primary' },
    { code: 'JS', name: 'Junior Secondary' }
  ];

  return (
    <div
      style={{
        background: '#fff',
        padding: 12,
        borderRadius: 6,
        border: '1px solid #e5e7eb',
        marginTop: 12
      }}
    >
      {/* Search */}
      <input
        type="text"
        placeholder={
          activeTab === 'subjects'
            ? 'Search subject name or code...'
            : activeTab === 'classes'
            ? 'Search class name...'
            : 'Search timetables...'
        }
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          fontSize: 13,
          borderRadius: 6,
          border: '1px solid #d1d5db',
          marginBottom: 10
        }}
      />

      {/* Filters Row */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        {/* Level */}
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          style={{
            padding: '6px 10px',
            fontSize: 13,
            borderRadius: 6,
            border: '1px solid #d1d5db',
            minWidth: 160
          }}
        >
          {levels.map(level => (
            <option key={level.code} value={level.code}>
              {level.name}
            </option>
          ))}
        </select>

        {/* Status (Subjects only) */}
        {activeTab === 'subjects' && (
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid #d1d5db',
              minWidth: 140
            }}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        )}

        {/* Clear */}
        <button
          onClick={clearFilters}
          style={{
            padding: '6px 14px',
            fontSize: 13,
            borderRadius: 6,
            border: '1px solid #d1d5db',
            background: '#f9fafb',
            cursor: 'pointer'
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default AcademicsFilters;
