// src/pages/AdmissionsHeader.jsx
import React from 'react';

const AdmissionsHeader = ({ stats, levels, loadStudents, setShowForm }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Student Admissions
          </h1>
          <p className="text-gray-600 mt-2">
            Manage student registrations and records
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadStudents}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            ↻ Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            ＋ New Student
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
              👤
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
  );
};

export default AdmissionsHeader;