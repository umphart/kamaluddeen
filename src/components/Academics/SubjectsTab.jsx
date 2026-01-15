import React, { useState, useEffect } from 'react'; 
import { academicService } from '../../services/academicService';
import { FaEye, FaEdit, FaTrash, FaSave, FaTimes, FaUserTie, FaBook, FaClock, FaPalette } from 'react-icons/fa';

const SubjectsTab = ({ searchTerm, selectedLevel, selectedStatus, refreshTrigger }) => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => { loadSubjects(); }, [refreshTrigger]);
  useEffect(() => { filterSubjects(); }, [subjects, searchTerm, selectedLevel, selectedStatus]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await academicService.getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubjects = () => {
    let filtered = [...subjects];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(subject =>
        subject.name.toLowerCase().includes(term) ||
        subject.code.toLowerCase().includes(term) ||
        subject.description.toLowerCase().includes(term) ||
        subject.teacher.toLowerCase().includes(term)
      );
    }

    if (selectedLevel !== 'all') filtered = filtered.filter(subject => subject.level === selectedLevel);
    if (selectedStatus !== 'all') filtered = filtered.filter(subject => subject.status === selectedStatus);

    setFilteredSubjects(filtered);
  };

  const getLevelName = (code) => {
    const levels = academicService.getLevels();
    const level = levels.find(l => l.code === code);
    return level ? level.name : code;
  };

  const getLevelColor = (code) => {
    const colors = { PN: '#10b981', NU: '#3b82f6', PR: '#f59e0b', JS: '#8b5cf6', All: '#64748b' };
    return colors[code] || '#64748b';
  };

  // EDIT FUNCTIONS
  const handleEdit = (subject) => {
    setEditingSubject(subject.id);
    setFormData({
      ...subject,
      classes: subject.classes ? subject.classes.join(', ') : ''
    });
  };

  const handleSaveEdit = async () => {
    try {
      const updatedData = {
        ...formData,
        classes: formData.classes ? formData.classes.split(',').map(c => c.trim()) : []
      };

      await academicService.updateSubject(editingSubject, updatedData);
      
      setSuccessMessage('Subject updated successfully!');
      setEditingSubject(null);
      loadSubjects();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating subject:', error);
      alert('Failed to update subject. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // DELETE FUNCTIONS
  const handleDeleteClick = (subjectId) => {
    setIsDeleting(subjectId);
  };

  const handleConfirmDelete = async () => {
    try {
      await academicService.deleteSubject(isDeleting);
      
      setSuccessMessage('Subject deleted successfully!');
      setIsDeleting(null);
      setSelectedSubject(null);
      loadSubjects();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(null);
  };

  const tableStyles = {
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px'
    },
    th: {
      padding: '8px 12px',
      textAlign: 'left',
      backgroundColor: '#f8fafc',
      borderBottom: '2px solid #e2e8f0',
      fontWeight: 600,
      color: '#475569'
    },
    td: {
      padding: '8px 12px',
      borderBottom: '1px solid #e2e8f0',
      verticalAlign: 'middle'
    },
    emptyState: {
      padding: '8px 12px',
      textAlign: 'center',
      color: '#64748b',
      fontStyle: 'italic'
    },
    actionCell: {
      padding: '8px 12px',
      width: '140px'
    },
    levelBadge: {
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      color: '#fff',
      display: 'inline-block'
    },
    actionButton: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    input: {
      width: '100%',
      padding: '6px 10px',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '6px 10px',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white'
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading subjects...</p>;

  return (
    <div className="tab-content">
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1001,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {successMessage}
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h3>Subjects ({filteredSubjects.length})</h3>
        </div>

        <div className="table-responsive">
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Code</th>
                <th style={tableStyles.th}>Name</th>
                <th style={tableStyles.th}>Classes</th>
             
                 <th style={tableStyles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan="7" style={tableStyles.emptyState}>No subjects found</td>
                </tr>
              ) : (
                filteredSubjects.map(subject => (
                  <tr key={subject.id}>
                    <td style={tableStyles.td}>
                      {editingSubject === subject.id ? (
                        <input
                          type="text"
                          name="code"
                          value={formData.code || ''}
                          onChange={handleInputChange}
                          style={tableStyles.input}
                          placeholder="Subject code"
                        />
                      ) : (
                        subject.code
                      )}
                    </td>
                    <td style={tableStyles.td}>
                      {editingSubject === subject.id ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          style={tableStyles.input}
                          placeholder="Subject name"
                        />
                      ) : (
                        <strong>{subject.name}</strong>
                      )}
                    </td>
                   
                    <td style={tableStyles.td}>
                      {editingSubject === subject.id ? (
                        <input
                          type="text"
                          name="classes"
                          value={formData.classes || ''}
                          onChange={handleInputChange}
                          style={tableStyles.input}
                          placeholder="Class 1, Class 2, ..."
                        />
                      ) : (
                        <>
                          {subject.classes.slice(0, 2).join(', ')}
                          {subject.classes.length > 2 && ` +${subject.classes.length - 2}`}
                        </>
                      )}
                    </td>
            
                   
                    <td style={tableStyles.actionCell}>
                      {editingSubject === subject.id ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={handleSaveEdit}
                            style={{
                              ...tableStyles.actionButton,
                              backgroundColor: '#10b981',
                              color: 'white'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                          >
                            <FaSave size={12} /> Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              ...tableStyles.actionButton,
                              backgroundColor: '#ef4444',
                              color: 'white'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                          >
                            <FaTimes size={12} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="action-btn view"
                            title="View Details"
                            onClick={() => setSelectedSubject(subject)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            className="action-btn edit"
                            title="Edit"
                            onClick={() => handleEdit(subject)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b' }}
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            className="action-btn delete"
                            title="Delete"
                            onClick={() => handleDeleteClick(subject.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              margin: '0 0 16px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#1e293b'
            }}>
              <FaTrash style={{ color: '#ef4444', marginRight: '8px' }} />
              Delete Subject
            </h3>
            <p style={{
              margin: '0 0 24px',
              color: '#64748b',
              lineHeight: '1.5'
            }}>
              Are you sure you want to delete this subject? This action cannot be undone.
              All associated data (schedules, grades, etc.) will be permanently removed.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={handleCancelDelete}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedSubject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setSelectedSubject(null)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'fadeIn 0.3s ease-out'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: selectedSubject.color || '#3b82f6'
                  }}></span>
                  Subject Details
                </h2>
                <p style={{
                  margin: '4px 0 0',
                  fontSize: '14px',
                  color: '#64748b'
                }}>{selectedSubject.code} • {selectedSubject.name}</p>
              </div>
              <button 
                onClick={() => setSelectedSubject(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            <div style={{
              padding: '24px',
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 140px)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: '4px solid #3b82f6'
                  }}>
                    <h3 style={{
                      margin: '0 0 12px',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FaBook /> Basic Information
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '4px'
                        }}>Code</label>
                        <div style={{
                          padding: '8px 12px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                          color: '#1e293b'
                        }}>{selectedSubject.code}</div>
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '4px'
                        }}>Name</label>
                        <div style={{
                          padding: '8px 12px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                          color: '#1e293b'
                        }}>{selectedSubject.name}</div>
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '4px'
                        }}>Description</label>
                        <div style={{
                          padding: '8px 12px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                          color: '#1e293b',
                          minHeight: '60px'
                        }}>{selectedSubject.description || 'No description'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <h3 style={{
                      margin: '0 0 12px',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FaUserTie /> Schedule & Staff
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '4px'
                        }}>
                          <FaClock style={{ marginRight: '6px' }} /> Weekly Periods
                        </label>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            padding: '8px 12px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            color: '#1e293b',
                            flex: 1
                          }}>{selectedSubject.weeklyPeriods} periods/week</div>
                          <div style={{
                            padding: '6px 10px',
                            backgroundColor: '#fef3c7',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#92400e',
                            fontWeight: 500
                          }}>{selectedSubject.weeklyPeriods * 40} mins</div>
                        </div>
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '4px'
                        }}>Teacher</label>
                        <div style={{
                          padding: '8px 12px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                          color: '#1e293b'
                        }}>{selectedSubject.teacher || 'Not assigned'}</div>
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '4px'
                        }}>
                          <FaPalette style={{ marginRight: '6px' }} /> Color Theme
                        </label>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: selectedSubject.color || '#3b82f6',
                            borderRadius: '8px',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}></div>
                          <div style={{
                            padding: '8px 12px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            color: '#1e293b',
                            flex: 1,
                            fontFamily: 'monospace'
                          }}>{selectedSubject.color || '#3b82f6'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#64748b'
              }}>
                <span>Subject ID: {selectedSubject.id}</span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setSelectedSubject(null)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    handleEdit(selectedSubject);
                    setSelectedSubject(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                >
                  Edit Subject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SubjectsTab;