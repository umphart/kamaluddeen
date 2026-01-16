import React, { useRef, useState } from 'react';
import { FiPrinter, FiDownload } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import kccLogo from './kcc.jpeg';

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
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to download as PDF
  const handleDownloadPDF = async () => {
    if (!componentRef.current) {
      alert('No content available for download');
      return;
    }

    try {
      setIsGenerating(true);
      
      const element = componentRef.current;
      
      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        top: -10000px;
        left: -10000px;
        width: 210mm;
        background: white;
        z-index: 9999;
      `;
      
      // Clone the element
      const clonedElement = element.cloneNode(true);
      
      // Apply styles for PDF
      clonedElement.style.cssText = `
        width: 210mm !important;
        min-height: 297mm !important;
        padding: 10mm 8mm !important;
        margin: 0 !important;
        background: white !important;
        font-family: 'Times New Roman', serif !important;
        font-size: 10px !important;
        box-sizing: border-box !important;
      `;
      
      // Remove any existing watermark from clone
      const watermark = clonedElement.querySelector('[style*="opacity: 0.08"]');
      if (watermark) {
        watermark.remove();
      }
      
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);

      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use html2canvas with optimized settings
      const canvas = await html2canvas(clonedElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 210 * 3.78, // Convert mm to pixels
        windowWidth: 210 * 3.78,
        onclone: (clonedDoc) => {
          // Ensure all elements are visible
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            el.style.boxSizing = 'border-box';
            el.style.maxWidth = 'none';
          });
        }
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add watermark after generating the PDF image
      const ctx = canvas.getContext('2d');
      const watermarkImg = new Image();
      
      await new Promise((resolve) => {
        watermarkImg.onload = () => {
          ctx.globalAlpha = 0.1;
          const watermarkWidth = canvas.width * 0.4;
          const watermarkHeight = (watermarkImg.height * watermarkWidth) / watermarkImg.width;
          const x = (canvas.width - watermarkWidth) / 2;
          const y = (canvas.height - watermarkHeight) / 2;
          ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight);
          ctx.globalAlpha = 1;
          resolve();
        };
        
        watermarkImg.onerror = () => {
          // Text fallback
          ctx.globalAlpha = 0.05;
          ctx.font = 'bold 100px Times New Roman';
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('KCC', canvas.width / 2, canvas.height / 2);
          ctx.globalAlpha = 1;
          resolve();
        };
        
        watermarkImg.src = kccLogo;
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save PDF
      const fileName = `${student?.studentName || 'Student'}_${term}_Term_${academicYear}_Result.pdf`
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '');
      
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct print functionality (simplified)
  const handleDirectPrint = () => {
    if (!componentRef.current) {
      alert('No content available for printing');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    const content = componentRef.current.innerHTML;
    
    const printStyles = `
      <style>
        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 10px;
            margin: 0;
            padding: 0;
          }
          table {
            font-size: 9px;
            border-collapse: collapse;
          }
          th, td {
            padding: 3px 4px;
          }
          img {
            max-width: 100%;
            height: auto;
          }
        }
        body {
          width: 210mm;
          margin: 0 auto;
          padding: 10mm 8mm;
          background: white;
        }
      </style>
    `;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${student?.studentName || 'Student'} - ${term} Term Result</title>
          <meta charset="UTF-8">
          ${printStyles}
        </head>
        <body>
          <div style="position: relative;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; z-index: 0; pointer-events: none;">
              <img src="${kccLogo}" alt="Watermark" style="width: 300px; height: auto;" />
            </div>
            <div style="position: relative; z-index: 1;">
              ${content}
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Helper functions (keep as is)
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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

  const getOrdinalSuffix = (n) => {
    if (!n) return '';
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

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
          disabled={isGenerating}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
          title="Download as PDF"
        >
          <FiDownload />
          {isGenerating ? 'Generating...' : 'Download PDF'}
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

      {/* PDF Content */}
      <div 
        ref={componentRef} 
        className="pdf-content bg-white border border-gray-200 rounded-lg"
        style={{ 
          width: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          padding: '10mm 8mm',
          fontFamily: "'Times New Roman', serif",
          fontSize: '10px',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* Watermark Background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '40%',
          opacity: 0.1,
          pointerEvents: 'none',
          zIndex: 0
        }}>
          <img 
            src={kccLogo} 
            alt="Watermark" 
            style={{ width: '100%', height: 'auto' }}
            crossOrigin="anonymous"
          />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
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
    </div>
  );
};

export default ResultsPDFGenerator;