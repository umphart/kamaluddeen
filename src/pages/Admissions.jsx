// src/pages/Admissions.jsx
import React, { useState, useEffect } from 'react';
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
    toast.success('Student updated successfully!');
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.deleteStudent(studentId);
        setStudents(prev => prev.filter(s => s.id !== studentId));
        toast.success('Student deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  // Filter students based on criteria
  const filteredStudents = safeFilter(students, student => {
    const matchesSearch = searchTerm === '' || 
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = selectedLevel === 'All' || student.level === selectedLevel;
    
    const matchesClass = selectedClass === 'All' || student.className === selectedClass;
    
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    
    return matchesSearch && matchesLevel && matchesClass && matchesStatus;
  });

  // Calculate statistics
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
    setCurrentPage(1);
  };

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
        filteredStudents={filteredStudents}
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
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No students found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedLevel !== 'All' || statusFilter !== 'All' 
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
          students={filteredStudents}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          editStudent={editStudent}
          generateIdCard={generateIdCard}
          generateAdmissionLetter={generateAdmissionLetter}
          handleDeleteStudent={handleDeleteStudent}
          levels={levels}
        />
      ) : (
        <StudentCardView
          students={filteredStudents}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          editStudent={editStudent}
          generateIdCard={generateIdCard}
          generateAdmissionLetter={generateAdmissionLetter}
          handleDeleteStudent={handleDeleteStudent}
          levels={levels}
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