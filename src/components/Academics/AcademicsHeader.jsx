import React, { useState } from 'react';
import AddSubjectModal from './AddSubjectModal';
import AddClassModal from './AddClassModal';

const AcademicsHeader = ({
  statistics,
  activeTab,
  setActiveTab,
  onSubjectAdded,
  onClassAdded
}) => {
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  const tabs = [
    { id: 'subjects', label: 'Subjects' },
    { id: 'classes', label: 'Classes' },
    { id: 'timetables', label: 'Timetables' },
    { id: 'curriculum', label: 'Curriculum' }
  ];

  return (
    <>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Academics Management</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
            Manage curriculum, subjects, classes, and timetables
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary">Generate Report</button>

          {activeTab === 'subjects' && (
            <button className="btn-primary" onClick={() => setShowSubjectModal(true)}>
              + Add Subject
            </button>
          )}

          {activeTab === 'classes' && (
            <button className="btn-primary" onClick={() => setShowClassModal(true)}>
              + Add Class
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards - Removed Weekly Periods */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Total Subjects', value: statistics.totalSubjects },
          { label: 'Active Classes', value: statistics.totalClasses },
          { label: 'Teachers Assigned', value: statistics.uniqueTeachers }
        ].map((item, index) => (
          <div
            key={index}
            style={{
              padding: '10px 12px',
              borderRadius: 6,
              background: '#fff',
              border: '1px solid #e5e7eb',
              height: 70,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: 12, color: '#555' }}>{item.label}</span>
            <strong style={{ fontSize: 18 }}>{item.value}</strong>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 14px',
              fontSize: 13,
              borderRadius: 20,
              border: '1px solid #d1d5db',
              background: activeTab === tab.id ? '#2563eb' : '#fff',
              color: activeTab === tab.id ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Modals */}
      {showSubjectModal && (
        <AddSubjectModal
          onClose={() => setShowSubjectModal(false)}
          onSuccess={() => {
            setShowSubjectModal(false);
            onSubjectAdded();
          }}
        />
      )}

      {showClassModal && (
        <AddClassModal
          onClose={() => setShowClassModal(false)}
          onSuccess={() => {
            setShowClassModal(false);
            onClassAdded();
          }}
        />
      )}
    </>
  );
};

export default AcademicsHeader;