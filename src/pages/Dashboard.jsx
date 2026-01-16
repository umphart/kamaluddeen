import React, { useState, useEffect } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { studentService } from "../services/studentService";
import { teacherService } from "../services/teacherService";
import "./Dashboard.css";

// School Information
const SCHOOL_INFO = {
  name: "KAMALUDEEN COMPREHENSIVE COLLEGE",
  motto: "Knowledge is Power",
  address: "Kwanar Yashi along Hayin Dae Muntsira Kano, Nigeria",
  phone: "08065662896",
  email: "kamaluddeencomprehensive@gmail.com"
};

const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: "Total Students", value: 0, icon: <FaUserGraduate /> },
    { title: "Total Teachers", value: 0, icon: <FaChalkboardTeacher /> },
    { title: "Total Classes", value: 12, icon: <FaSchool /> }
  ]);
  const [studentGender, setStudentGender] = useState([]);
  const [teacherGender, setTeacherGender] = useState([]);
  const [classGenderDistribution, setClassGenderDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#2563eb", "#ec4899"];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [students, teachers] = await Promise.all([
        studentService.getAllStudents(),
        teacherService.getAllTeachers()
      ]);

      console.log("📊 Dashboard Data Loaded:");
      console.log("Total Students:", students.length);
      console.log("Total Teachers:", teachers.length);

      // Debug: Check first student data structure
      if (students.length > 0) {
        console.log("Sample Student Data:", students[0]);
        console.log("Student className:", students[0]?.className);
        console.log("Student level:", students[0]?.level);
      }

      // Update stats
      setStats(prev => prev.map(stat => {
        if (stat.title === "Total Students") return { ...stat, value: students.length };
        if (stat.title === "Total Teachers") return { ...stat, value: teachers.length };
        return stat;
      }));

      // Calculate gender distribution for students
      const maleStudents = students.filter(s => s.gender === 'Male').length;
      const femaleStudents = students.filter(s => s.gender === 'Female').length;
      setStudentGender([
        { name: "Male", value: maleStudents },
        { name: "Female", value: femaleStudents }
      ]);

      // Calculate gender distribution for teachers
      const maleTeachers = teachers.filter(t => t.gender === 'Male').length;
      const femaleTeachers = teachers.filter(t => t.gender === 'Female').length;
      setTeacherGender([
        { name: "Male", value: maleTeachers },
        { name: "Female", value: femaleTeachers }
      ]);

      // Calculate class gender distribution
      const classDistribution = calculateClassGenderDistribution(students);
      console.log("Class Distribution Data:", classDistribution);
      setClassGenderDistribution(classDistribution);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateClassGenderDistribution = (students) => {
    const classOrder = [
      "Pre-Nursery", "Nursery 1", "Nursery 2",
      "Primary 1", "Primary 2", "Primary 3", "Primary 4",
      "JSS 1", "JSS 2", "JSS 3"
    ];

    return classOrder.map(className => {
      // FIXED: Changed from s.currentClass to s.className
      const classStudents = students.filter(s => s.className === className);
      
      console.log(`Class: ${className}, Students: ${classStudents.length}`);
      
      return {
        class: className,
        male: classStudents.filter(s => s.gender === 'Male').length,
        female: classStudents.filter(s => s.gender === 'Female').length,
        total: classStudents.length
      };
    });
  };

  // Custom tooltip for better display
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-semibold mb-2">Class: {label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}: <span className="font-semibold">{entry.value} students</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom legend formatter
  const renderColorfulLegendText = (value, entry) => {
    const { color } = entry;
    return <span style={{ color }}>{value}</span>;
  };

  return (
    <div className="dashboard">
      {/* School Info Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{SCHOOL_INFO.name}</h2>
            <p className="text-indigo-100 italic">{SCHOOL_INFO.motto}</p>
          </div>
          <div className="mt-2 md:mt-0 text-sm text-indigo-100">
            <p className="flex items-center gap-2"> {SCHOOL_INFO.address}</p>
            <p className="flex items-center gap-2"> {SCHOOL_INFO.phone}</p>
            <p className="flex items-center gap-2">{SCHOOL_INFO.email}</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* =========================
              STAT CARDS
          ========================== */}
          <div className="stats-grid">
            {stats.map((item, index) => (
              <div className="stat-card" key={index}>
                <div className="stat-icon">{item.icon}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p className="stat-number">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* =========================
              CHARTS
          ========================== */}
          <div className="charts-grid">
            {/* Students Gender */}
            <div className="dashboard-card">
              <h3 className="card-title">Students Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie 
                    data={studentGender} 
                    dataKey="value" 
                    outerRadius={90}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {studentGender.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip 
                    formatter={(value) => [`${value} students`, 'Count']}
                    labelFormatter={(name) => `Gender: ${name}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Teachers Gender */}
            <div className="dashboard-card">
              <h3 className="card-title">Teachers Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie 
                    data={teacherGender} 
                    dataKey="value" 
                    outerRadius={90}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {teacherGender.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip 
                    formatter={(value) => [`${value} teachers`, 'Count']}
                    labelFormatter={(name) => `Gender: ${name}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Class Gender Distribution */}
            <div className="dashboard-card full-width">
              <div className="flex justify-between items-center mb-4">
                <h3 className="card-title">Class Gender Distribution</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-sm text-gray-600">Male Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                    <span className="text-sm text-gray-600">Female Students</span>
                  </div>
                </div>
              </div>
              
              {classGenderDistribution.filter(item => item.total > 0).length > 0 ? (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={classGenderDistribution.filter(item => item.total > 0)}
                    margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                  >
                    <XAxis
                      dataKey="class"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Number of Students', 
                        angle: -90, 
                        position: 'insideLeft',
                        offset: -5
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      formatter={renderColorfulLegendText}
                    />
                    <Bar 
                      dataKey="male" 
                      name="Male Students" 
                      fill="#2563eb" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="female" 
                      name="Female Students" 
                      fill="#ec4899" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="text-5xl mb-4">📊</div>
                  <p className="text-lg font-medium text-gray-700 mb-2">No Class Data Available</p>
                  <p className="text-gray-500 text-center max-w-md">
                    Add students with class assignments to see gender distribution across classes
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;