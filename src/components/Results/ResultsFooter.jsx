// src/components/Results/ResultsFooter.jsx
import React from 'react';
import { FiDownload, FiX, FiSave, FiLoader } from 'react-icons/fi';

const ResultsFooter = ({ onClose, onSave, onExport, isSaving, results, statistics }) => {
  const hasResults = results && results.length > 0;
  const hasCompletedResults = statistics.completedCount > 0;

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-auto flex-shrink-0">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            disabled={isSaving || !hasResults || !hasCompletedResults}
            title={!hasCompletedResults ? "No completed results to export" : "Export to CSV"}
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            onClick={onClose}
            disabled={isSaving}
          >
            <FiX className="w-4 h-4" />
            Cancel
          </button>
          
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            disabled={isSaving || !hasResults || !hasCompletedResults}
          >
            {isSaving ? (
              <>
                <FiLoader className="animate-spin w-4 h-4" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                {results.some(r => !r.isNew) ? 'Update Results' : 'Save All Results'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsFooter;