import React from 'react';
import { FaPrint, FaFilePdf } from 'react-icons/fa';

const TeacherProfileActions = ({ 
  onPrintIDCard, 
  onPrintProfile, 
  onExportPDF, 
  onClose 
}) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      padding: '16px 24px',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb'
    }}>
      <button 
        style={{
          backgroundColor: '#e0f2fe',
          color: '#0369a1',
          border: '1px solid #bae6fd',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s',
          gap: '6px'
        }}
        onClick={onPrintIDCard}
      >
        <FaPrint />
        ID Card
      </button>
      
      <button 
        style={{
          backgroundColor: '#e0f2fe',
          color: '#0369a1',
          border: '1px solid #bae6fd',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s',
          gap: '6px'
        }}
        onClick={onPrintProfile}
      >
        <FaPrint />
        Full Profile
      </button>
      
      <button 
        style={{
          backgroundColor: '#dcfce7',
          color: '#166534',
          border: '1px solid #bbf7d0',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s',
          gap: '6px'
        }}
        onClick={onExportPDF}
      >
        <FaFilePdf />
        Export PDF
      </button>
      
      <button 
        style={{
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: 'none',
          padding: '8px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s'
        }}
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

export { TeacherProfileActions };