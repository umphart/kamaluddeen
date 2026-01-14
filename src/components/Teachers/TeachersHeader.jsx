import React, { useState } from "react";
import { FaUserTie, FaFilePdf, FaPlus, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import kccLogo from "../images/kcc.jpeg"; // adjust path if needed

const TeachersHeader = ({ teachers = [], setShowAddModal }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (teachers.length === 0) {
      toast.error("No teachers to export");
      return;
    }

    setIsExporting(true);

    try {
      // Create container for PDF content
      const container = document.createElement("div");
      container.style.padding = "20px";
      container.style.width = "900px";
      container.style.background = "#fff";
      container.style.fontFamily = "Arial, sans-serif";

      // SCHOOL HEADER
      const headerDiv = document.createElement("div");
      headerDiv.style.textAlign = "center";
      headerDiv.style.marginBottom = "20px";

      // Logo and School Info
      const logoRow = document.createElement("div");
      logoRow.style.display = "flex";
      logoRow.style.alignItems = "center";
      logoRow.style.justifyContent = "center";
      logoRow.style.gap = "15px";
      logoRow.style.marginBottom = "10px";

      const logoImg = document.createElement("img");
      logoImg.src = kccLogo;
      logoImg.style.width = "60px";
      logoImg.style.height = "60px";
      logoImg.style.objectFit = "contain";
      logoRow.appendChild(logoImg);

      const schoolInfo = document.createElement("div");
      
      const schoolName = document.createElement("h1");
      schoolName.innerText = "KAMALUDEEN COMPREHENSIVE COLLEGE";
      schoolName.style.margin = "0";
      schoolName.style.fontSize = "16px";
      schoolName.style.fontWeight = "bold";
      schoolName.style.color = "#1e3a8a";
      schoolName.style.textTransform = "uppercase";
      schoolInfo.appendChild(schoolName);

      const motto = document.createElement("p");
      motto.innerText = "Knowledge is Power";
      motto.style.margin = "4px 0";
      motto.style.fontSize = "12px";
      motto.style.fontStyle = "italic";
      motto.style.color = "#64748b";
      schoolInfo.appendChild(motto);

      logoRow.appendChild(schoolInfo);
      headerDiv.appendChild(logoRow);

      // Contact Info
      const contactDiv = document.createElement("div");
      contactDiv.style.marginBottom = "10px";
      
      const address = document.createElement("p");
      address.innerText = "Kwanar Yashi along Hayin Dae Muntsira Kano, Nigeria";
      address.style.margin = "2px 0";
      address.style.fontSize = "11px";
      address.style.color = "#475569";
      contactDiv.appendChild(address);

      const contactDetails = document.createElement("div");
      contactDetails.style.display = "flex";
      contactDetails.style.justifyContent = "center";
      contactDetails.style.gap = "20px";
      contactDetails.style.fontSize = "11px";
      contactDetails.style.color = "#475569";

      const phone = document.createElement("span");
      phone.innerText = "Phone: +234 8065662896";
      contactDetails.appendChild(phone);

      const email = document.createElement("span");
      email.innerText = "Email: kamaluddeencomprehensive@gmail.com";
      contactDetails.appendChild(email);

      contactDiv.appendChild(contactDetails);
      headerDiv.appendChild(contactDiv);

      // Report Title
      const reportTitle = document.createElement("h2");
      reportTitle.innerText = "TEACHERS LIST REPORT";
      reportTitle.style.margin = "15px 0 10px 0";
      reportTitle.style.padding = "8px";
      reportTitle.style.background = "#2563eb";
      reportTitle.style.color = "#ffffff";
      reportTitle.style.fontSize = "14px";
      reportTitle.style.fontWeight = "bold";
      reportTitle.style.textAlign = "center";
      reportTitle.style.borderRadius = "4px";
      reportTitle.style.textTransform = "uppercase";
      headerDiv.appendChild(reportTitle);

      // Report Details
      const reportDetails = document.createElement("div");
      reportDetails.style.display = "flex";
      reportDetails.style.justifyContent = "space-between";
      reportDetails.style.marginBottom = "15px";
      reportDetails.style.fontSize = "11px";
      reportDetails.style.color = "#475569";

      const dateGenerated = document.createElement("div");
      dateGenerated.innerHTML = `<strong>Date Generated:</strong> ${new Date().toLocaleDateString()}`;
      reportDetails.appendChild(dateGenerated);

      const totalTeachers = document.createElement("div");
      totalTeachers.innerHTML = `<strong>Total Teachers:</strong> ${teachers.length}`;
      reportDetails.appendChild(totalTeachers);

      headerDiv.appendChild(reportDetails);
      container.appendChild(headerDiv);

      // TABLE
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.fontSize = "10px";
      table.style.border = "1px solid #e2e8f0";

      // Table Header
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");

      const headers = [
        "S/N",
        "STAFF ID",
        "FULL NAME",
        "QUALIFICATION",
        "PHONE",
        "EMAIL",
        "SUBJECTS",
        "CLASSES ASSIGNED"
      ];

      headers.forEach((text) => {
        const th = document.createElement("th");
        th.innerText = text;
        th.style.border = "1px solid #e2e8f0";
        th.style.padding = "8px 6px";
        th.style.background = "#f1f5f9";
        th.style.fontWeight = "600";
        th.style.textAlign = "center";
        th.style.color = "#1e293b";
        th.style.textTransform = "uppercase";
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Table Body
      const tbody = document.createElement("tbody");
      teachers.forEach((teacher, index) => {
        const row = document.createElement("tr");
        row.style.background = index % 2 === 0 ? "#ffffff" : "#f8fafc";

        const rowData = [
          index + 1,
          teacher.staffId || "-",
          teacher.fullName || "-",
          teacher.qualification || "-",
          teacher.phone || "-",
          teacher.email || "-",
          teacher.subjects?.join(", ") || "-",
          teacher.classAssignments?.join(", ") || "-"
        ];

        rowData.forEach((val, idx) => {
          const td = document.createElement("td");
          td.innerText = val || "-";
          td.style.border = "1px solid #e2e8f0";
          td.style.padding = "8px 6px";
          td.style.textAlign = idx === 0 ? "center" : "left";
          td.style.color = idx === 2 ? "#1e3a8a" : "#334155"; // Highlight name column
          td.style.fontWeight = idx === 2 ? "500" : "normal";
          row.appendChild(td);
        });

        tbody.appendChild(row);
      });
      table.appendChild(tbody);

      container.appendChild(table);

      // Footer
      const footerDiv = document.createElement("div");
      footerDiv.style.marginTop = "20px";
      footerDiv.style.paddingTop = "10px";
      footerDiv.style.borderTop = "2px solid #e2e8f0";
      footerDiv.style.textAlign = "center";
      footerDiv.style.fontSize = "10px";
      footerDiv.style.color = "#64748b";

      const generatedBy = document.createElement("p");
      generatedBy.innerHTML = `<strong>Generated by:</strong> KCC School Management System`;
      generatedBy.style.margin = "4px 0";
      footerDiv.appendChild(generatedBy);

      const timestamp = document.createElement("p");
      timestamp.innerHTML = `<strong>Timestamp:</strong> ${new Date().toLocaleString()}`;
      timestamp.style.margin = "4px 0";
      footerDiv.appendChild(timestamp);

      container.appendChild(footerDiv);

      document.body.appendChild(container);

      // Convert to canvas
      const canvas = await html2canvas(container, { 
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`KCC_Teachers_List_${new Date().toISOString().split('T')[0]}.pdf`);

      document.body.removeChild(container);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={headerWrapper}>
      {/* LEFT */}
      <div>
        <h2 style={titleStyle}>
          <FaUserTie style={{ marginRight: 8, color: "#2563eb" }} />
          Teachers
          <span style={countBadge}>{teachers.length}</span>
        </h2>
        <p style={subtitleStyle}>Manage teaching staff and assignments</p>
      </div>

      {/* RIGHT ACTIONS */}
      <div style={actionsStyle}>
        <button
          onClick={handleExport}
          disabled={teachers.length === 0 || isExporting}
          style={{
            ...secondaryBtn,
            opacity: teachers.length === 0 || isExporting ? 0.6 : 1,
            cursor:
              teachers.length === 0 || isExporting
                ? "not-allowed"
                : "pointer",
          }}
        >
          {isExporting ? (
            <>
              <FaSpinner style={{ marginRight: 6, animation: "spin 1s linear infinite" }} />
              Generating
            </>
          ) : (
            <>
              <FaFilePdf style={{ marginRight: 6 }} />
              Export PDF
            </>
          )}
        </button>

        <button onClick={() => setShowAddModal(true)} style={primaryBtn}>
          <FaPlus style={{ marginRight: 6 }} />
          Add Teacher
        </button>
      </div>
    </div>
  );
};

/* ================= INLINE STYLES ================= */

const headerWrapper = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 14px",
  marginBottom: 10,
  backgroundColor: "#f1f5f9",
  borderRadius: 6,
};

const titleStyle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const countBadge = {
  background: "#e0e7ff",
  color: "#1e3a8a",
  fontSize: 12,
  padding: "2px 6px",
  borderRadius: 999,
};

const subtitleStyle = {
  margin: "2px 0 0",
  fontSize: 12,
  color: "#64748b",
};

const actionsStyle = {
  display: "flex",
  gap: 8,
};

const primaryBtn = {
  display: "flex",
  alignItems: "center",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  fontSize: 13,
  borderRadius: 4,
  cursor: "pointer",
  transition: "background 0.2s",
};

const secondaryBtn = {
  display: "flex",
  alignItems: "center",
  background: "#ffffff",
  color: "#1f2937",
  border: "1px solid #cbd5f5",
  padding: "6px 12px",
  fontSize: 13,
  borderRadius: 4,
  transition: "all 0.2s",
};

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default TeachersHeader;