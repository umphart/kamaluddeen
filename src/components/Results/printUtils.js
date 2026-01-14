import Logo from '../images/kcc.jpeg';

/* =========================
   DATE FORMAT
========================= */
export const getCurrentDateFormatted = () =>
  new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

/* =========================
   TERM LABEL
========================= */
export const getTermLabel = (selectedTerm = '') =>
  selectedTerm.includes('1st')
    ? 'FIRST'
    : selectedTerm.includes('2nd')
    ? 'SECOND'
    : selectedTerm.includes('3rd')
    ? 'THIRD'
    : '';

/* =========================
   AUTO PRIMARY / SECONDARY
========================= */
export const getSchoolTypeTitle = (className = '') => {
  return className.toLowerCase().includes('primary')
    ? 'PRIMARY SCHOOL'
    : 'SECONDARY SCHOOL';
};

/* =========================
   HEAD TEACHER REMARK
========================= */
export const getHeadTeacherRemark = (average = 0) => {
  if (average >= 75) return 'Excellent performance. Keep it up.';
  if (average >= 60) return 'Very good result. Aim higher next term.';
  if (average >= 50) return 'Good effort. More improvement needed.';
  if (average >= 40) return 'Fair performance. Work harder.';
  return 'Poor performance. Serious improvement required.';
};

/* =========================
   LOGO HTML
========================= */
export const getLogoHtml = () => `
  <img
    src="${Logo}"
    alt="School Logo"
    style="max-height:80px; object-fit:contain;"
    crossorigin="anonymous"
  />
`;

/* =========================
   MAIN PRINT TEMPLATE
========================= */
export const generateStudentResultHtml = ({
  student,
  selectedTerm,
  session,
  subjectsHtml,
  averageScore = 0
}) => {
  const hasPhoto = student.photo && student.photo.trim() !== '';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Student Result</title>

<style>
  body {
    font-family: Arial, sans-serif;
    position: relative;
    color: #000;
  }

  /* ===== WATERMARK ===== */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: url(${Logo}) center/300px no-repeat;
    opacity: 0.08;
    z-index: -1;
  }

  .school-header {
    border-bottom: 2px solid #000;
    margin-bottom: 10px;
    padding-bottom: 6px;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .student-photo {
    width: 90px;
    height: 110px;
    border: 2px solid #000;
    object-fit: cover;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .school-info {
    text-align: center;
    margin-top: 4px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }

  th, td {
    border: 1px solid #000;
    padding: 5px;
    font-size: 12px;
    text-align: center;
  }

  .student-info td {
    text-align: left;
  }

  .remark-box {
    margin-top: 10px;
    border: 1px solid #000;
    padding: 8px;
    font-size: 12px;
  }
</style>
</head>

<body>

<!-- ===== HEADER ===== -->
<div class="school-header">
  <div class="header-row">
    ${getLogoHtml()}

    ${
      hasPhoto
        ? `<img 
            src="${student.photo}" 
            class="student-photo"
            crossorigin="anonymous"
          />`
        : `<div class="student-photo">NO PHOTO</div>`
    }
  </div>

  <div class="school-info">
    <h3>KAMALUDDEEN COMPREHENSIVE COLLEGE</h3>
    <strong>${getSchoolTypeTitle(student.className)}</strong>
    <p>
      ${getTermLabel(selectedTerm)} TERM RESULT — ${session}
    </p>
  </div>
</div>

<!-- ===== STUDENT INFO ===== -->
<table class="student-info">
  <tr>
    <td><strong>Name:</strong> ${student.fullName}</td>
    <td><strong>Admission No:</strong> ${student.admissionNumber}</td>
  </tr>
  <tr>
    <td><strong>Class:</strong> ${student.className}</td>
    <td><strong>Gender:</strong> ${student.gender}</td>
  </tr>
</table>

<!-- ===== SUBJECT TABLE ===== -->
${subjectsHtml}

<!-- ===== HEAD TEACHER REMARK ===== -->
<div class="remark-box">
  <strong>Head Teacher’s Remark:</strong><br/>
  ${getHeadTeacherRemark(averageScore)}
</div>

<p style="margin-top:8px;">
  <strong>Date:</strong> ${getCurrentDateFormatted()}
</p>

</body>
</html>
`;
};
