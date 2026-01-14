// src/hooks/useResultsData.js
import { useState, useCallback } from 'react';
import { resultsService } from '../services/resultsService';
import { studentService } from '../services/studentService';
import { academicService } from '../services/academicService';

export const useResultsData = () => {
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
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [existingResults, setExistingResults] = useState([]);

  const loadClassData = useCallback(async () => {
    if (!selectedClass) return;

    try {
      setIsLoading(true);
      
      const classStudents = await studentService.getStudentsByClass(selectedClass);
      setStudents(classStudents);
      setFilteredStudents(classStudents);

      const allSubjects = await academicService.getAllSubjects();
      setSubjects(allSubjects);

      const classSubjects = allSubjects.filter(subject => {
        return subject.classes && (
          subject.classes.includes(selectedClass) || 
          subject.classes.includes('All Classes') ||
          subject.classes.length === 0
        );
      });
      setFilteredSubjects(classSubjects);

      if (academicYear) {
        const existing = await resultsService.getClassResults(selectedClass, selectedTerm, academicYear);
        setExistingResults(existing);
      }

      initializeResultsGrid(classStudents, classSubjects);

    } catch (error) {
      console.error('Error loading class data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, selectedTerm, academicYear]);

  const initializeResultsGrid = useCallback((studentsList = filteredStudents, subjectsList = filteredSubjects) => {
    let newResults = [];
    
    if (activeTab === 'class') {
      studentsList.forEach(student => {
        subjectsList.forEach(subject => {
          const existingResult = existingResults.find(
            r => r.studentId === student.id && r.subjectId === subject.id
          );

          if (existingResult) {
            newResults.push({
              ...existingResult,
              id: existingResult.id || `${student.id}_${subject.id}`,
              isNew: false
            });
          } else {
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
      subjectsList.forEach(subject => {
        const existingResult = existingResults.find(
          r => r.studentId === selectedStudent.id && r.subjectId === subject.id
        );

        if (existingResult) {
          newResults.push({
            ...existingResult,
            id: existingResult.id || `${selectedStudent.id}_${subject.id}`,
            isNew: false
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
  }, [selectedClass, selectedTerm, academicYear, activeTab, selectedStudent, existingResults, filteredStudents, filteredSubjects]);

  const handleTermYearChange = useCallback(async () => {
    if (!selectedClass || !academicYear) return;

    try {
      setIsLoading(true);
      
      const existing = await resultsService.getClassResults(selectedClass, selectedTerm, academicYear);
      setExistingResults(existing);
      
      initializeResultsGrid();
      
    } catch (error) {
      console.error('Error loading results:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, selectedTerm, academicYear, initializeResultsGrid]);

  const refreshData = useCallback(async () => {
    if (!selectedClass) return;
    
    await loadClassData();
  }, [selectedClass, loadClassData]);

  // Calculate statistics
  const calculateStatistics = useCallback(() => {
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

  const statistics = calculateStatistics();

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
    filteredStudents,
    setFilteredStudents,
    filteredSubjects,
    setFilteredSubjects,
    existingResults,
    setExistingResults,
    
    // Computed values
    statistics,
    
    // Methods
    refreshData,
    loadClassData,
    handleTermYearChange,
    initializeResultsGrid
  };
};