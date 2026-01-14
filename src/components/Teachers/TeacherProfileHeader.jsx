import React from 'react';

const TeacherProfileHeader = ({ logo, schoolInfo, onClose }) => {
  return (
    <div className="teacher-modal-header">
      <div className="header-content">
        <img 
          src={logo} 
          alt="KCC Logo" 
          className="school-logo"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="header-text">
          <h2>Teacher Profile</h2>
          <p>{schoolInfo.name}</p>
        </div>
      </div>
      <button 
        className="close-btn" 
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
};

export { TeacherProfileHeader };