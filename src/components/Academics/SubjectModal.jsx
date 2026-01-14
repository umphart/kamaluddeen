// src/components/Academics/SubjectModal.jsx
import React, { useState } from 'react';
import { academicService } from '../../services/academicService';

const SubjectModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    level: 'All',
    classes: [],
    teacher: '',
    weeklyPeriods: 3,
    color: '#3b82f6'
  });

  const levels = [
    { code: 'PN', name: 'Pre-Nursery' },
    { code: 'NU', name: 'Nursery' },
    { code: 'PR', name: 'Primary' },
    { code: 'JS', name: 'Junior Secondary' },
    { code: 'All', name: 'All Levels' }
  ];

  const allClasses = [
    'Pre-Nursery', 'Nursery 1', 'Nursery 2',
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4',
    'JSS 1', 'JSS 2', 'JSS 3', 'All Classes'
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16'];

  const generateSubjectCode = (name) => {
    const prefix = name.substring(0, 3).toUpperCase();
    const number = academicService.subjects.filter(s => s.code.startsWith(prefix)).length + 1;
    return `${prefix}${number.toString().padStart(3, '0')}`;
  };

  const handleClassToggle = (className) => {
    setForm(prev => ({
      ...prev,
      classes: prev.classes.includes(className)
        ? prev.classes.filter(c => c !== className)
        : [...prev.classes, className]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newSubject = await academicService.addSubject(form);
      onSave(newSubject);
      alert(`Subject "${newSubject.name}" added successfully!`);
    } catch (error) {
      alert('Error adding subject');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Subject</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-row">
                <div className="form-group">
                  <label>Subject Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        name: e.target.value,
                        code: e.target.value ? generateSubjectCode(e.target.value) : ''
                      });
                    }}
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Subject Code *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({...form, code: e.target.value})}
                    placeholder="e.g., MAT101"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows="3"
                  placeholder="Brief description of the subject..."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Level *</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({...form, level: e.target.value})}
                    required
                  >
                    {levels.map(level => (
                      <option key={level.code} value={level.code}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Weekly Periods *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.weeklyPeriods}
                    onChange={(e) => setForm({...form, weeklyPeriods: parseInt(e.target.value) || 3})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Assigned Teacher</label>
                <input
                  type="text"
                  value={form.teacher}
                  onChange={(e) => setForm({...form, teacher: e.target.value})}
                  placeholder="Teacher's name"
                />
              </div>
              
              <div className="form-group">
                <label>Color Theme</label>
                <div className="color-picker">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${form.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setForm({...form, color})}
                    />
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Classes (Optional)</label>
                <div className="classes-selector">
                  <div className="selected-classes">
                    {form.classes.map(cls => (
                      <span key={cls} className="class-tag selected">
                        {cls}
                        <button 
                          type="button"
                          onClick={() => handleClassToggle(cls)}
                          className="remove-class"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleClassToggle(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="class-select"
                  >
                    <option value="">Add class...</option>
                    {allClasses
                      .filter(cls => !form.classes.includes(cls))
                      .map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={!form.name || !form.code}
            >
              Add Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectModal;