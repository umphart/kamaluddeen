import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import maleAvatar from '../images/TeacterMaleAvata.png';
import femaleAvatar from '../images/TeacherfemaleAvata.png';
import kccLogo from './kcc.jpeg';
export const useTeacherProfile = (teacher, printRef) => {
  // Move hook call before any conditional returns
  const getAvatar = useCallback((teacher) => {
    if (!teacher) return maleAvatar;
    if (teacher.profilePhoto) return teacher.profilePhoto;
    if (teacher.gender?.toLowerCase() === 'female') return femaleAvatar;
    return maleAvatar;
  }, []);

  // Calculate years of service
  const getYearsOfService = useCallback(() => {
    if (!teacher?.dateJoined) return 'N/A';
    const joinDate = new Date(teacher.dateJoined);
    const today = new Date();
    const years = today.getFullYear() - joinDate.getFullYear();
    const months = today.getMonth() - joinDate.getMonth();
    
    if (months < 0) {
      return `${years - 1} years`;
    }
    return `${years} years`;
  }, [teacher?.dateJoined]);

  // School information
  const schoolInfo = {
    name: "KAMALUDEEN COMPREHENSIVE COLLEGE",
    motto: "Knowledge is Power",
    address: "Kwanar Yashi along Hayin Dae Muntsira Kano, Nigeria",
    phone: "+234 8065662896",
    email: "kamaluddeencomprehensive@gmail.com",
    secondaryEmail: "aliyumuzammilsani@gmail.com"
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to get base64 encoded logo
  const getBase64Logo = useCallback(() => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      // Try to load the logo
      try {
        // This assumes the logo is available at this path
        img.src = '/images/kcc.jpeg';
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL('image/png');
          resolve(base64);
        };
        img.onerror = () => resolve(null);
      } catch (error) {
        resolve(null);
      }
    });
  }, []);

  // Print full profile
  const handlePrintProfile = useCallback(async () => {
    if (!teacher) {
      toast.error('No teacher data available');
      return;
    }
    
    const logoBase64 = await getBase64Logo();
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '', 'width=900,height=650');
    
    // Create print HTML
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Teacher Profile - ${teacher.fullName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              background: #f8fafc; 
              padding: 30px;
              margin: 0;
            }
            
            .teacher-modal-body {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            
            .profile-header {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              padding: 30px;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 20px;
            }
            
            .profile-header img {
              width: 80px;
              height: 80px;
              object-fit: contain;
              filter: brightness(0) invert(1);
            }
            
            .profile-info h2 {
              margin: 0 0 8px 0;
              color: #1e293b;
              font-size: 24px;
              font-weight: 700;
            }
            
            .sections-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 25px;
              padding: 30px;
            }
            
            .profile-section {
              background: #f8fafc;
              border-radius: 12px;
              padding: 20px;
              border: 1px solid #e2e8f0;
            }
            
            .section-header h3 {
              color: #2563eb;
              margin: 0 0 15px 0;
              font-size: 16px;
              font-weight: 600;
              text-transform: uppercase;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 8px 0;
              border-bottom: 1px solid #f1f5f9;
            }
            
            .info-label {
              font-weight: 600;
              color: #475569;
              font-size: 14px;
            }
            
            .info-value {
              color: #1e293b;
              font-weight: 500;
              font-size: 14px;
              text-align: right;
              max-width: 60%;
            }
            
            @media print {
              body {
                padding: 0;
                background: white;
              }
              
              .teacher-modal-body {
                box-shadow: none;
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="teacher-modal-body">
            <div class="profile-header">
              ${logoBase64 ? `<img src="${logoBase64}" alt="KCC Logo" />` : ''}
              <div class="profile-info">
                <h2>${schoolInfo.name}</h2>
                <p>${schoolInfo.motto}</p>
              </div>
            </div>
            ${printContent}
          </div>
        </body>
      </html>
    `;
    
    win.document.write(printHTML);
    win.document.close();
    setTimeout(() => {
      win.print();
      win.close();
    }, 1000);
  }, [teacher, printRef, getBase64Logo, schoolInfo]);

  // Export profile PDF
  const handleExportProfilePDF = useCallback(async () => {
    if (!teacher) {
      toast.error('No teacher data available');
      return;
    }
    
    try {
      const canvas = await html2canvas(printRef.current, { 
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add watermark
      pdf.setFontSize(40);
      pdf.setTextColor(240, 240, 240);
      pdf.text('KCC', 105, 150, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      
      // Add header
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, 210, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text(schoolInfo.name, 105, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(schoolInfo.motto, 105, 22, { align: 'center' });
      
      // Add content
      pdf.addImage(imgData, 'PNG', 10, 35, 190, pdfHeight * 0.95);
      
      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
      pdf.text('Confidential Document - For Official Use Only', 105, 295, { align: 'center' });
      
      pdf.save(`${teacher.fullName?.replace(/\s+/g, '_') || 'teacher'}_Profile.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating PDF. Please try again.', {
        duration: 4000
      });
    }
  }, [teacher, printRef, schoolInfo]);

  // Print ID card
const handlePrintIDCard = useCallback(async () => {
  if (!teacher) {
    toast.error('No teacher data available');
    return;
  }
  
  try {
    // Get school logo from specific path
  const getSchoolLogo = () => {
  return new Promise((resolve) => {
    // Use the imported logo directly
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    // Use the imported logo URL
    img.src = kccLogo;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      console.log('Logo failed to load');
      resolve(null);
    };
  });
};

    // Get teacher photo
    const getTeacherPhoto = () => {
      return new Promise((resolve) => {
        const avatarUrl = getAvatar(teacher);
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = avatarUrl;
      });
    };

    // Get both images
    const [schoolLogoBase64, teacherPhotoBase64] = await Promise.all([
      getSchoolLogo(),
      getTeacherPhoto()
    ]);

    // Create ID card HTML template with proper dimensions
    const idCardHTML = `
      <div id="idCardTemplate" style="
        width: 85mm;
        height: 54mm;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 8px;
      
        position: relative;
        font-family: 'Arial', 'Helvetica', sans-serif;
        overflow: hidden;
        box-sizing: border-box;
        padding: 2mm;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      ">
        <!-- Header with School Logo -->
        <div style="
          background: linear-gradient(135deg, #1e40af 0%, #5e6fa0ff 100%);
          color: white;
          padding: 1.5mm 2mm;
          margin: -2mm -2mm 2mm -2mm;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 10mm;
        ">
          <!-- School Logo -->
          <div style="display: flex; align-items: center; gap: 2mm;">
            ${schoolLogoBase64 ? `
              <img src="${schoolLogoBase64}" style="
                width: 8mm;
                height: 8mm;
                object-fit: contain;
                background: white;
                padding: 0.5mm;
                border-radius: 10px;
              " alt="School Logo" />
            ` : `
              <div style="
                width: 8mm;
                height: 8mm;
                background: rgba(255, 255, 255, 0.2);
              
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 7pt;
                font-weight: bold;
              ">
                KCC
              </div>
            `}
          </div>
          
          <!-- School Name and Title -->
          <div style="text-align: center; flex: 1;">
            <div style="font-weight: bold; font-size: 7pt; margin-bottom: 0.5mm;">
              KAMALUDDEEN COMPREHENSIVE COLLEGE
            </div>
            <div style="font-weight: bold; font-size: 6pt; opacity: 0.95;">
              OFFICIAL STAFF ID CARD
            </div>
          </div>
          
          <!-- Empty div for balance -->
          <div style="width: 8mm;"></div>
        </div>
        
        <!-- Main Content -->
        <div style="display: flex; gap: 3mm; margin-bottom: 2mm; height: 28mm;">
          <!-- Left - Photo and Basic Info -->
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; padding: 1mm;">
            <!-- Teacher Photo -->
            <div style="
              width: 25mm;
              height: 25mm;
              border: 2px solid #2563eb;
             border-radius: 8px;
              overflow: hidden;
              margin-bottom: 2mm;
              background: ${teacherPhotoBase64 ? '#ffffff' : '#f3f4f6'};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            ">
              ${teacherPhotoBase64 ? `
                <img src="${teacherPhotoBase64}" style="
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                " alt="Teacher Photo" />
              ` : `
                <div style="color: #6b7280; font-size: 8pt; text-align: center; padding: 3mm; font-weight: bold;">
                  PHOTO
                </div>
              `}
            </div>
            
            <!-- Staff ID Badge -->
            <div style="
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: white;
              padding: 1mm 3mm;
              border-radius: 15px;
              font-size: 8pt;
              font-weight: bold;
              text-align: center;
              box-shadow: 0 1px 3px rgba(220, 38, 38, 0.3);
              letter-spacing: 0.3px;
            ">
              ${teacher.staffId || 'STAFF ID'}
            </div>
          </div>
          
          <!-- Right - Details -->
          <div style="flex: 1.5; display: flex; flex-direction: column; justify-content: space-between; padding: 1mm;">
            <!-- Teacher Info -->
            <div style="margin-bottom: 2mm;">
              <!-- Teacher Name -->
              <div style="
                font-weight: bold;
                font-size: 10pt;
                color: #1f2937;
                margin-bottom: 1mm;
                line-height: 1.1;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                border-bottom: 1px solid #d1d5db;
                padding-bottom: 1mm;
              ">
                ${teacher.fullName || 'TEACHER NAME'}
              </div>
              
              <!-- Qualification -->
              <div style="
                font-size: 8pt;
                color: #4b5563;
                font-weight: 500;
                margin-bottom: 2mm;
                padding: 1mm;
                background: #f3f4f6;
                border-radius: 3px;
                border-left: 2px solid #2563eb;
              ">
                ${teacher.qualification || 'QUALIFICATION'}
              </div>
            </div>
            
            <!-- Contact Details -->
            <div style="font-size: 7pt;">
              ${teacher.email ? `
                <div style="margin-bottom: 1.5mm; display: flex; align-items: flex-start;">
                  <div style="color: #374151; font-weight: bold; width: 15mm; flex-shrink: 0;">Email:</div>
                  <div style="color: #111827; flex: 1; word-break: break-all;">${teacher.email}</div>
                </div>
              ` : ''}
              
              ${teacher.phone ? `
                <div style="margin-bottom: 1.5mm; display: flex; align-items: center;">
                  <div style="color: #374151; font-weight: bold; width: 15mm; flex-shrink: 0;">Phone:</div>
                  <div style="color: #111827; flex: 1;">${teacher.phone}</div>
                </div>
              ` : ''}
              
              ${teacher.gender ? `
                <div style="margin-bottom: 1.5mm; display: flex; align-items: center;">
                  <div style="color: #374151; font-weight: bold; width: 15mm; flex-shrink: 0;">Gender:</div>
                  <div style="color: #111827; flex: 1;">${teacher.gender}</div>
                </div>
              ` : ''}
            </div>
            
            <!-- Validity and ID -->
            <div style="
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #fbbf24;
              border-radius: 4px;
              padding: 1.5mm;
              margin-top: 1mm;
            ">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="color: #dc2626; font-weight: bold; font-size: 7pt;">
                    Valid until: ${new Date(new Date().setFullYear(new Date().getFullYear() + 2))
                      .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <div style="color: #6b7280; font-size: 6.5pt; margin-top: 0.5mm;">
                    ID: ${teacher.id || 'N/A'}
                  </div>
                </div>
                
                <!-- Status Badge -->
                <div style="
                  background: ${teacher.status === 'Active' ? '#10b981' : '#ef4444'};
                  color: white;
                  padding: 0.5mm 2mm;
                  border-radius: 10px;
                  font-size: 6.5pt;
                  font-weight: bold;
                ">
                  ${teacher.status || 'Status'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer with School Info -->
        <div style="
          background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
          border-top: 1px solid #bfdbfe;
          padding: 0.5mm;
          margin: 0 -2mm -2mm -2mm;
          border-radius: 0 0 6px 6px;
          font-size: 5.5pt;
          color: #374151;
        ">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <!-- School Address -->
            <div style="flex: 1;">
              <div style="font-weight: bold; color: #1e40af; margin-bottom: 0.5mm;">
                School Address:
              </div>
              <div style="line-height: 1.3;">
                ${schoolInfo.address}
              </div>
            </div>
            
            <!-- Contact Info -->
            <div style="flex: 1; text-align: center;">
              <div style="font-weight: bold; color: #1e40af; margin-bottom: 0.5mm;">
                Contact:
              </div>
              <div>${schoolInfo.phone}</div>
              <div>${schoolInfo.email}</div>
            </div>
            
            <!-- Signature Area -->
            <div style="flex: 1; text-align: right;">
              <div style="
                width: 25mm;
                border-top: 1px solid #2563eb;
                margin: 0 0 0.5mm auto;
              "></div>
              <div style="font-weight: bold; color: #4b5563;">
                Principal's Signature
              </div>
            </div>
          </div>
          
          <!-- School Motto -->
          <div style="
            text-align: center;
            margin-top: 1mm;
            padding-top: 1mm;
            border-top: 1px dashed #bfdbfe;
            font-style: italic;
            color: #6b7280;
            font-weight: 500;
          ">
            "${schoolInfo.motto}"
          </div>
        </div>
        
        <!-- Watermark -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 20pt;
          color: rgba(30, 64, 175, 0.05);
          font-weight: bold;
          white-space: nowrap;
          z-index: 0;
          pointer-events: none;
        ">
          KAMALUDDEEN COMPREHENSIVE COLLEGE
        </div>
      </div>
    `;
    
    // Create temporary container
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.innerHTML = idCardHTML;
    document.body.appendChild(tempDiv);
    
    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Convert to canvas
    const canvas = await html2canvas(tempDiv.querySelector('#idCardTemplate'), {
      scale: 4, // Higher scale for better quality
      backgroundColor: null,
      useCORS: true,
      logging: false,
      allowTaint: true
    });
    
    // Convert to PDF with standard ID card size
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [54, 85] // Standard ID card size
    });
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, 85, 54);
    
    // Set PDF properties
    pdf.setProperties({
      title: `${teacher.fullName} - Staff ID Card`,
      subject: 'Official Staff Identification',
      author: schoolInfo.name,
      keywords: 'staff, id, card, teacher, kcc'
    });
    
    // Save PDF
    pdf.save(`${teacher.fullName?.replace(/\s+/g, '_') || 'teacher'}_ID_Card.pdf`);
    
    // Clean up
    document.body.removeChild(tempDiv);
    
    toast.success('ID card generated successfully!', {
      icon: '🪪',
      duration: 3000
    });
  } catch (error) {
    console.error('Error generating ID card:', error);
    toast.error('Error generating ID card. Please try again.', {
      duration: 4000
    });
  }
}, [teacher, schoolInfo, getAvatar]);
  return {
    getAvatar,
    formatDate,
    getYearsOfService,
    schoolInfo,
    handlePrintProfile,
    handleExportProfilePDF,
    handlePrintIDCard
  };
};