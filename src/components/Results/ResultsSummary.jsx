// src/components/Results/ResultsSummary.jsx
import React, { useState, useEffect } from 'react';
import { resultsService } from '../../services/resultsService';
import { studentService } from '../../services/studentService';
import { FiDownload, FiPrinter, FiBarChart2, FiTrendingUp, FiTrendingDown, FiUsers } from 'react-icons/fi';

const ResultsSummary = ({ className, term, academicYear }) => {
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    averageScore: 0,
    passRate: 0,
    topSubject: 'N/A',
    gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 },
    subjectWiseAverage: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalClassStudents, setTotalClassStudents] = useState(0);
  const [lastTermStats, setLastTermStats] = useState(null);

  useEffect(() => {
    if (className && term && academicYear) {
      loadStatistics();
      loadTotalClassStudents();
      loadPreviousTermStats();
    }
  }, [className, term, academicYear]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      
      // Get results for this class, term, and year
      const results = await resultsService.getClassResults(className, term, academicYear);
      
      if (results.length === 0) {
        setStatistics({
          totalStudents: 0,
          averageScore: 0,
          passRate: 0,
          topSubject: 'N/A',
          gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 },
          subjectWiseAverage: {}
        });
        return;
      }

      // Calculate statistics
      const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
      const subjectScores = {};
      const subjectCounts = {};
      let totalScore = 0;
      let passCount = 0;
      const uniqueStudents = new Set();

      results.forEach(result => {
        uniqueStudents.add(result.studentId);
        totalScore += result.totalScore || 0;
        
        if (result.totalScore >= 40) passCount++;
        
        // Count grades
        if (result.grade && gradeDistribution[result.grade] !== undefined) {
          gradeDistribution[result.grade]++;
        }
        
        // Track subject scores
        if (!subjectScores[result.subjectName]) {
          subjectScores[result.subjectName] = 0;
          subjectCounts[result.subjectName] = 0;
        }
        subjectScores[result.subjectName] += result.totalScore || 0;
        subjectCounts[result.subjectName]++;
      });

      // Calculate subject-wise averages
      const subjectWiseAverage = {};
      Object.keys(subjectScores).forEach(subject => {
        subjectWiseAverage[subject] = subjectCounts[subject] > 0 
          ? subjectScores[subject] / subjectCounts[subject] 
          : 0;
      });

      // Find top subject
      let topSubject = 'N/A';
      let topSubjectAvg = 0;
      Object.entries(subjectWiseAverage).forEach(([subject, avg]) => {
        if (avg > topSubjectAvg) {
          topSubjectAvg = avg;
          topSubject = subject;
        }
      });

      const totalStudents = uniqueStudents.size;
      const averageScore = results.length > 0 ? totalScore / results.length : 0;
      const passRate = totalStudents > 0 ? (passCount / totalStudents) * 100 : 0;

      setStatistics({
        totalStudents,
        averageScore: parseFloat(averageScore.toFixed(1)),
        passRate: parseFloat(passRate.toFixed(1)),
        topSubject,
        gradeDistribution,
        subjectWiseAverage
      });

    } catch (error) {
      console.error('Error loading statistics:', error);
      // Set default statistics on error
      setStatistics({
        totalStudents: 0,
        averageScore: 0,
        passRate: 0,
        topSubject: 'N/A',
        gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 },
        subjectWiseAverage: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTotalClassStudents = async () => {
    try {
      const students = await studentService.getStudentsByClass(className);
      setTotalClassStudents(students.length);
    } catch (error) {
      console.error('Error loading class students:', error);
      setTotalClassStudents(0);
    }
  };

  const loadPreviousTermStats = async () => {
    try {
      // Get previous term based on current term
      const getPreviousTerm = (currentTerm) => {
        const terms = ['1st Term', '2nd Term', '3rd Term'];
        const currentIndex = terms.indexOf(currentTerm);
        return currentIndex > 0 ? terms[currentIndex - 1] : null;
      };

      const previousTerm = getPreviousTerm(term);
      if (!previousTerm) {
        setLastTermStats(null);
        return;
      }

      // Try to get previous term results
      const previousResults = await resultsService.getClassResults(className, previousTerm, academicYear);
      
      if (previousResults.length === 0) {
        setLastTermStats(null);
        return;
      }

      // Calculate average for previous term
      const prevTotalScore = previousResults.reduce((sum, result) => sum + (result.totalScore || 0), 0);
      const prevAverage = previousResults.length > 0 ? prevTotalScore / previousResults.length : 0;
      
      setLastTermStats({
        averageScore: parseFloat(prevAverage.toFixed(1))
      });

    } catch (error) {
      console.error('Error loading previous term stats:', error);
      setLastTermStats(null);
    }
  };

  const calculateChange = () => {
    if (!lastTermStats) return { value: 0, isPositive: true };
    
    const current = statistics.averageScore;
    const previous = lastTermStats.averageScore;
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    
    return {
      value: parseFloat(change.toFixed(1)),
      isPositive: change >= 0
    };
  };

  const handleExportPDF = () => {
    // Implement PDF export functionality
    console.log('Exporting PDF for:', { className, term, academicYear });
    // You would integrate with a PDF library like jsPDF here
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading statistics...</p>
      </div>
    );
  }

  if (!className || !term || !academicYear) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
        <FiBarChart2 className="mx-auto text-3xl text-gray-300 mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Class & Term</h3>
        <p className="text-gray-500">Choose a class, term, and academic year to view statistics</p>
      </div>
    );
  }

  const change = calculateChange();
  const passCount = Object.values(statistics.gradeDistribution).reduce((a, b) => a + b, 0);
  const completionRate = totalClassStudents > 0 
    ? Math.round((statistics.totalStudents / totalClassStudents) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden print:shadow-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 print:bg-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Results Summary</h3>
            <p className="text-indigo-100 text-sm">
              {className} • {term} • {academicYear}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExportPDF}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
              title="Export PDF"
            >
              <FiDownload />
            </button>
            <button 
              onClick={handlePrint}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors print:hidden"
              title="Print Report"
            >
              <FiPrinter />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Students with Results</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalStudents}</p>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">{completionRate}%</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <FiUsers className="text-indigo-600 text-xl" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {totalClassStudents > 0 
              ? `${statistics.totalStudents} out of ${totalClassStudents} students have results`
              : 'No students in class'
            }
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.averageScore.toFixed(1)}%
              </p>
              {lastTermStats && (
                <div className="flex items-center mt-2">
                  {change.isPositive ? (
                    <>
                      <FiTrendingUp className="text-green-600 mr-1" />
                      <span className="text-xs text-green-600">{change.value}%</span>
                    </>
                  ) : (
                    <>
                      <FiTrendingDown className="text-red-600 mr-1" />
                      <span className="text-xs text-red-600">{Math.abs(change.value)}%</span>
                    </>
                  )}
                  <span className="text-xs text-gray-500 ml-1">from last term</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full ${
              statistics.averageScore >= 70 ? 'bg-green-100' :
              statistics.averageScore >= 50 ? 'bg-yellow-100' :
              'bg-red-100'
            }`}>
              <FiBarChart2 className={`text-xl ${
                statistics.averageScore >= 70 ? 'text-green-600' :
                statistics.averageScore >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Based on {passCount} completed result{passCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.passRate.toFixed(1)}%
              </p>
              <div className="mt-2">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">A-D Grades: </span>
                  <span className="text-xs font-semibold ml-1">
                    {Object.entries(statistics.gradeDistribution)
                      .slice(0, 4)
                      .reduce((sum, [_, count]) => sum + count, 0)}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">E-F Grades: </span>
                  <span className="text-xs font-semibold ml-1">
                    {Object.entries(statistics.gradeDistribution)
                      .slice(4)
                      .reduce((sum, [_, count]) => sum + count, 0)}
                  </span>
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-full ${
              statistics.passRate >= 80 ? 'bg-green-100' :
              statistics.passRate >= 60 ? 'bg-blue-100' :
              'bg-orange-100'
            }`}>
              <FiTrendingUp className={`text-xl ${
                statistics.passRate >= 80 ? 'text-green-600' :
                statistics.passRate >= 60 ? 'text-blue-600' :
                'text-orange-600'
              }`} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Students scoring 40% and above
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Subject</p>
              <p className="text-lg font-bold text-gray-900 truncate" title={statistics.topSubject}>
                {statistics.topSubject}
              </p>
              {statistics.topSubject !== 'N/A' && statistics.subjectWiseAverage[statistics.topSubject] && (
                <p className="text-sm text-gray-700 mt-1">
                  Avg: {statistics.subjectWiseAverage[statistics.topSubject].toFixed(1)}%
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiBarChart2 className="text-purple-600 text-xl" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {statistics.topSubject !== 'N/A' 
              ? `Highest average score among ${Object.keys(statistics.subjectWiseAverage).length} subjects`
              : 'No results available'
            }
          </p>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="px-6 pb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-800">Grade Distribution</h4>
          <div className="text-sm text-gray-500">
            Total: {passCount} result{passCount !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(statistics.gradeDistribution).map(([grade, count]) => {
            const percentage = passCount > 0 ? (count / passCount) * 100 : 0;
            
            return (
              <div key={grade} className="text-center">
                <div 
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    grade === 'A' ? 'bg-green-100 hover:bg-green-200' :
                    grade === 'B' ? 'bg-blue-100 hover:bg-blue-200' :
                    grade === 'C' ? 'bg-yellow-100 hover:bg-yellow-200' :
                    grade === 'D' ? 'bg-orange-100 hover:bg-orange-200' :
                    grade === 'E' ? 'bg-purple-100 hover:bg-purple-200' :
                    'bg-red-100 hover:bg-red-200'
                  }`}
                  title={`${grade}: ${count} result${count !== 1 ? 's' : ''} (${percentage.toFixed(1)}%)`}
                >
                  <span className={`text-lg font-bold ${
                    grade === 'A' ? 'text-green-800' :
                    grade === 'B' ? 'text-blue-800' :
                    grade === 'C' ? 'text-yellow-800' :
                    grade === 'D' ? 'text-orange-800' :
                    grade === 'E' ? 'text-purple-800' :
                    'text-red-800'
                  }`}>
                    {grade}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{count}</p>
                <p className="text-xs text-gray-500">
                  {percentage > 0 ? percentage.toFixed(1) + '%' : '0%'}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Subject Performance Bar Chart */}
        {Object.keys(statistics.subjectWiseAverage).length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3">Subject Performance</h4>
            <div className="space-y-2">
              {Object.entries(statistics.subjectWiseAverage)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5) // Show top 5 subjects
                .map(([subject, average]) => (
                  <div key={subject} className="flex items-center">
                    <div className="w-32 text-sm text-gray-600 truncate mr-3" title={subject}>
                      {subject}
                    </div>
                    <div className="flex-1">
                      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`absolute h-full rounded-full transition-all duration-500 ${
                            average >= 80 ? 'bg-green-500' :
                            average >= 60 ? 'bg-blue-500' :
                            average >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(average, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-semibold ml-3">
                      {average.toFixed(1)}%
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="px-6 pb-4 border-t pt-4">
        <div className="text-xs text-gray-500 italic">
          Statistics generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ResultsSummary;