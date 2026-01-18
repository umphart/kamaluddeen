import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiCheck, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';
import './CreateAccount.css';
import schoolLogo from './kcc.jpeg'; 

const CreateAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'admin' // Default role
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username || !formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { success, error } = await userService.createAdmin(
        formData.username.trim(),
        formData.password,
        formData.role
      );

      if (success) {
        toast.success('Account created successfully! Please login.');
        navigate('/login');
      } else {
        toast.error(error?.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Create account error:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-account-container">
      <div className="create-account-card">    
        <div className="create-account-header">
         <div className="create-account-logo">
  <div className="logo-circle">
    <img 
      src={schoolLogo} 
      alt="KCC Logo" 
      className="school-logo"
    />
  </div>
</div>
          <h2>Create Admin Account</h2>
          <p className="create-account-subtitle">Set up your administrator credentials</p>
        </div>

        <form className="create-account-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <FiUser className="input-icon" />
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              required
              disabled={loading}
            />
            {errors.username && (
              <div className="error-text">
                <FiAlertCircle /> {errors.username}
              </div>
            )}
            <div className="hint-text">3-20 characters, letters, numbers, and underscores only</div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FiLock className="input-icon" />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Choose a strong password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              required
              disabled={loading}
            />
            {errors.password && (
              <div className="error-text">
                <FiAlertCircle /> {errors.password}
              </div>
            )}
            <div className="hint-text">Minimum 6 characters</div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <FiLock className="input-icon" />
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              required
              disabled={loading}
            />
            {errors.confirmPassword && (
              <div className="error-text">
                <FiAlertCircle /> {errors.confirmPassword}
              </div>
            )}
          </div>


          <button
            type="submit"
            className="create-account-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner-small"></span>
            ) : (
              <>
                <FiCheck className="button-icon" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="create-account-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
          <p className="school-info">
            <strong>Kamaluddeen Comprehensive College</strong><br />
            Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;