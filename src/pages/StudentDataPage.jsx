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
