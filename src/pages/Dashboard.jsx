import React, { useState, useEffect } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
  FiMapPin,
  FiPhone,
  FiMail
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
      const classStudents = students.filter(s => s.currentClass === className);
      return {
        class: className,
        male: classStudents.filter(s => s.gender === 'Male').length,
        female: classStudents.filter(s => s.gender === 'Female').length
      };
    });
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
              <h3 className="card-title">Class Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart
                  data={classGenderDistribution}
                  margin={{ top: 10, right: 20, left: 0, bottom: 50 }}
                >
                  <XAxis
                    dataKey="class"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [`${value} students`, name]}
                    labelFormatter={(label) => `Class: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="male" 
                    name="Male Students" 
                    fill="#2563eb" 
                    radius={[6, 6, 0, 0]} 
                  />
                  <Bar 
                    dataKey="female" 
                    name="Female Students" 
                    fill="#ec4899" 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;