// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { 
  FiGrid, 
  FiMenu,
  FiHome,
  FiSettings,
  FiX,
  FiLock,
  FiUser,
  FiLogOut
} from 'react-icons/fi';
import { 
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaChartLine
} from 'react-icons/fa';
import { 
  MdSchool,
  MdAssignment
} from 'react-icons/md';
import Dashboard from './pages/Dashboard';
import Admissions from './pages/Admissions';
import Classes from './pages/Classes';
import Teachers from './pages/Teachers';
import Academics from './pages/Academics';
import Results from './pages/ResultsPage';
import Settings from './pages/Settings';
import Login from './pages/Login';
import './App.css';
import logo from './components/images/kcc.jpeg';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuth = () => {
      const savedAuth = localStorage.getItem('isAuthenticated');
      const savedUser = localStorage.getItem('user');
      const authTimestamp = localStorage.getItem('authTimestamp');
      
      if (savedAuth === 'true' && savedUser && authTimestamp) {
        // Check if session is still valid (24 hours)
        const currentTime = new Date().getTime();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (currentTime - parseInt(authTimestamp) < sessionDuration) {
          setIsAuthenticated(true);
          setUser(JSON.parse(savedUser));
        } else {
          // Session expired
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('user');
          localStorage.removeItem('authTimestamp');
          toast.error('Session expired. Please login again.');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false); // Close sidebar by default on mobile
      } else {
        setSidebarOpen(true); // Open sidebar by default on desktop
      }
    };

    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  const handleContentClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const handleLogin = (username, password) => {
    return new Promise((resolve) => {
      // Default credentials
      const defaultUsername = 'admin';
      const defaultPassword = 'kcc123';
      
      if (username === defaultUsername && password === defaultPassword) {
        const userData = {
          username,
          role: 'Administrator',
          loginTime: new Date().toLocaleString()
        };
        
        setIsAuthenticated(true);
        setUser(userData);
        
        // Save to localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authTimestamp', new Date().getTime().toString());
        
        toast.success('Login successful!');
        resolve(true);
      } else {
        toast.error('Invalid username or password');
        resolve(false);
      }
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('authTimestamp');
    toast.success('Logged out successfully');
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 4000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
      
      <Router>
        <div className="app">
          {/* Render login page if not authenticated */}
          {!isAuthenticated ? (
            <Routes>
              <Route path="/" element={<Login onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            <>
              <header className="header">
                <div className="header-left">
                  <button 
                    className="menu-toggle" 
                    onClick={toggleSidebar}
                    aria-label="Toggle menu"
                  >
                    {sidebarOpen && !isMobile ? <FiX size={24} /> : <FiMenu size={24} />}
                  </button>
                  <div className="logo-container">
                    <div className="school-logo">
                      <img 
                        src={logo} 
                        alt="KCC Logo" 
                        className="logo-image"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Centered School Name */}
                <div className="header-center">
                  <h2 className="school-name">Kamaluddeen Comprehensive College</h2>
                </div>
                
                {/* User info and logout */}
                <div className="header-right">
                  <div className="user-info">
                    <div className="user-avatar">
                      <FiUser size={20} />
                    </div>
                    <div className="user-details">
                      <span className="username">{user?.username}</span>
                      <span className="user-role">{user?.role}</span>
                    </div>
                    <button 
                      className="logout-btn"
                      onClick={handleLogout}
                      title="Logout"
                    >
                      <FiLogOut size={18} />
                    </button>
                  </div>
                </div>
              </header>

              <div className="main-container">
                {/* Overlay for mobile when sidebar is open */}
                {isMobile && sidebarOpen && (
                  <div 
                    className="sidebar-overlay" 
                    onClick={() => setSidebarOpen(false)}
                  />
                )}

                {/* Sidebar with conditional classes */}
                <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${isMobile ? 'mobile' : ''}`}>
                  <nav>
                    <ul className="nav-menu">
                      <li>
                        <Link 
                          to="/" 
                          className="nav-link"
                          onClick={() => isMobile && setSidebarOpen(false)}
                        >
                          <span className="nav-icon">
                            <FiGrid size={18} />
                          </span>
                          <span className="nav-text">Dashboard</span>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/admissions" 
                          className="nav-link"
                          onClick={() => isMobile && setSidebarOpen(false)}
                        >
                          <span className="nav-icon">
                            <MdSchool size={18} />
                          </span>
                          <span className="nav-text">Admissions</span>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/classes" 
                          className="nav-link"
                          onClick={() => isMobile && setSidebarOpen(false)}
                        >
                          <span className="nav-icon">
                            <FaUserGraduate size={18} />
                          </span>
                          <span className="nav-text">Classes</span>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/teachers" 
                          className="nav-link"
                          onClick={() => isMobile && setSidebarOpen(false)}
                        >
                          <span className="nav-icon">
                            <FaChalkboardTeacher size={18} />
                          </span>
                          <span className="nav-text">Teachers</span>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/academics" 
                          className="nav-link"
                          onClick={() => isMobile && setSidebarOpen(false)}
                        >
                          <span className="nav-icon">
                            <FaBook size={18} />
                          </span>
                          <span className="nav-text">Academics</span>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/results" 
                          className="nav-link"
                          onClick={() => isMobile && setSidebarOpen(false)}
                        >
                          <span className="nav-icon">
                            <FaChartLine size={18} />
                          </span>
                          <span className="nav-text">Results & Positions</span>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/settings" 
                          className="nav-link"
                          onClick={() => isMobile && setSidebarOpen(false)}
                        >
                          <span className="nav-icon">
                            <FiSettings size={18} />
                          </span>
                          <span className="nav-text">Settings</span>
                        </Link>
                      </li>
                    </ul>
                  </nav>
                  
                  <div className="sidebar-footer">
                    <div className="school-info">
                      <h4>
                        <FiHome size={16} style={{ marginRight: '8px' }} />
                        KCC Info
                      </h4>
                      <p>Est. 2024</p>
                      <p>Pre-Nursery to JSS 3</p>
                    </div>
                    <div className="user-status">
                      <FiLock size={14} style={{ marginRight: '6px' }} />
                      <small>Logged in as {user?.username}</small>
                    </div>
                  </div>
                </aside>

                <main 
                  className={`main-content ${sidebarOpen && !isMobile ? 'with-sidebar' : ''}`}
                  onClick={handleContentClick}
                >
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/admissions" element={<Admissions />} />
                    <Route path="/classes" element={<Classes />} />
                    <Route path="/teachers" element={<Teachers />} />
                    <Route path="/academics" element={<Academics />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </>
          )}
        </div>
      </Router>
    </>
  );
}

export default App;