// src/components/StudentCard.jsx
import React from 'react';
import { FiEye, FiUser, FiPhone, FiCalendar, FiMail } from 'react-icons/fi';
import { MdPerson } from 'react-icons/md';

const StudentCard = ({ student, getLevelColor, formatDate, statuses, onView }) => {
  if (!student) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow h-full">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
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
              <h4 className="font-semibold text-gray-800 text-sm leading-tight">{student.fullName}</h4>
              <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                <FiUser className="w-3 h-3 flex-shrink-0" />
                {student.gender}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
            statuses.find(s => s.value === student.status)?.color || 'bg-green-100 text-green-800'
          }`}>
            {statuses.find(s => s.value === student.status)?.icon || '✅'}
            <span className="hidden sm:inline">{student.status || 'Active'}</span>
          </span>
        </div>
        
        <div className="space-y-3 flex-grow">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">Admission No.</p>
              <p className="text-sm font-medium truncate">{student.admissionNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Class</p>
              <div className="flex items-center gap-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(student.level)} truncate`}>
                  {student.level}
                </span>
                <span className="text-sm truncate">{student.className}</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-500">Parent/Guardian</p>
            <p className="text-sm font-medium truncate">{student.parentName}</p>
            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
              <FiPhone className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{student.parentPhone}</span>
            </p>
            {student.parentEmail && (
              <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                <FiMail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{student.parentEmail}</span>
              </p>
            )}
          </div>
          
          <div>
            <p className="text-xs text-gray-500">Date Admitted</p>
            <p className="text-sm font-medium flex items-center gap-1">
              <FiCalendar className="w-3 h-3 flex-shrink-0" />
              {formatDate(student.admissionDate)}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onView(student)}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm w-full justify-center"
            title="View Details"
          >
            <FiEye className="w-4 h-4" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;