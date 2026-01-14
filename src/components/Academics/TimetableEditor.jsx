// src/components/Academics/TimetableEditor.jsx
import React, { useState } from 'react';

const TimetableEditor = ({ timetable, onClose, onSave, classes, subjects }) => {
  const [editedTimetable, setEditedTimetable] = useState(timetable);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedTime, setSelectedTime] = useState('8:00 - 8:40');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '8:00 - 8:40', '8:40 - 9:20', '9:20 - 10:00',
    '10:20 - 11:00', '11:00 - 11:40', '11:40 - 12:20',
    '1:00 - 1:40', '1:40 - 2:20', '2:20 - 3:00'
  ];

  const handlePeriodChange = (day, time, field, value) => {
    setEditedTimetable(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [time]: {
            ...prev.schedule[day][time],
            [field]: value
          }
        }
      }
    }));
  };

  const handleClearDay = (day) => {
    if (window.confirm(`Clear all periods for ${day}?`)) {
      setEditedTimetable(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: timeSlots.reduce((acc, time) => {
            acc[time] = { subject: '', teacher: '' };
            return acc;
          }, {})
        }
      }));
    }
  };

  const handleCopyDay = (sourceDay, targetDay) => {
    if (window.confirm(`Copy ${sourceDay}'s schedule to ${targetDay}?`)) {
      setEditedTimetable(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [targetDay]: { ...prev.schedule[sourceDay] }
        }
      }));
    }
  };

  const handleSave = () => {
    onSave(editedTimetable);
  };

  const getCurrentPeriod = () => {
    return editedTimetable.schedule[selectedDay][selectedTime];
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content timetable-editor-modal">
        <div className="modal-header">
          <h2>Edit Timetable - {editedTimetable.class}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="editor-layout">
            {/* Left Panel - Period Selector */}
            <div className="editor-left-panel">
              <div className="period-selector">
                <div className="selector-section">
                  <label>Select Day</label>
                  <div className="day-buttons">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        className={`day-btn ${selectedDay === day ? 'active' : ''}`}
                        onClick={() => setSelectedDay(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="day-actions">
                    <button 
                      className="btn-secondary small"
                      onClick={() => handleClearDay(selectedDay)}
                    >
                      Clear {selectedDay}
                    </button>
                    <select 
                      className="copy-select"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleCopyDay(selectedDay, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Copy to...</option>
                      {daysOfWeek
                        .filter(day => day !== selectedDay)
                        .map(day => (
                          <option key={day} value={day}>Copy to {day}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                
                <div className="selector-section">
                  <label>Select Time Slot</label>
                  <div className="time-slots">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        className={`time-btn ${selectedTime === time ? 'active' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="period-editor">
                <h4>Edit Period: {selectedTime} on {selectedDay}</h4>
                <div className="form-group">
                  <label>Subject</label>
                  <select
                    value={getCurrentPeriod().subject}
                    onChange={(e) => handlePeriodChange(selectedDay, selectedTime, 'subject', e.target.value)}
                  >
                    <option value="">Select Subject</option>
                    <option value="Free Period">Free Period</option>
                    <option value="Assembly">Assembly</option>
                    <option value="Break">Break</option>
                    <option value="Lunch">Lunch</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.name}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Teacher</label>
                  <input
                    type="text"
                    value={getCurrentPeriod().teacher}
                    onChange={(e) => handlePeriodChange(selectedDay, selectedTime, 'teacher', e.target.value)}
                    placeholder="Teacher's name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Room</label>
                  <input
                    type="text"
                    value={getCurrentPeriod().room || ''}
                    onChange={(e) => handlePeriodChange(selectedDay, selectedTime, 'room', e.target.value)}
                    placeholder="Room number"
                  />
                </div>
                
                <div className="quick-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => handlePeriodChange(selectedDay, selectedTime, 'subject', 'Free Period')}
                  >
                    Set as Free
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => handlePeriodChange(selectedDay, selectedTime, 'subject', 'Break')}
                  >
                    Set as Break
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right Panel - Preview */}
            <div className="editor-right-panel">
              <div className="day-preview">
                <div className="preview-header">
                  <h3>{selectedDay}'s Schedule</h3>
                  <span className="period-count">
                    {Object.values(editedTimetable.schedule[selectedDay] || {}).filter(p => p.subject && p.subject !== 'Free Period').length} periods
                  </span>
                </div>
                <div className="preview-table">
                  {timeSlots.map(time => {
                    const period = editedTimetable.schedule[selectedDay][time];
                    return (
                      <div 
                        key={time} 
                        className={`preview-row ${selectedTime === time ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        <div className="preview-time">{time}</div>
                        <div className="preview-content">
                          {period.subject ? (
                            <>
                              <div className="preview-subject">{period.subject}</div>
                              <div className="preview-details">
                                {period.teacher && <span>👨‍🏫 {period.teacher}</span>}
                                {period.room && <span>🚪 {period.room}</span>}
                              </div>
                            </>
                          ) : (
                            <div className="preview-empty">Empty</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="summary">
                <h4>Timetable Summary</h4>
                <div className="summary-stats">
                  {daysOfWeek.map(day => {
                    const periods = editedTimetable.schedule[day] || {};
                    const filledPeriods = Object.values(periods).filter(p => p.subject && p.subject !== 'Free Period').length;
                    return (
                      <div key={day} className="stat-item">
                        <div className="stat-day">{day.substring(0, 3)}</div>
                        <div className="stat-bar">
                          <div 
                            className="stat-fill"
                            style={{ width: `${(filledPeriods / timeSlots.length) * 100}%` }}
                          />
                        </div>
                        <div className="stat-count">{filledPeriods}/{timeSlots.length}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Timetable
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimetableEditor;