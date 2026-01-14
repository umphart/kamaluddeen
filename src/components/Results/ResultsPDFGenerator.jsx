import React, { useRef } from 'react';
import { FiPrinter, FiDownload } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import kccLogo from './kcc.jpeg'; // Import the logo

const ResultsPDFGenerator = ({
  student,
  term,
  academicYear,
  className,
  studentPhotoUrl,
  studentAllSubjects,
  studentStats
}) => {
  const componentRef = useRef();

  // Function to download as PDF
  const handleDownloadPDF = async () => {
    if (!componentRef.current) {
      console.error('No content to download');
      alert('No content available for download');
      return;
    }

    try {
      // Show loading state
      const downloadBtn = document.querySelector('[title="Download as PDF"]');
      const originalText = downloadBtn.innerHTML;
      downloadBtn.innerHTML = '<span>Generating PDF...</span>';
      downloadBtn.disabled = true;

      // Get the original element
      const element = componentRef.current;
      
      // Create a temporary container for cloning
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 210mm;
        min-height: 297mm;
        background: white;
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
      `;
      
      // Clone the element
      const clonedElement = element.cloneNode(true);
      
      // Fix the logo image source in the cloned element
      const logoElements = clonedElement.querySelectorAll('img');
      logoElements.forEach(logoElement => {
        if (logoElement.alt === 'KCC Logo' || logoElement.src.includes('kcc')) {
          // Use the imported logo directly
          logoElement.src = kccLogo;
          logoElement.crossOrigin = 'anonymous';
        }
      });
      
      // Fix student photo source if exists
      const studentPhotos = clonedElement.querySelectorAll('img');
      studentPhotos.forEach(photo => {
        if (photo.alt && photo.alt.includes('Student') && studentPhotoUrl) {
          photo.src = studentPhotoUrl;
          photo.crossOrigin = 'anonymous';
        }
      });
      
      // Apply styles to cloned element
      clonedElement.style.cssText = element.style.cssText;
      clonedElement.style.width = '210mm';
      clonedElement.style.minHeight = '297mm';
      clonedElement.style.padding = '15mm';
      clonedElement.style.margin = '0';
      clonedElement.style.boxSizing = 'border-box';
      clonedElement.style.background = 'white';
      
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);

      // Wait for images to load
      await new Promise((resolve) => {
        const images = clonedElement.getElementsByTagName('img');
        let loadedCount = 0;
        const totalImages = images.length;
        
        if (totalImages === 0) {
          resolve();
          return;
        }
        
        const imageLoaded = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            resolve();
          }
        };
        
        Array.from(images).forEach((img) => {
          if (img.complete) {
            imageLoaded();
          } else {
            img.onload = imageLoaded;
            img.onerror = imageLoaded; // Continue even if image fails
          }
        });
      });

      // Use html2canvas with better options for PDF generation
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794, // A4 width in pixels at 96 DPI
        height: clonedElement.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure all styles are preserved
          const style = document.createElement('style');
          style.innerHTML = `
            @font-face {
              font-family: 'Times New Roman';
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body { margin: 0; padding: 0; }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save PDF
      const fileName = `${student?.studentName || 'Student'}_${term}_Term_${academicYear}_Result.pdf`
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '');
      
      pdf.save(fileName);

      // Reset button state
      downloadBtn.innerHTML = originalText;
      downloadBtn.disabled = false;

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      // Reset button state on error
      const downloadBtn = document.querySelector('[title="Download as PDF"]');
      if (downloadBtn) {
        downloadBtn.innerHTML = '<FiDownload />Download PDF';
        downloadBtn.disabled = false;
      }
      
      // Clean up any temporary elements
      const tempElements = document.querySelectorAll('[style*="position: fixed"][style*="z-index: 9999"]');
      tempElements.forEach(el => document.body.removeChild(el));
    }
  };

  // Direct print functionality
const handleDirectPrint = () => {
  if (!componentRef.current) {
    console.error('No content to print');
    alert('No content available for printing');
    return;
  }
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Get the outer HTML with all styles
  const content = componentRef.current.outerHTML;
  
  // Create print styles that include Tailwind CSS classes
  const printStyles = `
    <style>
      @media print {
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          margin: 0;
          padding: 0;
        }
        .no-print {
          display: none !important;
        }
        * {
          box-sizing: border-box;
        }
      }
      
      /* Preserve layout styles */
      body {
        width: 210mm;
        min-height: 297mm;
        padding: 15mm;
        margin: 0 auto;
        background: white;
        font-family: 'Times New Roman', Times, serif;
        font-size: 12px;
      }
      
      /* Fix for grid layout */
      .grid {
        display: grid;
      }
      .grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .gap-4 {
        gap: 1rem;
      }
      .gap-6 {
        gap: 1.5rem;
      }
      
      /* Fix for flex layout */
      .flex {
        display: flex;
      }
      .justify-between {
        justify-content: space-between;
      }
      .items-start {
        align-items: flex-start;
      }
      .justify-start {
        justify-content: flex-start;
      }
      .justify-end {
        justify-content: flex-end;
      }
      .justify-center {
        justify-content: center;
      }
      .text-center {
        text-align: center;
      }
      .space-y-2 > * + * {
        margin-top: 0.5rem;
      }
      
      /* Width utilities */
      .w-full {
        width: 100%;
      }
      .w-1\\/4 {
        width: 25%;
      }
      .flex-1 {
        flex: 1 1 0%;
      }
      
      /* Padding and margin */
      .mb-4 {
        margin-bottom: 1rem;
      }
      .mb-6 {
        margin-bottom: 1.5rem;
      }
      .mt-6 {
        margin-top: 1.5rem;
      }
      .pb-3 {
        padding-bottom: 0.75rem;
      }
      .px-1 {
        padding-left: 0.25rem;
        padding-right: 0.25rem;
      }
      
      /* Border utilities */
      .border-b {
        border-bottom-width: 1px;
      }
      .border-blue-800 {
        border-color: #1e40af;
      }
      .border-gray-200 {
        border-color: #e5e7eb;
      }
      .rounded-lg {
        border-radius: 0.5rem;
      }
      
      /* Overflow */
      .overflow-hidden {
        overflow: hidden;
      }
      
      /* Background colors */
      .bg-white {
        background-color: white;
      }
      .bg-f9fafb {
        background-color: #f9fafb;
      }
      .bg-f3f4f6 {
        background-color: #f3f4f6;
      }
      .bg-f8fafc {
        background-color: #f8fafc;
      }
      .bg-f0f9ff {
        background-color: #f0f9ff;
      }
      .bg-1e40af {
        background-color: #1e40af;
      }
      
      /* Ensure images display properly */
      img {
        max-width: 100%;
        height: auto;
      }
      
      /* Table styles */
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 4px 6px;
        border: 1px solid #d1d5db;
      }
      
      /* Ensure text colors */
      .text-blue-600 { color: #2563eb; }
      .text-green-600 { color: #059669; }
      .text-purple-600 { color: #7c3aed; }
      .text-gray-600 { color: #4b5563; }
      .text-gray-700 { color: #374151; }
      .text-gray-800 { color: #1f2937; }
      .text-white { color: white; }
      
      /* Font weights */
      .font-bold { font-weight: 700; }
      .font-semibold { font-weight: 600; }
      .font-medium { font-weight: 500; }
      
      /* Custom styles to match inline styles */
      [style*="Times New Roman"] {
        font-family: 'Times New Roman', Times, serif !important;
      }
      
      /* Ensure proper spacing */
      .space-y-2 > *:not(:first-child) {
        margin-top: 0.5rem;
      }
    </style>
  `;
  
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${student?.studentName || 'Student'} - ${term} Term Result</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${printStyles}
      </head>
      <body>
        ${content}
        <script>
          // Wait for all images to load before printing
          window.onload = function() {
            const images = document.images;
            let loadedImages = 0;
            const totalImages = images.length;
            
            if (totalImages === 0) {
              setTimeout(() => window.print(), 100);
              return;
            }
            
            Array.from(images).forEach(img => {
              if (img.complete) {
                loadedImages++;
              } else {
                img.onload = () => {
                  loadedImages++;
                  if (loadedImages === totalImages) {
                    setTimeout(() => window.print(), 100);
                  }
                };
                img.onerror = () => {
                  loadedImages++;
                  if (loadedImages === totalImages) {
                    setTimeout(() => window.print(), 100);
                  }
                };
              }
            });
            
            // Fallback in case all images are already loaded
            if (loadedImages === totalImages) {
              setTimeout(() => window.print(), 100);
            }
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
};

  // Get current date for report
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Function to get grade remark
  const getGradeRemark = (grade) => {
    switch(grade) {
      case 'A': return 'Excellent';
      case 'B': return 'Very Good';
      case 'C': return 'Good';
      case 'D': return 'Pass';
      case 'E': return 'Fair';
      case 'F': return 'Fail';
      default: return 'No Grade';
    }
  };

  // Get overall performance remark
  const getOverallRemark = (average) => {
    if (!average) return 'No Data Available';
    if (average >= 80) return 'Excellent Performance';
    if (average >= 70) return 'Very Good Performance';
    if (average >= 60) return 'Good Performance';
    if (average >= 50) return 'Average Performance';
    if (average >= 40) return 'Below Average';
    return 'Poor Performance - Needs Improvement';
  };

  // Helper function for ordinal suffix
  const getOrdinalSuffix = (n) => {
    if (!n) return '';
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  // Grading system
  const gradingSystem = [
    { grade: 'A', score: '80 - 100', remark: 'Excellent' },
    { grade: 'B', score: '70 - 79', remark: 'Very Good' },
    { grade: 'C', score: '60 - 69', remark: 'Good' },
    { grade: 'D', score: '50 - 59', remark: 'Pass' },
    { grade: 'E', score: '40 - 49', remark: 'Fair' },
    { grade: 'F', score: '0 - 39', remark: 'Fail' }
  ];

  return (
    <div className="w-full">
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4 no-print">
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all duration-200"
          title="Download as PDF"
        >
          <FiDownload />
          Download PDF
        </button>
        <button
          onClick={handleDirectPrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all duration-200"
          title="Print Result"
        >
          <FiPrinter />
          Print Result
        </button>
      </div>

      {/* PDF Content - Optimized for A4 */}
      <div 
        ref={componentRef} 
        className="bg-white border border-gray-200 rounded-lg"
        style={{ 
          width: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          padding: '15mm',
          fontFamily: 'Times New Roman, serif',
          fontSize: '12px',
          boxSizing: 'border-box'
        }}
      >
        {/* School Header */}
        <div className="flex justify-between items-start mb-6 pb-3 border-b border-blue-800">
          {/* School Logo - LEFT SIDE */}
          <div className="w-1/4 flex justify-start">
            <div style={{ width: '70px', height: '70px' }}>
              {kccLogo ? (
                <img 
                  src={kccLogo} 
                  alt="KCC Logo" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    display: 'block' 
                  }}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Failed to load logo:', e);
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `
                      <div style="width: 100%; height: 100%; background: #dbeafe; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 2px solid #93c5fd;">
                        <span style="color: #1e40af; font-weight: bold; font-size: 16px;">KCC</span>
                      </div>
                    `;
                  }}
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: '#dbeafe', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '6px', 
                  border: '2px solid #93c5fd' 
                }}>
                  <span style={{ color: '#1e40af', fontWeight: 'bold', fontSize: '16px' }}>KCC</span>
                </div>
              )}
            </div>
          </div>
          
          {/* School Name and Details - CENTER */}
          <div className="flex-1 text-center px-1">
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#1e40af', 
              marginBottom: '8px',
              lineHeight: '1.2'
            }}>
              KAMALUDEEN COMPREHENSIVE COLLEGE (K.C.C)
            </h2>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Knowledge is Power
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>
              Kwanar Yashi along Hayin Dae Muntsira Kano, Nigeria
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', marginTop: '2px' }}>
              08065662896 • kamaluddeencomprehensive@gmail.com
            </div>
          </div>
          
          {/* Student Photo - RIGHT SIDE */}
          <div className="w-1/4 flex justify-end">
            <div style={{ 
              width: '60px', 
              height: '60px', 
              border: '2px solid #1e40af',
              borderRadius: '4px', 
              overflow: 'hidden', 
              backgroundColor: '#f3f4f6' 
            }}>
              {studentPhotoUrl ? (
                <img 
                  src={studentPhotoUrl} 
                  alt={student?.studentName || 'Student'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `
                      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 9px; color: #9ca3af;">No Photo</span>
                      </div>
                    `;
                  }}
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ fontSize: '9px', color: '#9ca3af' }}>No Photo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result Sheet Title */}
        <div className="text-center mb-6">
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#1e40af', 
            marginBottom: '4px',
            textTransform: 'uppercase'
          }}>
            STUDENT'S RESULT SHEET
          </h2>
          <div style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>
            {term} TERM - {academicYear} ACADEMIC SESSION
          </div>
        </div>

        {/* Student Information Section */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex border-b pb-1">
              <span style={{ width: '120px', fontWeight: '600', color: '#4b5563' }}>Student's Name:</span>
              <span style={{ flex: '1', fontWeight: 'bold', color: '#111827' }}>{student?.studentName || 'N/A'}</span>
            </div>
            <div className="flex border-b pb-1">
              <span style={{ width: '120px', fontWeight: '600', color: '#4b5563' }}>Admission Number:</span>
              <span style={{ flex: '1', color: '#111827' }}>{student?.admissionNumber || 'N/A'}</span>
            </div>
            <div className="flex border-b pb-1">
              <span style={{ width: '120px', fontWeight: '600', color: '#4b5563' }}>Class:</span>
              <span style={{ flex: '1', color: '#111827' }}>{className || 'N/A'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex border-b pb-1">
              <span style={{ width: '120px', fontWeight: '600', color: '#4b5563' }}>Term:</span>
              <span style={{ flex: '1', color: '#111827' }}>{term || 'N/A'}</span>
            </div>
            <div className="flex border-b pb-1">
              <span style={{ width: '120px', fontWeight: '600', color: '#4b5563' }}>Academic Year:</span>
              <span style={{ flex: '1', color: '#111827' }}>{academicYear || 'N/A'}</span>
            </div>
            <div className="flex border-b pb-1">
              <span style={{ width: '120px', fontWeight: '600', color: '#4b5563' }}>Date Printed:</span>
              <span style={{ flex: '1', color: '#111827' }}>{currentDate}</span>
            </div>
          </div>
        </div>

        {/* Performance Summary - TABLE FORMAT */}
        {studentStats && (
          <div className="mb-6">
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#1e40af', 
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              PERFORMANCE SUMMARY
            </h3>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              border: '1px solid #d1d5db',
              marginBottom: '8px'
            }}>
              <tbody>
                <tr>
                  <td style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '6px', 
                    width: '25%', 
                    backgroundColor: '#f8fafc',
                    fontWeight: '600'
                  }}>
                    Total Subjects
                  </td>
                  <td style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '6px', 
                    width: '25%',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {studentStats.totalSubjects || 0}
                  </td>
                  <td style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '6px', 
                    width: '25%', 
                    backgroundColor: '#f8fafc',
                    fontWeight: '600'
                  }}>
                    Total Marks
                  </td>
                  <td style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '6px', 
                    width: '25%',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#059669'
                  }}>
                    {studentStats.totalObtainedMarks?.toFixed(0) || 0}/{studentStats.totalMaximumMarks || 0}
                  </td>
                </tr>
                <tr>
                  <td style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '6px', 
                    width: '25%', 
                    backgroundColor: '#f8fafc',
                    fontWeight: '600'
                  }}>
                    Average Score
                  </td>
                  <td style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '6px', 
                    width: '25%',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#1e40af'
                  }}>
                    {studentStats.totalAverage?.toFixed(1) || '0.0'}%
                  </td>
                  <td style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '6px', 
                    width: '25%', 
                    backgroundColor: '#f8fafc',
                    fontWeight: '600'
                  }}>
                    Class Position
                  </td>
                  <td style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '6px', 
                    width: '25%',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#7c3aed'
                  }}>
                    {student?.position ? `${student.position}${getOrdinalSuffix(student.position)}` : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* Overall Remark */}
            <div style={{ 
              padding: '8px', 
              backgroundColor: '#f0f9ff', 
              border: '1px solid #93c5fd',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                Overall Remark: <span style={{ color: '#059669' }}>{getOverallRemark(studentStats.totalAverage)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Subjects Table */}
        <div className="mb-6">
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#1e40af', 
            marginBottom: '12px',
            textTransform: 'uppercase'
          }}>
            SUBJECTS PERFORMANCE
          </h3>
          <div style={{ overflowX: 'auto', fontSize: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e40af', color: 'white' }}>
                  <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'left', fontSize: '10px' }}>S/N</th>
                  <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'left', fontSize: '10px' }}>SUBJECT</th>
                  <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'left', fontSize: '10px' }}>TEACHER</th>
                  <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', fontSize: '10px' }}>CA (30)</th>
                  <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', fontSize: '10px' }}>EXAM (70)</th>
                  <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', fontSize: '10px' }}>TOTAL (100)</th>
                  <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', fontSize: '10px' }}>GRADE</th>
                  <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', fontSize: '10px' }}>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {studentAllSubjects && studentAllSubjects.length > 0 ? (
                  studentAllSubjects.map((subject, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white' }}>
                      <td style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '4px', fontWeight: '600' }}>{subject.subjectName}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '4px' }}>{subject.teacherName}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 4px',
                          borderRadius: '2px',
                          fontSize: '9px',
                          ...(parseFloat(subject.caScore || 0) >= 20 ? {
                             
                           } :
                              parseFloat(subject.caScore || 0) >= 15 ? {  } :
                              { 
                                
                               })
                        }}>
                          {subject.caScore || '0'}
                        </span>
                      </td>
                      <td style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 4px',
                          borderRadius: '2px',
                          fontSize: '9px',
                          ...(parseFloat(subject.examScore || 0) >= 50 ? { } :
                              parseFloat(subject.examScore || 0) >= 35 ? {  } :
                              {  })
                        }}>
                          {subject.examScore || '0'}
                        </span>
                      </td>
                      <td style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                        <span style={{
                          padding: '2px 4px',
                          borderRadius: '2px',
                          ...(parseFloat(subject.totalScore || 0) >= 80 ? {  } :
                              parseFloat(subject.totalScore || 0) >= 60 ? {  } :
                              parseFloat(subject.totalScore || 0) >= 40 ? { } :
                              { })
                        }}>
                          {subject.totalScore || '0'}
                        </span>
                      </td>
                      <td style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 6px',
                          borderRadius: '9999px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          ...(subject.grade === 'A' ? {  color: '#065f46' } :
                              subject.grade === 'B' ? {  color: '#1e40af' } :
                              subject.grade === 'C' ? {  color: '#92400e' } :
                              subject.grade === 'D' ? {  color: '#9a3412' } :
                              subject.grade === 'E' ? {  color: '#6b21a8' } :
                              { color: '#991b1b' })
                        }}>
                          {subject.grade || 'N/A'}
                        </span>
                      </td>
                      <td style={{ border: '1px solid #d1d5db', padding: '4px' }}>{subject.remarks || getGradeRemark(subject.grade)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'center' }}>
                      No subject data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grading System and Class Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-6">
          {/* Grading System */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af', marginBottom: '8px' }}>
              GRADING SYSTEM
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db', fontSize: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'left' }}>GRADE</th>
                  <th style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'left' }}>SCORE RANGE</th>
                  <th style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'left' }}>REMARK</th>
                </tr>
              </thead>
              <tbody>
                {gradingSystem.map((grade, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white' }}>
                    <td style={{ border: '1px solid #d1d5db', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>{grade.grade}</td>
                    <td style={{ border: '1px solid #d1d5db', padding: '4px' }}>{grade.score}</td>
                    <td style={{ border: '1px solid #d1d5db', padding: '4px' }}>{grade.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Comments Section */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af', marginBottom: '6px' }}>
                Class Teacher's Comment:
              </h3>
              <div style={{ 
                minHeight: '40px', 
                borderBottom: '1px solid #d1d5db', 
                paddingBottom: '4px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <div>
                    <div>Name:</div>
                    <div style={{ marginTop: '20px' }}>Sign & Date:</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af', marginBottom: '6px' }}>
                Head Teacher's Comment:
              </h3>
              <div style={{ 
                minHeight: '40px', 
                borderBottom: '1px solid #d1d5db', 
                paddingBottom: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <div>
                    <div>Name:</div>
                    <div style={{ marginTop: '20px' }}>Sign & Date:</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #d1d5db' }}>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '4px', marginTop: '40px' }}>
                <div style={{ fontWeight: '600', color: '#374151' }}>Class Teacher's Signature</div>
              </div>
            </div>
            <div className="text-center">
              <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '4px', marginTop: '40px' }}>
                <div style={{ fontWeight: '600', color: '#374151' }}>Principal's Signature</div>
              </div>
            </div>
            <div className="text-center">
              <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '4px', marginTop: '40px' }}>
                <div style={{ fontWeight: '600', color: '#374151' }}>Parent's Signature</div>
                <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>(Received & Acknowledged)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center" style={{ fontSize: '10px', color: '#6b7280' }}>
          <p>This is a computer-generated document. No signature is required for authentication.</p>
          <p style={{ marginTop: '2px' }}>KAMALUDEEN COMPREHENSIVE COLLEGE (K.C.C) - "Knowledge is power"</p>
          <p style={{ marginTop: '2px' }}>Result generated on: {currentDate}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPDFGenerator;