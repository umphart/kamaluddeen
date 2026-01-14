// src/components/Results/ResultsContentArea.jsx
import React from 'react';
import ResultsTable from './ResultsTable';

const ResultsContentArea = ({
  selectedClass,
  results = [],
  isLoading,
  isSaving,
  activeTab,
  handleScoreChange,
  statistics,
  selectedStudent,
  students = []
}) => {
  if (activeTab === 'individual' && selectedStudent) {
    // Find the student - check for different possible ID properties
    const student = students.find(s => 
      s.id === selectedStudent || 
      s.studentId === selectedStudent ||
      s._id === selectedStudent
    );
    
    // Get student name - check for different possible name properties
    let studentName = 'Student';
    if (student) {
      if (student.fullName) {
        studentName = student.fullName;
      } else if (student.firstName && student.lastName) {
        studentName = `${student.firstName} ${student.lastName}`;
      } else if (student.name) {
        studentName = student.name;
      } else if (student.studentName) {
        studentName = student.studentName;
      }
      
      // Also try to get admission number
      const admissionNumber = student.admissionNumber || student.admission_number || '';
      if (admissionNumber) {
        studentName = `${studentName} (${admissionNumber})`;
      }
    }

    
    return (
      <div className="p-6 h-full overflow-auto">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{studentName} - Results</h3>
          <p className="text-sm text-gray-600">
            Enter scores for all subjects. CA: 0-30, Exam: 0-70
          </p>
        </div>
        
<ResultsTable
  results={results}
  handleScoreChange={handleScoreChange}
  isSaving={isSaving}
  activeTab={activeTab}
  selectedClass={selectedClass} // Add this prop
/>
        
        {results.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {results.length} subjects for this student
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {selectedClass} - {activeTab === 'class' ? 'Class Results' : 'Individual Results'}
        </h3>
      </div>
      
      <ResultsTable
        results={results}
        handleScoreChange={handleScoreChange}
        isSaving={isSaving}
        activeTab={activeTab}
      />
      
      {results.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {results.length} total results across all students and subjects
        </div>
      )}
    </div>
  );
};

export default ResultsContentArea;