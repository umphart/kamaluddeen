// src/pages/Admissions.jsx
import React, { useState, useEffect } from 'react';
import StudentForm from '../components/Students/StudentForm';
// Update the imports section - remove FiBaby
import { 
  FiSearch, 
  FiFilter, 
  FiEdit, 
  FiUserPlus, 
  FiPrinter,
  FiFileText,
  FiGrid,
  FiList,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiPhone,
  
  FiMapPin,
  FiRefreshCw,
  FiChevronRight,
  FiChevronLeft,
  FiCheckCircle,
} from 'react-icons/fi';
import { 
  MdClass, 
  MdSchool,
  MdPerson,
  MdChildCare,
  MdChildFriendly,
  MdSchool as MdPrimarySchool
} from 'react-icons/md';
import { 
  HiOutlineAcademicCap,
  HiOutlineIdentification
} from 'react-icons/hi';
import { studentService } from '../services/studentService';
import toast from 'react-hot-toast';

// Safe filter helper function
const safeFilter = (array, callback) => {
  if (!array || !Array.isArray(array)) {
    console.warn('Attempted to filter non-array:', array);
    return [];
  }
  return array.filter(callback);
};

const Admissions = () => {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
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
  const [itemsPerPage] = useState(10);

  const levels = [
     { code: 'PN', name: 'Pre-Nursery', color: 'bg-purple-100 text-purple-800', icon: '👶' },
    { code: 'NU', name: 'Nursery', color: 'bg-blue-100 text-blue-800', icon: <MdChildFriendly className="text-blue-600" /> },
    { code: 'PR', name: 'Primary', color: 'bg-green-100 text-green-800', icon: <MdChildCare className="text-green-600" /> },
    { code: 'JS', name: 'Junior Secondary', color: 'bg-yellow-100 text-yellow-800', icon: <MdPrimarySchool className="text-yellow-600" /> }
  ];

  const classes = {
    'PN': ['Pre-Nursery'],
    'NU': ['Nursery 1', 'Nursery 2'],
    'PR': ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4'],
    'JS': ['JSS 1', 'JSS 2', 'JSS 3']
  };

  const statuses = [
    { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-800', icon: <FiCheckCircle /> },
    { value: 'Inactive', label: 'Inactive', color: 'bg-red-100 text-red-800', icon: '🚫' },
    { value: 'Graduated', label: 'Graduated', color: 'bg-blue-100 text-blue-800', icon: '🎓' },
    { value: 'Transferred', label: 'Transferred', color: 'bg-gray-100 text-gray-800', icon: '↪️' }
  ];

  // Load students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      console.log('Loading students in Admissions...');
      const allStudents = await studentService.getAllStudents();
      
      // Debug log
      console.log('Admissions loaded students:', {
        type: typeof allStudents,
        isArray: Array.isArray(allStudents),
        length: Array.isArray(allStudents) ? allStudents.length : 'N/A',
        data: allStudents
      });
      
      // Ensure we always set an array
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

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

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

  // Print ID Card
  const printIdCard = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Student ID Card - ${selectedIdCardStudent.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .id-card { width: 85mm; height: 54mm; border: 2px solid #333; padding: 10px; position: relative; }
            .school-header { text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 5px; margin-bottom: 10px; }
            .school-name { font-size: 14px; font-weight: bold; color: #4F46E5; }
            .school-motto { font-size: 9px; color: #666; }
            .student-photo { width: 25mm; height: 30mm; border: 1px solid #ddd; float: right; }
            .student-info { margin-right: 30mm; }
            .info-row { margin-bottom: 3px; font-size: 10px; }
            .label { font-weight: bold; color: #666; }
            .validity { position: absolute; bottom: 10px; font-size: 8px; color: #999; }
            .id-number { font-size: 11px; font-weight: bold; color: #4F46E5; margin-top: 5px; }
            @media print { 
              body { margin: 0; padding: 0; }
              .id-card { border: none; box-shadow: none; }
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="id-card">
            <div class="school-header">
              <div class="school-name">KAMALUDEEN COMPREHENSIVE COLLEGE</div>
              <div class="school-motto">Excellence in Education</div>
            </div>
            ${selectedIdCardStudent.photo ? `
              <img src="${selectedIdCardStudent.photo}" class="student-photo" alt="Student Photo">
            ` : ''}
            <div class="student-info">
              <div class="info-row">
                <span class="label">Name:</span> ${selectedIdCardStudent.fullName}
              </div>
              <div class="info-row">
                <span class="label">Class:</span> ${selectedIdCardStudent.className}
              </div>
              <div class="info-row">
                <span class="label">Level:</span> ${selectedIdCardStudent.level}
              </div>
              <div class="info-row">
                <span class="label">Gender:</span> ${selectedIdCardStudent.gender}
              </div>
              <div class="info-row">
                <span class="label">DOB:</span> ${selectedIdCardStudent.dateOfBirth}
              </div>
              <div class="info-row">
                <span class="label">Parent:</span> ${selectedIdCardStudent.parentName}
              </div>
              <div class="id-number">
                ID: ${selectedIdCardStudent.admissionNumber}
              </div>
            </div>
            <div class="validity">
              Valid until: ${new Date(new Date().getFullYear() + 1, 5, 30).toLocaleDateString()}
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLevel('All');
    setSelectedClass('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  // Add a debug console for troubleshooting
  useEffect(() => {
    console.log('Admissions component state:', {
      students: {
        type: typeof students,
        isArray: Array.isArray(students),
        length: students.length,
        firstItem: students[0]
      }
    });
  }, [students]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <HiOutlineAcademicCap className="text-indigo-600" />
              Student Admissions
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <MdSchool className="text-gray-400" />
              Manage student registrations and records
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadStudents}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw />
              Refresh
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <FiUserPlus />
              New Student
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="text-2xl text-indigo-500">
                <FiUser />
              </div>
            </div>
          </div>
          
          {levels.map(level => (
            <div key={level.code} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{level.name}</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.byLevel[level.code]}</p>
                </div>
                <span className={`text-lg ${level.color} p-2 rounded-full`}>
                  {level.icon}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name, admission number, or parent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-500" />
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setSelectedClass('All');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="All">All Levels</option>
                {levels.map(level => (
                  <option key={level.code} value={level.code}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
            
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={selectedLevel === 'All'}
            >
              <option value="All">All Classes</option>
              {selectedLevel !== 'All' && classes[selectedLevel].map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="All">All Status</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiRefreshCw />
              Clear
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredStudents.length}</span> of <span className="font-semibold">{stats.total}</span> students
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'table' 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiList />
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiGrid />
              Cards
            </button>
          </div>
        </div>
      </div>

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
            <FiUserPlus />
            Register Student
          </button>
        </div>
      ) : viewMode === 'table' ? (
        // Table View
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.map((student) => (
                  <tr key={student.admissionNumber || student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                          {student.photo ? (
                            <img 
                              src={student.photo} 
                              alt={student.fullName} 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <MdPerson className="h-6 w-6 text-indigo-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.fullName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FiUser className="w-3 h-3" />
                            {student.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <HiOutlineIdentification />
                        {student.admissionNumber}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {student.admissionDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                          levels.find(l => l.code === student.level)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          <MdClass />
                          {student.level}
                        </span>
                        <span className="text-sm text-gray-900">{student.className}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <MdPerson />
                        {student.parentName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <FiPhone className="w-3 h-3" />
                        {student.parentPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                        statuses.find(s => s.value === student.status)?.color || 'bg-green-100 text-green-800'
                      }`}>
                        {statuses.find(s => s.value === student.status)?.icon || <FiCheckCircle />}
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {/* ID Card Icon Button */}
                        <button
                          onClick={() => generateIdCard(student)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Generate ID Card"
                        >
                          <FiFileText className="w-4 h-4" />
                        </button>
                      
    
                        {/* Edit Icon Button */}
                        <button
                          onClick={() => editStudent(student)}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Student"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        
                        {/* Delete Icon Button */}
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentStudents.map((student) => (
            <div key={student.admissionNumber || student.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                      {student.photo ? (
                        <img 
                          src={student.photo} 
                          alt={student.fullName} 
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <MdPerson className="h-6 w-6 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{student.fullName}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <FiUser className="w-3 h-3" />
                        {student.gender}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                    statuses.find(s => s.value === student.status)?.color || 'bg-green-100 text-green-800'
                  }`}>
                    {statuses.find(s => s.value === student.status)?.icon || <FiCheckCircle />}
                    {student.status || 'Active'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <HiOutlineIdentification />
                        Admission No.
                      </p>
                      <p className="text-sm font-medium">{student.admissionNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MdClass />
                        Class
                      </p>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          levels.find(l => l.code === student.level)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.level}
                        </span>
                        <span className="text-sm">{student.className}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MdPerson />
                      Parent/Guardian
                    </p>
                    <p className="text-sm font-medium">{student.parentName}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <FiPhone className="w-3 h-3" />
                      {student.parentPhone}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FiCalendar />
                      Date Admitted
                    </p>
                    <p className="text-sm font-medium">{student.admissionDate}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => generateIdCard(student)}
                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Generate ID Card"
                  >
                    <FiFileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editStudent(student)}
                    className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit Student"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Student"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Pagination for Card View */}
          {totalPages > 1 && (
            <div className="col-span-full flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Registration Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <StudentForm 
              onClose={() => setShowForm(false)}
              onStudentAdded={handleStudentAdded}
              levels={levels}
              classes={classes}
            />
          </div>
        </div>
      )}

      {showEditForm && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiEdit />
                Edit Student: {selectedStudent.fullName}
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedStudent(null);
                }}
              >
                ×
              </button>
            </div>
            <StudentForm 
              onClose={() => {
                setShowEditForm(false);
                setSelectedStudent(null);
              }}
              onStudentAdded={handleStudentUpdated}
              studentData={selectedStudent}
              isEditMode={true}
            />
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      {showIdCard && selectedIdCardStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <HiOutlineIdentification />
                Student ID Card
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => {
                  setShowIdCard(false);
                  setSelectedIdCardStudent(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {/* ID Card Preview */}
              <div className="w-full max-w-md mx-auto border-2 border-gray-300 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50">
                {/* School Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-center">
                  <h3 className="text-xl font-bold text-white">KAMALUDEEN COMPREHENSIVE COLLEGE</h3>
                  <p className="text-sm text-indigo-100 mt-1">Excellence in Education</p>
                </div>
                
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Student Photo */}
                    <div className="w-32 h-40 border-2 border-indigo-200 rounded-lg overflow-hidden bg-white">
                      {selectedIdCardStudent.photo ? (
                        <img 
                          src={selectedIdCardStudent.photo} 
                          alt={selectedIdCardStudent.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                          <MdPerson className="h-16 w-16 text-indigo-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-500">Full Name</label>
                          <p className="font-bold text-gray-800">{selectedIdCardStudent.fullName}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500">Class</label>
                            <p className="font-semibold text-gray-700">{selectedIdCardStudent.className}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Level</label>
                            <p className="font-semibold text-gray-700">{selectedIdCardStudent.level}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-500">Admission No.</label>
                          <p className="font-mono font-bold text-indigo-700">{selectedIdCardStudent.admissionNumber}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500">Gender</label>
                            <p className="font-semibold text-gray-700">{selectedIdCardStudent.gender}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">DOB</label>
                            <p className="font-semibold text-gray-700">{selectedIdCardStudent.dateOfBirth}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-500">Parent/Guardian</label>
                          <p className="font-semibold text-gray-700">{selectedIdCardStudent.parentName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        <p className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          Valid until: {new Date(new Date().getFullYear() + 1, 5, 30).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p className="flex items-center gap-1">
                          <FiMapPin className="w-3 h-3" />
                          Kano, Nigeria
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={printIdCard}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  <FiPrinter />
                  Print ID Card
                </button>
                <button
                  onClick={() => {
                    setShowIdCard(false);
                    setSelectedIdCardStudent(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admissions;