import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentCard from "../components/StudentCard";
import "../styles/StudentDataPage.css";

const apiUrl = process.env.REACT_APP_API_URL;

export default function StudentDataPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [institute, setInstitute] = useState("Institute Name");

  // Fetch students from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found. Please login.");
        setLoading(false);
        return;
      }
      try {
        const [studentsRes, mentorRes] = await Promise.all([
          fetch(`${apiUrl}/api/students/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/api/mentors/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!studentsRes.ok) throw new Error("Failed to fetch students");
        if (!mentorRes.ok) throw new Error("Failed to fetch mentor data");

        const studentsData = await studentsRes.json();
        const cleanStudents = studentsData.filter(
          (s) => s && typeof s === "object" && typeof s.name === "string"
        );
        setStudents(cleanStudents); // ✅ Set only clean data

        const mentorData = await mentorRes.json();
        setInstitute(mentorData.institute || "Institute Name Not Available");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter students by name based on search input
  const filteredStudents = students.filter(
    (student) =>
      typeof student === "object" &&
      student !== null &&
      typeof student.name === "string" &&
      student.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="student-page-main">
      {/* Header */}
      <header className="student-header">
        <div>
          <h2 className="student-title">Student Data</h2>
          <h4>{institute}</h4>
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
              key={student.st_id || student.id || student.name}
              className="student-card-wrapper"
              onClick={() => {
                console.log("Clicked student id:", student.st_id);
                navigate(`/students/${student.st_id}`, { state: student });
              }}
            >
              <StudentCard
                student={{
                  ...student,
                  img: student.img || "../assets/student.png",
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
