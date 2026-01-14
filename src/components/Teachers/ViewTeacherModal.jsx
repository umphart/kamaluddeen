import React, { useRef } from 'react';
import { toast } from 'react-hot-toast';
import kccLogo from '../images/kcc.jpeg';
import { useTeacherProfile } from './useTeacherProfile';
import { TeacherProfileActions } from './TeacherProfileActions';
import { TeacherProfileHeader } from './TeacherProfileHeader';
import { TeacherProfileContent } from './TeacherProfileContent';
import './teacherProfile.css';

const ViewTeacherModal = ({ teacher, onClose }) => {
  const printRef = useRef();
  
  // Move hook call to the top, before any conditional returns
  const {
    getAvatar,
    formatDate,
    getYearsOfService,
    schoolInfo,
    handlePrintProfile,
    handleExportProfilePDF,
    handlePrintIDCard
  } = useTeacherProfile(teacher, printRef);
  
  if (!teacher) return null;

  return (
    <div className="teacher-modal-overlay">
      <div className="teacher-modal">
        {/* Header */}
        <TeacherProfileHeader 
          logo={kccLogo}
          schoolInfo={schoolInfo}
          onClose={onClose}
        />

        {/* Body */}
        <div ref={printRef} className="teacher-modal-body">
          <TeacherProfileContent 
            teacher={teacher}
            getAvatar={getAvatar}
            formatDate={formatDate}
            getYearsOfService={getYearsOfService}
            schoolInfo={schoolInfo}
          />
        </div>

        {/* Footer with Actions */}
        <TeacherProfileActions
          onPrintIDCard={handlePrintIDCard}
          onPrintProfile={handlePrintProfile}
          onExportPDF={handleExportProfilePDF}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default ViewTeacherModal;