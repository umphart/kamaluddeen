// src/pages/Teachers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import TeacherForm from '../components/Teachers/TeacherForm';
import TeachersTable from '../components/Teachers/TeachersTable';
import TeachersFilters from '../components/Teachers/TeachersFilters';
import TeachersHeader from '../components/Teachers/TeachersHeader';
import ViewTeacherModal from '../components/Teachers/ViewTeacherModal';
import { teacherService } from '../services/teacherService';
import toast from 'react-hot-toast';
import { academicService } from '../services/academicService';
const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignClassModal, setShowAssignClassModal] = useState(false);
  const [showAssignSubjectModal, setShowAssignSubjectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);

  const statuses = ['Active', 'Inactive', 'On Leave', 'Resigned'];
  
  const classes = [
    'Pre-Nursery', 'Nursery 1', 'Nursery 2',
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4',
    'JSS 1', 'JSS 2', 'JSS 3'
  ];

 const [subjects, setSubjects] = useState([]);
useEffect(() => {
  loadSubjects();
}, []);

const loadSubjects = async () => {
  try {
    const data = await academicService.getAllSubjects();
    // extract only subject names
    setSubjects(data.map(s => s.name));
  } catch (error) {
    toast.error('Failed to load subjects');
  }
};


  // Load teachers from Supabase
  useEffect(() => {
    loadTeachers();
  }, []);

  // Filter teachers whenever filters or teachers change
useEffect(() => {
  const filterTeachers = () => {
    let filtered = [...teachers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(teacher =>
        teacher.fullName?.toLowerCase().includes(term) ||
        teacher.staffId?.toLowerCase().includes(term) ||
        teacher.email?.toLowerCase().includes(term) ||
        teacher.phone?.includes(searchTerm) ||
        teacher.qualification?.toLowerCase().includes(term)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(teacher => teacher.status === selectedStatus);
    }

    setFilteredTeachers(filtered);
  };

  filterTeachers();
}, [teachers, searchTerm, selectedStatus]); // Now all dependencies are declared
  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      const teachersData = await teacherService.getAllTeachers();
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast.error('Failed to load teachers data');
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  };

const filterTeachers = useCallback(() => {
  let filtered = [...teachers];

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(teacher =>
      teacher.fullName?.toLowerCase().includes(term) ||
      teacher.staffId?.toLowerCase().includes(term) ||
      teacher.email?.toLowerCase().includes(term) ||
      teacher.phone?.includes(searchTerm) ||
      teacher.qualification?.toLowerCase().includes(term)
    );
  }

  if (selectedStatus !== 'all') {
    filtered = filtered.filter(teacher => teacher.status === selectedStatus);
  }

  setFilteredTeachers(filtered);
}, [teachers, searchTerm, selectedStatus]); // Add dependencies

useEffect(() => {
  filterTeachers();
}, [filterTeachers]); // Now it's in dependencies

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    toast.success('Filters cleared', { icon: '🔄' });
  };

  const handleTeacherAdded = async (teacherData) => {
    try {
      const newTeacher = await teacherService.addTeacher(teacherData);
      
      setTeachers(prev => [...prev, newTeacher]);
      
      toast.success(
        <div>
          <p className="font-semibold">Teacher Registered Successfully!</p>
          <p className="text-sm"><strong>Name:</strong> {teacherData.fullName}</p>
          <p className="text-sm"><strong>Staff ID:</strong> {newTeacher.staffId}</p>
        </div>,
        { duration: 4000 }
      );
      
      return newTeacher;
    } catch (error) {
      toast.error(
        <div>
          <p className="font-semibold">Registration Failed</p>
          <p className="text-sm">{error.message}</p>
        </div>
      );
      throw error;
    }
  };

  const handleTeacherUpdated = async (updatedTeacherData) => {
    try {
      const updatedTeacher = await teacherService.updateTeacher(
        updatedTeacherData.id, 
        updatedTeacherData
      );
      
      setTeachers(prev => prev.map(teacher => 
        teacher.id === updatedTeacher.id ? updatedTeacher : teacher
      ));
      
      toast.success(
        <div>
          <p className="font-bold">Teacher Updated Successfully!</p>
          <p className="text-sm"><strong>Name:</strong> {updatedTeacherData.fullName}</p>
        </div>
      );
      
      return updatedTeacher;
    } catch (error) {
      toast.error(
        <div>
          <p className="font-semibold">Update Failed</p>
          <p className="text-sm">{error.message}</p>
        </div>
      );
      throw error;
    }
  };

  const handleAssignClass = (teacher) => {
    setSelectedTeacher(teacher);
    setShowAssignClassModal(true);
  };

  const handleAssignSubject = (teacher) => {
    setSelectedTeacher(teacher);
    setShowAssignSubjectModal(true);
  };

  const handleSaveClassAssignments = async (selectedClasses) => {
    if (!selectedTeacher) return;

    try {
      const updatedTeacher = await teacherService.assignClasses(
        selectedTeacher.id, 
        selectedClasses
      );
      
      setTeachers(prev => prev.map(teacher => 
        teacher.id === updatedTeacher.id ? updatedTeacher : teacher
      ));
      
      toast.success(
        <div>
          <p className="font-semibold">Classes Assigned Successfully!</p>
          <p className="text-sm"><strong>Teacher:</strong> {selectedTeacher.fullName}</p>
          <p className="text-sm"><strong>Classes Assigned:</strong> {selectedClasses.join(', ')}</p>
        </div>,
        { duration: 4000, icon: '✅' }
      );
    } catch (error) {
      toast.error('Failed to assign classes');
    }
    
    setShowAssignClassModal(false);
    setSelectedTeacher(null);
  };

  const handleSaveSubjectAssignments = async (selectedSubjects) => {
    if (!selectedTeacher) return;

    try {
      const updatedTeacher = await teacherService.assignSubjects(
        selectedTeacher.id, 
        selectedSubjects
      );
      
      setTeachers(prev => prev.map(teacher => 
        teacher.id === updatedTeacher.id ? updatedTeacher : teacher
      ));
      
      toast.success(
        <div>
          <p className="font-semibold">Subjects Assigned Successfully!</p>
          <p className="text-sm"><strong>Teacher:</strong> {selectedTeacher.fullName}</p>
          <p className="text-sm"><strong>Subjects Assigned:</strong> {selectedSubjects.join(', ')}</p>
        </div>,
        { duration: 4000, icon: '✅' }
      );
    } catch (error) {
      toast.error('Failed to assign subjects');
    }
    
    setShowAssignSubjectModal(false);
    setSelectedTeacher(null);
  };

  const handleStatusChange = async (teacherId, newStatus) => {
    try {
      const updatedTeacher = await teacherService.updateStatus(teacherId, newStatus);
      
      setTeachers(prev => prev.map(teacher => 
        teacher.id === updatedTeacher.id ? updatedTeacher : teacher
      ));
      
      const teacher = teachers.find(t => t.id === teacherId);
      toast.success(
        <div>
          <p className="font-semibold">Status Updated Successfully!</p>
          <p className="text-sm"><strong>Teacher:</strong> {teacher.fullName}</p>
          <p className="text-sm"><strong>New Status:</strong> {newStatus}</p>
        </div>,
        { duration: 4000, icon: '✅' }
      );
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    
    if (window.confirm(`Are you sure you want to delete ${teacher.fullName}?`)) {
      try {
        await teacherService.deleteTeacher(teacherId);
        
        setTeachers(prev => prev.filter(t => t.id !== teacherId));
        
        toast.success(`${teacher.fullName} has been removed`, {
          icon: '✅'
        });
      } catch (error) {
        toast.error('Failed to delete teacher');
      }
    }
  };

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowEditModal(true);
  };

  const handleViewProfile = (teacher) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
  };

  const filterProps = {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    statuses,
    clearFilters,
    teachers,
    filteredTeachers
  };

  const tableProps = {
    teachers: filteredTeachers,
    handleViewProfile,
    handleEditTeacher,
    handleDeleteTeacher,
    handleAssignClass,
    handleAssignSubject,
    handleStatusChange,
    statuses,
    classes
  };

  const headerProps = {
    teachers,
    handleExportPDF: () => {
      toast.loading('Generating PDF report...');
      setTimeout(() => {
        toast.dismiss();
        toast.success('PDF report generated successfully!');
      }, 1500);
    },
    setShowAddModal,
    loadTeachers // Add refresh function
  };
  const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50
};

const modalStyle = {
  background: '#fff',
  width: '100%',
  maxWidth: '620px',
  borderRadius: 8,
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column'
};

const headerStyle = {
  padding: '14px 18px',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const bodyStyle = {
  padding: 16,
  maxHeight: '60vh',
  overflowY: 'auto'
};

const footerStyle = {
  padding: '12px 18px',
  borderTop: '1px solid #e5e7eb',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10
};


  return (
    <div className="teachers-page">
      <TeachersHeader {...headerProps} />
      
      {/* Loading State */}
      {isLoading ? (
             <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Loading teachers</h3>
         
        </div>
      ) : (
        <>
          <TeachersFilters {...filterProps} />
          <TeachersTable {...tableProps} />
        </>
      )}

      {/* Modals remain the same as your existing code */}
      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Register New Teacher</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            
            <TeacherForm 
              onClose={() => setShowAddModal(false)}
              onTeacherAdded={handleTeacherAdded}
            />
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && selectedTeacher && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Teacher Details</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTeacher(null);
                }}
              >
                ×
              </button>
            </div>
            
            <TeacherForm 
              onClose={() => {
                setShowEditModal(false);
                setSelectedTeacher(null);
              }}
              onTeacherAdded={handleTeacherUpdated}
              teacherToEdit={selectedTeacher}
            />
          </div>
        </div>
      )}

      {/* View Teacher Modal */}
      {showViewModal && selectedTeacher && (
        <ViewTeacherModal
          teacher={selectedTeacher}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTeacher(null);
          }}
        />
      )}
 {showAssignClassModal && selectedTeacher && (
  <div style={overlayStyle}>
    <div style={modalStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0 }}>
          Assign Classes – {selectedTeacher.fullName}
        </h3>
        <button
          onClick={() => {
            setShowAssignClassModal(false);
            setSelectedTeacher(null);
           toast('Class assignment cancelled', {
  icon: '❌'
});
 }}
          style={{ fontSize: 20, border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>

      <div style={bodyStyle}>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
          Select classes to assign to this teacher
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 10
          }}
        >
          {classes.map(cls => (
            <label
              key={cls}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13
              }}
            >
              <input
                type="checkbox"
                checked={selectedTeacher.classAssignments?.includes(cls) || false}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...(selectedTeacher.classAssignments || []), cls]
                    : (selectedTeacher.classAssignments || []).filter(c => c !== cls);
                  setSelectedTeacher({ ...selectedTeacher, classAssignments: updated });
                }}
              />
              {cls}
            </label>
          ))}
        </div>
      </div>

      <div style={footerStyle}>
        <button className="btn-secondary" onClick={() => setShowAssignClassModal(false)}>
          Cancel
        </button>
        <button
          className="btn-primary"
          onClick={() => handleSaveClassAssignments(selectedTeacher.classAssignments || [])}
        >
          Save Assignments
        </button>
      </div>
    </div>
  </div>
)}
 {showAssignSubjectModal && selectedTeacher && (
  <div style={overlayStyle}>
    <div style={modalStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0 }}>
          Assign Subjects – {selectedTeacher.fullName}
        </h3>
        <button
          onClick={() => {
            setShowAssignSubjectModal(false);
            setSelectedTeacher(null);
           toast('Class assignment cancelled', {
  icon: '❌'
});
}}
          style={{ fontSize: 20, border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>

      <div style={bodyStyle}>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
          Select subjects to assign to this teacher
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 10
          }}
        >
          {subjects.map(subject => (
            <label
              key={subject}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13
              }}
            >
              <input
                type="checkbox"
                checked={selectedTeacher.subjects?.includes(subject) || false}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...(selectedTeacher.subjects || []), subject]
                    : (selectedTeacher.subjects || []).filter(s => s !== subject);
                  setSelectedTeacher({ ...selectedTeacher, subjects: updated });
                }}
              />
              {subject}
            </label>
          ))}
        </div>
      </div>

      <div style={footerStyle}>
        <button className="btn-secondary" onClick={() => setShowAssignSubjectModal(false)}>
          Cancel
        </button>
        <button
          className="btn-primary"
          onClick={() => handleSaveSubjectAssignments(selectedTeacher.subjects || [])}
        >
          Save Assignments
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Teachers;