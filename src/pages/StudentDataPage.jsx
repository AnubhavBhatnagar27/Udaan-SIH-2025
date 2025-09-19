import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentCard from "../components/StudentCard";
import "../styles/StudentDataPage.css";

export default function StudentDataPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Student data
  const students = [
    {
      id: 1,
      name: "Aadarsh Thakur",
      branch: "CSE",
      batch: "2023-2027",
      enrollment: "0105CS231001",
      risk: "High Risk",
      guardian: { name: "Sumit Thakur", mobile: "79856*****" },
      img: "/avatar.png",
    },
    {
      id: 2,
      name: "Rahul Sharma",
      branch: "IT",
      batch: "2022-2026",
      enrollment: "0105IT221011",
      risk: "Medium Risk",
      guardian: { name: "Ramesh Sharma", mobile: "98765*****" },
      img: "/avatar.png",
    },
    {
      id: 3,
      name: "Sneha Verma",
      branch: "ECE",
      batch: "2021-2025",
      enrollment: "0105EC211015",
      risk: "Low Risk",
      guardian: { name: "Sanjay Verma", mobile: "95432*****" },
      img: "/avatar.png",
    },
    {
      id: 4,
      name: "Umesh Farkade",
      branch: "AIML",
      batch: "2023-2027",
      enrollment: "0105AL231216",
      risk: "High Risk",
      guardian: { name: "Ramesh Farkade", mobile: "95552*****" },
      img: "/avatar.png",
    },
    {
      id: 5,
      name: "Kannat Pawar",
      branch: "ECE",
      batch: "2021-2027",
      enrollment: "0105EC211225",
      risk: "Low Risk",
      guardian: { name: "Ramkumar", mobile: "91432*****" },
      img: "/avatar.png",
    },
    {
      id: 6,
      name: "Sneha Bhargav",
      branch: "CSE",
      batch: "2023-2027",
      enrollment: "0105AL213200",
      risk: "Medium Risk",
      guardian: { name: "Dinesh Pawar", mobile: "95222*****" },
      img: "/avatar.png",
    },
    {
      id: 7,
      name: "Kunal Rai",
      branch: "CSBS",
      batch: "2021-2025",
      enrollment: "0105CB211015",
      risk: "High Risk",
      guardian: { name: "Rana Rai", mobile: "93252*****" },
      img: "/avatar.png",
    },
    {
      id: 8,
      name: "Pankaj Choudhary",
      branch: "IT",
      batch: "2022-2026",
      enrollment: "0105ITR211015",
      risk: "High Risk",
      guardian: { name: " Mohan Choudhary", mobile: "55432*****" },
      img: "/avatar.png",
    },
    {
      id: 9,
      name: "Aarav Sharma",
      branch: "IT",
      batch: "2021-2025",
      enrollment: "0105IT211015",
      risk: "Medium Risk",
      guardian: { name: "Rohan Sharma", mobile: "95582*****" },
      img: "/avatar.png",
    },
    {
      id: 10,
      name: "Neha Sharma",
      branch: "CSE",
      batch: "2021-2025",
      enrollment: "0105EC211015",
      risk: "Low Risk",
      guardian: { name: "Aditya Sharma", mobile: "95832*****" },
      img: "/avatar.png",
    },
    {
      id: 11,
      name: "Priya Kumari",
      branch: "ECE",
      batch: "2021-2025",
      enrollment: "0105EC211015",
      risk: "High Risk",
      guardian: { name: "Sanjay Kumari", mobile: "95692*****" },
      img: "/avatar.png",
    },
    {
      id: 12,
      name: "Khayti Pawar",
      branch: "AIML",
      batch: "2023-2026",
      enrollment: "0105AL211015",
      risk: "Low Risk",
      guardian: { name: "Ramesh Pawar", mobile: "95252*****" },
      img: "/avatar.png",
    },
  ];

  // Filter students based on search
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="student-page-main">
      {/* Header */}
      <header className="student-header">
        <div>
          <h2 className="student-title">📊 Student Data</h2>
          <p className="college-name">
            Oriental Institute of Science & Technology
          </p>
        </div>

        {/* Search Box */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <span className="search-icon"></span>
        </div>
      </header>

      {/* Student Cards Grid */}
      <div className="student-grid">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="student-card-wrapper"
              onClick={() =>
                navigate(`/students/${student.id}`, { state: student })
              }
            >
              {/* ✅ fallback image fix */}
              <StudentCard
                student={{
                  ...student,
                  img: student.img || "https://via.placeholder.com/90",
                }}
              />
            </div>
          ))
        ) : (
          <p className="no-results">No students found.</p>
        )}
      </div>
    </div>
  );
}
