// src/components/Academics/ResultsManager.jsx
import React, { useState } from 'react';

const ResultsManager = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState('CA');
  const [results, setResults] = useState([]);

  const classes = [
    'Pre-Nursery', 'Nursery 1', 'Nursery 2',
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4',
    'JSS 1', 'JSS 2', 'JSS 3'
  ];

  const subjects = [
    'Mathematics', 'English Language', 'Basic Science',
    'Social Studies', 'Quantitative Reasoning',
    'Verbal Reasoning', 'Computer Studies', 'Islamic Studies',
    'Creative Arts', 'Physical Education'
  ];

  const calculateResults = () => {
    // Mock calculation logic
    const calculatedResults = results.map(student => {
      const total = student.caScore + student.examScore;
      const percentage = (total / 100) * 100;
      return {
        ...student,
        total,
        percentage,
        grade: calculateGrade(percentage)
      };
    });

    // Sort by total score
    calculatedResults.sort((a, b) => b.total - a.total);
    
    // Assign positions
    return calculatedResults.map((student, index) => ({
      ...student,
      position: index + 1
    }));
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="results-manager">
      <div className="control-panel">
        <div className="control-group">
          <label>Select Class</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Select Subject</label>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            {subjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Exam Type</label>
          <select 
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
          >
            <option value="CA">Continuous Assessment</option>
            <option value="Exam">Examination</option>
            <option value="Total">Total Score</option>
          </select>
        </div>

        <button className="btn-primary">
          Calculate Results
        </button>
      </div>

      {/* Results Table */}
      <div className="results-table">
        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th>Admission No.</th>
              <th>Student Name</th>
              <th>CA Score</th>
              <th>Exam Score</th>
              <th>Total</th>
              <th>Percentage</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {calculateResults().map((student, index) => (
              <tr key={index}>
                <td className="position-cell">
                  <span className={`position-badge position-${student.position}`}>
                    {student.position}
                  </span>
                </td>
                <td>{student.admissionNo}</td>
                <td>{student.name}</td>
                <td>{student.caScore}</td>
                <td>{student.examScore}</td>
                <td><strong>{student.total}</strong></td>
                <td>{student.percentage.toFixed(1)}%</td>
                <td>
                  <span className={`grade-badge grade-${student.grade}`}>
                    {student.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Result Summary */}
      <div className="result-summary">
        <div className="summary-card">
          <h4>Class Average</h4>
          <div className="summary-value">78.5%</div>
        </div>
        <div className="summary-card">
          <h4>Highest Score</h4>
          <div className="summary-value">95%</div>
        </div>
        <div className="summary-card">
          <h4>Lowest Score</h4>
          <div className="summary-value">45%</div>
        </div>
        <div className="summary-card">
          <h4>Pass Rate</h4>
          <div className="summary-value">85%</div>
        </div>
      </div>
    </div>
  );
};

export default ResultsManager;