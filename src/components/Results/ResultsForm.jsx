// src/components/Results/ResultsForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { resultsService } from '../../services/resultsService';
import { studentService } from '../../services/studentService';
import { academicService } from '../../services/academicService';
import toast from 'react-hot-toast';
import { FiBookOpen, FiX, FiSave, FiDownload, FiUpload } from 'react-icons/fi';

// Error Boundary for the form
const FormErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

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

// Mini components for the form
const FormHeader = ({ selectedClass, selectedTerm, academicYear, onClose }) => (
  <div className="flex justify-between items-center p-4 border-b bg-white">
    <div>
      <h2 className="text-lg font-bold text-gray-800">Enter Results</h2>
      <p className="text-sm text-gray-600">
        {selectedClass} • {selectedTerm} • {academicYear}
      </p>
    </div>
    <button
      onClick={onClose}
      className="text-gray-500 hover:text-gray-700 text-xl"
    >
      <FiX />
    </button>
  </div>
);

const ClassSelector = ({ selectedClass, setSelectedClass, availableClasses, isLoading }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ 
      display: 'block', 
      fontSize: '0.875rem', 
      fontWeight: '500', 
      color: '#374151', 
      marginBottom: '4px' 
    }}>
      Select Class
    </label>
    <select
      value={selectedClass}
      onChange={(e) => setSelectedClass(e.target.value)}
      style={{
        width: '100%',
        padding: '8px 12px',
        fontSize: '0.875rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s'
      }}
      onFocus={(e) => e.target.style.borderColor = '#6366f1'}
      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
      disabled={isLoading}
    >
      <option value="">Select a class</option>
      {availableClasses.map(cls => (
        <option key={cls} value={cls}>{cls}</option>
      ))}
    </select>
  </div>
);

const TermSelector = ({ selectedTerm, setSelectedTerm }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ 
      display: 'block', 
      fontSize: '0.875rem', 
      fontWeight: '500', 
      color: '#374151', 
      marginBottom: '4px' 
    }}>
      Select Term
    </label>
    <select
      value={selectedTerm}
      onChange={(e) => setSelectedTerm(e.target.value)}
      style={{
        width: '100%',
        padding: '8px 12px',
        fontSize: '0.875rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s'
      }}
      onFocus={(e) => e.target.style.borderColor = '#6366f1'}
      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
    >
      <option value="1st Term">1st Term</option>
      <option value="2nd Term">2nd Term</option>
      <option value="3rd Term">3rd Term</option>
    </select>
  </div>
);

const AcademicYearInput = ({ academicYear, setAcademicYear }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ 
      display: 'block', 
      fontSize: '0.875rem', 
      fontWeight: '500', 
      color: '#374151', 
      marginBottom: '4px' 
    }}>
      Academic Year
    </label>
    <input
      type="text"
      value={academicYear}
      onChange={(e) => setAcademicYear(e.target.value)}
      style={{
        width: '100%',
        padding: '8px 12px',
        fontSize: '0.875rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s'
      }}
      onFocus={(e) => e.target.style.borderColor = '#6366f1'}
      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
      placeholder="YYYY/YYYY"
    />
  </div>
);

const ResultsForm = ({ onClose, onResultsSaved, initialData }) => {
  // State management
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('1st Term');
  const [academicYear, setAcademicYear] = useState('');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData) {
      if (initialData.className) setSelectedClass(initialData.className);
      if (initialData.term) setSelectedTerm(initialData.term);
      if (initialData.academicYear) setAcademicYear(initialData.academicYear);
    }
  }, [initialData]);

  // Initialize academic year if not set
  useEffect(() => {
    if (!academicYear) {
      const currentYear = resultsService.getCurrentAcademicYear();
      setAcademicYear(currentYear);
    }
  }, [academicYear]);

  // Load available classes on mount
  useEffect(() => {
    loadAvailableClasses();
  }, []);

  // Load class data when class changes
  useEffect(() => {
    if (selectedClass && selectedTerm && academicYear) {
      loadClassData();
    } else {
      // Reset data when filters are not complete
      setStudents([]);
      setSubjects([]);
      setResults([]);
    }
  }, [selectedClass, selectedTerm, academicYear]);

  const loadAvailableClasses = async () => {
    try {
      const allStudents = await studentService.getAllStudents();
      const classesSet = new Set();
      allStudents.forEach(student => {
        if (student.className) {
          classesSet.add(student.className);
        }
      });
      
      const sortedClasses = Array.from(classesSet).sort((a, b) => {
        const classOrder = {
          'Pre-Nursery': 1,
          'Nursery 1': 2,
          'Nursery 2': 3,
          'Primary 1': 4,
          'Primary 2': 5,
          'Primary 3': 6,
          'Primary 4': 7,
          'JSS 1': 8,
          'JSS 2': 9,
          'JSS 3': 10
        };
        return (classOrder[a] || 99) - (classOrder[b] || 99);
      });
      
      setAvailableClasses(sortedClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    }
  };

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
      const existingResults = await resultsService.getClassResults(selectedClass, selectedTerm, academicYear);
      
      // Initialize results grid
      initializeResults(classStudents, allSubjects, existingResults);

      toast.success(`Loaded ${classStudents.length} students and ${allSubjects.length} subjects`);

    } catch (error) {
      console.error('Error loading class data:', error);
      toast.error('Failed to load class data. Please try again.');
      
      // Reset to empty arrays on error
      setStudents([]);
      setSubjects([]);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

const initializeResults = (students, subjects, existingResults) => {
  const newResults = [];
  
  students.forEach(student => {
    subjects.forEach(subject => {
      // Check if result already exists
      const existingResult = existingResults.find(
        r => r.studentId === student.id && r.subjectId === subject.id
      );
      
      if (existingResult) {
        // Use existing result
        newResults.push({
          id: existingResult.id,
          studentId: student.id,
          studentName: existingResult.studentName || student.name || student.fullName || `${student.firstName} ${student.lastName}` || 'Unknown',
          admissionNumber: student.admissionNumber || student.admissionNo || student.admissionNumber,
          subjectId: subject.id,
          subjectName: subject.name || subject.subjectName,
          caScore: existingResult.caScore || '',
          examScore: existingResult.examScore || '',
          totalScore: existingResult.totalScore || 0,
          grade: existingResult.grade || '',
          remarks: existingResult.remarks || ''
        });
      } else {
        // Create new result entry
        newResults.push({
          id: `temp-${student.id}-${subject.id}`,
          studentId: student.id,
          studentName: student.name || student.fullName || `${student.firstName} ${student.lastName}` || 'Unknown',
          admissionNumber: student.admissionNumber || student.admissionNo || student.admissionNumber,
          subjectId: subject.id,
          subjectName: subject.name || subject.subjectName,
          caScore: '',
          examScore: '',
          totalScore: 0,
          grade: '',
          remarks: ''
        });
      }
    });
  });
  
  setResults(newResults);
};
  const handleScoreChange = (resultId, field, value) => {
    setResults(prev => prev.map(result => {
      if (result.id === resultId) {
        const updated = { ...result, [field]: value };
        
        // Calculate total and grade if both scores are provided
        if (field === 'caScore' || field === 'examScore') {
          const caScore = field === 'caScore' ? parseFloat(value) || 0 : parseFloat(result.caScore) || 0;
          const examScore = field === 'examScore' ? parseFloat(value) || 0 : parseFloat(result.examScore) || 0;
          const totalScore = caScore + examScore;
          
          updated.totalScore = totalScore;
          
          // Calculate grade
          if (totalScore >= 80) updated.grade = 'A';
          else if (totalScore >= 70) updated.grade = 'B';
          else if (totalScore >= 60) updated.grade = 'C';
          else if (totalScore >= 50) updated.grade = 'D';
          else if (totalScore >= 40) updated.grade = 'E';
          else if (totalScore > 0) updated.grade = 'F';
          else updated.grade = '';
        }
        
        return updated;
      }
      return result;
    }));
  };

  const validateAndSaveResults = async () => {
    if (!selectedClass || !selectedTerm || !academicYear) {
      toast.error('Please select class, term, and academic year');
      return;
    }

    // Filter out only results that have scores
    const resultsToSave = results.filter(r => 
      (r.caScore && r.caScore.trim() !== '') || 
      (r.examScore && r.examScore.trim() !== '')
    );

    if (resultsToSave.length === 0) {
      toast.error('No results to save. Please enter at least one score.');
      return;
    }

    try {
      setIsSaving(true);
      
      // Save results
      const savedResults = await resultsService.saveResults(
        selectedClass,
        selectedTerm,
        academicYear,
        resultsToSave
      );
      
      toast.success(`Successfully saved ${savedResults.length} results`);
      
      if (onResultsSaved) {
        onResultsSaved(savedResults);
      }
      
      return savedResults;
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error('Failed to save results. Please try again.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const exportToCSV = () => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    const csvData = results.map(result => ({
      'Admission Number': result.admissionNumber,
      'Student Name': result.studentName,
      'Subject': result.subjectName,
      'CA Score': result.caScore,
      'Exam Score': result.examScore,
      'Total Score': result.totalScore,
      'Grade': result.grade,
      'Remarks': result.remarks || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results_${selectedClass}_${selectedTerm}_${academicYear.replace(/\//g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Results exported to CSV');
  };

 

  const handleSave = async () => {
    try {
      const savedResults = await validateAndSaveResults();
      if (savedResults && onResultsSaved) {
        onResultsSaved(savedResults);
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  // Compact view for results table
const ResultsTableCompact = () => {
  // Add debug log to see what's in results
  console.log("Results data:", results);
  console.log("First result:", results[0]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CA
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exam
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.slice(0, 20).map((result) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-2 py-2">
                  {/* Debug the student name */}
                  <div className="text-xs font-medium text-gray-900 truncate max-w-[80px]">
                    {result.student?.full_name || result.full_name || result.studentName || 'No name found'}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate max-w-[80px]">
                    {result.student?.admission_number || result.admission_number || result.admissionNumber || 'No admission number'}
                  </div>
                </td>
                <td className="px-2 py-2">
                  <div className="text-xs text-gray-900 truncate max-w-[80px]">
                    {result.subjectName || result.subject?.name || 'No subject'}
                  </div>
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={result.caScore || 0}
                    onChange={(e) => handleScoreChange(result.id, 'caScore', e.target.value)}
                    className="w-14 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0-30"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min="0"
                    max="70"
                    step="0.5"
                    value={result.examScore || 0}
                    onChange={(e) => handleScoreChange(result.id, 'examScore', e.target.value)}
                    className="w-14 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0-70"
                  />
                </td>
                <td className="px-2 py-2">
                  <div className={`text-xs font-medium ${
                    (result.totalScore || 0) >= 80 ? 'text-green-600' :
                    (result.totalScore || 0) >= 60 ? 'text-blue-600' :
                    (result.totalScore || 0) >= 40 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {result.totalScore || 0}
                  </div>
                </td>
                <td className="px-2 py-2">
                  <div className={`px-1 py-0.5 rounded text-[10px] font-medium ${
                    result.grade === 'A' ? 'bg-green-100 text-green-800' :
                    result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                    result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                    result.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                    result.grade === 'E' ? 'bg-purple-100 text-purple-800' :
                    result.grade === 'F' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {result.grade || '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {results.length > 20 && (
        <div className="px-3 py-2 border-t bg-gray-50 text-xs text-gray-500">
          Showing 20 of {results.length} entries. Use scroll to see more.
        </div>
      )}
    </div>
  );
};

  // Student-focused view
  const StudentFocusedView = () => {
    const groupedByStudent = results.reduce((acc, result) => {
      if (!acc[result.studentId]) {
        acc[result.studentId] = {
          studentName: result.studentName,
          admissionNumber: result.admissionNumber,
          subjects: []
        };
      }
      acc[result.studentId].subjects.push(result);
      return acc;
    }, {});

    return (
      <div className="space-y-4">
        {Object.values(groupedByStudent).slice(0, 10).map((student, idx) => (
          <div key={idx} className="bg-white rounded-lg border p-3 shadow-sm">
            <div className="flex justify-between items-center mb-2 pb-2 border-b">
              <div>
                <h4 className="text-sm font-semibold text-gray-800">{student.studentName}</h4>
                <p className="text-xs text-gray-500">{student.admissionNumber}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {student.subjects.length} subjects
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {student.subjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="text-xs font-medium text-gray-700 truncate max-w-[100px]">
                    {subject.subjectName}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      value={subject.caScore}
                      onChange={(e) => handleScoreChange(subject.id, 'caScore', e.target.value)}
                      className="w-12 px-1 py-1 text-xs border border-gray-300 rounded"
                      placeholder="CA"
                    />
                    <input
                      type="number"
                      min="0"
                      max="70"
                      step="0.5"
                      value={subject.examScore}
                      onChange={(e) => handleScoreChange(subject.id, 'examScore', e.target.value)}
                      className="w-12 px-1 py-1 text-xs border border-gray-300 rounded"
                      placeholder="Exam"
                    />
                    <div className={`text-xs font-bold min-w-8 text-center ${
                      subject.totalScore >= 80 ? 'text-green-600' :
                      subject.totalScore >= 60 ? 'text-blue-600' :
                      subject.totalScore >= 40 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {subject.totalScore || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <FormErrorBoundary>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <FormHeader 
  selectedClass={selectedClass}
  selectedTerm={selectedTerm}
  academicYear={academicYear}
  onClose={onClose}
/>

{/* Control Panel */}
<div style={{
  padding: '12px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb'
}}>
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: '12px',
    width: '100%'
  }}>
    <div style={{
      gridColumn: 'span 1'
    }}>
      <ClassSelector 
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        availableClasses={availableClasses}
        isLoading={isLoading}
      />
    </div>
    
    <div style={{
      gridColumn: 'span 1'
    }}>
      <TermSelector 
        selectedTerm={selectedTerm}
        setSelectedTerm={setSelectedTerm}
      />
    </div>
    
    <div style={{
      gridColumn: 'span 1'
    }}>
      <AcademicYearInput 
        academicYear={academicYear}
        setAcademicYear={setAcademicYear}
      />
    </div>
  </div>
  
  <div style={{
    marginTop: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  }}>
    <button
      onClick={loadClassData}
      disabled={isLoading}
      style={{
        padding: '4px 8px',
        backgroundColor: isLoading ? '#9ca3af' : '#4f46e5',
        color: '#ffffff',
        borderRadius: '8px',
        border: 'none',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.875rem',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#4338ca')}
      onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#4f46e5')}
    >
      {isLoading ? 'Loading...' : 'Load Data'}
    </button>
    
    <div style={{
      display: 'flex',
      gap: '8px'
    }}>
      <button
        onClick={() => setViewMode('grid')}
        style={{
          padding: '4px 8px',
          backgroundColor: viewMode === 'grid' ? '#e0e7ff' : '#f3f4f6',
          color: viewMode === 'grid' ? '#3730a3' : '#374151',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.75rem',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = viewMode === 'grid' ? '#dbeafe' : '#e5e7eb';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = viewMode === 'grid' ? '#e0e7ff' : '#f3f4f6';
        }}
      >
        Compact View
      </button>
      <button
        onClick={() => setViewMode('list')}
        style={{
          padding: '4px 8px',
          backgroundColor: viewMode === 'list' ? '#e0e7ff' : '#f3f4f6',
          color: viewMode === 'list' ? '#3730a3' : '#374151',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.75rem',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = viewMode === 'list' ? '#dbeafe' : '#e5e7eb';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = viewMode === 'list' ? '#e0e7ff' : '#f3f4f6';
        }}
      >
        Student View
      </button>
    </div>
  </div>
</div>
        {/* Content Area */}
        <div className="flex-1 overflow-auto p-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-600">Loading class data...</p>
              </div>
            </div>
          ) : !selectedClass || !selectedTerm || !academicYear ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm p-6 bg-white rounded-lg shadow-sm border">
                <FiBookOpen className="mx-auto text-3xl text-gray-300 mb-3" />
                <h3 className="text-md font-semibold text-gray-700 mb-2">Select Class & Term</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Please select a class, term, and academic year to start entering results
                </p>
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm p-6 bg-white rounded-lg shadow-sm border">
                <FiBookOpen className="mx-auto text-3xl text-gray-300 mb-3" />
                <h3 className="text-md font-semibold text-gray-700 mb-2">No Students Found</h3>
                <p className="text-sm text-gray-500">
                  No students found in {selectedClass}. Please add students to this class first.
                </p>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <StudentFocusedView />
          ) : (
            <ResultsTableCompact />
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="text-xs text-gray-600">
            {students.length > 0 && subjects.length > 0 && (
              <>Total entries: {results.length} • Students: {students.length} • Subjects: {subjects.length}</>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              disabled={results.length === 0}
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <FiDownload size={14} />
              Export
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || results.length === 0}
              className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
            >
              <FiSave size={14} className={isSaving ? 'animate-spin' : ''} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </FormErrorBoundary>
  );
};

export default ResultsForm;