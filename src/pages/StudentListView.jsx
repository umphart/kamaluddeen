// src/pages/StudentListView.jsx
import React from 'react';
import { 
  FiUser, 
  FiCalendar, 
  FiEdit, 
  FiTrash2,
  FiFileText,
  FiDownload,
  FiChevronLeft,
  FiChevronRight
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
  levels
}) => {
  // Pagination
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = students.slice(startIndex, endIndex);

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
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <HiOutlineIdentification className="w-4 h-4" />
                  Admission Details
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