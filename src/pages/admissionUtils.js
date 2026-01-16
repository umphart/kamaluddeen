// src/pages/admissionUtils.js

// Safe filter helper function
export const safeFilter = (array, callback) => {
  if (!array || !Array.isArray(array)) {
    console.warn('Attempted to filter non-array:', array);
    return [];
  }
  return array.filter(callback);
};

// Function to get admission duration based on level
export const getAdmissionDuration = (level, className) => {
  switch(level) {
    case 'PN':
    case 'NU':
      return '3 years (Pre-Nursery to Nursery 2)';
    case 'PR':
      return '4 years (Primary 1 to Primary 4)';
    case 'JS':
      return '3 years (JSS 1 to JSS 3)';
    default:
      return 'Academic Year';
  }
};

// Function to get completion year based on admission date and level
export const getCompletionYear = (admissionDate, level) => {
  const date = new Date(admissionDate);
  const currentYear = date.getFullYear();
  
  switch(level) {
    case 'PN':
    case 'NU':
      return currentYear + 3;
    case 'PR':
      return currentYear + 4;
    case 'JS':
      return currentYear + 3;
    default:
      return currentYear + 1;
  }
};