// src/components/Results/ResultsViews.jsx - Fixed version with print button
import React from 'react';
import { 
  FiPlus, 
  FiList, 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiUser, 
  FiPrinter, 
  FiDownload,
} from 'react-icons/fi';

const ResultsViews = ({
  isLoading,
  selectedClass,
  selectedTerm,
  academicYear,
  results,
  filteredResults,
  viewMode,
  setShowForm,
  setSelectedResult,
  handleDeleteResult,
  getGradeColorClass,
  getScoreColorClass,
  studentSummaries = [],
  classStatistics = { classAverage: 0, topStudent: null, gradeDistribution: {} },
  exportToCSV,
  printAllResults,
  printStudentResult // Added this prop
}) => {
  
  // DEBUG: Check what data we're receiving
  console.log('ResultsViews Debug:', {
    filteredResultsCount: filteredResults.length,
    filteredResultsSample: filteredResults.slice(0, 2),
    studentSummariesCount: studentSummaries.length,
    hasPrintAllResults: !!printAllResults,
    hasPrintStudentResult: !!printStudentResult // Check if function is passed
  });
  
  // Extract class name if it's an object
  const className = selectedClass?.name || selectedClass || "";
  
  // Loading State
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading results...</p>
      </div>
    );
  }

  // No Results State
  if (!selectedClass || !selectedTerm || !academicYear) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
        <FiList className="mx-auto text-4xl text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Class & Term</h3>
        <p className="text-gray-500">Please select a class, term, and academic year to view results</p>
      </div>
    );
  }

  const getOrdinal = (n) => {
    const s = ["th","st","nd","rd"],
          v = n % 100;
    return n + (s[(v-20)%10] || s[v] || s[0]);
  };

  // No Results Found
  if (filteredResults.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
        <FiList className="mx-auto text-4xl text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Found</h3>
        <p className="text-gray-500 mb-6">
          {results.length === 0 
            ? `No results available for ${className} - ${selectedTerm} ${academicYear}`
            : 'No results match your filters. Try adjusting your search criteria.'
          }
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <FiPlus className="inline mr-2" />
          Enter Results Now
        </button>
      </div>
    );
  }

  // View Mode: Summary
  if (viewMode === 'summary') {
    return (
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Class Performance Summary</h3>
            <p className="text-sm text-gray-600">
              {className} • {selectedTerm} • {academicYear}
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Class Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Students</span>
                    <span className="text-2xl font-bold text-gray-800">{studentSummaries.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Class Average</span>
                    <span className={`text-2xl font-bold ${getScoreColorClass(classStatistics.classAverage)}`}>
                      {classStatistics.classAverage?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Top Student</span>
                    <span className="text-sm font-semibold text-gray-800 truncate max-w-[150px]">
                      {classStatistics.topStudent?.studentName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Top Performers</h4>
                <div className="space-y-3">
                  {studentSummaries.slice(0, 3).map((student, index) => (
                    <div key={student.studentId} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {student.position}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Student photo in summary view - using studentPhotoUrl */}
                          {student.studentPhotoUrl ? (
                            <img 
                              src={student.studentPhotoUrl} 
                              alt={student.studentName}
                              className="w-8 h-8 rounded-full object-cover border border-gray-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                // Create fallback element if it doesn't exist
                                const fallback = e.target.nextElementSibling || 
                                  document.createElement('div');
                                fallback.className = 'w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center';
                                e.target.parentNode.appendChild(fallback);
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiUser className="text-gray-500" size={14} />
                            </div>
                          )}
                          <span className="text-sm text-gray-700 truncate max-w-[120px]">
                            {student.studentName}
                          </span>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${getScoreColorClass(student.totalAverage)}`}>
                        {student.totalAverage?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Grade Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(classStatistics.gradeDistribution || {}).map(([grade, count]) => (
                    <div key={grade} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold ${getGradeColorClass(grade)}`}>
                          {grade}
                        </span>
                        <span className="text-sm text-gray-600">Grade {grade}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{count} students</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => printAllResults && printAllResults(
                    className,
                    selectedTerm, 
                    academicYear, 
                    studentSummaries, 
                    classStatistics,
                    filteredResults
                  )}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <FiPrinter />
                  Print Class Results
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <FiDownload />
                  Export to Excel
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <FiUser />
                  View Student Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View Mode: Student Table
  if (viewMode === 'student-table') {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Student Results Summary</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span>Total Students: {studentSummaries.length}</span>
              <span>Class Average: {classStatistics.classAverage?.toFixed(1) || '0.0'}%</span>
              <span>Top Score: {classStatistics.topStudent?.totalAverage?.toFixed(1) || '0.0'}%</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString()}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Position
                </th>
              
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CA Avg
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Avg
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Avg
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentSummaries.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-center">
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {getOrdinal(student.position)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Student Photo - using studentPhotoUrl */}
                      {student.studentPhotoUrl ? (
                        <img 
                          src={student.studentPhotoUrl} 
                          alt={student.studentName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            // Create fallback element
                            const fallback = e.target.nextElementSibling || 
                              document.createElement('div');
                            fallback.className = 'w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center';
                            e.target.parentNode.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <FiUser className="text-gray-500" />
                        </div>
                      )}
                      
                      {/* Student Details */}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.studentName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.gender || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {student.admissionNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.totalSubjects}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${getScoreColorClass(student.caAverage)}`}>
                      {student.caAverage?.toFixed(1) || '0.0'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${getScoreColorClass(student.examAverage)}`}>
                      {student.examAverage?.toFixed(1) || '0.0'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${getScoreColorClass(student.totalAverage)}`}>
                      {student.totalAverage?.toFixed(1) || '0.0'}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.overallGrade ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getGradeColorClass(student.overallGrade)}`}>
                        {student.overallGrade}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const studentResults = filteredResults.filter(r => r.studentId === student.studentId);
                          if (studentResults.length > 0) {
                            setSelectedResult(studentResults[0]);
                          }
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => printStudentResult && printStudentResult(student)}
                        className="text-green-600 hover:text-green-900"
                        title="Print Result Sheet"
                      >
                        <FiPrinter />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {studentSummaries.length} students
          </div>
          <div className="flex gap-4">
            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 flex items-center gap-2"
            >
              <FiDownload size={14} />
              Export
            </button>
            <button
              onClick={() => printAllResults && printAllResults(
                className,
                selectedTerm, 
                academicYear, 
                studentSummaries, 
                classStatistics,
                filteredResults
              )}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 flex items-center gap-2"
            >
              <FiPrinter size={14} />
              Print All
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View Mode: Detailed (Default Table View with Photos)
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
      <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Detailed Results with Photos</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span>Total: {filteredResults.length}</span>
            <span>Completed: {filteredResults.filter(r => r.caScore && r.examScore).length}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString()}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CA Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exam Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResults.slice(0, 50).map((result) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {/* Student Photo in detailed view - using studentPhotoUrl */}
                    {result.studentPhotoUrl ? (
                      <img 
                        src={result.studentPhotoUrl} 
                        alt={result.studentName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          // Create fallback element
                          const fallback = e.target.nextElementSibling || 
                            document.createElement('div');
                          fallback.className = 'w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center';
                          e.target.parentNode.appendChild(fallback);
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{result.studentName}</div>
                      <div className="text-xs text-gray-500">{result.admissionNumber}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{result.subjectName}</div>
                  <div className="text-xs text-gray-500">{result.teacherName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    parseFloat(result.caScore) >= 20 ? 'bg-green-100 text-green-800' :
                    parseFloat(result.caScore) >= 15 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.caScore}/30
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    parseFloat(result.examScore) >= 50 ? 'bg-green-100 text-green-800' :
                    parseFloat(result.examScore) >= 35 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.examScore}/70
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.totalScore >= 80 ? 'bg-green-100 text-green-800' :
                    result.totalScore >= 60 ? 'bg-blue-100 text-blue-800' :
                    result.totalScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.totalScore}/100
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    result.grade === 'A' ? 'bg-green-100 text-green-800' :
                    result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                    result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                    result.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                    result.grade === 'E' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.grade || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedResult(result)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResult(result);
                        setShowForm(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteResult(result.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t bg-gray-50 text-sm text-gray-600">
        Showing {Math.min(filteredResults.length, 50)} of {filteredResults.length} results
      </div>
    </div>
  );
};

export default ResultsViews;