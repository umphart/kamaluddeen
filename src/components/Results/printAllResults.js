import { getCurrentDateFormatted, getLogoHtml } from './printUtils';

export const printAllResults = (
  selectedClass,
  selectedTerm,
  academicYear,
  studentSummaries = [],
  classStatistics = {},
  filteredResults = []
  
) => {
  const printWindow = window.open('', '_blank');
  const currentDate = getCurrentDateFormatted();
  const logoHtml = getLogoHtml();

  // Safely access classStatistics properties
  const safeClassAverage = classStatistics?.classAverage || 0;
  const safeTopStudent = classStatistics?.topStudent || { studentName: 'N/A', totalAverage: 0, totalScoreSum: 0 };
  const safeGradeDistribution = classStatistics?.gradeDistribution || {};

  // Helper function to ensure totalScoreSum is calculated
  const calculateTotalScoreSum = (student) => {
    if (student.totalScoreSum && student.totalScoreSum > 0) {
      return student.totalScoreSum;
    }
    
    if (student.totalAverage && student.totalSubjects) {
      return student.totalAverage * student.totalSubjects;
    }
    
    return 0;
  };

  // Get all unique subjects from filteredResults
  const getUniqueSubjects = () => {
    const subjectMap = new Map();
    
    if (filteredResults && filteredResults.length > 0) {
      filteredResults.forEach(result => {
        if (result.subjectName) {
          subjectMap.set(result.subjectName, {
            name: result.subjectName,
            code: result.subjectCode || '',
            teacher: result.teacherName || ''
          });
        }
      });
    }
    
    // Sort subjects alphabetically
    return Array.from(subjectMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  };

  const allSubjects = getUniqueSubjects();
  
  // Create student subject scores map
  const getStudentSubjectScores = () => {
    const studentScoresMap = new Map();
    
    if (filteredResults && filteredResults.length > 0) {
      filteredResults.forEach(result => {
        const studentId = result.studentId;
        const subjectName = result.subjectName;
        const totalScore = parseFloat(result.totalScore) || 0;
        
        if (!studentScoresMap.has(studentId)) {
          studentScoresMap.set(studentId, {});
        }
        
        const studentScores = studentScoresMap.get(studentId);
        studentScores[subjectName] = totalScore;
      });
    }
    
    return studentScoresMap;
  };

  const studentSubjectScores = getStudentSubjectScores();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Class Results Summary - ${selectedClass}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', serif;
          font-size: 9px;
          line-height: 1.2;
          color: #000;
          margin: 0;
          padding: 0;
          background: #fff;
        }
        
        .page {
          width: 21cm;
          min-height: 29.7cm;
          margin: 0 auto;
          padding: 1cm;
          position: relative;
        }
        
        .school-header {
          text-align: center;
          margin-bottom: 15px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        
        .school-name {
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        
        .school-address {
          font-size: 11px;
          margin-bottom: 5px;
        }
        
        .school-contact {
          font-size: 10px;
          margin-bottom: 5px;
        }
        
        .motto {
          font-size: 11px;
          font-style: italic;
          font-weight: bold;
          margin-top: 5px;
        }
        
        .report-title {
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          text-decoration: underline;
          margin: 15px 0 10px;
          text-transform: uppercase;
        }
        
        .term-info {
          text-align: center;
          font-size: 11px;
          margin-bottom: 15px;
          display: flex;
          justify-content: center;
          gap: 30px;
        }
        
        .class-info {
          margin: 15px 0 20px;
          font-size: 10px;
          background-color: #f8f9fa;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        
        .info-label {
          font-weight: bold;
          min-width: 100px;
          color: #2c3e50;
        }
        
        .info-value {
          flex: 1;
          text-align: right;
          font-weight: bold;
        }
        
        /* Results Table */
        .results-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0 25px;
          font-size: 8px;
          table-layout: fixed;
        }
        
        .results-table th {
          background-color: #2c3e50;
          color: white;
          border: 1px solid #000;
          padding: 8px 3px;
          text-align: center;
          font-weight: bold;
          vertical-align: middle;
          position: sticky;
          top: 0;
        }
        
        .results-table td {
          border: 1px solid #ddd;
          padding: 6px 3px;
          text-align: center;
          vertical-align: middle;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        /* Fixed width columns */
        .col-pos { width: 30px; }
        .col-admission { width: 80px; }
        .col-name { width: 120px; text-align: left; padding-left: 8px !important; }
        .col-subject { width: 50px; min-width: 50px; }
        .col-total { width: 60px; }
        .col-average { width: 60px; }
        .col-grade { width: 40px; }
        
        .student-info-cell {
          text-align: left;
          background-color: #f8f9fa;
        }
        
        .student-name {
          font-weight: bold;
          margin-bottom: 1px;
          font-size: 9px;
        }
        
        .admission-number {
          font-size: 7px;
          color: #666;
        }
        
        .position-cell {
          font-weight: bold;
          background-color: #f8f9fa;
        }
        
        .position-1 {
          background-color: gold !important;
          color: #000;
        }
        
        .position-2 {
          background-color: silver !important;
          color: #000;
        }
        
        .position-3 {
          background-color: #cd7f32 !important;
          color: #000;
        }
        
        .subject-score {
          font-weight: bold;
          font-size: 8px;
        }
        
        .total-score-cell {
          font-weight: bold;
          background-color: #e8f4fd;
        }
        
        .average-cell {
          font-weight: bold;
          background-color: #f0f9f0;
        }
        
        .grade-cell {
          font-weight: bold;
          padding: 4px 2px !important;
        }
        
        .grade-A { background-color: #d4edda; color: #155724; }
        .grade-B { background-color: #cce5ff; color: #004085; }
        .grade-C { background-color: #fff3cd; color: #856404; }
        .grade-D { background-color: #ffe5d0; color: #664d03; }
        .grade-E { background-color: #e2d5f0; color: #4a0080; }
        .grade-F { background-color: #f8d7da; color: #721c24; }
        
        /* Class Summary Section */
        .class-summary {
          margin: 25px 0;
          padding: 15px;
          border: 2px solid #2c3e50;
          border-radius: 6px;
          background-color: #f8f9fa;
        }
        
        .class-summary-title {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 15px;
          color: #2c3e50;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 10px;
        }
        
        .summary-item {
          text-align: center;
          padding: 12px;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .summary-value {
          font-size: 18px;
          font-weight: bold;
          margin-top: 5px;
          color: #2c3e50;
        }
        
        .grade-distribution {
          margin: 15px 0;
          padding: 12px;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .grade-distribution-title {
          font-weight: bold;
          text-align: center;
          margin-bottom: 12px;
          font-size: 12px;
          color: #2c3e50;
        }
        
        .grade-distribution-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }
        
        .grade-dist-item {
          text-align: center;
          padding: 8px 3px;
          border-radius: 3px;
        }
        
        .grade-count {
          font-weight: bold;
          font-size: 14px;
          margin: 3px 0;
        }
        
        .signature-section {
          margin-top: 25px;
          display: flex;
          justify-content: space-between;
          padding-top: 15px;
          border-top: 1px solid #2c3e50;
        }
        
        .signature-box {
          text-align: center;
          width: 200px;
        }
        
        .signature-line {
          width: 160px;
          height: 1px;
          background-color: #000;
          margin: 25px auto 5px;
        }
        
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 8px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 8px;
        }
        
        .grade-key {
          margin: 15px 0;
          font-size: 9px;
          text-align: center;
          padding: 8px;
          background-color: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .page {
            padding: 1cm;
            box-shadow: none;
            margin: 0;
            width: auto;
            min-height: auto;
          }
          
          .no-print {
            display: none;
          }
          
          .results-table {
            font-size: 7px;
          }
        }
        
        .no-print {
          text-align: center;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #ccc;
        }
        
        .print-button {
          padding: 8px 20px;
          background-color: #2c3e50;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          margin: 0 8px;
        }
        
        .close-button {
          padding: 8px 20px;
          background-color: #95a5a6;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          margin: 0 8px;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- School Header -->
        <div class="school-header">
          ${logoHtml}
          
          <div class="school-name">KAMALUDDEEN COMPREHENSIVE COLLEGE (K.C.C)</div>
          <div class="school-address">Address: Kwanar Yashi Along Hayin Da'e Muntsira Street Kumbotso LGA, Kano</div>
          <div class="school-contact">
            Email: muzammilsanialaiyu@gmail.com | Tel: 08065662896
          </div>
          <div class="motto">Motto: Knowledge is power</div>
        </div>
        
        <!-- Report Title -->
        <div class="report-title">CLASS RESULTS SUMMARY</div>
        
        <!-- Term Information -->
        <div class="term-info">
          <div><strong>${selectedTerm} TERM</strong></div>
          <div><strong>SESSION:</strong> ${academicYear}</div>
        </div>
        
        <!-- Class Information -->
        <div class="class-info">
          <div class="info-row">
            <div class="info-label">Class:</div>
            <div class="info-value">${selectedClass}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Total Students:</div>
            <div class="info-value">${studentSummaries.length}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Class Average:</div>
            <div class="info-value">${safeClassAverage.toFixed(1)}%</div>
          </div>
          <div class="info-row">
            <div class="info-label">Total Subjects:</div>
            <div class="info-value">${allSubjects.length}</div>
          </div>
        </div>
        
        <!-- Results Table -->
        ${studentSummaries.length > 0 ? `
        <div style="overflow-x: auto;">
          <table class="results-table">
            <thead>
              <tr>
                <th class="col-pos">POS.</th>
                <th class="col-admission">ADMISSION NO.</th>
                <th class="col-name">STUDENT NAME</th>
                <!-- Dynamic Subject Columns -->
                ${allSubjects.map(subject => `
                  <th class="col-subject" title="${subject.name}">
                    ${subject.name.substring(0, 8)}${subject.name.length > 8 ? '...' : ''}
                  </th>
                `).join('')}
                <th class="col-total">TOTAL</th>
                <th class="col-average">AVERAGE</th>
                <th class="col-grade">GRADE</th>
              </tr>
            </thead>
            <tbody>
              ${studentSummaries.map((student) => {
                const totalScore = calculateTotalScoreSum(student);
                const positionClass = student.position === 1 ? 'position-1' : 
                                    student.position === 2 ? 'position-2' : 
                                    student.position === 3 ? 'position-3' : '';
                const studentScores = studentSubjectScores.get(student.studentId) || {};
                
                return `
                <tr>
                  <td class="position-cell ${positionClass}">
                    ${student.position}
                  </td>
                  <td class="student-info-cell col-admission">
                    <div class="admission-number">${student.admissionNumber || 'N/A'}</div>
                  </td>
                  <td class="student-info-cell col-name">
                    <div class="student-name">${student.studentName || 'N/A'}</div>
                  </td>
                  <!-- Subject Scores -->
                  ${allSubjects.map(subject => {
                    const score = studentScores[subject.name] || 0;
                    return `
                    <td class="subject-score">
                      ${score.toFixed(1)}
                    </td>
                    `;
                  }).join('')}
                  <td class="total-score-cell">
                    ${totalScore.toFixed(1)}
                  </td>
                  <td class="average-cell">
                    ${student.totalAverage ? student.totalAverage.toFixed(1) + '%' : '0.0%'}
                  </td>
                  <td class="grade-cell grade-${student.overallGrade || 'N/A'}">
                    ${student.overallGrade || '-'}
                  </td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Subject Legend -->
        <div style="margin: 15px 0; padding: 10px; background-color: #f8f9fa; border-radius: 4px; border: 1px solid #ddd; font-size: 8px;">
          <div style="font-weight: bold; margin-bottom: 5px; color: #2c3e50;">SUBJECT LEGEND (Full Names):</div>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${allSubjects.map((subject, index) => `
              <div style="display: flex; align-items: center; gap: 5px;">
                <span style="font-weight: bold;">${String.fromCharCode(65 + index)}:</span>
                <span>${subject.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : `
        <div style="text-align: center; padding: 30px; background-color: #f8f9fa; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #666; margin-bottom: 10px; font-size: 14px;">No Student Data Available</h3>
          <p style="color: #888; font-size: 11px;">No student summaries found for printing.</p>
        </div>
        `}
        
        <!-- Class Summary -->
        ${studentSummaries.length > 0 ? `
        <div class="class-summary">
          <div class="class-summary-title">CLASS PERFORMANCE SUMMARY</div>
          
          <div class="summary-grid">
            <div class="summary-item">
              <div>Total Students</div>
              <div class="summary-value">${studentSummaries.length}</div>
            </div>
            
            <div class="summary-item">
              <div>Class Average</div>
              <div class="summary-value">${safeClassAverage.toFixed(1)}%</div>
            </div>
            
            <div class="summary-item">
              <div>Top Student</div>
              <div class="summary-value">
                ${safeTopStudent.studentName}
                <div style="font-size: 10px; margin-top: 3px;">
                  ${calculateTotalScoreSum(safeTopStudent).toFixed(1)} points
                </div>
              </div>
            </div>
          </div>
          
          <!-- Grade Distribution -->
          <div class="grade-distribution">
            <div class="grade-distribution-title">GRADE DISTRIBUTION</div>
            <div class="grade-distribution-grid">
              ${Object.entries(safeGradeDistribution).map(([grade, count]) => `
                <div class="grade-dist-item grade-${grade}">
                  <div style="font-weight: bold;">Grade ${grade}</div>
                  <div class="grade-count">${count}</div>
                  <div style="font-size: 7px;">students</div>
                </div>
              `).join('')}
              ${Object.keys(safeGradeDistribution).length === 0 ? 
                '<div style="text-align: center; padding: 10px; color: #666; grid-column: 1 / -1;">No grade data available</div>' : 
                ''}
            </div>
          </div>
          
          <!-- Subject Statistics -->
          <div style="margin-top: 15px; padding: 12px; background-color: white; border-radius: 4px; border: 1px solid #ddd;">
            <div style="font-weight: bold; text-align: center; margin-bottom: 8px; color: #2c3e50; font-size: 11px;">
              SUBJECTS OFFERED (${allSubjects.length})
            </div>
            <div style="font-size: 9px; text-align: center;">
              Each column shows total score (CA + Exam) out of 100
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- Grade Key -->
        <div class="grade-key">
          <strong>GRADING SYSTEM:</strong>
          <span>A (80-100%) - Excellent</span> | 
          <span>B (70-79%) - Very Good</span> | 
          <span>C (60-69%) - Good</span> | 
          <span>D (50-59%) - Pass</span> | 
          <span>E (40-49%) - Fair</span> | 
          <span>F (Below 40%) - Needs Improvement</span>
        </div>
        
        <!-- Signatures -->
        <div class="signature-section">
          <div class="signature-box">
            <div style="font-size: 9px;">CLASS TEACHER'S SIGNATURE</div>
            <div class="signature-line"></div>
            <div style="font-size: 9px;">Name: _________________________</div>
            <div style="font-size: 8px;">Date: ${currentDate}</div>
          </div>
          
          <div class="signature-box">
            <div style="font-size: 9px;">HEAD TEACHER'S SIGNATURE</div>
            <div class="signature-line"></div>
            <div style="font-size: 9px;">Name: _________________________</div>
            <div style="font-size: 8px;">Date: ${currentDate}</div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div>Printed on: ${currentDate}</div>
          <div>KAMALUDDEEN COMPREHENSIVE COLLEGE • Knowledge is Power</div>
          <div>08065662896 • kamaluddeencomprehensive@gmail.com</div>
        </div>
        
        <!-- Print Controls -->
        <div class="no-print">
          <button onclick="window.print()" class="print-button">Print Class Results</button>
          <button onclick="window.close()" class="close-button">Close Window</button>
        </div>
      </div>
      
      <script>
        // Auto print after page loads
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};