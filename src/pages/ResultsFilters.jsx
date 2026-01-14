import React from 'react';

const ResultsFilters = ({
  showFilters,
  filters,
  setFilters,
  filteredResults,
  handleBulkDelete
}) => {
  if (!showFilters) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Advanced Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Min Average Score</label>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.minScore}
            onChange={(e) => setFilters(prev => ({ ...prev, minScore: e.target.value }))}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            placeholder="0"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Max Average Score</label>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.maxScore}
            onChange={(e) => setFilters(prev => ({ ...prev, maxScore: e.target.value }))}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            placeholder="100"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Overall Grade</label>
          <select
            value={filters.grade}
            onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Grades</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
            <option value="F">F</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Student Name</label>
          <input
            type="text"
            value={filters.student}
            onChange={(e) => setFilters(prev => ({ ...prev, student: e.target.value }))}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            placeholder="Filter by student name"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
        <button
          onClick={() => setFilters({ minScore: '', maxScore: '', grade: '', student: '' })}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          Clear Filters
        </button>
        
        {filteredResults.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Delete Filtered ({filteredResults.length})
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultsFilters;