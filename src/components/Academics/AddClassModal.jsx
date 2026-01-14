import React, { useState } from 'react';
import { academicService } from '../../services/academicService';
import toast from 'react-hot-toast';

const AddClassModal = ({ onClose, onSuccess }) => {
  const levels = academicService.getLevels().slice(0, 4); // Exclude "All Levels"
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    level: 'PN',
    teacher: '',
    capacity: 40
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please enter a class name');
      return;
    }

    try {
      setLoading(true);
      await academicService.addClass(formData);
      toast.success(`Class "${formData.name}" created successfully!`);
      onSuccess();
    } catch (error) {
      toast.error(`Failed to create class: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
  className="modal-content"
  style={{
    maxWidth: '580px',
    width: '100%',
    margin: '0 auto'
  }}
>

        {/* Header */}
        <div className="modal-header">
          <h2>Create New Class</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* Basic Info */}
            <div className="form-row">
              <div className="form-group">
                <label>Class Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Primary 1"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>Level *</label>
                <select
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                  disabled={loading}
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

            {/* Teacher */}
            <div className="form-group">
              <label>Class Teacher</label>
              <input
                type="text"
                value={formData.teacher}
                onChange={(e) =>
                  setFormData({ ...formData, teacher: e.target.value })
                }
                placeholder="Optional"
                disabled={loading}
              />
            </div>

            {/* Capacity */}
            <div className="form-group">
              <label>Maximum Capacity</label>
              <input
                type="number"
                min="10"
                max="60"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: parseInt(e.target.value) || 40
                  })
                }
                disabled={loading}
              />
              <small className="form-hint">
                Recommended range: 10 – 60 students
              </small>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !formData.name}
            >
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;
