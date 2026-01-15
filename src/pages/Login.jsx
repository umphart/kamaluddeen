// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate for v6
import { FiLock, FiUser, FiLogIn } from 'react-icons/fi';
import './Login.css';
import schoolLogo from './kcc.jpeg';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // useNavigate for v6

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await onLogin(username, password);
      if (success) {
        // Login successful - navigate to dashboard
        navigate('/');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
              {error}
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
            />
            <div className="hint-text">Default: admin</div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FiLock className="input-icon" />
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="form-input"
              required
            />
            <div className="hint-text">Default: kcc123</div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner-small"></span>
            ) : (
              <>
                <FiLogIn className="button-icon" />
                {loading ? 'Logging in...' : 'Login'}
              </>
            )}
          </button>
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