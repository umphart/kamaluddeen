// src/components/Results/ResultsTable.jsx
import React, { useState, useMemo } from 'react';
import { MdPerson } from 'react-icons/md';

const ResultsTable = ({ results, handleScoreChange, isSaving, activeTab }) => {
  const [expandedStudents, setExpandedStudents] = useState({});

  // Group results by student in class mode
  const groupedResults = useMemo(() => {
    if (activeTab === 'individual') {
      return results.map(result => ({ ...result, showStudentInfo: true }));
    }

    const grouped = [];
    let currentStudentId = null;
    
    results.forEach((result) => {
      const showStudentInfo = currentStudentId !== result.studentId;
      currentStudentId = result.studentId;
      grouped.push({ ...result, showStudentInfo });
    });

    return grouped;
  }, [results, activeTab]);

  // Helper function to check if a result is completed
  const isResultCompleted = (result) => {
    const caScore = result.caScore?.toString().trim();
    const examScore = result.examScore?.toString().trim();
    return caScore !== '' && caScore !== undefined && 
           examScore !== '' && examScore !== undefined;
  };

  // Helper function to check if a result has any score
  const hasAnyScore = (result) => {
    const caScore = result.caScore?.toString().trim();
    const examScore = result.examScore?.toString().trim();
    return (caScore !== '' && caScore !== undefined) || 
           (examScore !== '' && examScore !== undefined);
  };

  const getGradeColorClass = (grade) => {
    switch(grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'E': return 'bg-purple-100 text-purple-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score > 0) return 'text-red-600';
    return 'text-gray-400';
  };

  const getInputBorderClass = (score, max) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return 'border-gray-300';
    if (numScore > max || numScore < 0) {
      return 'border-red-300 bg-red-50';
    }
    return 'border-gray-300';
  };

  // Function to render student photo at top right
  const renderStudentPhotoTopRight = (studentResult) => {
    if (!studentResult) return null;

    return (
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
        {/* Photo Container */}
        <div className="flex flex-col items-end">
          <div className="relative">
            {studentResult.studentPhotoUrl ? (
              <img
                src={studentResult.studentPhotoUrl}
                alt={studentResult.studentName}
                className="h-16 w-16 rounded-full object-cover border-3 border-white shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Fallback initials */}
            <div 
              className={`h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg ${studentResult.studentPhotoUrl ? 'hidden' : ''}`}
            >
              <span className="text-white text-xl font-bold">
                {(studentResult.studentName?.charAt(0) || 'S').toUpperCase()}
              </span>
            </div>
          </div>
          {/* Student Details Below Photo */}
          <div className="text-right mt-2">
            <div className="text-sm font-semibold text-gray-800">
              {studentResult.studentName}
            </div>
            <div className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded mt-1">
              {studentResult.admissionNumber}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Individual mode layout
  if (activeTab === 'individual') {
    // Find the student for individual view
    const student = results[0];
    
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden relative">
        {/* Student Header with Photo at Top Right */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b p-4 relative">
          {/* Photo at Top Right */}
          {renderStudentPhotoTopRight(student)}
          
          {/* Left side content */}
          <div className="pr-24"> {/* Add padding to make space for photo */}
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Student Results</h3>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border">
                  <div className="text-xs text-gray-500">Class</div>
                  <div className="font-semibold text-gray-800">{student?.className}</div>
                </div>
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border">
                  <div className="text-xs text-gray-500">Subjects</div>
                  <div className="font-semibold text-gray-800">{results.length}</div>
                </div>
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm border">
                  <div className="text-xs text-gray-500">Overall Average</div>
                  <div className="font-semibold text-indigo-600 text-lg">
                    {(() => {
                      const validResults = results.filter(r => r.totalScore > 0);
                      if (validResults.length === 0) return '0.0';
                      const average = validResults.reduce((sum, r) => sum + r.totalScore, 0) / validResults.length;
                      return average.toFixed(1);
                    })()}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CA (30)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam (70)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total (100)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result, index) => {
                const completed = isResultCompleted(result);
                const hasScore = hasAnyScore(result);
                
                return (
                  <tr 
                    key={result.id} 
                    className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{result.subjectName}</div>
                      <div className="text-xs text-gray-500 font-mono">{result.subjectCode}</div>
                      <div className="text-xs text-gray-400">{result.teacherName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="0.5"
                        value={result.caScore}
                        onChange={(e) => handleScoreChange(result.id, 'caScore', e.target.value)}
                        className={`w-20 px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          getInputBorderClass(result.caScore, 30)
                        }`}
                        placeholder="0-30"
                        disabled={isSaving}
                        style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                        onWheel={(e) => e.target.blur()}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="70"
                        step="0.5"
                        value={result.examScore}
                        onChange={(e) => handleScoreChange(result.id, 'examScore', e.target.value)}
                        className={`w-20 px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          getInputBorderClass(result.examScore, 70)
                        }`}
                        placeholder="0-70"
                        disabled={isSaving}
                        style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                        onWheel={(e) => e.target.blur()}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-sm font-semibold ${
                        getScoreColorClass(result.totalScore)
                      }`}>
                        {result.totalScore > 0 ? result.totalScore.toFixed(1) : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {result.grade ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          getGradeColorClass(result.grade)
                        }`}>
                          {result.grade}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {result.remarks || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        completed 
                          ? 'bg-green-100 text-green-800'
                          : hasScore
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {completed ? 'Complete' : hasScore ? 'Partial' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Class mode - Photo at top right for each student group
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Class Header with Summary Stats */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b p-4">
        <div className="flex justify-between items-center">
          <div>
        
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                📊 {new Set(results.map(r => r.studentId)).size} Students
              </span>
              <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                📚 {new Set(results.map(r => r.subjectName)).size} Subjects
              </span>
              <span className="bg-white px-3 py-1 rounded-full shadow-sm">
                ✅ {results.filter(r => isResultCompleted(r)).length} Completed
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-lg shadow-sm">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CA (30)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exam (70)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total (100)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {groupedResults.map((result, index) => {
              const isExistingRecord = !result.isNew;
              const completed = isResultCompleted(result);
              const hasScore = hasAnyScore(result);
              const showStudentInfo = result.showStudentInfo;
              
              return (
                <tr 
                  key={result.id} 
                  className={`hover:bg-gray-50 ${isExistingRecord && (completed || hasScore) ? 'bg-blue-50' : ''} ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  {/* Student Info Column with Photo */}
                  <td className="px-4 py-3">
                    {showStudentInfo ? (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {result.studentPhotoUrl ? (
                            <img
                              src={result.studentPhotoUrl}
                              alt={result.studentName}
                              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          {/* Fallback initials */}
                        
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {result.studentName}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {result.admissionNumber}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pl-11">
                        <div className="text-xs text-gray-400 italic">
                          ↑ Same student as above
                        </div>
                      </div>
                    )}
                  </td>
                  
                  {/* Subject Information */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{result.subjectName}</div>
                    <div className="text-xs text-gray-500 font-mono">{result.subjectCode}</div>
                    <div className="text-xs text-gray-400">{result.teacherName}</div>
                  </td>
                  
                  {/* CA Score Input */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      value={result.caScore}
                      onChange={(e) => handleScoreChange(result.id, 'caScore', e.target.value)}
                      className={`w-20 px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        getInputBorderClass(result.caScore, 30)
                      } ${isExistingRecord && (completed || hasScore) ? 'bg-blue-50' : ''}`}
                      placeholder="0-30"
                      disabled={isSaving}
                      style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                      onWheel={(e) => e.target.blur()}
                    />
                  </td>
                  
                  {/* Exam Score Input */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="70"
                      step="0.5"
                      value={result.examScore}
                      onChange={(e) => handleScoreChange(result.id, 'examScore', e.target.value)}
                      className={`w-20 px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        getInputBorderClass(result.examScore, 70)
                      } ${isExistingRecord && (completed || hasScore) ? 'bg-blue-50' : ''}`}
                      placeholder="0-70"
                      disabled={isSaving}
                      style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                      onWheel={(e) => e.target.blur()}
                    />
                  </td>
                  
                  {/* Total Score */}
                  <td className="px-4 py-3">
                    <div className={`text-sm font-semibold ${
                      getScoreColorClass(result.totalScore)
                    }`}>
                      {result.totalScore > 0 ? result.totalScore.toFixed(1) : '-'}
                    </div>
                  </td>
                  
                  {/* Grade */}
                  <td className="px-4 py-3">
                    {result.grade ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        getGradeColorClass(result.grade)
                      }`}>
                        {result.grade}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  
                  {/* Remarks */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {result.remarks || '-'}
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      completed
                        ? isExistingRecord ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        : hasScore
                        ? isExistingRecord ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {completed 
                        ? isExistingRecord ? 'Completed' : 'Complete'
                        : hasScore 
                        ? isExistingRecord ? 'Partial' : 'Partial'
                        : 'Pending'
                      }
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {groupedResults.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <MdPerson className="text-2xl text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">No students found</p>
          <p className="text-gray-500">No results available for the selected filters.</p>
        </div>
      )}

      {/* CSS for hiding number input spinners */}
      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default ResultsTable;