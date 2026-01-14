// src/Hooks/useResultsForm.js
import { useState, useCallback } from 'react';
import { resultsService } from '../services/resultsService';
import { studentService } from '../services/studentService';
import toast from 'react-hot-toast';

export const useResultsForm = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('1st Term');
  const [academicYear, setAcademicYear] = useState('');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('class');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [existingResults, setExistingResults] = useState([]);

  // Calculate statistics
  const statistics = useCallback(() => {
    const completedResults = results.filter(r => r.caScore !== '' && r.examScore !== '');
    
    if (completedResults.length === 0) {
      return {
        totalStudents: 0,
        totalSubjects: 0,
        averageScore: 0,
        completedCount: 0,
        totalCount: results.length
      };
    }

    const totalScore = completedResults.reduce((sum, result) => sum + result.totalScore, 0);
    const averageScore = totalScore / completedResults.length;

    return {
      totalStudents: new Set(completedResults.map(r => r.studentId)).size,
      totalSubjects: new Set(completedResults.map(r => r.subjectId)).size,
      averageScore: parseFloat(averageScore.toFixed(1)),
      completedCount: completedResults.length,
      totalCount: results.length
    };
  }, [results]);

  // Load available classes
  const loadAvailableClasses = useCallback(async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize results with existing data
  const initializeResults = useCallback((studentsList, subjectsList, existingResultsList) => {
    let newResults = [];
    
    // Filter subjects for the selected class
    const classSubjects = subjectsList.filter(subject => {
      return subject.classes && (
        subject.classes.includes(selectedClass) || 
        subject.classes.includes('All Classes') ||
        subject.classes.length === 0
      );
    });

    if (activeTab === 'class') {
      // Initialize results for all students in the class
      studentsList.forEach(student => {
        classSubjects.forEach(subject => {
          // Check if result already exists
          const existingResult = existingResultsList.find(
            r => r.studentId === student.id && r.subjectId === subject.id
          );

          if (existingResult) {
            // Use existing result - this prevents duplicates
            newResults.push({
              ...existingResult,
              id: existingResult.id || `${student.id}_${subject.id}`,
              isNew: false,
              caScore: existingResult.caScore || '',
              examScore: existingResult.examScore || '',
              totalScore: existingResult.totalScore || 0,
              grade: existingResult.grade || '',
              remarks: existingResult.remarks || ''
            });
          } else {
            // Create new result entry
            newResults.push({
              id: `${student.id}_${subject.id}`,
              studentId: student.id,
              admissionNumber: student.admissionNumber,
              studentName: student.fullName,
              className: selectedClass,
              subjectId: subject.id,
              subjectCode: subject.code,
              subjectName: subject.name,
              examType: 'First Term',
              term: selectedTerm,
              academicYear: academicYear,
              caScore: '',
              examScore: '',
              totalScore: 0,
              grade: '',
              remarks: '',
              teacherName: subject.teacher || 'Not Assigned',
              isNew: true
            });
          }
        });
      });
    } else if (activeTab === 'individual' && selectedStudent) {
      // Initialize results for selected student
      classSubjects.forEach(subject => {
        const existingResult = existingResultsList.find(
          r => r.studentId === selectedStudent.id && r.subjectId === subject.id
        );

        if (existingResult) {
          newResults.push({
            ...existingResult,
            id: existingResult.id || `${selectedStudent.id}_${subject.id}`,
            isNew: false,
            caScore: existingResult.caScore || '',
            examScore: existingResult.examScore || '',
            totalScore: existingResult.totalScore || 0,
            grade: existingResult.grade || '',
            remarks: existingResult.remarks || ''
          });
        } else {
          newResults.push({
            id: `${selectedStudent.id}_${subject.id}`,
            studentId: selectedStudent.id,
            admissionNumber: selectedStudent.admissionNumber,
            studentName: selectedStudent.fullName,
            className: selectedClass,
            subjectId: subject.id,
            subjectCode: subject.code,
            subjectName: subject.name,
            examType: 'First Term',
            term: selectedTerm,
            academicYear: academicYear,
            caScore: '',
            examScore: '',
            totalScore: 0,
            grade: '',
            remarks: '',
            teacherName: subject.teacher || 'Not Assigned',
            isNew: true
          });
        }
      });
    }
    
    setResults(newResults);
  }, [selectedClass, selectedTerm, academicYear, activeTab, selectedStudent]);

  // Handle score change
// In your useResultsForm hook, update handleScoreChange:
const handleScoreChange = (resultId, field, value) => {
  setResults(prevResults => {
    return prevResults.map(result => {
      if (result.id === resultId) {
        const updatedResult = { ...result, [field]: value };
        
        // Safely calculate total score
        try {
          const caScore = parseFloat(updatedResult.caScore || 0);
          const examScore = parseFloat(updatedResult.examScore || 0);
          
          // Validate scores are numbers
          if (!isNaN(caScore) && !isNaN(examScore)) {
            const total = caScore + examScore;
            updatedResult.totalScore = parseFloat(total.toFixed(1));
            
            // Calculate grade (add your own grading logic)
            updatedResult.grade = calculateGrade(updatedResult.totalScore);
            updatedResult.remarks = calculateRemarks(updatedResult.grade);
          }
        } catch (error) {
          console.error('Error calculating score:', error);
          updatedResult.totalScore = 0;
          updatedResult.grade = '';
          updatedResult.remarks = '';
        }
        
        return updatedResult;
      }
      return result;
    });
  });
};

// Helper functions
const calculateGrade = (score) => {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  return 'F';
};

const calculateRemarks = (grade) => {
  switch(grade) {
    case 'A': return 'Excellent';
    case 'B': return 'Very Good';
    case 'C': return 'Good';
    case 'D': return 'Fair';
    case 'E': return 'Poor';
    case 'F': return 'Fail';
    default: return '';
  }
};

  // Validate results
  const validateResults = useCallback(() => {
    const errors = [];
    const warnings = [];
    
    results.forEach((result, index) => {
      const caScore = parseFloat(result.caScore) || 0;
      const examScore = parseFloat(result.examScore) || 0;
      
      if (result.caScore === '' && result.examScore === '') return;
      
      if (caScore < 0 || caScore > 30) {
        errors.push(`Row ${index + 1}: CA Score must be between 0-30 for ${result.subjectName}`);
      }
      
      if (examScore < 0 || examScore > 70) {
        errors.push(`Row ${index + 1}: Exam Score must be between 0-70 for ${result.subjectName}`);
      }
      
      const total = caScore + examScore;
      if (total < 0 || total > 100) {
        errors.push(`Row ${index + 1}: Total score must be between 0-100 for ${result.subjectName}`);
      }
      
      if (total < 40 && total > 0) {
        warnings.push(`Row ${index + 1}: ${result.studentName} has low score (${total}) in ${result.subjectName}`);
      }
    });
    
    return { errors, warnings };
  }, [results]);

  // Save results
// In your useResultsForm hook, update the validateAndSaveResults function:
const validateAndSaveResults = async () => {
  try {
    setIsSaving(true);

    // Filter only results with valid scores
    const resultsToSave = results.filter(result => {
      const caScore = parseFloat(result.caScore || 0);
      const examScore = parseFloat(result.examScore || 0);
      
      // Only save results that have at least one score entered
      return !isNaN(caScore) || !isNaN(examScore);
    });

    if (resultsToSave.length === 0) {
      toast.error('Please enter scores for at least one result');
      return [];
    }

    // Prepare results data
    const preparedResults = resultsToSave.map(result => {
      const caScore = parseFloat(result.caScore || 0);
      const examScore = parseFloat(result.examScore || 0);
      const totalScore = caScore + examScore;
      const grade = resultsService.calculateGrade(totalScore);
      const remarks = resultsService.calculateRemarks(grade);

      return {
        studentId: result.studentId,
        admissionNumber: result.admissionNumber,
        studentName: result.studentName,
        className: selectedClass,
        subjectId: result.subjectId,
        subjectCode: result.subjectCode,
        subjectName: result.subjectName,
        examType: 'Final Exam',
        term: selectedTerm,
        academicYear: academicYear,
        caScore: result.caScore,
        examScore: result.examScore,
        grade: grade,
        remarks: remarks,
        teacherId: result.teacherId,
        teacherName: result.teacherName,
        enteredBy: 'Teacher' // Get from user session
      };
    });

    console.log('Saving results:', preparedResults);

    // Use bulkAddResults which handles both insert and update
    const savedResults = await resultsService.bulkAddResults(preparedResults);
    
    toast.success(`Successfully saved ${savedResults.length} results`);
    return savedResults;

  } catch (error) {
    console.error('Error saving results:', error);
    
    // Handle specific error messages
    if (error.message.includes('CA must be 0-30') || error.message.includes('Exam must be 0-70')) {
      toast.error('Invalid scores. CA must be 0-30, Exam must be 0-70.');
    } else if (error.message.includes('Invalid student or subject ID')) {
      toast.error('Invalid student or subject data. Please refresh and try again.');
    } else {
      toast.error(`Failed to save results: ${error.message}`);
    }
    
    throw error;
  } finally {
    setIsSaving(false);
  }
};
  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    const completedResults = results.filter(result => result.caScore !== '' && result.examScore !== '');
    if (completedResults.length === 0) {
      toast.error('No completed results to export');
      return;
    }

    const csvData = completedResults.map(result => ({
      'Admission Number': result.admissionNumber,
      'Student Name': result.studentName,
      'Class': result.className,
      'Subject': result.subjectName,
      'Subject Code': result.subjectCode,
      'CA Score': result.caScore,
      'Exam Score': result.examScore,
      'Total Score': result.totalScore,
      'Grade': result.grade,
      'Remarks': result.remarks,
      'Term': result.term,
      'Academic Year': result.academicYear,
      'Teacher': result.teacherName
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results_${selectedClass.replace(/\s+/g, '_')}_${selectedTerm.replace(/\s+/g, '_')}_${academicYear.replace(/\//g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Results exported to CSV');
  }, [results, selectedClass, selectedTerm, academicYear]);

  return {
    // State
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
    
    // Computed values
    statistics: statistics(),
    
    // Methods
    loadAvailableClasses,
    initializeResults,
    handleScoreChange,
    validateAndSaveResults,
    exportToCSV
  };
};