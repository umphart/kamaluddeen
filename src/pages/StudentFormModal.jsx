// src/pages/StudentFormModal.jsx
import React from 'react';
import StudentForm from '../components/Students/StudentForm';

const StudentFormModal = ({ showForm, setShowForm, handleStudentAdded, levels, classes }) => {
  if (!showForm) return null;

  return (
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
  );
};

export default StudentFormModal;