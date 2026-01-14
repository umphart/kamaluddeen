// src/components/Academics/TimetablesTab.jsx
import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService';
import TimetableEditor from './TimetableEditor';

const TimetablesTab = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [currentTimetable, setCurrentTimetable] = useState(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '8:00 - 8:40', '8:40 - 9:20', '9:20 - 10:00',
    '10:20 - 11:00', '11:00 - 11:40', '11:40 - 12:20',
    '1:00 - 1:40', '1:40 - 2:20', '2:20 - 3:00'
  ];

  // Sample timetable data - in real app, this would come from API
  const sampleTimetables = [
    {
      id: 1,
      class: 'JSS 1',
      schedule: {
        Monday: {
          '8:00 - 8:40': { subject: 'Mathematics', teacher: 'Dr. Ahmed Musa' },
          '8:40 - 9:20': { subject: 'English Language', teacher: 'Mrs. Fatima Ibrahim' },
          '9:20 - 10:00': { subject: 'Basic Science', teacher: 'Mr. Chinedu Okoro' },
          '10:20 - 11:00': { subject: 'Social Studies', teacher: 'Mrs. Grace Williams' },
          '11:00 - 11:40': { subject: 'Computer Studies', teacher: 'Mr. Chinedu Okoro' },
          '11:40 - 12:20': { subject: 'Islamic Studies', teacher: 'Mr. Sani Bello' }
        },
        Tuesday: {
          '8:00 - 8:40': { subject: 'English Language', teacher: 'Mrs. Fatima Ibrahim' },
          '8:40 - 9:20': { subject: 'Mathematics', teacher: 'Dr. Ahmed Musa' },
          '9:20 - 10:00': { subject: 'Physical Education', teacher: 'Coach Ade' },
          '10:20 - 11:00': { subject: 'Basic Science', teacher: 'Mr. Chinedu Okoro' },
          '11:00 - 11:40': { subject: 'Creative Arts', teacher: 'Miss Joy' },
          '11:40 - 12:20': { subject: 'Home Economics', teacher: 'Mrs. Adebayo' }
        },
        Wednesday: {
          '8:00 - 8:40': { subject: 'Mathematics', teacher: 'Dr. Ahmed Musa' },
          '8:40 - 9:20': { subject: 'Basic Science', teacher: 'Mr. Chinedu Okoro' },
          '9:20 - 10:00': { subject: 'French', teacher: 'Monsieur Pierre' },
          '10:20 - 11:00': { subject: 'Social Studies', teacher: 'Mrs. Grace Williams' },
          '11:00 - 11:40': { subject: 'Computer Studies', teacher: 'Mr. Chinedu Okoro' },
          '11:40 - 12:20': { subject: 'Library Period', teacher: 'Librarian' }
        },
        Thursday: {
          '8:00 - 8:40': { subject: 'English Language', teacher: 'Mrs. Fatima Ibrahim' },
          '8:40 - 9:20': { subject: 'Mathematics', teacher: 'Dr. Ahmed Musa' },
          '9:20 - 10:00': { subject: 'Basic Science', teacher: 'Mr. Chinedu Okoro' },
          '10:20 - 11:00': { subject: 'Social Studies', teacher: 'Mrs. Grace Williams' },
          '11:00 - 11:40': { subject: 'Islamic Studies', teacher: 'Mr. Sani Bello' },
          '11:40 - 12:20': { subject: 'Music', teacher: 'Mr. Melody' }
        },
        Friday: {
          '8:00 - 8:40': { subject: 'Assembly', teacher: 'All Teachers' },
          '8:40 - 9:20': { subject: 'Moral Instruction', teacher: 'Mrs. Grace Williams' },
          '9:20 - 10:00': { subject: 'Mathematics', teacher: 'Dr. Ahmed Musa' },
          '10:20 - 11:00': { subject: 'English Language', teacher: 'Mrs. Fatima Ibrahim' },
          '11:00 - 11:40': { subject: 'Games/Sports', teacher: 'Coach Ade' },
          '11:40 - 12:20': { subject: 'Club Activities', teacher: 'Various Teachers' }
        }
      }
    },
    {
      id: 2,
      class: 'Primary 4',
      schedule: {
        Monday: {
          '8:00 - 8:40': { subject: 'Mathematics', teacher: 'Dr. Ahmed Musa' },
          '8:40 - 9:20': { subject: 'English', teacher: 'Mrs. Fatima Ibrahim' },
          '9:20 - 10:00': { subject: 'Quantitative Reasoning', teacher: 'Dr. Ahmed Musa' },
          '10:20 - 11:00': { subject: 'Verbal Reasoning', teacher: 'Mrs. Fatima Ibrahim' },
          '11:00 - 11:40': { subject: 'Basic Science', teacher: 'Mr. Chinedu Okoro' },
          '11:40 - 12:20': { subject: 'Creative Arts', teacher: 'Miss Joy' }
        },
        Tuesday: {
          '8:00 - 8:40': { subject: 'English', teacher: 'Mrs. Fatima Ibrahim' },
          '8:40 - 9:20': { subject: 'Mathematics', teacher: 'Dr. Ahmed Musa' },
          '9:20 - 10:00': { subject: 'Social Studies', teacher: 'Mrs. Grace Williams' },
          '10:20 - 11:00': { subject: 'Computer Studies', teacher: 'Mr. Chinedu Okoro' },
          '11:00 - 11:40': { subject: 'Physical Education', teacher: 'Coach Ade' },
          '11:40 - 12:20': { subject: 'Islamic Studies', teacher: 'Mr. Sani Bello' }
        },
        // ... other days
      }
    }
  ];

  useEffect(() => {
    loadClasses();
    // In real app: loadTimetables();
    setTimetables(sampleTimetables);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const timetable = timetables.find(t => t.class === selectedClass);
      setCurrentTimetable(timetable);
    } else {
      setCurrentTimetable(null);
    }
  }, [selectedClass, timetables]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await academicService.getClasses({});
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTimetable = () => {
    setShowEditor(true);
  };

  const handleSaveTimetable = (updatedTimetable) => {
    // In real app, this would update the API
    const updatedTimetables = timetables.map(t => 
      t.class === updatedTimetable.class ? updatedTimetable : t
    );
    setTimetables(updatedTimetables);
    setCurrentTimetable(updatedTimetable);
    setShowEditor(false);
    alert('Timetable saved successfully!');
  };

  const handleCreateNewTimetable = () => {
    const newTimetable = {
      id: timetables.length + 1,
      class: selectedClass,
      schedule: daysOfWeek.reduce((acc, day) => {
        acc[day] = timeSlots.reduce((timeAcc, time) => {
          timeAcc[time] = { subject: '', teacher: '' };
          return timeAcc;
        }, {});
        return acc;
      }, {})
    };
    setCurrentTimetable(newTimetable);
    setShowEditor(true);
  };

  const handlePrintTimetable = () => {
    window.print();
  };

  const handleExportTimetable = () => {
    const dataStr = JSON.stringify(currentTimetable, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${selectedClass.replace(' ', '_')}_Timetable.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getPeriodData = (day, time) => {
    if (!currentTimetable || !currentTimetable.schedule[day]) {
      return { subject: '', teacher: '' };
    }
    return currentTimetable.schedule[day][time] || { subject: '', teacher: '' };
  };

  const getSubjectColor = (subjectName) => {
    if (!subjectName) return '#f3f4f6';
    
    const colors = {
      'Mathematics': '#3b82f6',
      'English Language': '#10b981',
      'Basic Science': '#f59e0b',
      'Social Studies': '#8b5cf6',
      'Computer Studies': '#ef4444',
      'Islamic Studies': '#06b6d4',
      'Physical Education': '#84cc16',
      'Creative Arts': '#f97316',
      'Home Economics': '#ec4899',
      'French': '#6366f1',
      'Music': '#8b5cf6',
      'Quantitative Reasoning': '#3b82f6',
      'Verbal Reasoning': '#10b981'
    };
    
    return colors[subjectName] || '#d1d5db';
  };

  return (
    <div className="tab-content">
      <div className="timetables-container">
        <div className="timetable-header-section">
          <div className="timetable-selector">
            <div className="selector-group">
              <label>Select Class</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="timetable-select"
                disabled={loading}
              >
                <option value="">Choose a class...</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.name}>{cls.name}</option>
                ))}
              </select>
            </div>
            
            <div className="timetable-actions">
              {selectedClass && currentTimetable && (
                <>
                  <button 
                    className="btn-secondary"
                    onClick={handleEditTimetable}
                  >
                    ✏️ Edit Timetable
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={handlePrintTimetable}
                  >
                    🖨️ Print
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={handleExportTimetable}
                  >
                    📥 Export
                  </button>
                </>
              )}
              
              {selectedClass && !currentTimetable && (
                <button 
                  className="btn-primary"
                  onClick={handleCreateNewTimetable}
                >
                  + Create Timetable
                </button>
              )}
            </div>
          </div>
          
          {selectedClass && currentTimetable && (
            <div className="timetable-info">
              <div className="info-card">
                <div className="info-icon">📅</div>
                <div className="info-content">
                  <h4>Current Timetable</h4>
                  <p>Last updated: Today, 9:00 AM</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">⏰</div>
                <div className="info-content">
                  <h4>Total Periods</h4>
                  <p>30 periods per week</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">👨‍🏫</div>
                <div className="info-content">
                  <h4>Teachers</h4>
                  <p>6 assigned teachers</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="loading-state">Loading timetable...</div>
        ) : selectedClass ? (
          currentTimetable ? (
            <div className="timetable-view">
              <div className="timetable-legend">
                <h4>Subject Legend:</h4>
                <div className="legend-items">
                  {['Mathematics', 'English Language', 'Basic Science', 'Social Studies', 'Computer Studies', 'Islamic Studies']
                    .map(subject => (
                      <div key={subject} className="legend-item">
                        <span 
                          className="legend-color" 
                          style={{ backgroundColor: getSubjectColor(subject) }}
                        />
                        <span className="legend-label">{subject}</span>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="timetable-table">
                <div className="timetable-header">
                  <div className="time-header">Time</div>
                  {daysOfWeek.map(day => (
                    <div key={day} className="day-header">
                      {day}
                      <small>{getWeekDay(day)}</small>
                    </div>
                  ))}
                </div>
                
                {timeSlots.map((time, timeIndex) => (
                  <div key={time} className="timetable-row">
                    <div className="time-cell">
                      {time}
                      <div className="period-number">Period {timeIndex + 1}</div>
                    </div>
                    {daysOfWeek.map(day => {
                      const period = getPeriodData(day, time);
                      return (
                        <div 
                          key={`${day}-${time}`} 
                          className="period-cell"
                          style={{ 
                            backgroundColor: period.subject ? getSubjectColor(period.subject) + '20' : 'transparent',
                            borderLeft: `4px solid ${getSubjectColor(period.subject)}`
                          }}
                        >
                          <div className="period-content">
                            {period.subject ? (
                              <>
                                <div className="period-subject">{period.subject}</div>
                                <div className="period-teacher">{period.teacher}</div>
                                <div className="period-room">Room 10{timeIndex + 1}</div>
                              </>
                            ) : (
                              <div className="period-empty">
                                <span className="empty-text">Free Period</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              <div className="timetable-footer">
                <div className="footer-notes">
                  <p><strong>Notes:</strong></p>
                  <ul>
                    <li>Assembly: Every Friday 8:00 - 8:40 AM</li>
                    <li>Break: 10:00 - 10:20 AM daily</li>
                    <li>Lunch: 12:20 - 1:00 PM daily</li>
                    <li>Clubs: Fridays 2:20 - 3:00 PM</li>
                  </ul>
                </div>
                <div className="footer-signature">
                  <p>Approved by: Principal's Office</p>
                  <p>Effective Date: January 2024</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-timetable">
              <div className="empty-content">
                <span className="empty-icon">📅</span>
                <h3>No Timetable Found</h3>
                <p>No timetable has been created for {selectedClass} yet.</p>
                <button 
                  className="btn-primary"
                  onClick={handleCreateNewTimetable}
                >
                  Create First Timetable
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="empty-timetable">
            <div className="empty-content">
              <span className="empty-icon">⏰</span>
              <h3>Select a Class</h3>
              <p>Choose a class from the dropdown to view or edit its timetable</p>
              <div className="instruction-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <p>Select a class from the dropdown above</p>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <p>View existing timetable or create a new one</p>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <p>Edit, print, or export the timetable</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEditor && currentTimetable && (
        <TimetableEditor
          timetable={currentTimetable}
          onClose={() => setShowEditor(false)}
          onSave={handleSaveTimetable}
          classes={classes}
          subjects={academicService.subjects}
        />
      )}
    </div>
  );
};

// Helper function to get weekday
const getWeekDay = (day) => {
  const weekdays = {
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri'
  };
  return weekdays[day] || day;
};

export default TimetablesTab;