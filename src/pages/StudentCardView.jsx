// src/pages/StudentCardView.jsx
import React from 'react';
import { 
  FiUser, 
  FiCalendar, 
  FiEdit, 
  FiTrash2,
  FiFileText,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle
} from 'react-icons/fi';
import { 
  MdClass,
  MdPerson,
  MdPhone
} from 'react-icons/md';
import { 
  HiOutlineIdentification 
} from 'react-icons/hi';

const StudentCardView = ({
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
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = students.slice(startIndex, endIndex);

  const statuses = [
    { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-800', icon: <FiCheckCircle /> },
    { value: 'Inactive', label: 'Inactive', color: 'bg-red-100 text-red-800', icon: '🚫' },
    { value: 'Graduated', label: 'Graduated', color: 'bg-blue-100 text-blue-800', icon: '🎓' },
    { value: 'Transferred', label: 'Transferred', color: 'bg-gray-100 text-gray-800', icon: '↪️' }
  ];

  return (
    <>
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
                      <FiUser className="h-6 w-6 text-indigo-600" />
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
                      <HiOutlineIdentification className="w-3 h-3" />
                      Admission No.
                    </p>
                    <p className="text-sm font-medium">{student.admissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MdClass className="w-3 h-3" />
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
                    <MdPerson className="w-3 h-3" />
                    Parent/Guardian
                  </p>
                  <p className="text-sm font-medium">{student.parentName}</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <MdPhone className="w-3 h-3" />
                    {student.parentPhone}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    Date Admitted
                  </p>
                  <p className="text-sm font-medium">{student.admissionDate}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => generateAdmissionLetter(student)}
                  className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Generate Admission Letter"
                >
                  <FiDownload className="w-4 h-4" />
                </button>
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
    </>
  );
};

export default StudentCardView;