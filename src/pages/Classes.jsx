// src/pages/Classes.jsx
import React, { useState, useEffect } from 'react';
import { studentService } from '../services/studentService';
import { exportStudentsToPDF as exportToPDF, exportStudentsToCSV as exportToCSV } from '../utils/exportUtils';
import { 
  FiSearch, 
  FiFilter, 
  FiUsers,
  FiChevronRight,
  FiChevronLeft,
  FiFileText,
  FiRefreshCw,
  FiCalendar,
} from 'react-icons/fi';
import { 
  MdClass, 
  MdSchool,
  MdPerson,
  MdChildFriendly,
  MdPictureAsPdf,
  MdErrorOutline
} from 'react-icons/md';
import { 
  HiOutlineAcademicCap,
  HiOutlineUsers
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Classes = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Class structure
  const levels = [
    { 
      code: 'PN', 
      name: 'Pre-Nursery', 
      color: 'bg-purple-100 text-purple-800',
      reactIcon: <MdChildFriendly className="text-purple-600" />
    },
    { 
      code: 'NU', 
      name: 'Nursery', 
      color: 'bg-blue-100 text-blue-800',
      reactIcon: <MdChildFriendly className="text-blue-600" />
    },
    { 
      code: 'PR', 
      name: 'Primary', 
      color: 'bg-green-100 text-green-800',
      reactIcon: <HiOutlineAcademicCap className="text-green-600" />
    },
    { 
      code: 'JS', 
      name: 'Junior Secondary', 
      color: 'bg-yellow-100 text-yellow-800',
      reactIcon: <MdSchool className="text-yellow-600" />
    }
  ];

  // Level order for sorting
  const levelOrder = ['PN', 'NU', 'PR', 'JS'];

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedLevel, selectedClass]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allStudents = await studentService.getAllStudents();
      
      // Validate response
      if (!allStudents) {
        setStudents([]);
        toast.error('No data received from server');
        return;
      }
      
      if (!Array.isArray(allStudents)) {
        setStudents([]);
        toast.error('Invalid data format received');
        return;
      }
      
      setStudents(allStudents);
      
    } catch (error) {
      setError(error.message);
      setStudents([]);
      toast.error(`Failed to load students: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract numeric part from admission number
  const getAdmissionNumberNumeric = (admissionNumber) => {
    if (!admissionNumber) return 999999;
    
    // Handle KCC/PN/2026/001 format
    const parts = admissionNumber.split('/');
    if (parts.length >= 4) {
      const lastPart = parts[parts.length - 1];
      const num = parseInt(lastPart, 10);
      if (!isNaN(num)) return num;
    }
    
    // Fallback: extract any numbers
    const matches = admissionNumber.match(/\d+/g);
    if (matches && matches.length > 0) {
      const num = parseInt(matches[matches.length - 1], 10);
      if (!isNaN(num)) return num;
    }
    
    // Fallback 2: direct parse
    const directParse = parseInt(admissionNumber, 10);
    if (!isNaN(directParse)) return directParse;
    
    return 999999;
  };

  const filterStudents = () => {
    // Ensure students is an array
    if (!Array.isArray(students)) {
      setFilteredStudents([]);
      return;
    }
    
    let filtered = [...students];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(student => {
        if (!student) return false;
        
        return (
          (student.fullName && student.fullName.toLowerCase().includes(term)) ||
          (student.admissionNumber && student.admissionNumber.toLowerCase().includes(term)) ||
          (student.parentPhone && student.parentPhone.includes(term)) ||
          (student.parentName && student.parentName.toLowerCase().includes(term))
        );
      });
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(student => 
        student && student.level === selectedLevel
      );
    }

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(student => 
        student && student.className === selectedClass
      );
    }

    // Sort the filtered students
    filtered.sort((a, b) => {
      // If viewing all classes, sort by level first, then class, then admission number
      if (selectedClass === 'all') {
        // Sort by level order (PN → NU → PR → JS)
        const levelAIndex = levelOrder.indexOf(a?.level || '');
        const levelBIndex = levelOrder.indexOf(b?.level || '');
        
        if (levelAIndex !== levelBIndex) {
          return levelAIndex - levelBIndex;
        }
        
        // Same level, sort by class name alphabetically
        if (a.className !== b.className) {
          return a.className?.localeCompare(b.className || '') || 0;
        }
      }
      
      // Same class (or specific class selected), sort by admission number
      const numA = getAdmissionNumberNumeric(a.admissionNumber);
      const numB = getAdmissionNumberNumeric(b.admissionNumber);
      return numA - numB;
    });

    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  // Get all available classes from students, sorted by level then alphabetically
  const getAllClasses = () => {
    if (!Array.isArray(students)) {
      return [];
    }
    
    // Group classes by level to maintain level order
    const classesByLevel = {
      'PN': new Set(),
      'NU': new Set(),
      'PR': new Set(),
      'JS': new Set()
    };
    
    // Collect classes by level
    students.forEach(student => {
      if (student && student.className && student.level && classesByLevel[student.level]) {
        classesByLevel[student.level].add(student.className);
      }
    });
    
    // Flatten in level order, with classes sorted alphabetically within each level
    const sortedClasses = [];
    levelOrder.forEach(levelCode => {
      if (classesByLevel[levelCode]) {
        const levelClasses = Array.from(classesByLevel[levelCode]).sort();
        sortedClasses.push(...levelClasses);
      }
    });
    
    return sortedClasses;
  };

  // Get class statistics
  const getClassStatistics = () => {
    const stats = {};
    const allClasses = getAllClasses();
    
    allClasses.forEach(className => {
      const classStudents = students.filter(student => 
        student && student.className === className
      );
      
      // Sort students within class by admission number
      const sortedClassStudents = [...classStudents].sort((a, b) => {
        const numA = getAdmissionNumberNumeric(a.admissionNumber);
        const numB = getAdmissionNumberNumeric(b.admissionNumber);
        return numA - numB;
      });
      
      const level = sortedClassStudents[0]?.level || '';
      const levelInfo = levels.find(l => l.code === level);
      
      stats[className] = {
        total: sortedClassStudents.length,
        male: sortedClassStudents.filter(s => s && s.gender === 'Male').length,
        female: sortedClassStudents.filter(s => s && s.gender === 'Female').length,
        active: sortedClassStudents.filter(s => s && s.status === 'Active').length,
        level: level,
        levelInfo: levelInfo || levels[0]
      };
    });
    
    return stats;
  };

  const getLevelName = (code) => {
    const level = levels.find(l => l.code === code);
    return level ? level.name : code;
  };

  const getLevelColor = (code) => {
    const level = levels.find(l => l.code === code);
    return level ? level.color : 'bg-gray-100 text-gray-800';
  };

  const getLevelIcon = (code) => {
    const level = levels.find(l => l.code === code);
    return level ? level.reactIcon : <MdClass />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('all');
    setSelectedLevel('all');
  };

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle PDF export
  const handleExportPDF = (className = null) => {
    const studentsToExport = className 
      ? students.filter(s => s && s.className === className)
      : filteredStudents;

    if (studentsToExport.length === 0) {
      toast.error('No students to export');
      return;
    }

    exportToPDF(studentsToExport, className);
    toast.success(`PDF generated for ${className || 'all classes'}!`);
  };

  // Handle CSV export
  const handleExportCSV = (className = null) => {
    const studentsToExport = className 
      ? students.filter(s => s && s.className === className)
      : filteredStudents;

    if (studentsToExport.length === 0) {
      toast.error('No students to export');
      return;
    }

    exportToCSV(studentsToExport, className);
    toast.success(`CSV exported for ${className || 'all classes'}!`);
  };

  // Class statistics
  const classStats = getClassStatistics();
  const allClasses = getAllClasses();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Loading Students</h3>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <MdErrorOutline className="text-red-600 text-2xl" />
            <h3 className="text-lg font-semibold text-red-800">Database Connection Error</h3>
          </div>
          <p className="text-red-700 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={loadStudents}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <FiRefreshCw />
              Retry Connection
            </button>
            <p className="text-sm text-red-600">
              Check if: 1) Supabase table exists 2) Internet connection 3) Browser console for details
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <MdClass className="text-indigo-600" />
              Classes Management
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <HiOutlineUsers className="text-gray-400" />
              {students.length} students total
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleExportPDF()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-lg hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={filteredStudents.length === 0}
            >
              <MdPictureAsPdf />
              Export PDF
            </button>
            <button
              onClick={loadStudents}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Class Selection Cards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MdSchool />
          Select Class
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* All Classes Card */}
          <div 
            className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
              selectedClass === 'all' ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => setSelectedClass('all')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <FiUsers className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">All Classes</h4>
                  <p className="text-sm text-gray-600">View all students</p>
                </div>
              </div>
              <FiChevronRight className="text-gray-400" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{students.length} students</span>
              <button 
                className="text-indigo-600 hover:text-indigo-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportPDF();
                }}
                disabled={students.length === 0}
              >
                <MdPictureAsPdf className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Individual Class Cards */}
          {allClasses.map(className => {
            const stats = classStats[className] || {};
            const levelInfo = stats.levelInfo || levels[0];
            
            return (
              <div 
                key={className}
                className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                  selectedClass === className ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => setSelectedClass(className)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 ${levelInfo.color} rounded-lg flex items-center justify-center`}>
                      {levelInfo.reactIcon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{className}</h4>
                      <p className="text-sm text-gray-600">{levelInfo.name}</p>
                    </div>
                  </div>
                  <FiChevronRight className="text-gray-400" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total: {stats.total || 0}</span>
                    <span className="text-gray-500">
                      ♂ {stats.male || 0} | ♀ {stats.female || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button 
                      className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportPDF(className);
                      }}
                      disabled={!stats.total || stats.total === 0}
                    >
                      <MdPictureAsPdf className="h-3 w-3" />
                      PDF
                    </button>
                    <button 
                      className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1 disabled:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportCSV(className);
                      }}
                      disabled={!stats.total || stats.total === 0}
                    >
                      <FiFileText className="h-3 w-3" />
                      CSV
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
                  setSelectedClass('all');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Levels</option>
                {levels.map(level => (
                  <option key={level.code} value={level.code}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
            
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
            {selectedClass === 'all' ? (
              <>
                Showing <span className="font-semibold">{filteredStudents.length}</span> of <span className="font-semibold">{students.length}</span> students
                {selectedLevel !== 'all' && ` in ${getLevelName(selectedLevel)}`}
              </>
            ) : (
              <>
                Class: <span className="font-semibold">{selectedClass}</span> | 
                Students: <span className="font-semibold">{filteredStudents.length}</span> of <span className="font-semibold">{students.filter(s => s && s.className === selectedClass).length}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExportPDF(selectedClass !== 'all' ? selectedClass : null)}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={filteredStudents.length === 0}
            >
              <MdPictureAsPdf />
              Export PDF
            </button>
            <button
              onClick={() => handleExportCSV(selectedClass !== 'all' ? selectedClass : null)}
              className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={filteredStudents.length === 0}
            >
              <FiFileText />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          {students.length === 0 ? (
            <>
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Students in Database</h3>
              <p className="text-gray-500 mb-6">
                Add your first student using the registration form
              </p>
              <button
                onClick={() => window.location.href = '/students/add'}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add First Student
              </button>
            </>
          ) : (
            <>
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No students found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filters
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear All Filters
              </button>
            </>
          )}
        </div>
      ) : (
        // Table View Only
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class & Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Information
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.map((student) => {
                  if (!student) return null;
                  
                  return (
                    <tr key={student.admissionNumber || student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.admissionNumber || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          {formatDate(student.admissionDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                            {student.photo ? (
                              <img 
                                src={student.photo} 
                                alt={student.fullName} 
                                className="h-10 w-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<MdPerson className="h-6 w-6 text-indigo-600" />';
                                }}
                              />
                            ) : (
                              <MdPerson className="h-6 w-6 text-indigo-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.fullName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.gender || 'N/A'} | DOB: {student.dateOfBirth || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getLevelColor(student.level)}`}>
                            {getLevelIcon(student.level)}
                            {student.level || 'N/A'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{student.className || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.parentName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.parentPhone || 'N/A'}
                        </div>
                        {student.parentEmail && (
                          <div className="text-sm text-gray-500">
                            {student.parentEmail}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft />
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
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
    </div>
  );
};

export default Classes;