// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    schoolName: 'Kamaluddeen Comprehensive College',
    schoolShortName: 'KCC',
    schoolAddress: 'P.M.B. 123, Kano State, Nigeria',
    schoolEmail: 'info@kcc.edu.ng',
    schoolPhone: '+234 80 1234 5678',
    schoolWebsite: 'www.kcc.edu.ng',
    schoolMotto: 'Knowledge, Character, Excellence',
    schoolLogo: null,
    
    // Academic Settings
    currentSession: '2024/2025',
    currentTerm: 'First Term',
    termStartDate: '2024-09-10',
    termEndDate: '2024-12-15',
    gradingSystem: 'Percentage',
    passingPercentage: 50,
    maxCaScore: 20,
    maxExamScore: 80,
    
    // User Management
    users: [
      { id: 1, username: 'admin', fullName: 'System Administrator', email: 'admin@kcc.edu.ng', role: 'Admin', status: 'Active', lastLogin: '2024-01-15 09:30' },
      { id: 2, username: 'principal', fullName: 'Dr. Ahmed Musa', email: 'principal@kcc.edu.ng', role: 'Principal', status: 'Active', lastLogin: '2024-01-14 14:20' },
      { id: 3, username: 'teacher1', fullName: 'Mrs. Fatima Ibrahim', email: 'fatima@kcc.edu.ng', role: 'Teacher', status: 'Active', lastLogin: '2024-01-14 16:45' },
      { id: 4, username: 'accountant', fullName: 'Mr. Chinedu Okoro', email: 'accounts@kcc.edu.ng', role: 'Accountant', status: 'Inactive', lastLogin: '2024-01-10 11:15' }
    ],
    
    // System Preferences
    timezone: 'Africa/Lagos',
    dateFormat: 'DD/MM/YYYY',
    language: 'English',
    theme: 'light',
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    emailNotifications: true,
    smsNotifications: false,
    
    // Security Settings
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90
    },
    loginAttempts: 5,
    sessionTimeout: 30,
    twoFactorAuth: false,
    
    // Database Settings
    lastBackup: '2024-01-14 02:00',
    backupSize: '45.2 MB',
    databaseVersion: '1.2.0'
  });

  const [formData, setFormData] = useState({});
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const userRoles = ['Admin', 'Principal', 'Teacher', 'Accountant', 'Registrar', 'Parent'];
  const timezones = ['Africa/Lagos', 'Africa/Abuja', 'UTC', 'America/New_York', 'Europe/London'];
  const languages = ['English', 'French', 'Arabic', 'Hausa', 'Yoruba', 'Igbo'];
  const themes = ['light', 'dark', 'auto'];
  const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
  const backupFrequencies = ['hourly', 'daily', 'weekly', 'monthly'];

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section, parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    setSaveStatus('Saving...');
    
    // Simulate API call
    setTimeout(() => {
      setSettings(formData);
      setSaveStatus('Saved successfully!');
      
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    }, 1000);
  };

  const handleAddUser = (userData) => {
    const newUser = {
      id: settings.users.length + 1,
      ...userData,
      status: 'Active',
      lastLogin: 'Never'
    };
    
    setSettings(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    
    setShowAddUserModal(false);
    alert(`User "${userData.fullName}" added successfully!`);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setSettings(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== userId)
      }));
      alert('User deleted successfully!');
    }
  };

  const handleToggleUserStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setSettings(prev => ({
      ...prev,
      users: prev.users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
    }));
    alert(`User status updated to ${newStatus}`);
  };

  const handleBackupNow = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    // Simulate backup process
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          
          // Update last backup time
          const now = new Date();
          const backupTime = now.toISOString().split('T')[0] + ' ' + 
                           now.toTimeString().split(' ')[0].substring(0, 5);
          
          setSettings(prev => ({
            ...prev,
            lastBackup: backupTime,
            backupSize: (Math.random() * 50 + 40).toFixed(1) + ' MB'
          }));
          
          setShowBackupModal(false);
          alert('Backup completed successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleSystemReset = (type) => {
    if (window.confirm(`Are you sure you want to ${type}? This action cannot be undone!`)) {
      alert(`System ${type} completed. Page will reload.`);
      // In a real app, this would make an API call
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kcc-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        if (window.confirm('Import settings? This will overwrite current settings.')) {
          setSettings(importedSettings);
          alert('Settings imported successfully!');
        }
      } catch (error) {
        alert('Error importing settings: Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': '#10b981',
      'Inactive': '#64748b',
      'Suspended': '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const getRoleColor = (role) => {
    const colors = {
      'Admin': '#dc2626',
      'Principal': '#059669',
      'Teacher': '#3b82f6',
      'Accountant': '#8b5cf6',
      'Registrar': '#f59e0b',
      'Parent': '#64748b'
    };
    return colors[role] || '#64748b';
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>System Settings</h1>
          <p className="page-subtitle">Configure system preferences, users, and administration</p>
        </div>
        <div className="header-actions">
          <span className="save-status">{saveStatus}</span>
          <button className="btn-secondary" onClick={() => setShowBackupModal(true)}>
            💾 Backup Now
          </button>
          <button className="btn-primary" onClick={handleSaveSettings}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="settings-tabs">
        <button 
          className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          🏫 General
        </button>
        <button 
          className={`settings-tab ${activeTab === 'academic' ? 'active' : ''}`}
          onClick={() => setActiveTab('academic')}
        >
          📚 Academic
        </button>
        <button 
          className={`settings-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={`settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ Preferences
        </button>
        <button 
          className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security
        </button>
        <button 
          className={`settings-tab ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          💾 Database
        </button>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="settings-section">
          <div className="section-header">
            <h3>General School Settings</h3>
            <p>Configure basic school information and branding</p>
          </div>
          
          <div className="settings-grid">
            <div className="setting-group">
              <label>School Name *</label>
              <input
                type="text"
                value={formData.schoolName || ''}
                onChange={(e) => handleInputChange('general', 'schoolName', e.target.value)}
                placeholder="Enter school name"
              />
            </div>
            
            <div className="setting-group">
              <label>School Short Name</label>
              <input
                type="text"
                value={formData.schoolShortName || ''}
                onChange={(e) => handleInputChange('general', 'schoolShortName', e.target.value)}
                placeholder="e.g., KCC"
              />
            </div>
            
            <div className="setting-group">
              <label>School Address</label>
              <textarea
                value={formData.schoolAddress || ''}
                onChange={(e) => handleInputChange('general', 'schoolAddress', e.target.value)}
                rows="3"
                placeholder="Enter complete school address"
              />
            </div>
            
            <div className="setting-group">
              <label>School Email</label>
              <input
                type="email"
                value={formData.schoolEmail || ''}
                onChange={(e) => handleInputChange('general', 'schoolEmail', e.target.value)}
                placeholder="school@example.com"
              />
            </div>
            
            <div className="setting-group">
              <label>School Phone</label>
              <input
                type="tel"
                value={formData.schoolPhone || ''}
                onChange={(e) => handleInputChange('general', 'schoolPhone', e.target.value)}
                placeholder="+234 800 000 0000"
              />
            </div>
            
            <div className="setting-group">
              <label>School Website</label>
              <input
                type="url"
                value={formData.schoolWebsite || ''}
                onChange={(e) => handleInputChange('general', 'schoolWebsite', e.target.value)}
                placeholder="https://www.example.com"
              />
            </div>
            
            <div className="setting-group">
              <label>School Motto</label>
              <input
                type="text"
                value={formData.schoolMotto || ''}
                onChange={(e) => handleInputChange('general', 'schoolMotto', e.target.value)}
                placeholder="Enter school motto"
              />
            </div>
            
            <div className="setting-group logo-upload">
              <label>School Logo</label>
              <div className="logo-preview">
                {formData.schoolLogo ? (
                  <img src={formData.schoolLogo} alt="School Logo" />
                ) : (
                  <div className="logo-placeholder">
                    <span>🏫</span>
                    <p>Upload School Logo</p>
                  </div>
                )}
              </div>
              <div className="upload-actions">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        handleInputChange('general', 'schoolLogo', e.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <label htmlFor="logo-upload" className="btn-secondary">
                  {formData.schoolLogo ? 'Change Logo' : 'Upload Logo'}
                </label>
                {formData.schoolLogo && (
                  <button 
                    className="btn-secondary"
                    onClick={() => handleInputChange('general', 'schoolLogo', null)}
                  >
                    Remove
                  </button>
                )}
                <small>Recommended: 300x300px, PNG or JPG</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Academic Settings Tab */}
      {activeTab === 'academic' && (
        <div className="settings-section">
          <div className="section-header">
            <h3>Academic Settings</h3>
            <p>Configure academic sessions, terms, and grading system</p>
          </div>
          
          <div className="settings-grid">
            <div className="setting-group">
              <label>Current Academic Session *</label>
              <input
                type="text"
                value={formData.currentSession || ''}
                onChange={(e) => handleInputChange('academic', 'currentSession', e.target.value)}
                placeholder="e.g., 2024/2025"
              />
            </div>
            
            <div className="setting-group">
              <label>Current Term *</label>
              <select
                value={formData.currentTerm || ''}
                onChange={(e) => handleInputChange('academic', 'currentTerm', e.target.value)}
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>
            
            <div className="setting-group">
              <label>Term Start Date</label>
              <input
                type="date"
                value={formData.termStartDate || ''}
                onChange={(e) => handleInputChange('academic', 'termStartDate', e.target.value)}
              />
            </div>
            
            <div className="setting-group">
              <label>Term End Date</label>
              <input
                type="date"
                value={formData.termEndDate || ''}
                onChange={(e) => handleInputChange('academic', 'termEndDate', e.target.value)}
              />
            </div>
            
            <div className="setting-group">
              <label>Grading System</label>
              <select
                value={formData.gradingSystem || ''}
                onChange={(e) => handleInputChange('academic', 'gradingSystem', e.target.value)}
              >
                <option value="Percentage">Percentage</option>
                <option value="Letter Grade">Letter Grade</option>
                <option value="GPA">GPA</option>
              </select>
            </div>
            
            <div className="setting-group">
              <label>Passing Percentage</label>
              <div className="range-input">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.passingPercentage || 50}
                  onChange={(e) => handleInputChange('academic', 'passingPercentage', parseInt(e.target.value))}
                />
                <span className="range-value">{formData.passingPercentage || 50}%</span>
              </div>
              <small>Minimum percentage required to pass</small>
            </div>
            
            <div className="setting-group">
              <label>Maximum CA Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.maxCaScore || 20}
                onChange={(e) => handleInputChange('academic', 'maxCaScore', parseInt(e.target.value))}
              />
              <small>Maximum score for Continuous Assessment</small>
            </div>
            
            <div className="setting-group">
              <label>Maximum Exam Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.maxExamScore || 80}
                onChange={(e) => handleInputChange('academic', 'maxExamScore', parseInt(e.target.value))}
              />
              <small>Maximum score for Examinations</small>
            </div>
          </div>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="settings-section">
          <div className="section-header">
            <div>
              <h3>User Management</h3>
              <p>Manage system users, roles, and permissions</p>
            </div>
            <button 
              className="btn-primary"
              onClick={() => setShowAddUserModal(true)}
            >
              + Add User
            </button>
          </div>
          
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <span className="username">{user.username}</span>
                      </div>
                    </td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span 
                        className="role-badge"
                        style={{ backgroundColor: getRoleColor(user.role) }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(user.status) }}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>{user.lastLogin}</td>
                    <td>
                      <div className="user-actions">
                        <button 
                          className="action-btn edit"
                          title="Edit User"
                          onClick={() => alert(`Edit ${user.fullName}`)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn toggle"
                          title={user.status === 'Active' ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                        >
                          {user.status === 'Active' ? '⏸️' : '▶️'}
                        </button>
                        {user.username !== 'admin' && (
                          <button 
                            className="action-btn delete"
                            title="Delete User"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="permissions-section">
            <h4>Role Permissions</h4>
            <div className="permissions-grid">
              <div className="permission-card">
                <h5>Administrator</h5>
                <ul>
                  <li>Full system access</li>
                  <li>User management</li>
                  <li>System configuration</li>
                  <li>Data backup/restore</li>
                </ul>
              </div>
              <div className="permission-card">
                <h5>Principal</h5>
                <ul>
                  <li>View all data</li>
                  <li>Manage academic settings</li>
                  <li>Approve results</li>
                  <li>Generate reports</li>
                </ul>
              </div>
              <div className="permission-card">
                <h5>Teacher</h5>
                <ul>
                  <li>Enter results</li>
                  <li>View class data</li>
                  <li>Update attendance</li>
                  <li>Generate student reports</li>
                </ul>
              </div>
              <div className="permission-card">
                <h5>Accountant</h5>
                <ul>
                  <li>Manage fees</li>
                  <li>Generate invoices</li>
                  <li>View payment records</li>
                  <li>Financial reports</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="settings-section">
          <div className="section-header">
            <h3>System Preferences</h3>
            <p>Configure system behavior and appearance</p>
          </div>
          
          <div className="settings-grid">
            <div className="setting-group">
              <label>Timezone</label>
              <select
                value={formData.timezone || ''}
                onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            
            <div className="setting-group">
              <label>Date Format</label>
              <select
                value={formData.dateFormat || ''}
                onChange={(e) => handleInputChange('preferences', 'dateFormat', e.target.value)}
              >
                {dateFormats.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>
            
            <div className="setting-group">
              <label>Language</label>
              <select
                value={formData.language || ''}
                onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            
            <div className="setting-group">
              <label>Theme</label>
              <select
                value={formData.theme || ''}
                onChange={(e) => handleInputChange('preferences', 'theme', e.target.value)}
              >
                {themes.map(theme => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.autoBackup || false}
                  onChange={(e) => handleInputChange('preferences', 'autoBackup', e.target.checked)}
                />
                <span>Enable Automatic Backup</span>
              </label>
            </div>
            
            {formData.autoBackup && (
              <>
                <div className="setting-group">
                  <label>Backup Frequency</label>
                  <select
                    value={formData.backupFrequency || ''}
                    onChange={(e) => handleInputChange('preferences', 'backupFrequency', e.target.value)}
                  >
                    {backupFrequencies.map(freq => (
                      <option key={freq} value={freq}>
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="setting-group">
                  <label>Backup Time</label>
                  <input
                    type="time"
                    value={formData.backupTime || ''}
                    onChange={(e) => handleInputChange('preferences', 'backupTime', e.target.value)}
                  />
                </div>
              </>
            )}
            
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications || false}
                  onChange={(e) => handleInputChange('preferences', 'emailNotifications', e.target.checked)}
                />
                <span>Email Notifications</span>
              </label>
            </div>
            
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.smsNotifications || false}
                  onChange={(e) => handleInputChange('preferences', 'smsNotifications', e.target.checked)}
                />
                <span>SMS Notifications</span>
              </label>
              <small>Requires SMS credits</small>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings Tab */}
      {activeTab === 'security' && (
        <div className="settings-section">
          <div className="section-header">
            <h3>Security Settings</h3>
            <p>Configure security policies and authentication</p>
          </div>
          
          <div className="settings-grid">
            <div className="setting-group">
              <label>Minimum Password Length</label>
              <input
                type="number"
                min="6"
                max="32"
                value={formData.passwordPolicy?.minLength || 8}
                onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
              />
            </div>
            
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy?.requireUppercase || false}
                  onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                />
                <span>Require Uppercase Letters</span>
              </label>
            </div>
            
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy?.requireNumbers || false}
                  onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                />
                <span>Require Numbers</span>
              </label>
            </div>
            
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy?.requireSpecialChars || false}
                  onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
                />
                <span>Require Special Characters</span>
              </label>
            </div>
            
            <div className="setting-group">
              <label>Password Expiry (Days)</label>
              <input
                type="number"
                min="0"
                max="365"
                value={formData.passwordPolicy?.expiryDays || 90}
                onChange={(e) => handleNestedChange('security', 'passwordPolicy', 'expiryDays', parseInt(e.target.value))}
              />
              <small>Set to 0 for no expiry</small>
            </div>
            
            <div className="setting-group">
              <label>Maximum Login Attempts</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.loginAttempts || 5}
                onChange={(e) => handleInputChange('security', 'loginAttempts', parseInt(e.target.value))}
              />
              <small>Before account lockout</small>
            </div>
            
            <div className="setting-group">
              <label>Session Timeout (Minutes)</label>
              <input
                type="number"
                min="1"
                max="240"
                value={formData.sessionTimeout || 30}
                onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.twoFactorAuth || false}
                  onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                />
                <span>Enable Two-Factor Authentication</span>
              </label>
              <small>Requires user's mobile number</small>
            </div>
          </div>
          
          <div className="security-audit">
            <h4>Security Audit Log</h4>
            <div className="audit-log">
              <div className="audit-entry">
                <span className="audit-time">2024-01-15 09:30</span>
                <span className="audit-action">User "admin" logged in from 192.168.1.100</span>
              </div>
              <div className="audit-entry">
                <span className="audit-time">2024-01-14 16:45</span>
                <span className="audit-action">User "teacher1" updated student records</span>
              </div>
              <div className="audit-entry">
                <span className="audit-time">2024-01-14 14:20</span>
                <span className="audit-action">User "principal" approved term results</span>
              </div>
              <div className="audit-entry">
                <span className="audit-time">2024-01-14 02:00</span>
                <span className="audit-action">System backup completed successfully</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Settings Tab */}
      {activeTab === 'database' && (
        <div className="settings-section">
          <div className="section-header">
            <h3>Database Management</h3>
            <p>Manage database backups, imports, and exports</p>
          </div>
          
          <div className="database-stats">
            <div className="stat-card">
              <div className="stat-icon">💾</div>
              <div className="stat-content">
                <h4>Last Backup</h4>
                <div className="stat-value">{settings.lastBackup || 'Never'}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h4>Database Size</h4>
                <div className="stat-value">{settings.backupSize || 'Unknown'}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h4>System Version</h4>
                <div className="stat-value">{settings.databaseVersion || '1.0.0'}</div>
              </div>
            </div>
          </div>
          
          <div className="database-actions">
            <div className="action-card">
              <h5>Export Settings</h5>
              <p>Export all system settings as JSON file</p>
              <button className="btn-secondary" onClick={exportSettings}>
                Export Settings
              </button>
            </div>
            
            <div className="action-card">
              <h5>Import Settings</h5>
              <p>Import settings from JSON backup file</p>
              <input
                type="file"
                id="import-settings"
                accept=".json"
                onChange={importSettings}
                style={{ display: 'none' }}
              />
              <label htmlFor="import-settings" className="btn-secondary">
                Import Settings
              </label>
            </div>
            
            <div className="action-card">
              <h5>System Diagnostics</h5>
              <p>Run system health check and diagnostics</p>
              <button 
                className="btn-secondary"
                onClick={() => alert('System diagnostics completed. All systems operational.')}
              >
                Run Diagnostics
              </button>
            </div>
            
            <div className="action-card danger">
              <h5>Danger Zone</h5>
              <p>Advanced system operations</p>
              <div className="danger-actions">
                <button 
                  className="btn-danger"
                  onClick={() => setShowResetModal(true)}
                >
                  Reset System
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => handleSystemReset('clear all data')}
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddUserModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-row">
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Role *</label>
                    <select required>
                      <option value="">Select Role</option>
                      {userRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Initial Password *</label>
                    <input
                      type="password"
                      placeholder="Enter initial password"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Permissions</label>
                  <div className="permissions-checklist">
                    {['Manage Students', 'Manage Teachers', 'Enter Results', 'View Reports', 'Manage Fees', 'System Configuration'].map(permission => (
                      <label key={permission} className="checkbox-label">
                        <input type="checkbox" />
                        <span>{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowAddUserModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleAddUser({
                  username: 'newuser',
                  fullName: 'New User',
                  email: 'newuser@kcc.edu.ng',
                  role: 'Teacher'
                })}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>System Backup</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowBackupModal(false);
                  setIsBackingUp(false);
                  setBackupProgress(0);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="backup-info">
                <div className="backup-icon">💾</div>
                <h3>Create System Backup</h3>
                <p>This will create a complete backup of all system data including:</p>
                
                <ul className="backup-list">
                  <li>Student records and admissions</li>
                  <li>Teacher profiles and assignments</li>
                  <li>Academic results and positions</li>
                  <li>System settings and configurations</li>
                  <li>User accounts and permissions</li>
                </ul>
                
                {isBackingUp ? (
                  <div className="backup-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${backupProgress}%` }}
                      />
                    </div>
                    <div className="progress-text">
                      <span>Backing up... {backupProgress}%</span>
                      <span>Please do not close this window</span>
                    </div>
                  </div>
                ) : (
                  <div className="backup-stats">
                    <div className="stat">
                      <span className="stat-label">Estimated Size:</span>
                      <span className="stat-value">{settings.backupSize || '45.2 MB'}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Last Backup:</span>
                      <span className="stat-value">{settings.lastBackup || 'Never'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowBackupModal(false);
                  setIsBackingUp(false);
                  setBackupProgress(0);
                }}
                disabled={isBackingUp}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleBackupNow}
                disabled={isBackingUp}
              >
                {isBackingUp ? 'Backing Up...' : 'Start Backup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-content reset-modal">
            <div className="modal-header">
              <h2>System Reset</h2>
              <button 
                className="close-btn"
                onClick={() => setShowResetModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="reset-warning">
                <div className="warning-icon">⚠️</div>
                <h3>Warning: Critical Operation</h3>
                <p>This action will reset the system to default settings. All custom configurations will be lost.</p>
                
                <div className="reset-options">
                  <div className="reset-option">
                    <h4>Soft Reset</h4>
                    <p>Reset only system settings to defaults</p>
                    <ul>
                      <li>Preserves all student data</li>
                      <li>Preserves all academic records</li>
                      <li>Resets configurations only</li>
                    </ul>
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        handleSystemReset('soft reset');
                        setShowResetModal(false);
                      }}
                    >
                      Perform Soft Reset
                    </button>
                  </div>
                  
                  <div className="reset-option danger">
                    <h4>Hard Reset</h4>
                    <p>Reset entire system to factory defaults</p>
                    <ul>
                      <li>Deletes all student data</li>
                      <li>Deletes all academic records</li>
                      <li>Resets everything to defaults</li>
                    </ul>
                    <button 
                      className="btn-danger"
                      onClick={() => {
                        handleSystemReset('hard reset');
                        setShowResetModal(false);
                      }}
                    >
                      Perform Hard Reset
                    </button>
                  </div>
                </div>
                
                <div className="reset-note">
                  <p><strong>Note:</strong> Always create a backup before performing any reset operation.</p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;