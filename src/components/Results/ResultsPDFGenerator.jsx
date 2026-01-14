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

  // Function to create a watermark canvas
  const createWatermarkCanvas = () => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      // Create the watermark image
      const watermarkImg = new Image();
      watermarkImg.crossOrigin = 'anonymous';
      watermarkImg.onload = () => {
        // Draw the logo
        ctx.drawImage(watermarkImg, 0, 0, 600, 600);
        
        // Make it semi-transparent
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply transparency
        for (let i = 3; i < data.length; i += 4) {
          data[i] = 50; // 20% opacity (255 * 0.2 = 51)
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      
      watermarkImg.onerror = () => {
        // Fallback to text watermark if image fails
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.font = 'bold 80px Times New Roman';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('KCC', 300, 300);
        resolve(canvas.toDataURL('image/png'));
      };
      
      watermarkImg.src = kccLogo;
    });
  };

  // Function to download as PDF with watermark
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
      
      // Add watermark overlay to cloned element
      const watermarkOverlay = document.createElement('div');
      watermarkOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
        background-image: url(${kccLogo});
        background-repeat: repeat;
        background-size: 200px 200px;
        background-position: center;
        opacity: 0.1;
        mix-blend-mode: multiply;
      `;
      
      // Apply styles to cloned element
      clonedElement.style.cssText = element.style.cssText;
      clonedElement.style.width = '210mm';
      clonedElement.style.minHeight = '297mm';
      clonedElement.style.padding = '15mm';
      clonedElement.style.margin = '0';
      clonedElement.style.boxSizing = 'border-box';
      clonedElement.style.background = 'white';
      clonedElement.style.position = 'relative';
      
      // Insert watermark as background
      clonedElement.style.backgroundImage = `url(${kccLogo})`;
      clonedElement.style.backgroundRepeat = 'repeat';
      clonedElement.style.backgroundSize = '300px 300px';
      clonedElement.style.backgroundPosition = 'center';
      clonedElement.style.backgroundAttachment = 'fixed';
      clonedElement.style.backgroundBlendMode = 'multiply';
      clonedElement.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      
      // Make sure content is visible above watermark
      const allElements = clonedElement.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.style) {
          el.style.backgroundColor = 'transparent';
          el.style.position = 'relative';
          el.style.zIndex = '1001';
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

      // Create watermark canvas
      const watermarkDataURL = await createWatermarkCanvas();
      
      // Use html2canvas with watermark
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: clonedElement.scrollHeight,
        onclone: (clonedDoc) => {
          // Add watermark style to cloned document
          const style = document.createElement('style');
          style.innerHTML = `
            body::before {
              content: "";
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-image: url(${kccLogo});
              background-repeat: repeat;
              background-size: 300px 300px;
              background-position: center;
              opacity: 0.08;
              pointer-events: none;
              z-index: 0;
            }
            * {
              position: relative;
              z-index: 1;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create final canvas with watermark
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const finalCtx = finalCanvas.getContext('2d');
      
      // Draw original content
      finalCtx.drawImage(canvas, 0, 0);
      
      // Create watermark pattern
      const watermarkPattern = finalCtx.createPattern(
        await createPatternCanvas(watermarkDataURL),
        'repeat'
      );
      
      finalCtx.globalAlpha = 0.08;
      finalCtx.fillStyle = watermarkPattern;
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      finalCtx.globalAlpha = 1;

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (finalCanvas.height * imgWidth) / finalCanvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add image to PDF
      const imgData = finalCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Add additional watermark to PDF for extra safety
      const watermarkImg = new Image();
      watermarkImg.onload = () => {
        // Add watermark at the end
        pdf.setGState(new pdf.GState({opacity: 0.1}));
        const pageCount = pdf.internal.getNumberOfPages();
        
        for(let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          // Add watermark in center
          pdf.addImage(
            watermarkDataURL,
            'PNG',
            pageWidth/2 - 100,
            pageHeight/2 - 100,
            200,
            200
          );
          
          // Add smaller watermarks in corners
          pdf.addImage(watermarkDataURL, 'PNG', 10, 10, 50, 50);
          pdf.addImage(watermarkDataURL, 'PNG', pageWidth - 60, pageHeight - 60, 50, 50);
        }
        
        pdf.setGState(new pdf.GState({opacity: 1}));
        
        // Save PDF
        const fileName = `${student?.studentName || 'Student'}_${term}_Term_${academicYear}_Result.pdf`
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9_]/g, '');
        
        pdf.save(fileName);
      };
      
      watermarkImg.src = watermarkDataURL;

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

  // Helper function to create pattern canvas
  const createPatternCanvas = (imageDataURL) => {
    return new Promise((resolve) => {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = 200;
      patternCanvas.height = 200;
      const patternCtx = patternCanvas.getContext('2d');
      
      const img = new Image();
      img.onload = () => {
        patternCtx.drawImage(img, 0, 0, 200, 200);
        resolve(patternCanvas);
      };
      img.src = imageDataURL;
    });
  };

  // Direct print functionality with watermark
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
    
    // Create print styles with watermark
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
        }
        
        /* Watermark styling */
        body {
          width: 210mm;
          min-height: 297mm;
          padding: 15mm;
          margin: 0 auto;
          background: white;
          font-family: 'Times New Roman', Times, serif;
          font-size: 12px;
          position: relative;
        }
        
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url(${kccLogo});
          background-repeat: repeat;
          background-size: 300px 300px;
          background-position: center;
          opacity: 0.08;
          pointer-events: none;
          z-index: 0;
        }
        
        * {
          position: relative;
          z-index: 1;
        }
        
        /* Layout fixes */
        .grid {
          display: grid !important;
        }
        .grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
        .grid-cols-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
        .flex {
          display: flex !important;
        }
        .justify-between {
          justify-content: space-between !important;
        }
        .items-start {
          align-items: flex-start !important;
        }
        .text-center {
          text-align: center !important;
        }
        .w-full {
          width: 100% !important;
        }
        .w-1\\/4 {
          width: 25% !important;
        }
        .flex-1 {
          flex: 1 1 0% !important;
        }
        
        /* Spacing */
        .mb-4 { margin-bottom: 1rem !important; }
        .mb-6 { margin-bottom: 1.5rem !important; }
        .mt-6 { margin-top: 1.5rem !important; }
        .pb-3 { padding-bottom: 0.75rem !important; }
        
        /* Borders */
        .border-b { border-bottom-width: 1px !important; }
        .border-blue-800 { border-color: #1e40af !important; }
        
        /* Tables */
        table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        th, td {
          border: 1px solid #d1d5db !important;
          padding: 4px 6px !important;
        }
        
        /* Images */
        img {
          max-width: 100% !important;
          height: auto !important;
        }
        
        /* Box sizing */
        * {
          box-sizing: border-box !important;
        }
        
        /* Background colors - ensure they're visible over watermark */
        .bg-white {
          background-color: rgba(255, 255, 255, 0.95) !important;
        }
        .bg-f9fafb {
          background-color: rgba(249, 250, 251, 0.95) !important;
        }
        .bg-f3f4f6 {
          background-color: rgba(243, 244, 246, 0.95) !important;
        }
        .bg-f8fafc {
          background-color: rgba(248, 250, 252, 0.95) !important;
        }
        .bg-f0f9ff {
          background-color: rgba(240, 249, 255, 0.95) !important;
        }
        .bg-1e40af {
          background-color: rgba(30, 64, 175, 0.95) !important;
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
          ${content}
          <script>
            // Wait for all images to load before printing
            window.onload = function() {
              // Add a small delay to ensure watermark renders
              setTimeout(() => {
                window.print();
                // Optional: close after printing
                // setTimeout(() => window.close(), 1000);
              }, 500);
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
          boxSizing: 'border-box',
          position: 'relative',
          backgroundImage: `url(${kccLogo})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
          backgroundPosition: 'center',
          backgroundBlendMode: 'multiply',
          backgroundColor: 'rgba(255, 255, 255, 0.98)'
        }}
      >
        {/* Watermark overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${kccLogo})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
          backgroundPosition: 'center',
          opacity: 0.08,
          pointerEvents: 'none',
          zIndex: 0
        }}></div>

        {/* Content wrapper to bring content above watermark */}
        <div style={{ position: 'relative', zIndex: 1 }}>
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
    </div>
  );
};

export default ResultsPDFGenerator;