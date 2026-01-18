// src/pages/Login.jsx - Updated with Show Password
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiUser, FiLogIn, FiAlertCircle, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import './Login.css';
import schoolLogo from './kcc.jpeg';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Add showPassword state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');

    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-circle">
              <img 
                src={schoolLogo} 
                alt="KCC Logo" 
                className="school-logo"
              />
            </div>
          </div>
          <h2>KCC Admin Portal</h2>
          <p className="login-subtitle">Kamaluddeen Comprehensive College</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <FiAlertCircle /> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <FiUser className="input-icon" />
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="form-input"
              required
              autoFocus
              disabled={loginLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FiLock className="input-icon" />
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="form-input"
                required
                disabled={loginLoading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                disabled={loginLoading}
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loginLoading}
          >
            {loginLoading ? (
              <span className="loading-spinner-small"></span>
            ) : (
              <>
                <FiLogIn className="button-icon" />
                {loginLoading ? 'Logging in...' : 'Login'}
              </>
            )}
          </button>

          {/* Add Create Account Link */}
          <div className="create-account-section">
            <p className="divider">or</p>
            <Link to="/create-account" className="create-account-link">
              <FiUserPlus className="link-icon" />
              Create New Account
            </Link>
          </div>
        </form>

        <div className="login-footer">
          <p className="school-info">
            <strong>Kamaluddeen Comprehensive College</strong><br />
            Pre-Nursery to JSS 3<br />
            Established 2024
          </p>
          <div className="security-note">
            <FiLock size={12} />
            <small>Secure access for authorized personnel only</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;