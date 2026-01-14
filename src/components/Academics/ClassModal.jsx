// src/components/Academics/ClassModal.jsx
import React, { useState } from 'react';
import { academicService } from '../../services/academicService';

const ClassModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '',
    level: 'PN',
    teacher: '',
    capacity: 40
  });

  const levels = [
    { code: 'PN', name: 'Pre-Nursery' },
    { code: 'NU', name: 'Nursery' },
    { code: 'PR', name: 'Primary' },
    { code: 'JS', name: 'Junior Secondary' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newClass = await academicService.addClass(form);
      onSave(newClass);
      alert(`Class "${newClass.name}" created successfully!`);
    } catch (error) {
      alert('Error creating class');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Class</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-row">
                <div className="form-group">
                  <label>Class Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="e.g., Primary 1"
                    required
                  />
                </div>
                
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
              </div>
              
              <div className="form-group">
                <label>Class Teacher</label>
                <input
                  type="text"
                  value={form.teacher}
                  onChange={(e) => setForm({...form, teacher: e.target.value})}
                  placeholder="Assign a class teacher"
                />
              </div>
              
              <div className="form-group">
                <label>Maximum Capacity</label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={form.capacity}
                  onChange={(e) => setForm({...form, capacity: parseInt(e.target.value) || 40})}
                />
                <small className="form-hint">Maximum number of students for this class</small>
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
              disabled={!form.name}
            >
              Create Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassModal;