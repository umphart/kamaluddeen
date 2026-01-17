// src/pages/AdmissionLetterModal.jsx
import React, { useRef, useState } from 'react';
import { FiDownload, FiPrinter, FiX, FiLoader } from 'react-icons/fi';
import schoolLogo from './kcc.jpeg'; // Import logo from pages folder
import ownerSignature from './sign.png'; // Import owner signature from pages folder

const AdmissionLetterModal = ({
  showAdmissionLetter,
  setShowAdmissionLetter,
  selectedLetterStudent,
  setSelectedLetterStudent,
  getAdmissionDuration,
  getCompletionYear
}) => {
  const letterRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingPrint, setIsGeneratingPrint] = useState(false);

  if (!showAdmissionLetter || !selectedLetterStudent) return null;

  // School information
  const schoolInfo = {
    name: "KAMALUDEEN COMPREHENSIVE COLLEGE",
    motto: "Knowledge is Power",
    address: "Kwanar Yashi along Hayin Dae Muntsira Kano, Nigeria",
    phone: "+234 8065662896",
    email: "kamaluddeencomprehensive@gmail.com",
    secondaryEmail: "aliyumuzammilsani@gmail.com",
    owner: "Muzammil Sani Aliyu (BSc)",
    logo: schoolLogo,
    signature: ownerSignature
  };

  // Function to generate PDF
const generatePDF = async (forPrint = false) => {
    if (!selectedLetterStudent) return;
    
    try {
      if (forPrint) {
        setIsGeneratingPrint(true);
      } else {
        setIsGeneratingPDF(true);
      }

      // Dynamically import libraries
      const [jsPDFModule, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      
      const { default: jsPDF } = jsPDFModule;
      const { default: html2canvas } = html2canvasModule;

      // Create a temporary div for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '794px'; // A4 width in pixels (794px = 210mm)
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '30px'; // Reduced padding from 40px to 30px
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.style.fontFamily = "'Times New Roman', Times, serif";
      tempDiv.style.position = 'relative';
      tempDiv.style.overflow = 'hidden';
      
      // Clone the letter content
      const letterContent = letterRef.current.cloneNode(true);
      
      // Remove action buttons and unnecessary elements
      const buttons = letterContent.querySelectorAll('.action-buttons, .watermark-text');
      buttons.forEach(button => button.remove());
      
      // Create a compact version for PDF
      const compactContent = letterContent.cloneNode(true);
      
      // Reduce spacing for PDF
      const elementsToCompact = compactContent.querySelectorAll('p, div, ul, li');
      elementsToCompact.forEach(el => {
        const style = window.getComputedStyle(el);
        const currentMargin = parseFloat(style.marginBottom);
        const currentPadding = parseFloat(style.padding);
        
        if (currentMargin > 8) {
          el.style.marginBottom = '8px';
        }
        if (currentPadding > 10) {
          el.style.padding = '8px';
        }
      });
      
      // Reduce spacing in details container
      const detailsContainer = compactContent.querySelector('.bg-gradient-to-r');
      if (detailsContainer) {
        detailsContainer.style.padding = '12px';
        detailsContainer.style.margin = '10px 0';
      }
      
      // Reduce spacing in signatures
      const signatures = compactContent.querySelectorAll('.flex.justify-between');
      signatures.forEach(sig => {
        sig.style.marginTop = '20px';
      });
      
      // Update styles for PDF
      compactContent.style.width = '100%';
      compactContent.style.padding = '0';
      compactContent.style.margin = '0';
      compactContent.style.border = 'none';
      compactContent.style.boxShadow = 'none';
      compactContent.style.backgroundColor = 'white';
      compactContent.style.position = 'relative';
      compactContent.style.zIndex = '10';
      
      // Create watermark container
      const watermarkContainer = document.createElement('div');
      watermarkContainer.style.position = 'absolute';
      watermarkContainer.style.top = '0';
      watermarkContainer.style.left = '0';
      watermarkContainer.style.width = '100%';
      watermarkContainer.style.height = '100%';
      watermarkContainer.style.zIndex = '1';
      watermarkContainer.style.pointerEvents = 'none';
      watermarkContainer.style.overflow = 'hidden';
      
      // Create repeating watermarks
      const createWatermarkGrid = () => {
        const gridContainer = document.createElement('div');
        gridContainer.style.position = 'absolute';
        gridContainer.style.top = '0';
        gridContainer.style.left = '0';
        gridContainer.style.width = '100%';
        gridContainer.style.height = '100%';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        gridContainer.style.gridTemplateRows = 'repeat(4, 1fr)';
        gridContainer.style.gap = '20px';
        gridContainer.style.padding = '20px';
        
        // Create 12 watermarks (3 columns × 4 rows)
        for (let i = 0; i < 12; i++) {
          const watermark = document.createElement('div');
          watermark.style.display = 'flex';
          watermark.style.alignItems = 'center';
          watermark.style.justifyContent = 'center';
          watermark.style.opacity = '0.15';
          
          const watermarkImg = document.createElement('img');
          watermarkImg.src = schoolLogo;
          watermarkImg.style.width = '120px';
          watermarkImg.style.height = '120px';
          watermarkImg.style.objectFit = 'contain';
          watermarkImg.style.transform = 'rotate(-45deg)';
          watermarkImg.style.filter = 'grayscale(100%) brightness(1.2)';
          
          watermark.appendChild(watermarkImg);
          gridContainer.appendChild(watermark);
        }
        
        return gridContainer;
      };
      
      // Add PDF-specific styles with more compact layout
      const style = document.createElement('style');
      style.innerHTML = `
        @media all {
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          .pdf-content {
            width: 100%;
            max-width: 794px;
            margin: 0 auto;
            padding: 30px;
            background: white;
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.5;
            color: #333;
            position: relative;
          }
          
          .letterhead {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #4F46E5;
            position: relative;
            z-index: 20;
          }
          
          .school-logo-pdf {
            width: 80px;
            height: 80px;
            object-fit: contain;
            flex-shrink: 0;
          }
          
          .school-info-pdf {
            flex: 1;
            text-align: center;
            padding: 0 15px;
          }
          
          .school-name-pdf {
            font-size: 20px;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 3px;
          }
          
          .school-motto-pdf {
            font-size: 13px;
            font-style: italic;
            color: #4F46E5;
            margin-bottom: 5px;
          }
          
          .school-address-pdf {
            font-size: 11px;
            color: #666;
            margin-bottom: 2px;
          }
          
          .student-photo-pdf {
            width: 70px;
            height: 90px;
            object-fit: cover;
            border: 1px solid #4F46E5;
            border-radius: 2px;
            flex-shrink: 0;
          }
          
          .date-pdf {
            text-align: right;
            margin-bottom: 15px;
            font-size: 12px;
            position: relative;
            z-index: 20;
          }
          
          .recipient-pdf {
            margin-bottom: 15px;
            padding-left: 12px;
            border-left: 3px solid #4F46E5;
            position: relative;
            z-index: 20;
          }
          
          .subject-pdf {
            font-weight: bold;
            margin: 15px 0;
            text-align: center;
            font-size: 15px;
            text-decoration: underline;
            position: relative;
            z-index: 20;
          }
          
          .content-pdf {
            margin-bottom: 20px;
            font-size: 12px;
            position: relative;
            z-index: 20;
          }
          
          .content-pdf p {
            margin-bottom: 8px;
            text-align: justify;
          }
          
          .details-container-pdf {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 12px;
            margin: 12px 0;
            position: relative;
            z-index: 20;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-top: 8px;
          }
          
          .detail-item {
            margin-bottom: 8px;
          }
          
          .detail-label {
            font-size: 9px;
            color: #666;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 1px;
          }
          
          .detail-value {
            font-size: 10px;
            font-weight: 600;
            color: #333;
            padding: 3px 0;
            border-bottom: 1px dashed #cbd5e0;
          }
          
          .signatures-pdf {
            display: flex;
            justify-content: space-between;
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #cbd5e0;
            position: relative;
            z-index: 20;
          }
          
          .owner-signature-img {
            height: 50px;
            width: 140px;
            object-fit: contain;
            margin-bottom: 3px;
          }
          
          .footer-pdf {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            font-size: 10px;
            color: #666;
            position: relative;
            z-index: 20;
          }
          
          /* Reduce list spacing */
          .content-pdf ul {
            margin-left: 15px;
            margin-bottom: 10px;
          }
          
          .content-pdf li {
            margin-bottom: 4px;
          }
          
          /* Watermark styles */
          .watermark-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
            opacity: 0.15;
            background-image: url("${schoolLogo}");
            background-repeat: repeat;
            background-size: 120px 120px;
            background-position: 0 0;
            opacity: 0.15;
            transform: rotate(-45deg);
          }
          
          .watermark-grid {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
            opacity: 0.1;
          }
          
          .watermark-item {
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.1;
          }
          
          .watermark-logo {
            width: 100px;
            height: 100px;
            object-fit: contain;
            filter: grayscale(100%) brightness(1.2);
            opacity: 0.15;
          }
        }
      `;
      
      // Add watermark pattern overlay
      const watermarkPattern = document.createElement('div');
      watermarkPattern.className = 'watermark-pattern';
      
      // Add repeating watermark overlay using CSS background
      const watermarkOverlay = document.createElement('div');
      watermarkOverlay.className = 'watermark-overlay';
      
      // Add grid watermarks
      const watermarkGrid = createWatermarkGrid();
      watermarkGrid.className = 'watermark-grid';
      
      // Assemble the content
      watermarkContainer.appendChild(watermarkPattern);
      watermarkContainer.appendChild(watermarkOverlay);
      watermarkContainer.appendChild(watermarkGrid);
      
      tempDiv.appendChild(style);
      tempDiv.appendChild(watermarkContainer);
      tempDiv.appendChild(compactContent);
      document.body.appendChild(tempDiv);

      // Create canvas from the content
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        onclone: function(clonedDoc) {
          const watermarks = clonedDoc.querySelectorAll('.watermark-overlay, .watermark-grid, .watermark-pattern');
          watermarks.forEach(wm => {
            wm.style.opacity = '0.15';
          });
        }
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Calculate dimensions
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if content fits on one page
      const maxPageHeight = 297; // A4 height in mm
      if (imgHeight > maxPageHeight) {
        // Content is too long, scale it down to fit
        const scaleFactor = maxPageHeight / imgHeight * 0.95; // 95% to ensure footer fits
        const scaledHeight = imgHeight * scaleFactor;
        const scaledWidth = imgWidth * scaleFactor;
        
        // Center the scaled content
        const xOffset = (210 - scaledWidth) / 2;
        const yOffset = (297 - scaledHeight) / 2;
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
      } else {
        // Content fits normally
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      // Clean up
      document.body.removeChild(tempDiv);

      if (forPrint) {
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl);
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
            setIsGeneratingPrint(false);
          };
        }
      } else {
        pdf.save(`Admission_Letter_${selectedLetterStudent.fullName.replace(/\s+/g, '_')}.pdf`);
        setIsGeneratingPDF(false);
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGeneratingPDF(false);
      setIsGeneratingPrint(false);
      
      if (!forPrint) {
        downloadHTMLFallback();
      } else {
        printHTMLFallback();
      }
    }
  };
  // Fallback HTML download function
  const downloadHTMLFallback = () => {
    const completionYear = getCompletionYear(selectedLetterStudent.admissionDate, selectedLetterStudent.level);
    const duration = getAdmissionDuration(selectedLetterStudent.level, selectedLetterStudent.className);
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Convert logo to data URL
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = schoolLogo;
    
    // Convert signature to data URL
    const signatureCanvas = document.createElement('canvas');
    const signatureCtx = signatureCanvas.getContext('2d');
    const signatureImg = new Image();
    signatureImg.src = ownerSignature;
    
    Promise.all([
      new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve('');
      }),
      new Promise((resolve) => {
        signatureImg.onload = () => {
          signatureCanvas.width = signatureImg.width;
          signatureCanvas.height = signatureImg.height;
          signatureCtx.drawImage(signatureImg, 0, 0);
          resolve(signatureCanvas.toDataURL('image/png'));
        };
        signatureImg.onerror = () => resolve('');
      })
    ]).then(([logoDataUrl, signatureDataUrl]) => {
      const htmlContent = createHTMLContent(logoDataUrl, signatureDataUrl, completionYear, duration, currentDate);
      downloadHTML(htmlContent);
    }).catch(() => {
      const htmlContent = createHTMLContent('', '', completionYear, duration, currentDate);
      downloadHTML(htmlContent);
    });
  };

 const createHTMLContent = (logoDataUrl, signatureDataUrl, completionYear, duration, currentDate) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admission Letter - ${selectedLetterStudent.fullName}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm; /* Reduced from 20mm */
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            margin: 0;
            padding: 15mm; /* Reduced from 20mm */
            line-height: 1.5; /* Reduced from 1.6 */
            color: #333;
            width: 210mm;
            min-height: 297mm;
            position: relative;
          }
          /* ... keep other styles but make them more compact ... */
          .details-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr); /* Changed to 4 columns */
            gap: 10px; /* Reduced from 15px */
            margin-top: 8px; /* Reduced from 10px */
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            opacity: 0.05;
            z-index: -1;
          }
          .watermark-logo {
            width: 300px;
            height: 300px;
            object-fit: contain;
          }
          .letterhead {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #4F46E5;
          }
          .school-logo {
            width: 100px;
            height: 100px;
            object-fit: contain;
            flex-shrink: 0;
          }
          .school-info {
            flex: 1;
            text-align: center;
            padding: 0 15px;
          }
          .school-name {
            font-size: 22px;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 5px;
          }
          .school-motto {
            font-size: 14px;
            font-style: italic;
            color: #4F46E5;
            margin-bottom: 8px;
          }
          .school-address {
            font-size: 12px;
            color: #666;
            margin-bottom: 3px;
          }
          .student-photo {
            width: 90px;
            height: 110px;
            object-fit: cover;
            border: 1px solid #4F46E5;
            border-radius: 3px;
            flex-shrink: 0;
          }
          .date {
            text-align: right;
            margin-bottom: 20px;
            font-size: 13px;
          }
          .recipient {
            margin-bottom:15px;
            padding-left: 15px;
            border-left: 3px solid #4F46E5;
          }
          .subject {
            font-weight: bold;
            margin: 10px 0;
            text-align: center;
            font-size: 16px;
            text-decoration: underline;
          }
          .content {
            margin-bottom: 30px;
            font-size: 13px;
          }
          .content p {
            margin-bottom: 12px;
            text-align: justify;
          }
          .details-container {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px;
            margin: 10px 0;
          }
          .details-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 10px;
          }
          .detail-item {
            margin-bottom: 12px;
          }
          .detail-label {
            font-size: 10px;
            color: #666;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }
          .detail-value {
            font-size: 11px;
            font-weight: 600;
            color: #333;
            padding: 4px 0;
            border-bottom: 1px dashed #cbd5e0;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 35px;
            padding-top: 15px;
            border-top: 1px solid #cbd5e0;
          }
          .footer {
            text-align: center;
            margin-top: 25px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #666;
          }
          @media print {
            body {
              margin: 0;
              padding: 20mm;
            }
          }
        </style>
      </head>
      <body>
        ${logoDataUrl ? `
          <div class="watermark">
            <img src="${logoDataUrl}" class="watermark-logo" alt="School Logo Watermark">
          </div>
        ` : ''}
        
        <div class="letterhead">
          ${logoDataUrl ? `
            <img src="${logoDataUrl}" class="school-logo" alt="KCC Logo">
          ` : '<div class="school-logo"></div>'}
          
          <div class="school-info">
            <div class="school-name">${schoolInfo.name}</div>
            <div class="school-motto">"${schoolInfo.motto}"</div>
            <div class="school-address">${schoolInfo.address}</div>
            <div class="school-address">Phone: ${schoolInfo.phone} | Email: ${schoolInfo.email}</div>
          </div>
          
          <div class="student-photo-container">
            ${selectedLetterStudent.photo ? `
              <img src="${selectedLetterStudent.photo}" class="student-photo" alt="Student Photo">
            ` : `
              <div class="student-photo" style="display: flex; align-items: center; justify-content: center; background: #f5f5f5;">
                Photo
              </div>
            `}
          </div>
        </div>
        
        <div class="date">${currentDate}</div>
        
        <div class="recipient">
          <strong>To:</strong><br>
          Mr/Mrs ${selectedLetterStudent.parentName}<br>
          ${selectedLetterStudent.parentAddress || 'Parent/Guardian'}<br>
          Phone: ${selectedLetterStudent.parentPhone}
        </div>
        
        <div class="subject">
          LETTER OF ADMISSION
        </div>
        
        <div class="content">
          <p>Dear Mr/Mrs ${selectedLetterStudent.parentName},</p>
          
          <p>We are pleased to inform you that your child, <strong>${selectedLetterStudent.fullName}</strong>, 
          has been granted admission to ${schoolInfo.name} for the ${new Date().getFullYear()}/${new Date().getFullYear() + 1} academic session.</p>
          
          <p>This letter serves as official confirmation of admission with the following details:</p>
          
          <div class="details-container">
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Student's Full Name:</div>
                <div class="detail-value">${selectedLetterStudent.fullName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Admission Number:</div>
                <div class="detail-value">${selectedLetterStudent.admissionNumber}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Level:</div>
                <div class="detail-value">${selectedLetterStudent.level}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Class:</div>
                <div class="detail-value">${selectedLetterStudent.className}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Gender:</div>
                <div class="detail-value">${selectedLetterStudent.gender}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Date of Birth:</div>
                <div class="detail-value">${selectedLetterStudent.dateOfBirth}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Admission Date:</div>
                <div class="detail-value">${selectedLetterStudent.admissionDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Program Duration:</div>
                <div class="detail-value">${duration}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Expected Completion:</div>
                <div class="detail-value">${completionYear}</div>
              </div>
            </div>
          </div>
          
          <p>We congratulate you on this achievement and welcome your child to our institution. 
          ${schoolInfo.name} is committed to providing quality education that combines 
          academic excellence with moral upbringing in line with Islamic values.</p>
          
          <p>Please note the following important information:</p>
          <ul>
            <li>Orientation for new students will hold on ${new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString()}</li>
            <li>School fees payment deadline is ${new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString()}</li>
            <li>School uniforms and books are available at the school store</li>
            <li>School hours are from 8:00 AM to 2:00 PM, Monday to Friday</li>
          </ul>
          
          <p>We look forward to a fruitful partnership in the educational and moral development of your child. 
          Should you have any questions, please do not hesitate to contact the admissions office.</p>
        </div>
        
        <div class="signatures">
          <div>
            <div style="border-top: 1px solid #333; width: 200px; padding-top: 10px; margin-top: 40px;">
              <strong>Principal</strong><br>
              ${schoolInfo.name}
            </div>
          </div>
          
          <div>
            ${signatureDataUrl ? `
              <img src="${signatureDataUrl}" alt="Owner Signature" style="height: 50px; object-fit: contain;">
            ` : ''}
            <div style="border-top: 1px solid #333; width: 200px; padding-top: 10px; margin-top: 10px; text-align: right;">
              <strong>${schoolInfo.owner}</strong><br>
              School Owner/Proprietor<br>
              ${schoolInfo.name}
            </div>
          </div>
        </div>
        
        <div class="footer">
          Official Document | Copy No. 1 of 2 | Generated on: ${new Date().toLocaleDateString()}
          <div style="display: flex; justify-content: center; gap: 15px; margin-top: 8px; font-size: 10px;">
            <span>📞 ${schoolInfo.phone}</span>
            <span>📧 ${schoolInfo.email}</span>
            <span>📧 ${schoolInfo.secondaryEmail}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const downloadHTML = (htmlContent) => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Admission_Letter_${selectedLetterStudent.fullName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsGeneratingPDF(false);
  };

  const printHTMLFallback = () => {
    const completionYear = getCompletionYear(selectedLetterStudent.admissionDate, selectedLetterStudent.level);
    const duration = getAdmissionDuration(selectedLetterStudent.level, selectedLetterStudent.className);
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = createHTMLContent('', '', completionYear, duration, currentDate);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      setIsGeneratingPrint(false);
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiDownload className="text-indigo-600" />
            Admission Letter: {selectedLetterStudent.fullName}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 text-2xl"
            onClick={() => {
              setShowAdmissionLetter(false);
              setSelectedLetterStudent(null);
            }}
            disabled={isGeneratingPDF || isGeneratingPrint}
          >
            <FiX />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Admission Letter Preview */}
          <div 
            ref={letterRef}
            className="w-full mx-auto border border-gray-200 rounded-lg p-8 bg-white relative overflow-hidden"
            style={{
              width: '794px',
              maxWidth: '100%',
              margin: '0 auto',
              backgroundColor: 'white'
            }}
          >
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] opacity-5 z-0 watermark-text">
              <img 
                src={schoolLogo} 
                alt="School Logo Watermark" 
                className="w-96 h-96 object-contain"
              />
            </div>

            {/* Letterhead */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-indigo-600 relative z-10">
              <div className="flex-shrink-0 w-24">
                <img 
                  src={schoolLogo} 
                  alt="KCC Logo" 
                  className="w-24 h-24 object-contain rounded-lg border-2 border-indigo-200"
                />
              </div>
              
              <div className="flex-1 px-6 text-center">
                <h1 className="text-2xl font-bold text-indigo-700">{schoolInfo.name}</h1>
                <p className="text-indigo-600 italic mt-1 text-sm">"{schoolInfo.motto}"</p>
                <p className="text-gray-600 text-xs mt-2">{schoolInfo.address}</p>
                <p className="text-gray-600 text-xs">Phone: {schoolInfo.phone} | Email: {schoolInfo.email}</p>
              </div>
              
              <div className="flex-shrink-0 w-24">
                {selectedLetterStudent.photo ? (
                  <img 
                    src={selectedLetterStudent.photo} 
                    alt={selectedLetterStudent.fullName}
                    className="w-24 h-28 object-cover rounded-lg border-2 border-indigo-200"
                  />
                ) : (
                  <div className="w-24 h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-indigo-200">
                    <div className="text-gray-400 text-xs text-center px-2">Student Photo</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Date */}
            <div className="text-right mb-4 relative z-10">
              <p className="text-gray-700 text-sm">{new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
            
            {/* Recipient */}
            <div className="mb-4 pl-4 border-l-3 border-indigo-200 relative z-10">
              <p className="font-semibold text-gray-800 text-sm">To:</p>
              <p className="text-gray-700 text-sm">Mr/Mrs {selectedLetterStudent.parentName}</p>
              <p className="text-gray-700 text-sm">{selectedLetterStudent.parentAddress || 'Parent/Guardian'}</p>
              <p className="text-gray-700 text-sm">Phone: {selectedLetterStudent.parentPhone}</p>
            </div>
            
            {/* Subject */}
            <div className="text-center my-6 relative z-10">
              <h2 className="text-lg font-bold text-gray-800 underline">LETTER OF ADMISSION</h2>
            </div>
            
               {/* Content */}
            <div className="space-y-3 text-gray-700 text-sm relative z-10">
              <p>Dear Mr/Mrs {selectedLetterStudent.parentName},</p>
              
              <p>We are pleased to inform you that your child, <strong>{selectedLetterStudent.fullName}</strong>, 
              has been granted admission to {schoolInfo.name} for the {new Date().getFullYear()}/{new Date().getFullYear() + 1} academic session.</p>
              
              <p>This letter serves as official confirmation of admission with the following details:</p>
              
              {/* Details Container - 4 rows without class */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 my-4 border border-indigo-100 relative z-10">
                <div className="grid grid-cols-4 gap-4 mt-2">
                  {/* Row 1 */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Student's Full Name</p>
                    <p className="font-semibold text-gray-800 text-sm border-b border-dashed border-gray-300 pb-1">{selectedLetterStudent.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Admission Number</p>
                    <p className="font-semibold text-indigo-700 text-sm border-b border-dashed border-gray-300 pb-1">{selectedLetterStudent.admissionNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Level</p>
                    <p className="font-semibold text-gray-800 text-sm border-b border-dashed border-gray-300 pb-1">{selectedLetterStudent.level}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Gender</p>
                    <p className="font-semibold text-gray-800 text-sm border-b border-dashed border-gray-300 pb-1">{selectedLetterStudent.gender}</p>
                  </div>
                  
                  {/* Row 2 */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Date of Birth</p>
                    <p className="font-semibold text-gray-800 text-sm border-b border-dashed border-gray-300 pb-1">{selectedLetterStudent.dateOfBirth}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Admission Date</p>
                    <p className="font-semibold text-gray-800 text-sm border-b border-dashed border-gray-300 pb-1">{selectedLetterStudent.admissionDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Program Duration</p>
                    <p className="font-semibold text-gray-800 text-sm border-b border-dashed border-gray-300 pb-1">
                      {getAdmissionDuration(selectedLetterStudent.level, selectedLetterStudent.className)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Expected Completion</p>
                    <p className="font-semibold text-gray-800 text-sm border-b border-dashed border-gray-300 pb-1">
                      {getCompletionYear(selectedLetterStudent.admissionDate, selectedLetterStudent.level)}
                    </p>
                  </div>
                </div>
              </div>
              
              <p>We congratulate you on this achievement and welcome your child to our institution. 
              {schoolInfo.name} is committed to providing quality education that combines 
              academic excellence with moral upbringing in line with Islamic values.</p>
              
              <p>Please note the following important information:</p>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>School fees payment deadline is {new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString()}</li>
                <li>School uniforms and books are available at the school</li>
                <li>School hours are from 8:00 AM to 2:00 PM, Monday to Friday</li>
              </ul>
              
              <p>We look forward to a fruitful partnership in the educational and moral development of your child. 
              Should you have any questions, please do not hesitate to contact the admissions office.</p>
            </div>
            
            {/* Signatures - Principal (without name) and Owner */}
            <div className="flex justify-between mt-8 relative z-10">
              <div className="pt-6 border-t border-gray-300 w-48">
                <p className="font-bold text-gray-800 text-sm">Principal</p>
                <p className="text-gray-600 text-xs">{schoolInfo.name}</p>
              </div>
              
<div className="text-right">
  <img 
    src={ownerSignature} 
    alt="Owner Signature" 
    className="h-32 w-64 object-contain mb-1"
  />
  <div className="pt-6 border-t border-gray-300 w-64 text-right">
    <p className="font-bold text-gray-800 text-sm">{schoolInfo.owner}</p>
    <p className="text-gray-600 text-xs">School Owner/Proprietor</p>
    <p className="text-gray-600 text-xs">{schoolInfo.name}</p>
  </div>
</div>
            </div>
            
            {/* Footer */}
            <div className="mt-8 pt-3 border-t border-gray-200 text-center text-xs text-gray-500 relative z-10">
              <p>Official Document | Copy No. 1 of 2 | Generated on: {new Date().toLocaleDateString()}</p>
              <div className="flex justify-center gap-4 mt-1 text-xs">
                <span>📞 {schoolInfo.phone}</span>
                <span>📧 {schoolInfo.email}</span>
                <span>📧 {schoolInfo.secondaryEmail}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="action-buttons flex justify-center gap-4 mt-6">
            <button
              onClick={() => generatePDF(false)}
              disabled={isGeneratingPDF || isGeneratingPrint}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <FiLoader className="animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FiDownload />
                  Download as PDF
                </>
              )}
            </button>
            
            <button
              onClick={() => generatePDF(true)}
              disabled={isGeneratingPDF || isGeneratingPrint}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPrint ? (
                <>
                  <FiLoader className="animate-spin" />
                  Preparing to Print...
                </>
              ) : (
                <>
                  <FiPrinter />
                  Print Letter
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                setShowAdmissionLetter(false);
                setSelectedLetterStudent(null);
              }}
              disabled={isGeneratingPDF || isGeneratingPrint}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX />
              Close
            </button>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            The PDF/Printed version will match this preview exactly and fit A4 paper
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdmissionLetterModal;