import React, { useState, useEffect } from 'react'; 
import { academicService } from '../../services/academicService';
import { teacherService } from '../../services/teacherService';
import toast from 'react-hot-toast';

const AddSubjectModal = ({ onClose, onSuccess }) => {
  const allClasses = academicService.getAllAvailableClasses();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    classes: [], // Made required
    teacher: ''
  });

  // Fetch teachers from database
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const allTeachers = await teacherService.getAllTeachers();
        setTeachers(allTeachers);
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
      }
    };

    fetchTeachers();
  }, []);

  const generateSubjectCode = (name) => {
    if (!name) return '';
    // Create a clean code from the subject name
    const words = name.toUpperCase().split(' ');
    if (words.length >= 3) {
      return words.map(word => word.charAt(0)).slice(0, 3).join('');
    } else if (words.length === 2) {
      return words[0].substring(0, 2) + words[1].substring(0, 1);
    } else {
      return name.substring(0, 3).toUpperCase();
    }
  };

  const handleClassToggle = (className) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(className)
        ? prev.classes.filter(c => c !== className)
        : [...prev.classes, className]
    }));
  };

  const selectAllClasses = () => {
    setFormData(prev => ({
      ...prev,
      classes: allClasses.filter(cls => cls !== 'All Classes')
    }));
  };

  const clearAllClasses = () => {
    setFormData(prev => ({
      ...prev,
      classes: []
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push('Subject name is required');
    }
    
    if (!formData.code.trim()) {
      errors.push('Subject code is required');
    }
    
    if (formData.classes.length === 0) {
      errors.push('At least one class must be selected');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setLoading(true);
      
      // Prepare subject data for submission
      const subjectData = {
        ...formData,
        status: 'Active',
        description: '', // Empty description as requested
        level: 'All', // Default to 'All' as requested
        weeklyPeriods: 3, // Default value as requested
        color: '#3b82f6' // Default color as requested
      };

      await academicService.addSubject(subjectData);
      toast.success(`Subject "${formData.name}" added successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding subject:', error);
      toast.error(`Failed to add subject: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter out "All Classes" from available classes
  const availableClasses = allClasses.filter(cls => cls !== 'All Classes');

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
        {/* Header */}
        <div className="modal-header">
          <h2>Add New Subject</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* Subject Name */}
            <div className="form-group">
              <label>
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({
                  ...formData,
                  name: e.target.value,
                  code: e.target.value ? generateSubjectCode(e.target.value) : ''
                })}
                placeholder="e.g. Mathematics"
                disabled={loading}
                className={!formData.name.trim() && formData.name !== '' ? 'border-red-500' : ''}
                required
              />
              {!formData.name.trim() && formData.name !== '' && (
                <p className="text-red-500 text-sm mt-1">Subject name is required</p>
              )}
            </div>

            {/* Subject Code */}
            <div className="form-group">
              <label>
                Subject Code <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MAT"
                  disabled={loading}
                  className={`flex-1 ${!formData.code.trim() && formData.code !== '' ? 'border-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    if (formData.name) {
                      setFormData(prev => ({
                        ...prev,
                        code: generateSubjectCode(formData.name)
                      }));
                    }
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm whitespace-nowrap"
                  disabled={loading || !formData.name}
                  title="Generate from subject name"
                >
                  Generate
                </button>
              </div>
              {!formData.code.trim() && formData.code !== '' && (
                <p className="text-red-500 text-sm mt-1">Subject code is required</p>
              )}
            </div>

            {/* Teacher Dropdown */}
            <div className="form-group">
              <label>Assigned Teacher (Optional)</label>
              <select
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                disabled={loading || teachers.length === 0}
                className="w-full"
              >
                <option value="">No teacher assigned</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.fullName}>
                    {teacher.fullName} ({teacher.staffId})
                  </option>
                ))}
              </select>
              {teachers.length === 0 && (
                <p className="text-gray-500 text-sm mt-1">No teachers available. Add teachers first.</p>
              )}
            </div>

            {/* Classes Section */}
            <div className="form-group">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">
                  Classes <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-sm font-normal ml-2">
                    (Select at least one)
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllClasses}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    disabled={loading}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllClasses}
                    className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                    disabled={loading}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Class Selection Error */}
              {formData.classes.length === 0 && formData.name !== '' && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-600 text-sm">
                    Please select at least one class for this subject
                  </p>
                </div>
              )}

              {/* Class Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded">
                {availableClasses.map(cls => {
                  const isSelected = formData.classes.includes(cls);
                  const isNursery = cls.includes('Nursery');
                  const isPrimary = cls.includes('Primary');
                  const isJSS = cls.includes('JSS');
                  
                  let bgColor = 'bg-gray-50 hover:bg-gray-100';
                  if (isSelected) {
                    if (isNursery) bgColor = 'bg-blue-100 border-blue-300';
                    else if (isPrimary) bgColor = 'bg-green-100 border-green-300';
                    else if (isJSS) bgColor = 'bg-purple-100 border-purple-300';
                    else bgColor = 'bg-indigo-100 border-indigo-300';
                  }

                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => handleClassToggle(cls)}
                      disabled={loading}
                      className={`
                        p-2 text-sm border rounded text-left transition-colors
                        ${bgColor}
                        ${isSelected ? 'border-2 font-medium' : 'border-gray-200'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span>{cls}</span>
                        {isSelected && (
                          <span className="text-xs text-green-600 font-bold">✓</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Classes Summary */}
              {formData.classes.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      Selected: {formData.classes.length} class{formData.classes.length !== 1 ? 'es' : ''}
                    </span>
                    <span className="text-xs text-gray-500">
                      Click to deselect
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.classes.slice(0, 5).map(cls => (
                      <span
                        key={cls}
                        onClick={() => handleClassToggle(cls)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full cursor-pointer hover:bg-indigo-200"
                      >
                        {cls}
                        <span className="text-indigo-600 hover:text-indigo-800">×</span>
                      </span>
                    ))}
                    {formData.classes.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{formData.classes.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
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
              disabled={loading || !formData.name.trim() || !formData.code.trim() || formData.classes.length === 0}
            >
              {loading ? 'Adding...' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal Styles */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.3s ease-out;
        }
        
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #64748b;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        
        .close-btn:hover {
          background-color: #f1f5f9;
          color: #475569;
        }
        
        .close-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .modal-body {
          padding: 24px;
          max-height: 70vh;
          overflow-y: auto;
        }
        
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          background-color: #f8fafc;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-radius: 0 0 12px 12px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #1f2937;
          background-color: white;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-group input:disabled,
        .form-group select:disabled,
        .form-group textarea:disabled {
          background-color: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }
        
        .border-red-500 {
          border-color: #ef4444 !important;
        }
        
        .border-red-500:focus {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        
        .btn-primary {
          padding: 10px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          padding: 10px 24px;
          background-color: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background-color: #e5e7eb;
        }
        
        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

export default AddSubjectModal;