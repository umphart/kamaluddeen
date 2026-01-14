// src/components/Results/ResultsForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { resultsService } from '../../services/resultsService';
import { studentService } from '../../services/studentService';
import { academicService } from '../../services/academicService';
import toast from 'react-hot-toast';
import { FiBookOpen, FiX } from 'react-icons/fi';

import ResultsHeader from './ResultsHeader';
import ResultsControlPanel from './ControlPanel';
import ResultsContentArea from './ResultsContentArea';
import ResultsFooter from './ResultsFooter';
import { useResultsForm } from '../../Hooks/useResultsForm';

// Error Boundary for the form
const FormErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  const handleReset = () => {
    setHasError(false);
    setError(null);
  };

  if (hasError) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">
              There was an error in the form. Please try again.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 text-left">
                {error.toString()}
              </div>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

const ResultsForm = ({ onClose, onResultsSaved, initialData }) => {
  const {
    selectedClass,
    setSelectedClass,
    selectedTerm,
    setSelectedTerm,
    academicYear,
    setAcademicYear,
    students,
    setStudents,
    subjects,
    setSubjects,
    results,
    setResults,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    activeTab,
    setActiveTab,
    selectedStudent,
    setSelectedStudent,
    availableClasses,
    setAvailableClasses,
    existingResults,
    setExistingResults,
    statistics,
    initializeResults,
    loadAvailableClasses,
    handleScoreChange,
    validateAndSaveResults,
    exportToCSV
  } = useResultsForm();

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData) {
      if (initialData.className) setSelectedClass(initialData.className);
      if (initialData.term) setSelectedTerm(initialData.term);
      if (initialData.academicYear) setAcademicYear(initialData.academicYear);
    }
  }, [initialData, setSelectedClass, setSelectedTerm, setAcademicYear]);

  // Initialize academic year if not set
  useEffect(() => {
    if (!academicYear) {
      const currentYear = resultsService.getCurrentAcademicYear();
      setAcademicYear(currentYear);
    }
  }, [academicYear, setAcademicYear]);

  // Load available classes on mount
  useEffect(() => {
    loadAvailableClasses();
  }, [loadAvailableClasses]);

  // Load class data when class changes
  useEffect(() => {
    if (selectedClass && selectedTerm && academicYear) {
      loadClassData();
    } else {
      // Reset data when filters are not complete
      setStudents([]);
      setSubjects([]);
      setResults([]);
      setExistingResults([]);
    }
  }, [selectedClass, selectedTerm, academicYear]);

  const loadClassData = async () => {
    if (!selectedClass || !selectedTerm || !academicYear) {
      toast.error('Please select class, term, and academic year');
      return;
    }

    try {
      setIsLoading(true);
      
      // Load students for the selected class
      const classStudents = await studentService.getStudentsByClass(selectedClass);
      setStudents(classStudents);

      // Load all subjects
      const allSubjects = await academicService.getAllSubjects();
      setSubjects(allSubjects);

      // Load existing results for this class, term, and year
      const existing = await resultsService.getClassResults(selectedClass, selectedTerm, academicYear);
      setExistingResults(existing);

      // Initialize results grid with existing data
      initializeResults(classStudents, allSubjects, existing);

      //toast.success(`Loaded ${classStudents.length} students and ${allSubjects.length} subjects`);

    } catch (error) {
      console.error('Error loading class data:', error);
      toast.error('Failed to load class data. Please try again.');
      
      // Reset to empty arrays on error
      setStudents([]);
      setSubjects([]);
      setResults([]);
      setExistingResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save success
  const handleSaveSuccess = (savedResults) => {
    if (onResultsSaved) {
      onResultsSaved(savedResults);
    }
    // Refresh data after save
    loadClassData();
  };

  // Safe data for passing to components
  const safeResults = results || [];
  const safeStudents = students || [];
  const safeSubjects = subjects || [];
  const safeAvailableClasses = availableClasses || [];

  // Calculate statistics safely
  const safeStatistics = useMemo(() => {
    if (!statistics) {
      return {
        total: 0,
        pending: 0,
        completed: 0,
        averageScore: 0,
        passRate: 0
      };
    }
    return statistics;
  }, [statistics]);

  // Filter results for individual student
  const individualResults = useMemo(() => {
    if (activeTab === 'individual' && selectedStudent) {
      return safeResults.filter(result => result.studentId === selectedStudent);
    }
    return safeResults;
  }, [activeTab, selectedStudent, safeResults]);

  // Enhanced handleScoreChange with error handling
  const safeHandleScoreChange = (resultId, field, value) => {
    try {
      handleScoreChange(resultId, field, value);
    } catch (error) {
      console.error('Error in handleScoreChange:', error);
      toast.error('Failed to update score. Please try again.');
    }
  };

  // Enhanced save handler
  const handleSave = async () => {
    try {
      const savedResults = await validateAndSaveResults();
      handleSaveSuccess(savedResults);
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error('Failed to save results. Please check the form.');
    }
  };

  // Enhanced export handler
  const handleExport = () => {
    try {
      exportToCSV();
    } catch (error) {
      console.error('Error exporting results:', error);
      toast.error('Failed to export results.');
    }
  };

  return (
    <FormErrorBoundary>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <ResultsHeader 
          selectedClass={selectedClass}
          selectedTerm={selectedTerm}
          academicYear={academicYear}
          onClose={onClose}
          isSaving={isSaving}
          results={safeResults}
          students={safeStudents}
          subjects={safeSubjects}
        />

        {/* Control Panel */}
        <ResultsControlPanel
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedTerm={selectedTerm}
          setSelectedTerm={setSelectedTerm}
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          availableClasses={safeAvailableClasses}
          students={safeStudents}
          isLoading={isLoading}
          isSaving={isSaving}
          statistics={safeStatistics}
          loadClassData={loadClassData}
          hasData={selectedClass && selectedTerm && academicYear && safeStudents.length > 0}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading class data...</p>
              </div>
            </div>
          ) : !selectedClass || !selectedTerm || !academicYear ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-sm border">
                <FiBookOpen className="mx-auto text-4xl text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Class & Term</h3>
                <p className="text-gray-500 mb-4">
                  Please select a class, term, and academic year to start entering results
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={loadClassData}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Load Data
                  </button>
                </div>
              </div>
            </div>
          ) : safeStudents.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-sm border">
                <FiBookOpen className="mx-auto text-4xl text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Students Found</h3>
                <p className="text-gray-500">
                  No students found in {selectedClass}. Please add students to this class first.
                </p>
              </div>
            </div>
          ) : activeTab === 'individual' && !selectedStudent ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-sm border">
                <FiBookOpen className="mx-auto text-4xl text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Student</h3>
                <p className="text-gray-500">
                  Please select a student from the dropdown to view and edit their individual results.
                </p>
              </div>
            </div>
          ) : (
            <ResultsContentArea
              selectedClass={selectedClass}
              results={activeTab === 'individual' ? individualResults : safeResults}
              isLoading={isLoading}
              isSaving={isSaving}
              activeTab={activeTab}
              handleScoreChange={safeHandleScoreChange}
              statistics={safeStatistics}
              selectedStudent={selectedStudent}
              students={safeStudents}
            />
          )}
        </div>

        {/* Footer */}
        <ResultsFooter
          onClose={onClose}
          onSave={handleSave}
          onExport={handleExport}
          isSaving={isSaving}
          results={safeResults}
          statistics={safeStatistics}
        />
      </div>
    </FormErrorBoundary>
  );
};

export default ResultsForm;