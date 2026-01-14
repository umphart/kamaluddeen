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

// Function to export teachers data to PDF
export const exportTeachersToPDF = async (teachers) => {
  try {
    // Dynamically import jsPDF to avoid SSR issues
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // School logo
    try {
      doc.addImage(logoImage, 'JPEG', 10, 10, 30, 30);
    } catch (error) {
      console.warn('Could not add logo:', error);
    }

    // School header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(SCHOOL_INFO.name, 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(SCHOOL_INFO.motto, 105, 28, { align: 'center' });
    
    // School contact info
    doc.setFontSize(10);
    doc.text(`Address: ${SCHOOL_INFO.address}`, 10, 40);
    doc.text(`Phone: ${SCHOOL_INFO.phone} | Email: ${SCHOOL_INFO.email}`, 10, 46);
    
    // Report title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TEACHERS REPORT', 105, 60, { align: 'center' });
    
    // Report date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 68, { align: 'center' });
    
    // Summary statistics
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === 'Active').length;
    const maleTeachers = teachers.filter(t => t.gender === 'Male').length;
    const femaleTeachers = teachers.filter(t => t.gender === 'Female').length;
    const fullTimeTeachers = teachers.filter(t => t.employmentType === 'Full-time').length;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 10, 80);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Teachers: ${totalTeachers}`, 10, 88);
    doc.text(`Active Teachers: ${activeTeachers}`, 10, 94);
    doc.text(`Male: ${maleTeachers} | Female: ${femaleTeachers}`, 10, 100);
    doc.text(`Full-time: ${fullTimeTeachers}`, 10, 106);
    
    // Teachers table
    const tableData = teachers.map(teacher => [
      teacher.staffId || '',
      teacher.fullName || '',
      teacher.gender || '',
      teacher.qualification || '',
      teacher.employmentType || '',
      teacher.status || '',
      teacher.subjects?.join(', ') || 'None',
      teacher.classAssignments?.join(', ') || 'Not Assigned'
    ]);

    // Add the table
    doc.autoTable({
      startY: 115,
      head: [['Staff ID', 'Name', 'Gender', 'Qualification', 'Type', 'Status', 'Subjects', 'Classes']],
      body: tableData,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 15 },
        3: { cellWidth: 40 },
        4: { cellWidth: 20 },
        5: { cellWidth: 15 },
        6: { cellWidth: 40 },
        7: { cellWidth: 30 }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
      doc.text(`© ${SCHOOL_INFO.name} ${new Date().getFullYear()}`, 10, 285);
    }

    // Save the PDF
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`teachers_report_${dateStr}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
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
          padding: 20px;
          color: #333;
          background: white;
        }
        
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #4F46E5;
        }
        
        .logo-container {
          width: 120px;
          height: 120px;
          margin-right: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .school-info {
          flex: 1;
        }
        
        .school-name {
          font-size: 24px;
          font-weight: 700;
          color: #4F46E5;
          margin-bottom: 5px;
        }
        
        .school-motto {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
          font-style: italic;
        }
        
        .school-details {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
          line-height: 1.4;
        }
        
        .report-title {
          font-size: 20px;
          font-weight: 600;
          margin: 20px 0;
          color: #333;
          text-align: center;
          padding: 10px;
          background: #f8fafc;
          border-radius: 8px;
        }
        
        .report-info {
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .summary-box {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #4F46E5;
          font-size: 13px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-top: 20px;
        }
        
        th {
          background: #4F46E5;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: 600;
          border: 1px solid #e5e7eb;
        }
        
        td {
          padding: 8px 10px;
          border: 1px solid #e5e7eb;
        }
        
        tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .badge {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
          display: inline-block;
        }
        
        .badge-active { background: #d1fae5; color: #065f46; }
        .badge-inactive { background: #fee2e2; color: #991b1b; }
        .badge-graduated { background: #dbeafe; color: #1e40af; }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          font-size: 11px;
          color: #666;
          text-align: center;
        }
        
        .footer-contact {
          font-size: 10px;
          color: #4F46E5;
          margin-top: 5px;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        @media print {
          body { margin: 0; padding: 10px; }
          .no-print { display: none; }
          .header { page-break-inside: avoid; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          .footer { position: fixed; bottom: 0; width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-container">
          <img src="${getLogoDataURL()}" alt="KCC Logo" class="logo" />
        </div>
        <div class="school-info">
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
      
      <div class="summary-box">
        <strong>Levels Offered:</strong><br>
        • Pre-Nursery (PN)<br>
        • Nursery 1-2 (NU)<br>
        • Primary 1-4 (PR)<br>
        • JSS 1-3 (JS)
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
            <th>Status</th>
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
              <td>
                <span class="badge badge-${(student.status || 'active').toLowerCase()}">
                  ${student.status || 'Active'}
                </span>
              </td>
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
      
      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="
          background: #4F46E5;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          margin: 5px;
        ">
          🖨️ Print Document
        </button>
        <button onclick="window.close()" style="
          background: #6b7280;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          margin: 5px;
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