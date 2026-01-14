import React, { useEffect, useState } from "react";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";

const TeachersFilters = ({
  searchTerm,
  setSearchTerm,
  selectedEmploymentType,
  setSelectedEmploymentType,
  selectedStatus,
  setSelectedStatus,
  selectedSubject,
  setSelectedSubject,
  employmentTypes = [],
  statuses = [],
  subjects = [],
  clearFilters,
  teachers = [],
  filteredTeachers = [],
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  /* -------- Responsive detection -------- */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filtersActive =
    searchTerm ||
    selectedEmploymentType !== "all" ||
    selectedStatus !== "all" ||
    selectedSubject !== "all";

  return (
    <div style={wrapper}>
      {/* SEARCH */}
      <div style={searchWrapper}>
        <FaSearch style={searchIcon} />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInput}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            style={clearSearchBtn}
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* FILTER ROW */}
      <div
        style={{
          ...filterRow,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {/* Employment */}
        <FilterSelect
          label="Employment"
          value={selectedEmploymentType}
          onChange={setSelectedEmploymentType}
          options={employmentTypes}
        />

        {/* Status */}
        <FilterSelect
          label="Status"
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={statuses}
        />

        {/* Subject */}
        <FilterSelect
          label="Subject"
          value={selectedSubject}
          onChange={setSelectedSubject}
          options={subjects}
        />

        {/* Clear */}
        <button
          onClick={clearFilters}
          disabled={!filtersActive}
          style={{
            ...clearBtn,
            opacity: filtersActive ? 1 : 0.5,
            cursor: filtersActive ? "pointer" : "not-allowed",
          }}
        >
          <FaTimes style={{ marginRight: 4 }} />
          Clear
        </button>
      </div>

      {/* INFO */}
      <div style={infoRow}>
        Showing <strong>{filteredTeachers.length}</strong> of{" "}
        <strong>{teachers.length}</strong> teachers
        {selectedEmploymentType !== "all" && (
          <span style={tag}>{selectedEmploymentType}</span>
        )}
        {selectedStatus !== "all" && (
          <span style={tag}>{selectedStatus}</span>
        )}
        {selectedSubject !== "all" && (
          <span style={tag}>{selectedSubject}</span>
        )}
      </div>
    </div>
  );
};

/* ================= REUSABLE FILTER SELECT ================= */

const FilterSelect = ({ label, value, onChange, options }) => (
  <div style={filterGroup}>
    <label style={filterLabel}>
      <FaFilter style={{ marginRight: 4 }} />
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectStyle}
    >
      <option value="all">All</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

/* ================= INLINE STYLES ================= */

const wrapper = {
  padding: "10px 14px",
  background: "#f8fafc",
  borderRadius: 6,
  marginBottom: 10,
};

const searchWrapper = {
  display: "flex",
  alignItems: "center",
  border: "1px solid #cbd5f5",
  background: "#fff",
  borderRadius: 4,
  padding: "4px 6px",
  marginBottom: 8,
};

const searchIcon = {
  color: "#64748b",
  fontSize: 13,
};

const searchInput = {
  border: "none",
  outline: "none",
  fontSize: 13,
  padding: "6px",
  width: "100%",
};

const clearSearchBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#64748b",
};

const filterRow = {
  display: "flex",
  gap: 8,
  alignItems: "flex-end",
  flexWrap: "wrap",
};

const filterGroup = {
  display: "flex",
  flexDirection: "column",
};

const filterLabel = {
  fontSize: 11,
  color: "#475569",
  marginBottom: 2,
  display: "flex",
  alignItems: "center",
};

const selectStyle = {
  fontSize: 13,
  padding: "6px",
  borderRadius: 4,
  border: "1px solid #cbd5f5",
  minWidth: 120,
};

const clearBtn = {
  background: "#fff",
  border: "1px solid #cbd5f5",
  padding: "6px 10px",
  fontSize: 13,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
};

const infoRow = {
  marginTop: 6,
  fontSize: 12,
  color: "#475569",
};

const tag = {
  marginLeft: 6,
  background: "#e0e7ff",
  color: "#1e3a8a",
  padding: "2px 6px",
  borderRadius: 999,
  fontSize: 11,
};

export default TeachersFilters;
