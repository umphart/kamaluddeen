// src/pages/Setup.jsx (Simplified to just check and redirect)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import './Setup.css';

const Setup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Checking system status...');

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      setMessage('Checking if admin exists...');
      const { exists } = await userService.adminExists();
      
      if (exists) {
        // Admin exists, redirect to login
        setMessage('Admin exists. Redirecting to login...');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        // No admin exists, redirect to create account
        setMessage('No admin found. Redirecting to account creation...');
        setTimeout(() => navigate('/create-account'), 1000);
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
      setMessage('Error checking system. Please try again.');
      setTimeout(() => navigate('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <div className="setup-logo">
            <div className="logo-circle">
              <div className="logo-placeholder">
                KCC
              </div>
            </div>
          </div>
          <h2>System Setup</h2>
          <p className="setup-subtitle">Initializing KCC Admin Portal</p>
        </div>

        <div className="setup-content">
          <div className="setup-message">
            <div className="loading-spinner"></div>
            <p>{message}</p>
          </div>
          
          <div className="setup-info">
            <p>If you're not redirected automatically, please:</p>
            <div className="setup-actions">
              <button 
                onClick={() => navigate('/create-account')}
                className="setup-action-btn"
              >
                Create Account
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="setup-action-btn secondary"
              >
                Login
              </button>
            </div>
          </div>
        </div>

        <div className="setup-footer">
          <p className="school-info">
            <strong>Kamaluddeen Comprehensive College</strong><br />
            Admin Portal Setup
          </p>
        </div>
      </div>
    </div>
  );
};

export default Setup;