// src/pages/Admissions.jsx
import React, { useState, useEffect, useMemo } from 'react';
import StudentForm from '../components/Students/StudentForm';
import AdmissionsFilters from './AdmissionsFilters';
import StudentListView from './StudentListView';
import StudentCardView from './StudentCardView';
import AdmissionsHeader from './AdmissionsHeader';
import StudentFormModal from './StudentFormModal';
import EditStudentModal from './EditStudentModal';
import IdCardModal from './IdCardModal';
import AdmissionLetterModal from './AdmissionLetterModal';
import { getAdmissionDuration, getCompletionYear, safeFilter } from './admissionUtils';
import { studentService } from '../services/studentService';
import toast from 'react-hot-toast';

const Admissions = () => {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [showAdmissionLetter, setShowAdmissionLetter] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedIdCardStudent, setSelectedIdCardStudent] = useState(null);
  const [selectedLetterStudent, setSelectedLetterStudent] = useState(null);
  const [itemsPerPage] = useState(10);

  const levels = [
    { code: 'PN', name: 'Pre-Nursery', color: 'bg-purple-100 text-purple-800', icon: '👶' },
    { code: 'NU', name: 'Nursery', color: 'bg-blue-100 text-blue-800', icon: '👧' },
    { code: 'PR', name: 'Primary', color: 'bg-green-100 text-green-800', icon: '📚' },
    { code: 'JS', name: 'Junior Secondary', color: 'bg-yellow-100 text-yellow-800', icon: '🎓' }
  ];

  const classes = {
    'PN': ['Pre-Nursery'],
    'NU': ['Nursery 1', 'Nursery 2'],
    'PR': ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4'],
    'JS': ['JSS 1', 'JSS 2', 'JSS 3']
  };

  // Define level order for sorting (from lowest to highest)
  const levelOrder = ['PN', 'NU', 'PR', 'JS'];

  // Define class order within each level
  const classOrder = {
    'PN': ['Pre-Nursery'],
    'NU': ['Nursery 1', 'Nursery 2'],
    'PR': ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4'],
    'JS': ['JSS 1', 'JSS 2', 'JSS 3']
  };

  // Load students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const allStudents = await studentService.getAllStudents();
      
      if (!allStudents || !Array.isArray(allStudents)) {
        console.error('getAllStudents did not return array:', allStudents);
        setStudents([]);
        toast.error('Failed to load student data');
      } else {
        setStudents(allStudents);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAdded = (newStudent) => {
    setStudents(prev => [newStudent, ...prev]);
  };

  const handleStudentUpdated = (updatedStudent) => {
    setStudents(prev => prev.map(s => 
      s.id === updatedStudent.id ? updatedStudent : s
    ));
  };

const handleDeleteStudent = async (studentId) => {
  // Create a toast with confirmation buttons
  const toastId = toast.custom(
    (t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
        max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Delete Student
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete this student? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={async () => {
              try {
                await studentService.deleteStudent(studentId);
                setStudents(prev => prev.filter(s => s.id !== studentId));
                toast.success('Student deleted successfully!', { id: toastId });
              } catch (error) {
                toast.error('Failed to delete student', { id: toastId });
              }
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    { duration: Infinity } // Keep open until user responds
  );
};

  // Extract numeric part from admission number (handles KCC/PN/2026/001 format)
  const getAdmissionNumberNumeric = (admissionNumber) => {
    if (!admissionNumber) return 999999; // Large number for null/undefined
    
    // Try to extract the last numeric part (e.g., 001 from KCC/PN/2026/001)
    const parts = admissionNumber.split('/');
    
    if (parts.length >= 4) {
      const lastPart = parts[parts.length - 1];
      // Remove any leading zeros and convert to number
      const num = parseInt(lastPart, 10);
      if (!isNaN(num)) {
        return num;
      }
    }
    
    // Fallback 1: Try to get last sequence of digits
    const matches = admissionNumber.match(/\d+/g);
    if (matches && matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      const num = parseInt(lastMatch, 10);
      if (!isNaN(num)) {
        return num;
      }
    }
    
    // Fallback 2: If it's a simple number string
    const directParse = parseInt(admissionNumber, 10);
    if (!isNaN(directParse)) {
      return directParse;
    }
    
    // Fallback 3: Return a large number for non-numeric strings
    return 999999;
  };

  // Get level from admission number (extracts PN, NU, PR, JS from KCC/PN/2026/001)
  const getLevelFromAdmissionNumber = (admissionNumber) => {
    if (!admissionNumber) return '';
    
    const parts = admissionNumber.split('/');
    if (parts.length >= 2) {
      const levelCode = parts[1]; // Second part should be level code
      return levelCode.toUpperCase();
    }
    
    return '';
  };

  // Sort and filter students based on criteria
  const filteredAndSortedStudents = useMemo(() => {
    // First, apply filters
    const filtered = safeFilter(students, student => {
      const matchesSearch = searchTerm === '' || 
        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = selectedLevel === 'All' || student.level === selectedLevel;
      
      const matchesClass = selectedClass === 'All' || student.className === selectedClass;
      
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
      
      return matchesSearch && matchesLevel && matchesClass && matchesStatus;
    });

    // Helper function to get student's level - prioritize student.level, fallback to admission number
    const getStudentLevel = (student) => {
      // First, use the student's level property if available
      if (student.level && levelOrder.includes(student.level)) {
        return student.level;
      }
      
      // Fallback: extract from admission number
      if (student.admissionNumber) {
        const parts = student.admissionNumber.split('/');
        if (parts.length >= 2) {
          const levelFromAdmission = parts[1]?.toUpperCase();
          if (levelOrder.includes(levelFromAdmission)) {
            return levelFromAdmission;
          }
        }
      }
      
      return ''; // Return empty if no level found
    };

    // Apply sorting based on filter combination
    return [...filtered].sort((a, b) => {
      // Get numeric admission numbers for comparison
      const numA = getAdmissionNumberNumeric(a.admissionNumber);
      const numB = getAdmissionNumberNumeric(b.admissionNumber);
      
      // Get levels for both students
      const levelA = getStudentLevel(a);
      const levelB = getStudentLevel(b);
      
      // CASE 1: When "All Levels" is selected
      if (selectedLevel === 'All') {
        // First, sort by level order
        const levelAIndex = levelOrder.indexOf(levelA);
        const levelBIndex = levelOrder.indexOf(levelB);
        
        // If both levels are found and different, sort by level
        if (levelAIndex !== -1 && levelBIndex !== -1 && levelAIndex !== levelBIndex) {
          return levelAIndex - levelBIndex;
        }
        
        // If levels are the same or not found, sort by class
        if (levelA === levelB && classOrder[levelA]) {
          const classOrderForLevel = classOrder[levelA];
          const classAIndex = classOrderForLevel.indexOf(a.className);
          const classBIndex = classOrderForLevel.indexOf(b.className);
          
          if (classAIndex !== classBIndex) {
            return classAIndex - classBIndex;
          }
        }
        
        // Same class or no class order, sort by admission number
        return numA - numB;
      }
      
      // CASE 2: When specific level is selected but "All Classes"
      else if (selectedClass === 'All') {
        // Sort by class order within the selected level
        const classOrderForLevel = classOrder[selectedLevel] || [];
        const classAIndex = classOrderForLevel.indexOf(a.className);
        const classBIndex = classOrderForLevel.indexOf(b.className);
        
        // If both in same class order, sort by class
        if (classAIndex !== classBIndex) {
          return classAIndex - classBIndex;
        }
        
        // Same class, sort by admission number
        return numA - numB;
      }
      
      // CASE 3: When specific class is selected
      else {
        // Sort only by admission number within the selected class
        return numA - numB;
      }
    });
  }, [students, searchTerm, selectedLevel, selectedClass, statusFilter]);

  // Calculate statistics (based on ALL students, not filtered ones)
  const stats = {
    total: students.length,
    active: safeFilter(students, s => s.status === 'Active').length,
    byLevel: {
      PN: safeFilter(students, s => s.level === 'PN').length,
      NU: safeFilter(students, s => s.level === 'NU').length,
      PR: safeFilter(students, s => s.level === 'PR').length,
      JS: safeFilter(students, s => s.level === 'JS').length,
    }
  };

  // Edit student
  const editStudent = (student) => {
    setSelectedStudent(student);
    setShowEditForm(true);
  };

  // Generate ID Card
  const generateIdCard = (student) => {
    setSelectedIdCardStudent(student);
    setShowIdCard(true);
  };

  // Generate Admission Letter
  const generateAdmissionLetter = (student) => {
    setSelectedLetterStudent(student);
    setShowAdmissionLetter(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLevel('All');
    setSelectedClass('All');
    setStatusFilter('All');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedClass, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header Section */}
      <AdmissionsHeader
        stats={stats}
        levels={levels}
        loadStudents={loadStudents}
        setShowForm={setShowForm}
      />

      {/* Search and Filter Section */}
      <AdmissionsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filteredStudents={filteredAndSortedStudents}
        stats={stats}
        clearFilters={clearFilters}
        levels={levels}
        classes={classes}
      />

      {/* Students List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredAndSortedStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No students found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedLevel !== 'All' || selectedClass !== 'All' || statusFilter !== 'All' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by registering your first student'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ＋ Register Student
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <StudentListView
          students={filteredAndSortedStudents}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          editStudent={editStudent}
          generateIdCard={generateIdCard}
          generateAdmissionLetter={generateAdmissionLetter}
          handleDeleteStudent={handleDeleteStudent}
          levels={levels}
          selectedLevel={selectedLevel}
          selectedClass={selectedClass}
        />
      ) : (
        <StudentCardView
          students={filteredAndSortedStudents}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          editStudent={editStudent}
          generateIdCard={generateIdCard}
          generateAdmissionLetter={generateAdmissionLetter}
          handleDeleteStudent={handleDeleteStudent}
          levels={levels}
          selectedLevel={selectedLevel}
          selectedClass={selectedClass}
        />
      )}

      {/* Modals */}
      {showForm && (
        <StudentFormModal
          showForm={showForm}
          setShowForm={setShowForm}
          handleStudentAdded={handleStudentAdded}
          levels={levels}
          classes={classes}
        />
      )}

      {showEditForm && selectedStudent && (
        <EditStudentModal
          showEditForm={showEditForm}
          setShowEditForm={setShowEditForm}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          handleStudentUpdated={handleStudentUpdated}
        />
      )}

      {showIdCard && selectedIdCardStudent && (
        <IdCardModal
          showIdCard={showIdCard}
          setShowIdCard={setShowIdCard}
          selectedIdCardStudent={selectedIdCardStudent}
          setSelectedIdCardStudent={setSelectedIdCardStudent}
        />
      )}

      {showAdmissionLetter && selectedLetterStudent && (
        <AdmissionLetterModal
          showAdmissionLetter={showAdmissionLetter}
          setShowAdmissionLetter={setShowAdmissionLetter}
          selectedLetterStudent={selectedLetterStudent}
          setSelectedLetterStudent={setSelectedLetterStudent}
          getAdmissionDuration={getAdmissionDuration}
          getCompletionYear={getCompletionYear}
        />
      )}
    </div>
  );
};

export default Admissions;