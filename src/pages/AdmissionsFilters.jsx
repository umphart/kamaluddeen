// src/pages/AdmissionsFilters.jsx
import React from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiRefreshCw,
  FiGrid,
  FiList
} from 'react-icons/fi';

const AdmissionsFilters = ({
  searchTerm,
  setSearchTerm,
  selectedLevel,
  setSelectedLevel,
  selectedClass,
  setSelectedClass,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
  filteredStudents,
  stats,
  clearFilters,
  levels,
  classes
}) => {
  const statuses = [
    { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'Inactive', label: 'Inactive', color: 'bg-red-100 text-red-800' },
    { value: 'Graduated', label: 'Graduated', color: 'bg-blue-100 text-blue-800' },
    { value: 'Transferred', label: 'Transferred', color: 'bg-gray-100 text-gray-800' }
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name, admission number, or parent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" />
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setSelectedClass('All');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="All">All Levels</option>
              {levels.map(level => (
                <option key={level.code} value={level.code}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
          
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={selectedLevel === 'All'}
          >
            <option value="All">All Classes</option>
            {selectedLevel !== 'All' && classes[selectedLevel]?.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="All">All Status</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiRefreshCw />
            Clear
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredStudents.length}</span> of <span className="font-semibold">{stats.total}</span> students
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'table' 
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiList />
            Table
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'cards' 
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiGrid />
            Cards
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsFilters;