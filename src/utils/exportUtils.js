// src/utils/exportUtils.js
import logoImage from './kcc.jpeg';

// School information (moved to top to avoid reference issues)
export const SCHOOL_INFO = {
  name: "KAMALUDEEN COMPREHENSIVE COLLEGE",
  motto: "Knowledge is Power",
  address: "Kwanar Yashi along Hayin Dae Muntsira Kano, Nigeria",
  phone: "+234 8065662896",
  email: "kamaluddeencomprehensive@gmail.com",
  secondaryEmail: "aliyumuzammilsani@gmail.com",
  levels: {
    'PN': 'Pre-Nursery',
    'NU': 'Nursery',
    'PR': 'Primary',
    'JS': 'Junior Secondary'
  },
  classes: {
    'PN': ['Pre-Nursery'],
    'NU': ['Nursery 1', 'Nursery 2'],
    'PR': ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4'],
    'JS': ['JSS 1', 'JSS 2', 'JSS 3']
  }
};

// Format date utility
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};


// Function to export teachers to CSV
export const exportTeachersToCSV = (teachers) => {
  if (!teachers || teachers.length === 0) {
    console.warn('No teachers data to export');
    return false;
  }

  const headers = ['Staff ID', 'Full Name', 'Gender', 'Email', 'Phone', 'Qualification', 'Employment Type', 'Status', 'Subjects', 'Classes Assigned', 'Date Joined'];
  
  const csvContent = [
    headers.join(','),
    ...teachers.map(teacher => [
      teacher.staffId || '',
      teacher.fullName || '',
      teacher.gender || '',
      teacher.email || '',
      teacher.phone || '',
      teacher.qualification || '',
      teacher.employmentType || '',
      teacher.status || '',
      teacher.subjects?.join(', ') || '',
      teacher.classAssignments?.join(', ') || '',
      teacher.dateJoined || ''
    ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `teachers_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return true;
};

// Function to export students to CSV
export const exportStudentsToCSV = (students, className = null) => {
  if (!students || students.length === 0) {
    console.warn('No students data to export');
    return false;
  }

  const data = students.map(student => ({
    'Admission No': student.admissionNumber || '',
    'Full Name': student.fullName || '',
    'Class': student.className || '',
    'Level': SCHOOL_INFO.levels[student.level] || student.level || '',
    'Gender': student.gender || '',
    'Date of Birth': student.dateOfBirth || '',
    'Parent Name': student.parentName || '',
    'Parent Phone': student.parentPhone || '',
    'Parent Email': student.parentEmail || '',
    'Address': student.address || '',
    'Admission Date': student.admissionDate || '',
    'Status': student.status || 'Active'
  }));
  
  const csvContent = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = className 
    ? `KCC_${className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    : `KCC_All_Students_${new Date().toISOString().split('T')[0]}.csv`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return true;
};

// Function to export students to PDF
export const exportStudentsToPDF = (students, className = null) => {
  if (!students || students.length === 0) {
    console.warn('No students data to export');
    return false;
  }

  // Create PDF content with school logo
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window. Please allow pop-ups.');
    return false;
  }
  
  const title = className 
    ? `Class ${className} - Student List`
    : 'Student List - All Classes';
  
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Convert logo image to data URL for embedding
  const getLogoDataURL = () => {
    // If logoImage is already a data URL or blob URL, use it directly
    if (logoImage.startsWith('data:') || logoImage.startsWith('blob:')) {
      return logoImage;
    }
    // For webpack imported images, they might be URLs or require base64 conversion
    return logoImage;
  };

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 10px; /* Reduced padding */
          color: #333;
          background: white;
        }
        
        .header-container {
          width: 100%;
          display: flex;
          align-items: center;
          margin-bottom: 15px; /* Reduced margin */
          padding-bottom: 10px; /* Reduced padding */
          border-bottom: 2px solid #4F46E5; /* Thinner border */
        }
        
        .logo-container {
          flex: 0 0 auto;
          width: 100px; /* Reduced logo size */
          height: 100px; /* Reduced logo size */
          display: flex;
          align-items: center;
          justify-content: flex-start; /* Align logo to left */
          margin-right: 15px; /* Reduced margin */
        }
        
        .logo {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .school-info-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center; /* Center school info */
          justify-content: center;
          text-align: center;
          margin: 0;
          padding: 0;
        }
        
        .school-name {
          font-size: 20px; /* Reduced font size */
          font-weight: 700;
          color: #4F46E5;
          margin-bottom: 3px; /* Reduced margin */
          line-height: 1.2;
        }
        
        .school-motto {
          font-size: 13px; /* Reduced font size */
          color: #666;
          margin-bottom: 6px; /* Reduced margin */
          font-style: italic;
        }
        
        .school-details {
          font-size: 11px; /* Reduced font size */
          color: #666;
          margin: 0;
          line-height: 1.3; /* Tighter line height */
        }
        
        .report-title {
          font-size: 18px; /* Reduced font size */
          font-weight: 600;
          margin: 10px 0; /* Reduced margin */
          color: #333;
          text-align: center;
          padding: 8px; /* Reduced padding */
          background: #f8fafc;
          border-radius: 6px;
        }
        
        .report-info {
          font-size: 11px; /* Reduced font size */
          color: #666;
          margin-bottom: 15px; /* Reduced margin */
          text-align: center;
        }
        
        .summary-box {
          background: #f8fafc;
          padding: 12px; /* Reduced padding */
          border-radius: 6px;
          margin-bottom: 15px; /* Reduced margin */
          border-left: 3px solid #4F46E5; /* Thinner border */
          font-size: 12px; /* Reduced font size */
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px; /* Reduced font size */
          margin-top: 15px; /* Reduced margin */
        }
        
        th {
          background: #4F46E5;
          color: white;
          padding: 8px; /* Reduced padding */
          text-align: left;
          font-weight: 600;
          border: 1px solid #e5e7eb;
        }
        
        td {
          padding: 6px 8px; /* Reduced padding */
          border: 1px solid #e5e7eb;
        }
        
        tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .badge {
          padding: 2px 6px; /* Reduced padding */
          border-radius: 3px;
          font-size: 9px; /* Reduced font size */
          font-weight: 500;
          display: inline-block;
        }
        
        .badge-active { background: #d1fae5; color: #065f46; }
        .badge-inactive { background: #fee2e2; color: #991b1b; }
        .badge-graduated { background: #dbeafe; color: #1e40af; }
        
        .footer {
          margin-top: 20px; /* Reduced margin */
          padding-top: 10px; /* Reduced padding */
          border-top: 1px solid #e5e7eb; /* Thinner border */
          font-size: 10px; /* Reduced font size */
          color: #666;
          text-align: center;
        }
        
        .footer-contact {
          font-size: 9px; /* Reduced font size */
          color: #4F46E5;
          margin-top: 3px; /* Reduced margin */
        }
        
        .page-break {
          page-break-before: always;
        }
        
        @media print {
          body { margin: 0; padding: 5px; }
          .no-print { display: none; }
          .header-container { page-break-inside: avoid; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          .footer { position: fixed; bottom: 0; width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="logo-container">
          <img src="${getLogoDataURL()}" alt="KCC Logo" class="logo" />
        </div>
        <div class="school-info-container">
          <div class="school-name">${SCHOOL_INFO.name}</div>
          <div class="school-motto">"${SCHOOL_INFO.motto}"</div>
          <div class="school-details">
            <strong>Address:</strong> ${SCHOOL_INFO.address}<br>
            <strong>Phone:</strong> ${SCHOOL_INFO.phone}<br>
            <strong>Email:</strong> ${SCHOOL_INFO.email}<br>
            <strong>Secondary Email:</strong> ${SCHOOL_INFO.secondaryEmail}
          </div>
        </div>
      </div>
      
      <div class="report-title">${title}</div>
      
      <div class="report-info">
        <strong>Generated:</strong> ${currentDate} | 
        <strong>Total Students:</strong> ${students.length}
        ${className ? ` | <strong>Class:</strong> ${className}` : ''}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Admission No.</th>
            <th>Student Name</th>
            <th>Class</th>
            <th>Level</th>
            <th>Gender</th>
            <th>Parent Name</th>
            <th>Parent Phone</th>
            <th>Admission Date</th>
          </tr>
        </thead>
        <tbody>
          ${students.map((student, index) => `
            <tr>
              <td style="text-align: center;">${index + 1}</td>
              <td><strong>${student.admissionNumber || ''}</strong></td>
              <td>${student.fullName || ''}</td>
              <td>${student.className || ''}</td>
              <td>${SCHOOL_INFO.levels[student.level] || student.level || ''}</td>
              <td>${student.gender || ''}</td>
              <td>${student.parentName || ''}</td>
              <td>${student.parentPhone || ''}</td>
              <td>${formatDate(student.admissionDate)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${SCHOOL_INFO.name} - All rights reserved</p>
        <p>This document contains confidential student information. Unauthorized distribution is prohibited.</p>
        <div class="footer-contact">
          For inquiries contact: ${SCHOOL_INFO.email} | ${SCHOOL_INFO.secondaryEmail}
        </div>
      </div>
      
      <div class="no-print" style="margin-top: 15px; text-align: center;">
        <button onclick="window.print()" style="
          background: #4F46E5;
          color: white;
          border: none;
          padding: 10px 20px; /* Reduced padding */
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px; /* Reduced font size */
          font-weight: 600;
          margin: 3px; /* Reduced margin */
        ">
          🖨️ Print Document
        </button>
        <button onclick="window.close()" style="
          background: #6b7280;
          color: white;
          border: none;
          padding: 10px 20px; /* Reduced padding */
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px; /* Reduced font size */
          font-weight: 600;
          margin: 3px; /* Reduced margin */
        ">
          ✕ Close Window
        </button>
      </div>
      
      <script>
        setTimeout(() => {
          window.print();
        }, 1000);
        
        window.onbeforeunload = function() {
          return 'Are you sure you want to close? The document may still be printing.';
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  
  return true;
};