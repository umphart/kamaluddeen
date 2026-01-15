import React, { useMemo } from 'react';
import ResultsForm from '../components/Results/ResultsForm';
import { FiFileText, FiPercent, FiAward, FiUser, FiX } from 'react-icons/fi';


const ResultsModals = ({
  showForm,
  setShowForm,
  selectedResult,
  setSelectedResult,
  handleResultSaved,
  filteredResults,
  studentSummaries = []
}) => {
  
  // Group all subjects for the selected student
  const studentAllSubjects = useMemo(() => {
    if (!selectedResult) return [];
    
    return filteredResults.filter(
      result => result.studentId === selectedResult.studentId
    );
  }, [selectedResult, filteredResults]);
  
  // Find student summary for position data
  const studentSummary = useMemo(() => {
    if (!selectedResult || !studentSummaries.length) return null;
    return studentSummaries.find(s => s.studentId === selectedResult.studentId);
  }, [selectedResult, studentSummaries]);
  
  // Calculate student statistics including total marks
  const studentStats = useMemo(() => {
    if (studentAllSubjects.length === 0) return null;
    
    const totalSubjects = studentAllSubjects.length;
    const totalScores = studentAllSubjects.reduce((sum, subj) => 
      sum + (parseFloat(subj.totalScore) || 0), 0
    );
    const caScores = studentAllSubjects.reduce((sum, subj) => 
      sum + (parseFloat(subj.caScore) || 0), 0
    );
    const examScores = studentAllSubjects.reduce((sum, subj) => 
      sum + (parseFloat(subj.examScore) || 0), 0
    );
    
    // Calculate total marks out of maximum (100 per subject)
    const totalMaximumMarks = totalSubjects * 100;
    const totalObtainedMarks = studentAllSubjects.reduce((sum, subj) => 
      sum + (parseFloat(subj.totalScore) || 0), 0
    );
    
    // Calculate subject-wise averages
    const subjectAverages = studentAllSubjects.reduce((acc, subj) => {
      const caMark = parseFloat(subj.caScore) || 0;
      const examMark = parseFloat(subj.examScore) || 0;
      const totalMark = parseFloat(subj.totalScore) || 0;
      
      acc.caTotal += caMark;
      acc.examTotal += examMark;
      acc.totalTotal += totalMark;
      
      return acc;
    }, { caTotal: 0, examTotal: 0, totalTotal: 0 });
    
    return {
      totalAverage: totalScores / totalSubjects,
      caAverage: caScores / totalSubjects,
      examAverage: examScores / totalSubjects,
      totalSubjects,
      highestScore: Math.max(...studentAllSubjects.map(s => parseFloat(s.totalScore) || 0)),
      lowestScore: Math.min(...studentAllSubjects.map(s => parseFloat(s.totalScore) || 0)),
      totalObtainedMarks,
      totalMaximumMarks,
      percentage: (totalObtainedMarks / totalMaximumMarks) * 100,
      caTotal: subjectAverages.caTotal,
      examTotal: subjectAverages.examTotal,
      totalTotal: subjectAverages.totalTotal
    };
  }, [studentAllSubjects]);
  
  // Grade color function
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
  
  // Score color function
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Function to get student photo URL
  const getStudentPhotoUrl = () => {
    return selectedResult?.studentPhotoUrl || 
           selectedResult?.studentPhoto || 
           selectedResult?.photo ||
           studentSummary?.studentPhotoUrl ||
           studentSummary?.photo;
  };

  // Function to get student position
  const getStudentPosition = () => {
    if (studentSummary?.position) {
      return studentSummary.position;
    }
    return selectedResult?.position;
  };

  // Function to format position with ordinal suffix
  const getOrdinalPosition = (position) => {
    if (!position) return 'N/A';
    const j = position % 10,
          k = position % 100;
    if (j === 1 && k !== 11) return `${position}st`;
    if (j === 2 && k !== 12) return `${position}nd`;
    if (j === 3 && k !== 13) return `${position}rd`;
    return `${position}th`;
  };

  // If no selected result, don't render modal
  if (!selectedResult) return null;

  return (
    <>
      {/* Results Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden">
            <ResultsForm 
              onClose={() => {
                setShowForm(false);
                setSelectedResult(null);
              }}
              onResultsSaved={handleResultSaved}
              initialData={selectedResult ? {
                class: selectedResult.className,
                term: selectedResult.term,
                academicYear: selectedResult.academicYear,
                studentId: selectedResult.studentId
              } : null}
            />
          </div>
        </div>
      )}

      {/* Student Results Details Modal - Compact Version */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedResult(null)}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header - Compact */}
          <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-800 truncate">
                  {selectedResult.studentName} - Results Details
                </h3>
                <p className="text-xs text-gray-600 truncate">
                  {selectedResult.className} • {selectedResult.term} Term • {selectedResult.academicYear}
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Student Info - Compact */}
            <div className="flex items-center gap-4 mb-4 p-3 bg-white border rounded-lg">
              {/* Student Photo - Smaller */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg border-2 border-white shadow-sm overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  {getStudentPhotoUrl() ? (
                    <img 
                      src={getStudentPhotoUrl()} 
                      alt={selectedResult.studentName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-blue-600 ${getStudentPhotoUrl() ? 'hidden' : ''}`}>
                    <FiUser className="w-8 h-8" />
                  </div>
                </div>
              </div>
              
              {/* Student Details - Compact */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="font-bold text-gray-800 truncate">{selectedResult.studentName}</h4>
                    <div className="text-xs text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Adm:</span>
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          {selectedResult.admissionNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Position:</span>
                      <span className="text-sm font-bold text-green-700">
                        {getOrdinalPosition(getStudentPosition())}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Subjects:</span>
                      <span className="text-sm font-bold text-purple-700">
                        {studentAllSubjects.length}
                      </span>
                    </div>
                    {studentStats && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Overall:</span>
                        <span className={`text-sm font-bold ${getScoreColorClass(studentStats.totalAverage)}`}>
                          {studentStats.totalAverage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Marks Summary - Compact */}
            {studentStats && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Marks Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-600">Obtained</div>
                        <div className="text-lg font-bold text-gray-800">
                          {studentStats.totalObtainedMarks.toFixed(0)}
                        </div>
                      </div>
                      <div className="p-1.5 bg-green-100 rounded">
                        <FiAward className="text-green-600 w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      /{studentStats.totalMaximumMarks}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-600">CA Total</div>
                        <div className="text-lg font-bold text-blue-600">
                          {studentStats.caTotal.toFixed(0)}
                        </div>
                      </div>
                      <div className="p-1.5 bg-blue-100 rounded">
                        <FiFileText className="text-blue-600 w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      /{studentStats.totalSubjects * 30}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-600">Exam Total</div>
                        <div className="text-lg font-bold text-purple-600">
                          {studentStats.examTotal.toFixed(0)}
                        </div>
                      </div>
                      <div className="p-1.5 bg-purple-100 rounded">
                        <FiPercent className="text-purple-600 w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      /{studentStats.totalSubjects * 70}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-600">Overall %</div>
                        <div className={`text-lg font-bold ${getScoreColorClass(studentStats.totalAverage)}`}>
                          {studentStats.percentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-1.5 bg-yellow-100 rounded">
                        <FiAward className="text-yellow-600 w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Avg: {studentStats.totalAverage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Subjects Table - Compact */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-800">Subjects Details</h4>
                <span className="text-xs text-gray-600">
                  {studentAllSubjects.length} subjects
                </span>
              </div>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CA
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentAllSubjects.map((subject, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                              {subject.subjectName}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[120px]">
                              {subject.teacherName}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            parseFloat(subject.caScore) >= 20 ? 'bg-green-100 text-green-800' :
                            parseFloat(subject.caScore) >= 15 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {subject.caScore || 0}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            parseFloat(subject.examScore) >= 50 ? 'bg-green-100 text-green-800' :
                            parseFloat(subject.examScore) >= 35 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {subject.examScore || 0}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            subject.totalScore >= 80 ? 'bg-green-100 text-green-800' :
                            subject.totalScore >= 60 ? 'bg-blue-100 text-blue-800' :
                            subject.totalScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {subject.totalScore || 0}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeColorClass(subject.grade)}`}>
                            {subject.grade || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Performance Summary - Compact */}
            {studentStats && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Performance Analysis</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Highest</div>
                    <div className="text-base font-bold text-green-600">
                      {studentStats.highestScore.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Lowest</div>
                    <div className="text-base font-bold text-red-600">
                      {studentStats.lowestScore.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">CA Avg</div>
                    <div className="text-base font-bold text-blue-600">
                      {studentStats.caAverage.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Exam Avg</div>
                    <div className="text-base font-bold text-purple-600">
                      {studentStats.examAverage.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Modal Footer - Always Visible */}
          <div className="px-4 py-3 border-t bg-gray-50 flex justify-between items-center flex-shrink-0">
            <div className="text-xs text-gray-600">
              {studentAllSubjects.length} subjects • 
              {studentStats ? ` ${studentStats.totalObtainedMarks.toFixed(0)}/${studentStats.totalMaximumMarks} marks` : ' Calculating...'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowForm(true);
                  setSelectedResult(null);
                }}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                Edit Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultsModals;