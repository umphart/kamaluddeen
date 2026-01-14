import React from 'react';
import {
  FiPlus,
  FiDownload,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiPrinter,
  FiBarChart2,
  FiUser
} from 'react-icons/fi';
import { MdOutlineTableChart } from 'react-icons/md';

const ResultsHeader = ({
  showForm,
  setShowForm,
  selectedClass,
  setSelectedClass,
  selectedTerm,
  setSelectedTerm,
  academicYear,
  setAcademicYear,
  searchTerm,
  setSearchTerm,
  availableClasses,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  isLoading,
  loadResults,
  getTerms,
  exportToCSV,
  printAllResults,
  studentSummaries,
  classStatistics
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Results Management</h1>
          <p className="text-gray-600">View and manage student exam results</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 transition-all"
          >
            <FiPlus />
            Enter Results
          </button>
          
          <button
            onClick={exportToCSV}
            disabled={!studentSummaries || studentSummaries.length === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            title={(!studentSummaries || studentSummaries.length === 0) ? "No results to export" : "Export to CSV"}
          >
            <FiDownload />
            Export CSV
          </button>

          <button
            onClick={printAllResults}
            disabled={!studentSummaries || studentSummaries.length === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            title="Print All Results"
          >
            <FiPrinter />
            Print All
          </button>
          
          <button
            onClick={loadResults}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              disabled={isLoading}
            >
              <option value="">Select Class</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              disabled={isLoading}
            >
              {getTerms().map(term => (
                <option key={term.value} value={term.value}>{term.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="YYYY/YYYY"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Search by student name or admission..."
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <FiFilter />
              {showFilters ? 'Hide Filters' : 'More Filters'}
            </button>
            
            {studentSummaries && studentSummaries.length > 0 && (
              <span className="text-sm text-gray-600">
                Showing {studentSummaries.length} students • 
                Class Average: {classStatistics?.classAverage?.toFixed(1) || '0.0'}%
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">View:</span>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-3 py-1.5 text-sm flex items-center gap-1 ${
                  viewMode === 'summary' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FiBarChart2 />
                Summary
              </button>
              <button
                onClick={() => setViewMode('student-table')}
                className={`px-3 py-1.5 text-sm flex items-center gap-1 border-l border-r border-gray-300 ${
                  viewMode === 'student-table' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FiUser />
                Student Table
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1.5 text-sm flex items-center gap-1 ${
                  viewMode === 'detailed' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MdOutlineTableChart />
                Detailed
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultsHeader;