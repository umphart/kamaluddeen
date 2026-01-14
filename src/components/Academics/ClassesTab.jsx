// src/components/Academics/ClassesTab.jsx
import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';

const ClassesTab = ({ searchTerm, selectedLevel, onClassAdded }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, [searchTerm, selectedLevel]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const filters = { searchTerm, level: selectedLevel };
      const data = await academicService.getClasses(filters);
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelName = (code) => {
    const levels = {
      'PN': 'Pre-Nursery',
      'NU': 'Nursery',
      'PR': 'Primary',
      'JS': 'Junior Secondary'
    };
    return levels[code] || code;
  };

  const getLevelColor = (code) => {
    const colors = {
      'PN': '#10b981',
      'NU': '#3b82f6',
      'PR': '#f59e0b',
      'JS': '#8b5cf6'
    };
    return colors[code] || '#64748b';
  };

  return (
    <div className="tab-content">
      <div className="classes-grid-view">
        {loading ? (
          <div className="loading-state">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="empty-classes">
            <div className="empty-content">
              <span className="empty-icon">👨‍🏫</span>
              <p>No classes found. {searchTerm && 'Try different search terms.'}</p>
            </div>
          </div>
        ) : (
          classes.map(cls => (
            <div key={cls.id} className="class-card">
              <div className="class-card-header">
                <div className="class-level">
                  <span 
                    className="level-badge"
                    style={{ backgroundColor: getLevelColor(cls.level) }}
                  >
                    {getLevelName(cls.level)}
                  </span>
                </div>
                <div className="class-status">
                  <span className={`status-dot status-${cls.status.toLowerCase()}`} />
                  {cls.status}
                </div>
              </div>
              
              <div className="class-card-body">
                <h3 className="class-name">{cls.name}</h3>
                <div className="class-teacher">
                  <span className="teacher-icon">👨‍🏫</span>
                  {cls.teacher || 'Not Assigned'}
                </div>
                
                <div className="class-stats">
                  <div className="class-stat">
                    <span className="stat-icon">👨‍🎓</span>
                    <div className="stat-details">
                      <div className="stat-number">{cls.students}</div>
                      <div className="stat-label">Students</div>
                    </div>
                  </div>
                  <div className="class-stat">
                    <span className="stat-icon">📚</span>
                    <div className="stat-details">
                      <div className="stat-number">{cls.subjects}</div>
                      <div className="stat-label">Subjects</div>
                    </div>
                  </div>
                </div>
                
                <div className="class-actions">
                  <button className="btn-secondary small">
                    View Timetable
                  </button>
                  <button className="btn-primary small">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClassesTab;