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
      
      // Apply optimized styles for PDF
      clonedElement.style.cssText = `
        width: 210mm !important;
        min-height: 297mm !important;
        padding: 10mm 8mm !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        background: white !important;
        position: relative !important;
        font-family: 'Times New Roman', serif !important;
        font-size: 10px !important;
      `;
      
      // Adjust inner elements for better PDF rendering
      clonedElement.querySelectorAll('*').forEach(el => {
        // Remove any max-width constraints
        el.style.maxWidth = 'none !important';
        el.style.overflow = 'visible !important';
        
        // Adjust tables for PDF
        if (el.tagName === 'TABLE') {
          el.style.width = '100% !important';
          el.style.fontSize = '9px !important';
          el.style.borderCollapse = 'collapse !important';
        }
        
        // Adjust table cells
        if (el.tagName === 'TD' || el.tagName === 'TH') {
          el.style.padding = '2px 3px !important';
          el.style.fontSize = '8px !important';
        }
        
        // Adjust headers
        if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3') {
          el.style.margin = '5px 0 !important';
          el.style.fontSize = el.tagName === 'H1' ? '16px !important' : 
                             el.tagName === 'H2' ? '14px !important' : 
                             '12px !important';
        }
      });
      
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
            img.onerror = imageLoaded;
          }
        });
      });

      // Calculate optimal scale for A4
      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;
      const PIXELS_PER_MM = 3.78; // Standard conversion
      const targetWidth = A4_WIDTH_MM * PIXELS_PER_MM;
      const targetHeight = A4_HEIGHT_MM * PIXELS_PER_MM;

      // Use html2canvas to capture the content
      const canvas = await html2canvas(clonedElement, {
        scale: 1.5, // Lower scale for better performance
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: targetWidth,
        height: clonedElement.scrollHeight,
        windowWidth: targetWidth,
        onclone: (clonedDoc) => {
          // Additional styling for cloned document
          const clonedRoot = clonedDoc.querySelector('.pdf-content');
          if (clonedRoot) {
            clonedRoot.style.width = `${targetWidth}px`;
            clonedRoot.style.minHeight = `${targetHeight}px`;
          }
        }
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create a new canvas for watermark
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const ctx = finalCanvas.getContext('2d');
      
      // Draw the original content
      ctx.drawImage(canvas, 0, 0);
      
      // Add watermark
      const watermarkImg = new Image();
      watermarkImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve) => {
        watermarkImg.onload = () => {
          // Calculate watermark size (30% of canvas width)
          const watermarkWidth = finalCanvas.width * 0.3;
          const watermarkHeight = (watermarkImg.height * watermarkWidth) / watermarkImg.width;
          const x = (finalCanvas.width - watermarkWidth) / 2;
          const y = (finalCanvas.height - watermarkHeight) / 2;
          
          // Set transparency
          ctx.globalAlpha = 0.08; // 8% opacity
          
          // Draw watermark
          ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight);
          
          // Reset opacity
          ctx.globalAlpha = 1;
          resolve();
        };
        
        watermarkImg.onerror = () => {
          // Fallback: draw text watermark
          ctx.globalAlpha = 0.05;
          ctx.font = 'bold 80px Times New Roman';
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('KCC', finalCanvas.width / 2, finalCanvas.height / 2);
          ctx.globalAlpha = 1;
          resolve();
        };
        
        watermarkImg.src = kccLogo;
      });

      // Calculate PDF dimensions
      const imgWidth = A4_WIDTH_MM;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add image to PDF
      const imgData = finalCanvas.toDataURL('image/png', 0.9);
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
    
    // Get the content
    const content = componentRef.current.innerHTML;
    
    // Create print styles optimized for A4
    const printStyles = `
      <style>
        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 10px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          
          /* Optimize tables for printing */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 9px !important;
          }
          
          th, td {
            padding: 3px 4px !important;
            border: 1px solid #666 !important;
          }
          
          /* Reduce spacing */
          .mb-6 { margin-bottom: 8px !important; }
          .pb-3 { padding-bottom: 4px !important; }
          .mt-6 { margin-top: 8px !important; }
          
          /* Optimize layout */
          .grid-cols-2 {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          
          /* Center content */
          .text-center {
            text-align: center !important;
          }
          
          /* Ensure proper image scaling */
          img {
            max-width: 100% !important;
            height: auto !important;
          }
        }
        
        /* Pre-print styles */
        body {
          width: 210mm;
          min-height: 297mm;
          padding: 10mm 8mm;
          margin: 0 auto;
          background: white;
          font-family: 'Times New Roman', serif;
          font-size: 10px;
          box-sizing: border-box;
        }
        
        /* Adjust content for A4 */
        .pdf-content * {
          box-sizing: border-box;
        }
        
        /* Make tables compact */
        table {
          width: 100%;
          font-size: 9px;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 3px 4px;
          border: 1px solid #666;
        }
        
        /* Reduce header sizes */
        h2 {
          font-size: 14px !important;
          margin: 5px 0 !important;
        }
        
        h3 {
          font-size: 12px !important;
          margin: 4px 0 !important;
        }
      </style>
    `;
    
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
          <div class="pdf-content">
            ${content}
          </div>
          <script>
            // Wait for all images to load before printing
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
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
        className="pdf-content bg-white border border-gray-200 rounded-lg"
        style={{ 
          width: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          padding: '10mm 8mm',
          fontFamily: 'Times New Roman, serif',
          fontSize: '10px',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* Centered watermark overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '30%',
          height: 'auto',
          aspectRatio: '1/1',
          backgroundImage: `url(${kccLogo})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          opacity: 0.08,
          pointerEvents: 'none',
          zIndex: 0
        }}></div>

        {/* Content wrapper to bring content above watermark */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* School Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '12px', 
            paddingBottom: '6px', 
            borderBottom: '2px solid #1e40af' 
          }}>
            {/* School Logo - LEFT SIDE */}
            <div style={{ width: '60px', height: '60px', flexShrink: 0 }}>
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
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: '#dbeafe', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '4px', 
                  border: '1px solid #93c5fd' 
                }}>
                  <span style={{ color: '#1e40af', fontWeight: 'bold', fontSize: '12px' }}>KCC</span>
                </div>
              )}
            </div>
            
            {/* School Name and Details - CENTER */}
            <div style={{ flex: 1, textAlign: 'center', padding: '0 8px' }}>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#1e40af', 
                marginBottom: '4px',
                lineHeight: '1.1'
              }}>
                KAMALUDEEN COMPREHENSIVE COLLEGE (K.C.C)
              </h2>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '2px' }}>
                Knowledge is Power
              </div>
              <div style={{ fontSize: '9px', color: '#6b7280', fontStyle: 'italic' }}>
                Kwanar Yashi along Hayin Dae Muntsira Kano, Nigeria
              </div>
              <div style={{ fontSize: '9px', color: '#6b7280', fontStyle: 'italic', marginTop: '1px' }}>
                08065662896 • kamaluddeencomprehensive@gmail.com
              </div>
            </div>
            
            {/* Student Photo - RIGHT SIDE */}
            <div style={{ width: '50px', height: '50px', flexShrink: 0 }}>
              <div style={{ 
                width: '100%', 
                height: '100%', 
                border: '1px solid #1e40af',
                borderRadius: '2px', 
                overflow: 'hidden', 
                backgroundColor: '#f3f4f6' 
              }}>
                {studentPhotoUrl ? (
                  <img 
                    src={studentPhotoUrl} 
                    alt={student?.studentName || 'Student'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <span style={{ fontSize: '7px', color: '#9ca3af' }}>No Photo</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result Sheet Title */}
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              color: '#1e40af', 
              marginBottom: '1px',
              textTransform: 'uppercase'
            }}>
              STUDENT'S RESULT SHEET
            </h2>
            <div style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>
              {term} TERM - {academicYear} ACADEMIC SESSION
            </div>
          </div>

          {/* Student Information Section - Compact */}
          <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2px', marginBottom: '2px' }}>
                <span style={{ fontWeight: '600', color: '#4b5563', fontSize: '9px' }}>Student's Name:</span>
                <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '9px' }}>{student?.studentName || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2px', marginBottom: '2px' }}>
                <span style={{ fontWeight: '600', color: '#4b5563', fontSize: '9px' }}>Admission Number:</span>
                <span style={{ color: '#111827', fontSize: '9px' }}>{student?.admissionNumber || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2px' }}>
                <span style={{ fontWeight: '600', color: '#4b5563', fontSize: '9px' }}>Class:</span>
                <span style={{ color: '#111827', fontSize: '9px' }}>{className || 'N/A'}</span>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2px', marginBottom: '2px' }}>
                <span style={{ fontWeight: '600', color: '#4b5563', fontSize: '9px' }}>Term:</span>
                <span style={{ color: '#111827', fontSize: '9px' }}>{term || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2px', marginBottom: '2px' }}>
                <span style={{ fontWeight: '600', color: '#4b5563', fontSize: '9px' }}>Academic Year:</span>
                <span style={{ color: '#111827', fontSize: '9px' }}>{academicYear || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2px' }}>
                <span style={{ fontWeight: '600', color: '#4b5563', fontSize: '9px' }}>Date Printed:</span>
                <span style={{ color: '#111827', fontSize: '9px' }}>{currentDate}</span>
              </div>
            </div>
          </div>

          {/* Performance Summary - More Compact */}
          {studentStats && (
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: '#1e40af', 
                marginBottom: '4px',
                textTransform: 'uppercase'
              }}>
                PERFORMANCE SUMMARY
              </h3>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                border: '1px solid #d1d5db',
                marginBottom: '4px',
                fontSize: '8px'
              }}>
                <tbody>
                  <tr>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '3px', 
                      backgroundColor: '#f8fafc',
                      fontWeight: '600'
                    }}>
                      Number in Class
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '3px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '10px'
                    }}>
                      {studentStats.numberInClass || 0}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '3px', 
                      backgroundColor: '#f8fafc',
                      fontWeight: '600'
                    }}>
                      Total Subjects
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '3px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '10px'
                    }}>
                      {studentStats.totalSubjects || 0}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '3px', 
                      backgroundColor: '#f8fafc',
                      fontWeight: '600'
                    }}>
                      Average Score
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '3px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '10px',
                      color: '#1e40af'
                    }}>
                      {studentStats.totalAverage?.toFixed(1) || '0.0'}%
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '3px', 
                      backgroundColor: '#f8fafc',
                      fontWeight: '600'
                    }}>
                      Class Position
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '3px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '10px',
                      color: '#7c3aed'
                    }}>
                      {student?.position ? `${student.position}${getOrdinalSuffix(student.position)}` : 'N/A'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Subjects Table - More Compact */}
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ 
              fontSize: '12px', 
              fontWeight: 'bold', 
              color: '#1e40af', 
              marginBottom: '6px',
              textTransform: 'uppercase'
            }}>
              SUBJECTS PERFORMANCE
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                border: '1px solid #d1d5db',
                fontSize: '8px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#1e40af', color: 'white' }}>
                    <th style={{ border: '1px solid #d1d5db', padding: '3px', textAlign: 'left', fontSize: '8px' }}>S/N</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '3px', textAlign: 'left', fontSize: '8px' }}>SUBJECT</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '3px', textAlign: 'center', fontSize: '8px' }}>CA</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '3px', textAlign: 'center', fontSize: '8px' }}>EXAM</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '3px', textAlign: 'center', fontSize: '8px' }}>TOTAL</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '3px', textAlign: 'center', fontSize: '8px' }}>GRADE</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '3px', textAlign: 'center', fontSize: '8px' }}>REMARKS</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAllSubjects && studentAllSubjects.length > 0 ? (
                    studentAllSubjects.map((subject, index) => (
                      <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white' }}>
                        <td style={{ border: '1px solid #d1d5db', padding: '2px', textAlign: 'center', fontSize: '8px' }}>{index + 1}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '2px', fontWeight: '600', fontSize: '8px' }}>{subject.subjectName}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '2px', textAlign: 'center', fontSize: '8px' }}>{subject.caScore || '0'}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '2px', textAlign: 'center', fontSize: '8px' }}>{subject.examScore || '0'}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '2px', textAlign: 'center', fontWeight: 'bold', fontSize: '8px' }}>
                          {subject.totalScore || '0'}
                        </td>
                        <td style={{ border: '1px solid #d1d5db', padding: '2px', textAlign: 'center', fontSize: '8px' }}>
                          <span style={{
                            padding: '1px 3px',
                            borderRadius: '2px',
                            fontSize: '7px',
                            fontWeight: 'bold',
                            backgroundColor: subject.grade === 'A' ? '#d1fae5' :
                                          subject.grade === 'B' ? '#dbeafe' :
                                          subject.grade === 'C' ? '#fef3c7' :
                                          subject.grade === 'D' ? '#ffedd5' :
                                          subject.grade === 'E' ? '#f3e8ff' :
                                          '#fecaca',
                            color: subject.grade === 'A' ? '#065f46' :
                                  subject.grade === 'B' ? '#1e40af' :
                                  subject.grade === 'C' ? '#92400e' :
                                  subject.grade === 'D' ? '#9a3412' :
                                  subject.grade === 'E' ? '#6b21a8' :
                                  '#991b1b'
                          }}>
                            {subject.grade || 'N/A'}
                          </span>
                        </td>
                        <td style={{ border: '1px solid #d1d5db', padding: '2px', fontSize: '8px' }}>{subject.remarks || getGradeRemark(subject.grade)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', fontSize: '9px' }}>
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
          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '8px', color: '#6b7280' }}>
            <p>This is a computer-generated document. No signature is required for authentication.</p>
            <p style={{ marginTop: '1px' }}>KAMALUDEEN COMPREHENSIVE COLLEGE (K.C.C) - "Knowledge is power"</p>
            <p style={{ marginTop: '1px' }}>Result generated on: {currentDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPDFGenerator;