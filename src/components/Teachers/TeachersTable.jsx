import React from "react";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaChalkboardTeacher,
  FaBook,
} from "react-icons/fa";

const TeachersTable = ({
  teachers,
  handleViewProfile,
  handleEditTeacher,
  handleDeleteTeacher,
  handleAssignClass,
  handleAssignSubject,
}) => {
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Qualification</th>
            <th style={thStyle}>Classes</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {teachers.length === 0 ? (
            <tr>
              <td colSpan={4} style={emptyStyle}>
                No teachers found
              </td>
            </tr>
          ) : (
            teachers.map((teacher) => (
              <tr key={teacher.id} style={rowStyle}>
                <td style={tdStyle}>{teacher.fullName}</td>
                <td style={tdStyle}>{teacher.phone}</td>
                <td style={tdStyle}>{teacher.qualification || "N/A"}</td>
                <td style={tdStyle}>{teacher.classAssignments?.join(", ") || "N/A"}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <button
                    style={iconBtnStyle}
                    title="View Profile"
                    onClick={() => handleViewProfile(teacher)}
                  >
                    <FaEye />
                  </button>

                  <button
                    style={{ ...iconBtnStyle, color: "#2563eb" }}
                    title="Edit Teacher"
                    onClick={() => handleEditTeacher(teacher)}
                  >
                    <FaEdit />
                  </button>

                  <button
                    style={{ ...iconBtnStyle, color: "#22c55e" }}
                    title="Assign Class"
                    onClick={() => handleAssignClass(teacher)}
                  >
                    <FaChalkboardTeacher />
                  </button>

                  <button
                    style={{ ...iconBtnStyle, color: "#8b5cf6" }}
                    title="Assign Subject"
                    onClick={() => handleAssignSubject(teacher)}
                  >
                    <FaBook />
                  </button>

                  <button
                    style={{ ...iconBtnStyle, color: "#dc2626" }}
                    title="Delete Teacher"
                    onClick={() => handleDeleteTeacher(teacher.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ================= INLINE STYLES ================= */

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#ffffff",
};

const thStyle = {
  padding: "8px 10px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 14,
  color: "#1e293b",
  borderBottom: "2px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "8px 10px",
  fontSize: 13,
  color: "#334155",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const rowStyle = {
  transition: "background 0.2s",
};

const iconBtnStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: 4,
  fontSize: 14,
  marginRight: 6,
  borderRadius: "4px",
  transition: "all 0.2s",
};

const emptyStyle = {
  padding: 20,
  textAlign: "center",
  color: "#64748b",
  fontSize: 14,
};

export default TeachersTable;