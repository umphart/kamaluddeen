// Create a separate schoolInfo.js file:
// src/utils/schoolInfo.js
export const SCHOOL_INFO = {
  name: "KAMALUDEEN COMPREHENSIVE COLLEGE",
  motto: "Knowledge is Power",
  address: "Kwanar Yashi along Hayin Dae Muntsira Kano, Nigeria",
  phone: "+234 8065662896",
  email: "kamaluddeencomprehensive@gmail.com",
  secondaryEmail: "aliyumuzammilsani@gmail.com",
  levels: {
    'PN': 'Pre-Nursery',
    'NU': 'Nursery',
    'PR': 'Primary',
    'JS': 'Junior Secondary'
  },
  classes: {
    'PN': ['Pre-Nursery'],
    'NU': ['Nursery 1', 'Nursery 2'],
    'PR': ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4'],
    'JS': ['JSS 1', 'JSS 2', 'JSS 3']
  }
};

// CSV export function
export const exportToCSV = (teachers) => {
  const headers = ['Staff ID', 'Full Name', 'Gender', 'Email', 'Phone', 'Qualification', 'Employment Type', 'Status', 'Subjects', 'Classes Assigned', 'Date Joined'];
  
  const csvContent = [
    headers.join(','),
    ...teachers.map(teacher => [
      teacher.staffId || '',
      `"${teacher.fullName || ''}"`,
      teacher.gender || '',
      teacher.email || '',
      teacher.phone || '',
      `"${teacher.qualification || ''}"`,
      teacher.employmentType || '',
      teacher.status || '',
      `"${teacher.subjects?.join(', ') || ''}"`,
      `"${teacher.classAssignments?.join(', ') || ''}"`,
      teacher.dateJoined || ''
    ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `teachers_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};