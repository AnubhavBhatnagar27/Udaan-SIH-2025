// src/pages/StudentCounseling.jsx
import React, { useState, useEffect } from "react";
import "../styles/StudentCounseling.css";
import axios from "axios"; // Import axios for API requests

export default function StudentCounseling() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]); // Empty array initially
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newRemark, setNewRemark] = useState("");

  // Format date function to show current date in readable format
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch students from the backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:8000/api/students/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }); // Make sure this URL matches your backend endpoint
        setStudents(response.data); // Set the students data
      } catch (err) {
        setError("Failed to fetch student data");
      } finally {
        setLoading(false); // Data fetching is complete, hide loading spinner
      }
    };

    fetchStudents();
  }, []); // Empty dependency array ensures this only runs once when the component mounts

  const filtered = students.filter((s) => {
    const name = s.name ? s.name.toLowerCase() : "";
    const enrolment_no = s.enrolment_no ? s.enrolment_no.toLowerCase() : "";
    const searchTerm = search.toLowerCase();

    return name.includes(searchTerm) || enrolment_no.includes(searchTerm);
  });

  // New function to update status on button click
  const updateStatus = (index, newStatus) => {
    setStudents((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status: newStatus } : s))
    );
  };

  const openRemarkModal = (student) => {
    setSelectedStudent(student);
    setNewRemark("");
  };

  const addRemark = async () => {
    if (!newRemark.trim()) return;

    const token = localStorage.getItem("accessToken");

    const remarkObj = {
      text: newRemark,
      date: new Date().toLocaleString(),
      counselor: "Prof. Sharma",
    };

    try {
      // Assuming your backend accepts a POST request to add a remark
      await axios.post(
        `http://localhost:8000/api/students/${selectedStudent.st_id}/remarks/`,
        remarkObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update local state after adding the remark successfully
      const updated = students.map((s) =>
        s.enrolment_no === selectedStudent.enrolment_no
          ? { ...s, remarks: [...(s.remarks || []), remarkObj] }
          : s
      );
      setStudents(updated);

      const updatedStudent = updated.find(
        (s) => s.enrolment_no === selectedStudent.enrolment_no
      );
      setSelectedStudent(updatedStudent);
      setNewRemark("");
    } catch (error) {
      setError("Failed to add remark");
    }
  };

  if (loading) return <div>Loading...</div>; // Show loading message while fetching data
  if (error) return <div>{error}</div>; // Show error if data fetching fails

  return (
    <div className="counseling-page">
      <div className="counseling-main">
        <h2 className="page-title">📚 CSE SEM-5 Counseling Dashboard</h2>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-box">
            <h3>Total Students</h3>
            <p>{students.length}</p>
          </div>
          <div className="stat-box">
            <h3>✅ Completed</h3>
            <p>{students.filter((s) => s.status === "Done").length}</p>
          </div>
          <div className="stat-box">
            <h3>⏳ Pending</h3>
            <p>{students.filter((s) => s.status === "Pending").length}</p>
          </div>
          <div className="stat-box">
            <h3>⚠️ Overdue</h3>
            <p>{students.filter((s) => s.status === "Overdue").length}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-section">
          <p>
            Counseling Completed:{" "}
            {students.length > 0
              ? Math.round(
                  (students.filter((s) => s.status === "Done").length / students.length) * 100
                )
              : 0}
            %
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  students.length > 0
                    ? (students.filter((s) => s.status === "Done").length / students.length) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <div className="table-header">
            <h3>📑 Counseling Records</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder=" Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-scroll">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Enrollment No.</th>
                  <th>Counseling Date</th>
                  <th>Status</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((s, index) => (
                    <tr key={index}>
                      <td>{s.name || "-"}</td>
                      <td>{s.enrolment_no || "-"}</td>
                      <td>{formatDate(new Date())}</td> {/* Show current date here */}
                      <td>
                        <div className="status-buttons">
                          {["Done", "Pending", "Overdue"].map((statusOption) => (
                            <button
                              key={statusOption}
                              onClick={() => updateStatus(index, statusOption)}
                              className={`status-btn ${
                                s.status === statusOption ? "active" : ""
                              }`}
                            >
                              {statusOption}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button className="remark-btn" onClick={() => openRemarkModal(s)}>
                          View/Add Remark
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      ❌ No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Remark Modal */}
        {selectedStudent && (
          <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3>Remarks - {selectedStudent.name || "-"}</h3>
              <ul className="remark-history">
                {selectedStudent.remarks && selectedStudent.remarks.length > 0 ? (
                  selectedStudent.remarks.map((r, i) => (
                    <li key={i}>
                      <strong>{r.counselor || "Unknown"}</strong> ({r.date || "Unknown"}):{" "}
                      {r.text || ""}
                    </li>
                  ))
                ) : (
                  <p className="no-remarks">No previous remarks</p>
                )}
              </ul>

              <div className="remark-input-box">
                <input
                  type="text"
                  value={newRemark}
                  placeholder="Add new remark..."
                  onChange={(e) => setNewRemark(e.target.value)}
                />
                <button onClick={addRemark}>➕ Add</button>
              </div>

              <button className="close-btn" onClick={() => setSelectedStudent(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
