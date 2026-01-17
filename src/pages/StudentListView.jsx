// src/pages/StudentListView.jsx
import React, { useMemo } from 'react';
import { 
  FiUser, 
  FiCalendar, 
  FiEdit, 
  FiTrash2,
  FiFileText,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import { 
  MdClass,
  MdPerson,
  MdPhone
} from 'react-icons/md';
import { 
  HiOutlineIdentification 
} from 'react-icons/hi';

const StudentListView = ({
  students,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  editStudent,
  generateIdCard,
  generateAdmissionLetter,
  handleDeleteStudent,
  levels,
  selectedLevel,      // Add this prop
  selectedClass       // Add this prop
}) => {
  // Define level order for sorting
  const levelOrder = ['pre-nursery', 'nursery', 'kg', 'basic 1', 'basic 2', 'basic 3', 
                      'basic 4', 'basic 5', 'jss 1', 'jss 2', 'jss 3'];

  // Sort students based on selected filter
  const sortedStudents = useMemo(() => {
    const studentsCopy = [...students];
    
    if (selectedLevel === 'All') {
      // Sort by level order, then by admission number
      return studentsCopy.sort((a, b) => {
        // Get level index for comparison
        const levelAIndex = levelOrder.indexOf(a.level.toLowerCase());
        const levelBIndex = levelOrder.indexOf(b.level.toLowerCase());
        
        // If same level, sort by admission number
        if (levelAIndex === levelBIndex) {
          const numA = parseInt(a.admissionNumber.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.admissionNumber.replace(/\D/g, '')) || 0;
          return numA - numB;
        }
        
        // Sort by level order
        return levelAIndex - levelBIndex;
      });
    } else if (selectedClass !== 'All') {
      // When specific class is selected, sort only by admission number
      return studentsCopy.sort((a, b) => {
        const numA = parseInt(a.admissionNumber.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.admissionNumber.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
    }
    
    return studentsCopy;
  }, [students, selectedLevel, selectedClass]);

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = sortedStudents.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <FiUser className="w-4 h-4" />
                  Student
                  {selectedLevel === 'All' && (
                    <FiArrowUp className="w-3 h-3 text-blue-500" title="Sorted by Level (Pre-Nursery to JSSS)" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <HiOutlineIdentification className="w-4 h-4" />
                  Admission Details
                  {selectedClass !== 'All' && (
                    <FiArrowUp className="w-3 h-3 text-blue-500" title="Sorted by Admission Number" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <MdClass className="w-4 h-4" />
                  Class Info
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <MdPerson className="w-4 h-4" />
                  Parent Info
                </div>
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
                        <FiUser className="h-5 w-5 text-indigo-600" />
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
                    <HiOutlineIdentification className="w-4 h-4" />
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
                      <MdClass className="w-3 h-3" />
                      {student.level}
                    </span>
                    <span className="text-sm text-gray-900">{student.className}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <MdPerson className="w-4 h-4" />
                    {student.parentName}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <MdPhone className="w-3 h-3" />
                    {student.parentPhone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {/* Admission Letter Button */}
                    <button
                      onClick={() => generateAdmissionLetter(student)}
                      className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Generate Admission Letter"
                    >
                      <FiDownload className="w-4 h-4" />
                    </button>
                    
                    {/* ID Card Button */}
                    <button
                      onClick={() => generateIdCard(student)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Generate ID Card"
                    >
                      <FiFileText className="w-4 h-4" />
                    </button>
                    
                    {/* Edit Button */}
                    <button
                      onClick={() => editStudent(student)}
                      className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Student"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    
                    {/* Delete Button */}
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
            <span className="ml-4 text-xs text-blue-600">
              {selectedLevel === 'All' 
                ? 'Sorted by Level (Pre-Nursery → JSSS)' 
                : selectedClass !== 'All' 
                  ? 'Sorted by Admission Number'
                  : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentListView;