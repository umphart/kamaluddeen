// src/components/Results/ResultsHeader.jsx
import React from 'react';
import { FiX, FiSave } from 'react-icons/fi';

const ResultsHeader = ({ 
  selectedClass, 
  selectedTerm, 
  academicYear, 
  onClose, 
  isSaving,
  results = [], // Default to empty array
  students = [], // Default to empty array
  subjects = []  // Default to empty array
}) => {
  return (
    <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <div>
    
        <p className="text-sm text-gray-600">
          {selectedClass ? `${selectedClass} • ${selectedTerm} • ${academicYear}` : 'Select class and term'}
          {selectedClass && students.length > 0 && (
            <span className="ml-4">
              • {students.length} students • {subjects.length} subjects
            </span>
          )}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-500">
          {results.length > 0 ? `${results.length} results pending` : 'No results entered'}
        </div>
        <button
          onClick={onClose}
          disabled={isSaving}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          title="Close"
        >
          <FiX size={20} />
        </button>
      </div>
    </div>
  );
};

export default ResultsHeader;