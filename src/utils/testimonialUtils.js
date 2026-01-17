// src/utils/testimonialUtils.js
export const testimonialUtils = {
  // Save testimonial to localStorage
  saveTestimonial: (studentData, graduationYear, note) => {
    const testimonial = {
      ...studentData,
      graduationYear,
      testimonialNote: note,
      graduationDate: new Date().toISOString(),
      certificateId: `CERT-${Date.now()}-${studentData.admissionNumber}`
    };

    const existing = JSON.parse(localStorage.getItem('graduatedStudents') || '[]');
    const updated = [...existing, testimonial];
    localStorage.setItem('graduatedStudents', JSON.stringify(updated));
    return testimonial;
  },

  // Get all testimonials
  getTestimonials: () => {
    return JSON.parse(localStorage.getItem('graduatedStudents') || '[]');
  },

  // Update testimonial
  updateTestimonial: (admissionNumber, updates) => {
    const testimonials = JSON.parse(localStorage.getItem('graduatedStudents') || '[]');
    const updated = testimonials.map(t => 
      t.admissionNumber === admissionNumber ? { ...t, ...updates } : t
    );
    localStorage.setItem('graduatedStudents', JSON.stringify(updated));
    return updated;
  },

  // Delete testimonial
  deleteTestimonial: (admissionNumber) => {
    const testimonials = JSON.parse(localStorage.getItem('graduatedStudents') || '[]');
    const updated = testimonials.filter(t => t.admissionNumber !== admissionNumber);
    localStorage.setItem('graduatedStudents', JSON.stringify(updated));
    return updated;
  },

  // Generate certificate image
  generateCertificate: (student, certImage) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw certificate background
        ctx.drawImage(img, 0, 0);
        
        // Customize certificate based on your cert.jpeg layout
        // You may need to adjust these coordinates based on your image
        
        // Example coordinates (adjust based on your cert.jpeg):
        ctx.font = 'bold 48px "Times New Roman", serif';
        ctx.fillStyle = '#1a365d';
        ctx.textAlign = 'center';
        ctx.fillText(student.fullName, canvas.width / 2, 350);
        
        ctx.font = '36px "Times New Roman", serif';
        ctx.fillStyle = '#4a5568';
        ctx.fillText(`Graduated: ${student.graduationYear}`, canvas.width / 2, 450);
        
        ctx.font = '32px "Times New Roman", serif';
        ctx.fillText(`${student.className}`, canvas.width / 2, 530);
        
        // Add testimonial note (wrapped)
        ctx.font = '24px "Times New Roman", serif';
        ctx.fillStyle = '#2d3748';
        const maxWidth = canvas.width * 0.7;
        const lines = this.wrapText(ctx, student.testimonialNote, canvas.width / 2, 600, maxWidth, 30);
        
        resolve(canvas.toDataURL('image/jpeg'));
      };
      
      img.src = certImage;
    });
  },

  // Helper to wrap text
  wrapText: (context, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let lines = [];
    let testLine = '';
    
    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    
    for (let i = 0; i < lines.length; i++) {
      context.fillText(lines[i], x, y + (i * lineHeight));
    }
    
    return lines;
  }
};