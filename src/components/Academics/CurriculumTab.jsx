// src/components/Academics/CurriculumTab.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CurriculumTab = () => {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [curriculumData, setCurriculumData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [activeView, setActiveView] = useState('standards'); // 'standards', 'outcomes', 'resources'

  const levels = [
    { id: 'all', name: 'All Levels', color: '#64748b' },
    { id: 'PN', name: 'Pre-Nursery', color: '#10b981' },
    { id: 'NU', name: 'Nursery', color: '#3b82f6' },
    { id: 'PR', name: 'Primary', color: '#f59e0b' },
    { id: 'JS', name: 'Junior Secondary', color: '#8b5cf6' }
  ];

  const subjects = [
    { id: 'all', name: 'All Subjects' },
    { id: 'math', name: 'Mathematics' },
    { id: 'english', name: 'English Language' },
    { id: 'science', name: 'Basic Science' },
    { id: 'social', name: 'Social Studies' },
    { id: 'computer', name: 'Computer Studies' },
    { id: 'islamic', name: 'Islamic Studies' }
  ];

  // Sample curriculum data
  const sampleCurriculum = [
    {
      id: 1,
      level: 'PR',
      grade: 'Primary 1',
      subject: 'Mathematics',
      standards: [
        {
          id: 'MATH-P1-001',
          code: 'MATH-P1-001',
          description: 'Count, read, and write numbers from 0 to 100',
          category: 'Number Sense',
          benchmarks: [
            'Count forward and backward from any number up to 100',
            'Read and write numerals up to 100',
            'Identify place value (tens and ones)'
          ],
          resources: 3,
          assessments: 2,
          status: 'Active'
        },
        {
          id: 'MATH-P1-002',
          code: 'MATH-P1-002',
          description: 'Add and subtract within 20',
          category: 'Operations',
          benchmarks: [
            'Add single-digit numbers using objects',
            'Subtract single-digit numbers using objects',
            'Solve simple word problems involving addition and subtraction'
          ],
          resources: 4,
          assessments: 3,
          status: 'Active'
        },
        {
          id: 'MATH-P1-003',
          code: 'MATH-P1-003',
          description: 'Identify basic shapes and their attributes',
          category: 'Geometry',
          benchmarks: [
            'Identify circles, squares, triangles, and rectangles',
            'Describe attributes of basic shapes',
            'Combine shapes to form new shapes'
          ],
          resources: 2,
          assessments: 2,
          status: 'Active'
        }
      ]
    },
    {
      id: 2,
      level: 'PR',
      grade: 'Primary 1',
      subject: 'English Language',
      standards: [
        {
          id: 'ENG-P1-001',
          code: 'ENG-P1-001',
          description: 'Recognize and name all upper and lowercase letters',
          category: 'Phonemic Awareness',
          benchmarks: [
            'Identify all 26 uppercase letters',
            'Identify all 26 lowercase letters',
            'Match uppercase and lowercase letters'
          ],
          resources: 5,
          assessments: 3,
          status: 'Active'
        },
        {
          id: 'ENG-P1-002',
          code: 'ENG-P1-002',
          description: 'Read common high-frequency words',
          category: 'Reading Fluency',
          benchmarks: [
            'Read 50 high-frequency words by sight',
            'Use context to confirm or self-correct word recognition',
            'Read emergent-reader texts with purpose and understanding'
          ],
          resources: 4,
          assessments: 2,
          status: 'Active'
        }
      ]
    },
    {
      id: 3,
      level: 'JS',
      grade: 'JSS 1',
      subject: 'Mathematics',
      standards: [
        {
          id: 'MATH-JS1-001',
          code: 'MATH-JS1-001',
          description: 'Understand and apply the concept of fractions',
          category: 'Number Sense',
          benchmarks: [
            'Identify fractions as parts of a whole',
            'Compare and order fractions',
            'Add and subtract fractions with like denominators'
          ],
          resources: 6,
          assessments: 4,
          status: 'Active'
        },
        {
          id: 'MATH-JS1-002',
          code: 'MATH-JS1-002',
          description: 'Solve problems involving algebraic expressions',
          category: 'Algebra',
          benchmarks: [
            'Simplify algebraic expressions',
            'Solve simple linear equations',
            'Translate word problems into algebraic expressions'
          ],
          resources: 5,
          assessments: 3,
          status: 'Active'
        }
      ]
    }
  ];

  useEffect(() => {
    loadCurriculumData();
  }, [selectedLevel, selectedSubject]);

  const loadCurriculumData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filtered = [...sampleCurriculum];

      if (selectedLevel !== 'all') {
        filtered = filtered.filter(item => item.level === selectedLevel);
      }

      if (selectedSubject !== 'all') {
        filtered = filtered.filter(item => 
          item.subject.toLowerCase().includes(subjects.find(s => s.id === selectedSubject)?.name.toLowerCase() || '')
        );
      }

      setCurriculumData(filtered);
      setLoading(false);
    }, 500);
  };

  const handleViewCurriculum = (curriculum) => {
    setSelectedCurriculum(curriculum);
    setShowCurriculumModal(true);
  };

  const handleAddStandard = () => {
    alert('Feature coming soon: Add new curriculum standard');
  };

  const handleExportCurriculum = (grade, subject) => {
    const data = curriculumData.find(c => c.grade === grade && c.subject === subject);
    if (data) {
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${grade}_${subject.replace(' ', '_')}_Curriculum.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const getLevelName = (code) => {
    const level = levels.find(l => l.id === code);
    return level ? level.name : code;
  };

  const getLevelColor = (code) => {
    const level = levels.find(l => l.id === code);
    return level ? level.color : '#64748b';
  };

  const getSubjectStats = (grade, subject) => {
    const curriculum = curriculumData.find(c => c.grade === grade && c.subject === subject);
    if (!curriculum) return { standards: 0, resources: 0, assessments: 0 };
    
    return {
      standards: curriculum.standards.length,
      resources: curriculum.standards.reduce((sum, std) => sum + std.resources, 0),
      assessments: curriculum.standards.reduce((sum, std) => sum + std.assessments, 0)
    };
  };

  const getGradeGroups = () => {
    const groups = {};
    curriculumData.forEach(item => {
      if (!groups[item.grade]) {
        groups[item.grade] = [];
      }
      groups[item.grade].push(item);
    });
    return groups;
  };

  return (
    <div className="tab-content">
      <div className="curriculum-container">
        <div className="curriculum-header">
          <div className="header-content">
            <h2>Curriculum Framework</h2>
            <p>Manage learning standards, outcomes, and teaching resources</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => alert('Curriculum import feature coming soon!')}
            >
              📥 Import Curriculum
            </button>
          </div>
        </div>

        {/* Curriculum Stats */}
        <div className="curriculum-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Total Standards</h3>
              <div className="stat-number">
                {curriculumData.reduce((sum, item) => sum + item.standards.length, 0)}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Learning Resources</h3>
              <div className="stat-number">
                {curriculumData.reduce((sum, item) => 
                  sum + item.standards.reduce((s, std) => s + std.resources, 0), 0
                )}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>Assessments</h3>
              <div className="stat-number">
                {curriculumData.reduce((sum, item) => 
                  sum + item.standards.reduce((s, std) => s + std.assessments, 0), 0
                )}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>Coverage</h3>
              <div className="stat-number">85%</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="curriculum-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Educational Level</label>
              <div className="level-buttons">
                {levels.map(level => (
                  <button
                    key={level.id}
                    className={`level-btn ${selectedLevel === level.id ? 'active' : ''}`}
                    style={selectedLevel === level.id ? { 
                      backgroundColor: level.color,
                      color: 'white'
                    } : {}}
                    onClick={() => setSelectedLevel(level.id)}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-group">
              <label>Subject Area</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="subject-select"
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="view-toggle">
            <button
              className={`view-btn ${activeView === 'standards' ? 'active' : ''}`}
              onClick={() => setActiveView('standards')}
            >
              📋 Standards
            </button>
            <button
              className={`view-btn ${activeView === 'outcomes' ? 'active' : ''}`}
              onClick={() => setActiveView('outcomes')}
            >
              🎯 Learning Outcomes
            </button>
            <button
              className={`view-btn ${activeView === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveView('resources')}
            >
              📚 Teaching Resources
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading curriculum data...</p>
          </div>
        ) : curriculumData.length === 0 ? (
          <div className="empty-curriculum">
            <div className="empty-content">
              <span className="empty-icon">📋</span>
              <h3>No Curriculum Data Found</h3>
              <p>No curriculum standards found for the selected filters.</p>
              <div className="empty-actions">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setSelectedLevel('all');
                    setSelectedSubject('all');
                  }}
                >
                  Reset Filters
                </button>
                <button 
                  className="btn-secondary"
                  onClick={handleAddStandard}
                >
                  Add First Standard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="curriculum-content">
            {/* Standards View */}
            {activeView === 'standards' && (
              <div className="standards-view">
                {Object.entries(getGradeGroups()).map(([grade, items]) => (
                  <div key={grade} className="grade-section">
                    <div className="grade-header">
                      <h3>
                        {grade}
                        <span 
                          className="level-badge"
                          style={{ backgroundColor: getLevelColor(items[0].level) }}
                        >
                          {getLevelName(items[0].level)}
                        </span>
                      </h3>
                      <div className="grade-stats">
                        <span>{items.length} subjects</span>
                        <span>•</span>
                        <span>{items.reduce((sum, item) => sum + item.standards.length, 0)} standards</span>
                      </div>
                    </div>
                    
                    <div className="subjects-grid">
                      {items.map(item => {
                        const stats = getSubjectStats(item.grade, item.subject);
                        return (
                          <div key={`${item.grade}-${item.subject}`} className="subject-card">
                            <div className="subject-card-header">
                              <h4>{item.subject}</h4>
                              <span 
                                className="subject-status"
                                style={{ 
                                  backgroundColor: stats.standards > 0 ? '#d1fae5' : '#fef3c7',
                                  color: stats.standards > 0 ? '#065f46' : '#92400e'
                                }}
                              >
                                {stats.standards > 0 ? 'Active' : 'Draft'}
                              </span>
                            </div>
                            
                            <div className="subject-stats">
                              <div className="stat-item">
                                <div className="stat-number">{stats.standards}</div>
                                <div className="stat-label">Standards</div>
                              </div>
                              <div className="stat-item">
                                <div className="stat-number">{stats.resources}</div>
                                <div className="stat-label">Resources</div>
                              </div>
                              <div className="stat-item">
                                <div className="stat-number">{stats.assessments}</div>
                                <div className="stat-label">Assessments</div>
                              </div>
                            </div>
                            
                            <div className="subject-actions">
                              <button 
                                className="btn-secondary small"
                                onClick={() => handleViewCurriculum(item)}
                              >
                                View Details
                              </button>
                              <button 
                                className="btn-primary small"
                                onClick={() => handleExportCurriculum(item.grade, item.subject)}
                              >
                                Export
                              </button>
                            </div>
                            
                            <div className="subject-progress">
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill"
                                  style={{ width: `${(stats.standards / 10) * 100}%` }}
                                />
                              </div>
                              <span className="progress-text">
                                {Math.min(stats.standards, 10)}/10 standards
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Learning Outcomes View */}
            {activeView === 'outcomes' && (
              <div className="outcomes-view">
                <div className="coming-soon-feature">
                  <div className="feature-icon">🎯</div>
                  <h3>Learning Outcomes Module</h3>
                  <p>Track and measure student learning outcomes against curriculum standards</p>
                  
                  <div className="feature-grid">
                    <div className="feature-card">
                      <div className="feature-icon-small">📊</div>
                      <h4>Outcome Tracking</h4>
                      <p>Monitor student progress against learning objectives</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon-small">📈</div>
                      <h4>Progress Analytics</h4>
                      <p>Visualize learning growth and identify areas for improvement</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon-small">🎓</div>
                      <h4>Mastery Levels</h4>
                      <p>Track student mastery of specific skills and concepts</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon-small">📋</div>
                      <h4>Reporting</h4>
                      <p>Generate comprehensive learning outcome reports</p>
                    </div>
                  </div>
                  
                  <div className="feature-actions">
                    <Link to="/admissions" className="btn-primary">
                      Go to Student Progress →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Teaching Resources View */}
            {activeView === 'resources' && (
              <div className="resources-view">
                <div className="coming-soon-feature">
                  <div className="feature-icon">📚</div>
                  <h3>Teaching Resources Hub</h3>
                  <p>Access and manage educational materials, lesson plans, and teaching aids</p>
                  
                  <div className="resource-categories">
                    <div className="category-card">
                      <h4>📖 Lesson Plans</h4>
                      <p>Structured teaching guides for each standard</p>
                      <span className="count-badge">24 plans</span>
                    </div>
                    <div className="category-card">
                      <h4>🖼️ Visual Aids</h4>
                      <p>Charts, diagrams, and multimedia resources</p>
                      <span className="count-badge">156 items</span>
                    </div>
                    <div className="category-card">
                      <h4>📝 Worksheets</h4>
                      <p>Printable exercises and activities</p>
                      <span className="count-badge">89 sheets</span>
                    </div>
                    <div className="category-card">
                      <h4>🎬 Multimedia</h4>
                      <p>Videos, animations, and interactive content</p>
                      <span className="count-badge">42 files</span>
                    </div>
                    <div className="category-card">
                      <h4>📋 Assessments</h4>
                      <p>Quizzes, tests, and evaluation tools</p>
                      <span className="count-badge">67 items</span>
                    </div>
                    <div className="category-card">
                      <h4>📚 Textbooks</h4>
                      <p>Digital and physical textbook references</p>
                      <span className="count-badge">12 books</span>
                    </div>
                  </div>
                  
                  <div className="feature-actions">
                    <button className="btn-primary">
                      Browse Resources
                    </button>
                    <button className="btn-secondary">
                      Upload New Resource
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions-panel">
          <h4>Quick Actions</h4>
          <div className="action-buttons-grid">
            <button className="action-btn">
              <span className="action-icon">➕</span>
              Add New Standard
            </button>
            <button className="action-btn">
              <span className="action-icon">📥</span>
              Bulk Import
            </button>
            <button className="action-btn">
              <span className="action-icon">🔄</span>
              Sync with National Curriculum
            </button>
            <button className="action-btn">
              <span className="action-icon">📊</span>
              Generate Coverage Report
            </button>
            <button className="action-btn">
              <span className="action-icon">👨‍🏫</span>
              Assign to Teachers
            </button>
            <button className="action-btn">
              <span className="action-icon">📅</span>
              Map to Academic Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Detail Modal */}
      {showCurriculumModal && selectedCurriculum && (
        <div className="modal-overlay">
          <div className="modal-content curriculum-modal">
            <div className="modal-header">
              <h2>
                {selectedCurriculum.grade} - {selectedCurriculum.subject}
                <span 
                  className="level-badge"
                  style={{ backgroundColor: getLevelColor(selectedCurriculum.level) }}
                >
                  {getLevelName(selectedCurriculum.level)}
                </span>
              </h2>
              <button 
                className="close-btn"
                onClick={() => setShowCurriculumModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="curriculum-details">
                <div className="details-header">
                  <div className="header-stats">
                    <div className="stat">
                      <div className="stat-number">{selectedCurriculum.standards.length}</div>
                      <div className="stat-label">Standards</div>
                    </div>
                    <div className="stat">
                      <div className="stat-number">
                        {selectedCurriculum.standards.reduce((sum, std) => sum + std.resources, 0)}
                      </div>
                      <div className="stat-label">Resources</div>
                    </div>
                    <div className="stat">
                      <div className="stat-number">
                        {selectedCurriculum.standards.reduce((sum, std) => sum + std.assessments, 0)}
                      </div>
                      <div className="stat-label">Assessments</div>
                    </div>
                  </div>
                </div>
                
                <div className="standards-list">
                  <h3>Curriculum Standards</h3>
                  {selectedCurriculum.standards.map(standard => (
                    <div key={standard.id} className="standard-item">
                      <div className="standard-header">
                        <div className="standard-code">{standard.code}</div>
                        <span className={`status-badge status-${standard.status.toLowerCase()}`}>
                          {standard.status}
                        </span>
                      </div>
                      
                      <div className="standard-content">
                        <h4>{standard.description}</h4>
                        <div className="standard-category">
                          Category: <span>{standard.category}</span>
                        </div>
                        
                        <div className="standard-benchmarks">
                          <h5>Learning Benchmarks:</h5>
                          <ul>
                            {standard.benchmarks.map((benchmark, index) => (
                              <li key={index}>{benchmark}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="standard-resources">
                          <div className="resource-count">
                            <span className="resource-icon">📚</span>
                            {standard.resources} teaching resources
                          </div>
                          <div className="assessment-count">
                            <span className="assessment-icon">📝</span>
                            {standard.assessments} assessments
                          </div>
                        </div>
                      </div>
                      
                      <div className="standard-actions">
                        <button className="btn-secondary small">
                          View Resources
                        </button>
                        <button className="btn-primary small">
                          Edit Standard
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowCurriculumModal(false)}
              >
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleExportCurriculum(selectedCurriculum.grade, selectedCurriculum.subject)}
              >
                Export Curriculum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumTab;