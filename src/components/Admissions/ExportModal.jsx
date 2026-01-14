// src/components/Admissions/ExportModal.jsx
import React, { useState } from 'react';
import { FiDownload, FiFileText, FiFile, FiX } from 'react-icons/fi';
import { exportToCSV, SCHOOL_INFO } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

const ExportModal = ({ isOpen, onClose, students, filters }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (students.length === 0) {
      toast.error('No students to export');
      return;
    }

    setIsExporting(true);
    
    try {
      // Only CSV export for now
      exportToCSV(students);
      toast.success('CSV file exported successfully!');
      
      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiDownload />
            Export Students Data
          </h2>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl"
            onClick={onClose}
            disabled={isExporting}
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* School Info */}
          <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <h3 className="font-semibold text-indigo-800 mb-2">{SCHOOL_INFO.name}</h3>
            <p className="text-sm text-gray-600">{SCHOOL_INFO.motto}</p>
            <p className="text-xs text-gray-500 mt-1">Total Students: {students.length}</p>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-colors ${
                    exportFormat === 'csv' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <FiFileText className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">CSV</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                CSV format recommended for easy data import/export
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="text-sm text-gray-500">
                <p className="font-medium">Export Details:</p>
                <ul className="mt-1 space-y-1">
                  <li>• {students.length} student records</li>
                  <li>• School: {SCHOOL_INFO.name}</li>
                  <li>• Date: {new Date().toLocaleDateString()}</li>
                  {filters.level && filters.level !== 'All' && (
                    <li>• Filter: Level {filters.level}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || students.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <FiDownload />
                  Export CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;