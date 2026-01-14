// src/components/Results/ControlPanel.jsx
import React from 'react';
import { FiUsers, FiUser, FiRefreshCw } from 'react-icons/fi';

const ControlPanel = ({
  selectedClass,
  setSelectedClass,
  selectedTerm,
  setSelectedTerm,
  academicYear,
  setAcademicYear,
  activeTab,
  setActiveTab,
  selectedStudent,
  setSelectedStudent,
  availableClasses = [],
  students = [],
  isLoading,
  isSaving,
  statistics = {},
  loadClassData,
  hasData = false
}) => {
  const getTerms = () => [
    { value: '1st Term', label: '1st Term' },
    { value: '2nd Term', label: '2nd Term' },
    { value: '3rd Term', label: '3rd Term' }
  ];

  // Safely parse statistics with defaults
  const safeStatistics = {
    total: statistics?.total || 0,
    completed: statistics?.completed || 0,
    pending: statistics?.pending || 0,
    averageScore: statistics?.averageScore || 0,
    // New fields for partial results
    partial: statistics?.partial || 0
  };

  // Calculate partial results (where only one score is entered)
  // If partial is not provided in statistics, calculate it
  if (safeStatistics.partial === 0 && safeStatistics.total > 0) {
    safeStatistics.partial = safeStatistics.total - safeStatistics.completed - safeStatistics.pending;
  }

  // Format average score - ensure it's a number and format to 1 decimal place
  const formatAverageScore = (score) => {
    const num = parseFloat(score);
    if (isNaN(num)) return '0.0';
    return num.toFixed(1);
  };

  return (
    <div className="bg-white border-b px-6 py-4">
      {/* Filter Row */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            disabled={isLoading || isSaving}
          >
            <option value="">Select Class</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            disabled={isLoading || isSaving}
          >
            {getTerms().map(term => (
              <option key={term.value} value={term.value}>{term.label}</option>
            ))}
          </select>
        </div>
        
        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="YYYY/YYYY"
            disabled={isLoading || isSaving}
          />
        </div>
        
        {hasData && activeTab === 'individual' && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              disabled={isLoading || isSaving}
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.fullName} -- ({student.admissionNumber})
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex items-end">
          <button
            onClick={loadClassData}
            disabled={isLoading || isSaving || !selectedClass || !selectedTerm || !academicYear}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Tab Selection and Statistics */}
      <div className="flex justify-between items-center">
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => {
              setActiveTab('class');
              setSelectedStudent(null);
            }}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'class'
                ? 'bg-indigo-100 text-indigo-700 border-r-0'
                : 'text-gray-600 hover:bg-gray-50 border-r border-gray-300'
            }`}
            disabled={isLoading || isSaving || !hasData}
          >
            <FiUsers />
            Class View
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'individual'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            disabled={isLoading || isSaving || !hasData}
          >
            <FiUser />
            Individual View
          </button>
        </div>

        {hasData && (
          <div className="flex items-center gap-4 text-sm">
          
            <div className="text-center">
              <div className="text-gray-500">Avg Score</div>
              <div className="font-semibold text-blue-600">
                {formatAverageScore(safeStatistics.averageScore)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;