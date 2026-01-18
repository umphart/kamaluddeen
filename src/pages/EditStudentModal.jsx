// In EditStudentModal.jsx, use this simplified modal
import React from 'react';
import StudentForm from '../components/Students/StudentForm';

const EditStudentModal = ({
  showEditForm,
  setShowEditForm,
  selectedStudent,
  setSelectedStudent,
  handleStudentUpdated
}) => {
  if (!showEditForm) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => {
          setSelectedStudent(null);
          setShowEditForm(false);
        }}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal panel - no header here */}
        <div 
          className="relative w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* StudentForm will render its own header */}
          <StudentForm
            onClose={() => {
              setSelectedStudent(null);
              setShowEditForm(false);
            }}
            onStudentAdded={handleStudentUpdated}
            studentData={selectedStudent}
            isEditMode={true}
          />
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;