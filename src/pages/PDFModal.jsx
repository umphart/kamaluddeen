// PDFModal.jsx
import React from 'react';
import ResultsPDFGenerator from '../components/Results/ResultsPDFGenerator';

const PDFModal = ({ pdfData, onClose }) => {
  if (!pdfData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-blue-50">
          <h3 className="text-lg font-bold text-blue-800">
            Generate Result Sheet for {pdfData.student.studentName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 h-[calc(90vh-120px)] overflow-y-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> This preview shows how the result sheet will look when printed.
              Make sure your printer is properly configured before printing.
            </p>
          </div>
          
          <ResultsPDFGenerator
            student={pdfData.student}
            term={pdfData.term}
            academicYear={pdfData.academicYear}
            className={pdfData.className}
            studentSummaries={pdfData.studentSummaries}
            classStatistics={pdfData.classStatistics}
            filteredResults={pdfData.filteredResults}
            studentPhotoUrl={pdfData.studentPhotoUrl}
            studentAllSubjects={pdfData.studentAllSubjects}
            studentStats={pdfData.studentStats}
           
          />
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFModal;