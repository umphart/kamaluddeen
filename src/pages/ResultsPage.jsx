import React, { useState, useEffect, useMemo } from 'react';
import ResultsForm from '../components/Results/ResultsForm';
import { resultsService } from '../services/resultsService';
import { studentService } from '../services/studentService';
import toast from 'react-hot-toast';
import ResultsHeader from './ResultsHeader';
import ResultsFilters from './ResultsFilters';
import ResultsViews from './ResultsViews';
import ResultsModals from './ResultsModals';
import { printAllResults } from '../components/Results/printAllResults';
import ResultsPDFGenerator from '../components/Results/ResultsPDFGenerator';

const ResultsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('1st Term');
  const [academicYear, setAcademicYear] = useState('');
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('summary');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [filters, setFilters] = useState({
    minScore: '',
    maxScore: '',
    grade: '',
    student: ''
  });

  // Calculate student summaries
  const studentSummaries = useMemo(() => {
    if (!filteredResults || filteredResults.length === 0) return [];

    const studentMap = {};
    
    filteredResults.forEach(result => {
      const studentId = result.studentId;
      
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          studentId,
          studentName: result.studentName,
          admissionNumber: result.admissionNumber,
          studentPhotoUrl: result.studentPhotoUrl || result.studentPhoto,
          caScores: [],
          examScores: [],
          totalScores: [],
          grades: [],
          subjectCount: 0,
          totalScoreSum: 0
        };
      }
      
      const caScore = parseFloat(result.caScore) || 0;
      const examScore = parseFloat(result.examScore) || 0;
      const totalScore = parseFloat(result.totalScore) || 0;
      
      if (!isNaN(caScore)) studentMap[studentId].caScores.push(caScore);
      if (!isNaN(examScore)) studentMap[studentId].examScores.push(examScore);
      if (!isNaN(totalScore)) studentMap[studentId].totalScores.push(totalScore);
      
      const subjectTotal = caScore + examScore;
      studentMap[studentId].totalScoreSum += subjectTotal;
      
      if (result.grade) {
        studentMap[studentId].grades.push(result.grade);
      }
      
      studentMap[studentId].subjectCount++;
    });

    const summaries = Object.values(studentMap).map(student => {
      const caAverage = student.caScores.length > 0 
        ? student.caScores.reduce((sum, score) => sum + score, 0) / student.caScores.length 
        : 0;
      
      const examAverage = student.examScores.length > 0 
        ? student.examScores.reduce((sum, score) => sum + score, 0) / student.examScores.length 
        : 0;
      
      let totalAverage;
      if (student.totalScores.length > 0) {
        totalAverage = student.totalScores.reduce((sum, score) => sum + score, 0) / student.totalScores.length;
      } else {
        totalAverage = student.subjectCount > 0 
          ? student.totalScoreSum / student.subjectCount 
          : 0;
      }
      
      let overallGrade = '';
      if (totalAverage >= 80) overallGrade = 'A';
      else if (totalAverage >= 70) overallGrade = 'B';
      else if (totalAverage >= 60) overallGrade = 'C';
      else if (totalAverage >= 50) overallGrade = 'D';
      else if (totalAverage >= 40) overallGrade = 'E';
      else if (totalAverage > 0) overallGrade = 'F';

      return {
        ...student,
        caAverage: parseFloat(caAverage.toFixed(1)),
        examAverage: parseFloat(examAverage.toFixed(1)),
        totalAverage: parseFloat(totalAverage.toFixed(1)),
        overallGrade,
        totalSubjects: student.subjectCount,
      };
    });

    summaries.sort((a, b) => b.totalAverage - a.totalAverage);
    
    return summaries.map((student, index) => ({
      ...student,
      position: index + 1
    }));
  }, [filteredResults]);

  // Calculate overall class statistics
  const classStatistics = useMemo(() => {
    if (studentSummaries.length === 0) {
      return {
        totalStudents: 0,
        classAverage: 0,
        topStudent: null,
        gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
      };
    }

    const totalAverage = studentSummaries.reduce((sum, student) => sum + student.totalAverage, 0);
    const classAverage = totalAverage / studentSummaries.length;

    const gradeDistribution = studentSummaries.reduce((counts, student) => {
      if (student.overallGrade) {
        counts[student.overallGrade] = (counts[student.overallGrade] || 0) + 1;
      }
      return counts;
    }, { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 });

    return {
      totalStudents: studentSummaries.length,
      classAverage: parseFloat(classAverage.toFixed(2)),
      topStudent: studentSummaries[0],
      gradeDistribution
    };
  }, [studentSummaries]);

  // Initialize academic year
  useEffect(() => {
    const currentYear = resultsService.getCurrentAcademicYear();
    setAcademicYear(currentYear);
  }, []);

  // Load available classes
  useEffect(() => {
    loadAvailableClasses();
  }, []);

  // Load results when filters change
  useEffect(() => {
    if (selectedClass && selectedTerm && academicYear) {
      loadResults();
    }
  }, [selectedClass, selectedTerm, academicYear]);

  // Apply search and filters when they change
  useEffect(() => {
    applyFilters();
  }, [results, searchTerm, filters]);

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
      if (sortedClasses.length > 0 && !selectedClass) {
        setSelectedClass(sortedClasses[0]);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const loadResults = async () => {
    if (!selectedClass || !selectedTerm || !academicYear) return;

    try {
      setIsLoading(true);
      const data = await resultsService.getClassResults(selectedClass, selectedTerm, academicYear);
      setResults(data);
      setFilteredResults(data);
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load results');
      setResults([]);
      setFilteredResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(result =>
        result.studentName.toLowerCase().includes(term) ||
        result.admissionNumber.toLowerCase().includes(term)
      );
    }

    if (filters.minScore) {
      filtered = filtered.filter(result => 
        result.totalScore >= parseFloat(filters.minScore)
      );
    }
    if (filters.maxScore) {
      filtered = filtered.filter(result => 
        result.totalScore <= parseFloat(filters.maxScore)
      );
    }

    if (filters.grade) {
      filtered = filtered.filter(result => 
        result.grade === filters.grade
      );
    }

    if (filters.student) {
      filtered = filtered.filter(result => 
        result.studentName.toLowerCase().includes(filters.student.toLowerCase())
      );
    }

    setFilteredResults(filtered);
  };

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) {
      return;
    }

    try {
      await resultsService.deleteResult(resultId);
      toast.success('Result deleted successfully');
      loadResults();
    } catch (error) {
      console.error('Error deleting result:', error);
      toast.error('Failed to delete result');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete all ${filteredResults.length} filtered results?`)) {
      return;
    }

    try {
      const deletePromises = filteredResults.map(result => 
        resultsService.deleteResult(result.id)
      );
      await Promise.all(deletePromises);
      toast.success(`${filteredResults.length} results deleted successfully`);
      loadResults();
    } catch (error) {
      console.error('Error deleting results:', error);
      toast.error('Failed to delete results');
    }
  };

  const exportToCSV = () => {
    if (studentSummaries.length === 0) {
      toast.error('No results to export');
      return;
    }

    const csvData = studentSummaries.map(student => ({
      'Position': student.position,
      'Admission Number': student.admissionNumber,
      'Student Name': student.studentName,
      'Total Subjects': student.totalSubjects,
      'CA Average': student.caAverage,
      'Exam Average': student.examAverage,
      'Total Average': student.totalAverage,
      'Total Score (Sum)': student.totalScoreSum,
      'Overall Grade': student.overallGrade
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_results_${selectedClass}_${selectedTerm}_${academicYear.replace(/\//g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Student summaries exported to CSV');
  };

  const handlePrintAllResults = () => {
    if (studentSummaries.length === 0) {
      toast.error('No results to print');
      return;
    }
    printAllResults(selectedClass, selectedTerm, academicYear, studentSummaries, classStatistics, filteredResults);
  };

  const handlePrintStudentResult = (student) => {
    if (!student) {
      toast.error('No student data available for printing');
      return;
    }

    const studentAllSubjects = filteredResults.filter(r => r.studentId === student.studentId);
    
    if (studentAllSubjects.length === 0) {
      toast.error('No subject data found for this student');
      return;
    }

    const studentStats = calculateStudentStats(studentAllSubjects);
    
    setPdfData({
      student,
      term: selectedTerm,
      academicYear,
      className: selectedClass,
      studentSummaries,
      classStatistics,
      filteredResults,
      studentPhotoUrl: student.studentPhotoUrl,
      studentAllSubjects,
      studentStats
    });
  };

  const calculateStudentStats = (studentAllSubjects) => {
    if (!studentAllSubjects || studentAllSubjects.length === 0) return null;
    
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
    
    const totalMaximumMarks = totalSubjects * 100;
    const totalObtainedMarks = studentAllSubjects.reduce((sum, subj) => 
      sum + (parseFloat(subj.totalScore) || 0), 0
    );
    
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
      caTotal: caScores,
      examTotal: examScores,
      totalTotal: totalScores
    };
  };

  const handleResultSaved = () => {
    loadResults();
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

  const PDFModal = ({ pdfData, onClose }) => {
    if (!pdfData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b bg-blue-50">
            <h3 className="text-lg font-bold text-blue-800">
              Generate Result Sheet for {pdfData.student.studentName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="p-4 h-[calc(90vh-120px)] overflow-y-auto">
            <ResultsPDFGenerator
              student={pdfData.student}
              term={pdfData.term}
              academicYear={pdfData.academicYear}
              className={pdfData.className}
              studentSummaries={pdfData.studentSummaries}
              classStatistics={pdfData.classStatistics}
              filteredResults={pdfData.filteredResults}
              studentPhotoUrl={pdfData.studentPhotoUrl}
              studentAllSubjects={pdfData.studentAllSubjects}
              studentStats={pdfData.studentStats}
            />
          </div>
          
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <ResultsHeader
        showForm={showForm}
        setShowForm={setShowForm}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedTerm={selectedTerm}
        setSelectedTerm={setSelectedTerm}
        academicYear={academicYear}
        setAcademicYear={setAcademicYear}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        availableClasses={availableClasses}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        isLoading={isLoading}
        loadResults={loadResults}
        exportToCSV={exportToCSV}
        printAllResults={handlePrintAllResults}
        studentSummaries={studentSummaries}
        classStatistics={classStatistics}
        getTerms={resultsService.getTerms}
      />

      <ResultsFilters
        showFilters={showFilters}
        filters={filters}
        setFilters={setFilters}
        filteredResults={filteredResults}
        handleBulkDelete={handleBulkDelete}
      />

      <ResultsViews
        isLoading={isLoading}
        selectedClass={selectedClass}
        selectedTerm={selectedTerm}
        academicYear={academicYear}
        results={results}
        filteredResults={filteredResults}
        studentSummaries={studentSummaries}
        classStatistics={classStatistics}
        viewMode={viewMode}
        setShowForm={setShowForm}
        setSelectedResult={setSelectedResult}
        handleDeleteResult={handleDeleteResult}
        getGradeColorClass={getGradeColorClass}
        getScoreColorClass={getScoreColorClass}
        exportToCSV={exportToCSV}
        printAllResults={handlePrintAllResults}
        printStudentResult={handlePrintStudentResult}
      />

      <ResultsModals
        showForm={showForm}
        setShowForm={setShowForm}
        selectedResult={selectedResult}
        setSelectedResult={setSelectedResult}
        handleResultSaved={handleResultSaved}
        filteredResults={filteredResults}
        studentSummaries={studentSummaries}
      />

      {/* Results Entry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-800">Enter/Edit Results</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedResult(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="h-[calc(90vh-64px)]">
              <ResultsForm
                onClose={() => {
                  setShowForm(false);
                  setSelectedResult(null);
                }}
                onResultsSaved={handleResultSaved}
                initialData={selectedResult || {
                  className: selectedClass,
                  term: selectedTerm,
                  academicYear: academicYear
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {pdfData && <PDFModal pdfData={pdfData} onClose={() => setPdfData(null)} />}
    </div>
  );
};

export default ResultsPage;