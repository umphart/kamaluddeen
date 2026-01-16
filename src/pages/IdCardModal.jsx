// src/pages/IdCardModal.jsx
import React from 'react';

const IdCardModal = ({ 
  showIdCard, 
  setShowIdCard, 
  selectedIdCardStudent, 
  setSelectedIdCardStudent 
}) => {
  if (!showIdCard || !selectedIdCardStudent) return null;

  const printIdCard = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Student ID Card - ${selectedIdCardStudent.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .id-card { width: 85mm; height: 54mm; border: 2px solid #333; padding: 10px; position: relative; }
            .school-header { text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 5px; margin-bottom: 10px; }
            .school-name { font-size: 14px; font-weight: bold; color: #4F46E5; }
            .school-motto { font-size: 9px; color: #666; }
            .student-photo { width: 25mm; height: 30mm; border: 1px solid #ddd; float: right; }
            .student-info { margin-right: 30mm; }
            .info-row { margin-bottom: 3px; font-size: 10px; }
            .label { font-weight: bold; color: #666; }
            .validity { position: absolute; bottom: 10px; font-size: 8px; color: #999; }
            .id-number { font-size: 11px; font-weight: bold; color: #4F46E5; margin-top: 5px; }
            @media print { 
              body { margin: 0; padding: 0; }
              .id-card { border: none; box-shadow: none; }
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="id-card">
            <div class="school-header">
              <div class="school-name">KAMALUDEEN COMPREHENSIVE COLLEGE</div>
              <div class="school-motto">Excellence in Education</div>
            </div>
            ${selectedIdCardStudent.photo ? `
              <img src="${selectedIdCardStudent.photo}" class="student-photo" alt="Student Photo">
            ` : ''}
            <div class="student-info">
              <div class="info-row">
                <span class="label">Name:</span> ${selectedIdCardStudent.fullName}
              </div>
              <div class="info-row">
                <span class="label">Class:</span> ${selectedIdCardStudent.className}
              </div>
              <div class="info-row">
                <span class="label">Level:</span> ${selectedIdCardStudent.level}
              </div>
              <div class="info-row">
                <span class="label">Gender:</span> ${selectedIdCardStudent.gender}
              </div>
              <div class="info-row">
                <span class="label">DOB:</span> ${selectedIdCardStudent.dateOfBirth}
              </div>
              <div class="info-row">
                <span class="label">Parent:</span> ${selectedIdCardStudent.parentName}
              </div>
              <div class="id-number">
                ID: ${selectedIdCardStudent.admissionNumber}
              </div>
            </div>
            <div class="validity">
              Valid until: ${new Date(new Date().getFullYear() + 1, 5, 30).toLocaleDateString()}
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            🪪 Student ID Card
          </h2>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl"
            onClick={() => {
              setShowIdCard(false);
              setSelectedIdCardStudent(null);
            }}
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {/* ID Card Preview */}
          <div className="w-full max-w-md mx-auto border-2 border-gray-300 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50">
            {/* School Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-center">
              <h3 className="text-xl font-bold text-white">KAMALUDEEN COMPREHENSIVE COLLEGE</h3>
              <p className="text-sm text-indigo-100 mt-1">Excellence in Education</p>
            </div>
            
            <div className="p-4">
              <div className="flex gap-4">
                {/* Student Photo */}
                <div className="w-32 h-40 border-2 border-indigo-200 rounded-lg overflow-hidden bg-white">
                  {selectedIdCardStudent.photo ? (
                    <img 
                      src={selectedIdCardStudent.photo} 
                      alt={selectedIdCardStudent.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                      👤
                    </div>
                  )}
                </div>
                
                {/* Student Info */}
                <div className="flex-1">
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-500">Full Name</label>
                      <p className="font-bold text-gray-800">{selectedIdCardStudent.fullName}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Class</label>
                        <p className="font-semibold text-gray-700">{selectedIdCardStudent.className}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Level</label>
                        <p className="font-semibold text-gray-700">{selectedIdCardStudent.level}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-500">Admission No.</label>
                      <p className="font-mono font-bold text-indigo-700">{selectedIdCardStudent.admissionNumber}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Gender</label>
                        <p className="font-semibold text-gray-700">{selectedIdCardStudent.gender}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">DOB</label>
                        <p className="font-semibold text-gray-700">{selectedIdCardStudent.dateOfBirth}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-500">Parent/Guardian</label>
                      <p className="font-semibold text-gray-700">{selectedIdCardStudent.parentName}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    <p>📅 Valid until: {new Date(new Date().getFullYear() + 1, 5, 30).toLocaleDateString()}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>📍 Kano, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={printIdCard}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              🖨️ Print ID Card
            </button>
            <button
              onClick={() => {
                setShowIdCard(false);
                setSelectedIdCardStudent(null);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdCardModal;