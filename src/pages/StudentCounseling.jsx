// src/pages/StudentCounseling.jsx
import React, { useState, useEffect } from "react";
import "../styles/StudentCounseling.css";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export default function StudentCounseling() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newRemark, setNewRemark] = useState("");
  const [currentMentor, setCurrentMentor] = useState({ name: "Unknown" });

  // Format date function (fall back if invalid)
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    // Expecting "mm/dd/yyyy"
    const parts = dateStr.split("/");
    if (parts.length !== 3) return "-";
    const [mm, dd, yyyy] = parts;
    // Create Date with yyyy, mm-1 (month is zero-based), dd
    const dateObj = new Date(yyyy, mm - 1, dd);
    if (isNaN(dateObj)) return "-";
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  // Utility: Check if API response is JSON before parsing (to avoid unexpected '<')
  const isJSON = (response) => {
    const contentType = response.headers["content-type"] || "";
    return contentType.includes("application/json");
  };

  // Load students & mentor on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found. Please login.");
        setLoading(false);
        return;
      }

      try {
        // Use axios all at once
        const [studentsRes, mentorRes] = await Promise.all([
          axios.get(`${apiUrl}/api/students/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/mentors/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (
          !studentsRes.data ||
          !Array.isArray(studentsRes.data) ||
          !mentorRes.data
        ) {
          throw new Error("Invalid API response");
        }

        // Apply 8-day overdue logic locally to students' status
        const updatedStudents = studentsRes.data.map((s) => {
          if (
            s.status === "Pending" &&
            s.counseling_date &&
            new Date() - new Date(s.counseling_date) > 8 * 24 * 60 * 60 * 1000
          ) {
            return { ...s, status: "Overdue" };
          }
          return s;
        });

        setStudents(updatedStudents);
        setCurrentMentor(mentorRes.data);
      } catch (err) {
        // Axios errors might have response with HTML (like 404 page) - catch gracefully
        if (axios.isAxiosError(err) && err.response) {
          const ct = err.response.headers["content-type"] || "";
          if (!ct.includes("application/json")) {
            setError(
              `API returned non-JSON response (${err.response.status}). Please check your API URL or server.`
            );
          } else {
            setError(
              err.response.data?.message ||
              err.message ||
              "Failed to fetch data from server"
            );
          }
        } else {
          setError(err.message || "Unexpected error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search filtering
  const filtered = students.filter((s) => {
    const name = s.name ? s.name.toLowerCase() : "";
    const enrolment_no = s.enrolment_no ? s.enrolment_no.toLowerCase() : "";
    const searchTerm = search.toLowerCase();

    return name.includes(searchTerm) || enrolment_no.includes(searchTerm);
  });
  const cycleStatus = (index) => {
    setStudents((prev) => {
      const updated = [...prev];
      const currentStatus = updated[index].status || "Pending";

      const newStatus =
        currentStatus === "Pending"
          ? "Done"
          : currentStatus === "Done"
            ? "Overdue"
            : "Pending";

      updated[index] = { ...updated[index], status: newStatus };
      return updated;
    });
  };


  // Status update handler
  const updateStatus = async (index, newStatus) => {
    // Optimistic UI update
    const updatedStudents = [...students];
    updatedStudents[index] = { ...updatedStudents[index], status: newStatus };
    setStudents(updatedStudents);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("No access token found. Please login.");
      return;
    }

    try {
      await axios.patch(
        `${apiUrl}/api/students/${updatedStudents[index].st_id}/`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      setError("Failed to update status. Please try again.");
      // Rollback on error
      setStudents(students);
    }
  };

  // Open remark modal and fetch remarks
  const openRemarkModal = async (student) => {
    setSelectedStudent(null);
    setNewRemark("");
    setError(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("No access token found. Please login.");
      return;
    }

    try {
      const res = await axios.get(
        `${apiUrl}/api/students/${student.st_id}/remarks/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!Array.isArray(res.data)) {
        setSelectedStudent({ ...student, remarks: [] });
        return;
      }

      setSelectedStudent({ ...student, remarks: res.data });
    } catch (err) {
      setError("Failed to load remarks.");
      setSelectedStudent({ ...student, remarks: [] });
    }
  };

  // Add a new remark
  const addRemark = async () => {
    if (!newRemark.trim()) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("No access token found. Please login.");
      return;
    }

    const remarkPayload = {
      text: newRemark.trim(),
      counselor: currentMentor.name || "Unknown",
    };

    try {
      await axios.post(
        `${apiUrl}/api/students/${selectedStudent.st_id}/remarks/`,
        remarkPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh remarks after add
      const remarksRes = await axios.get(
        `${apiUrl}/api/students/${selectedStudent.st_id}/remarks/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedStudent((prev) => ({
        ...prev,
        remarks: remarksRes.data,
      }));

      setNewRemark("");
    } catch (err) {
      setError("Failed to add remark.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <div style={{ color: "red", padding: "1rem" }}>
        <strong>Error:</strong> {error}
      </div>
    );

  return (
    <div className="counseling-page">
      <div className="counseling-main">
        <h2 className="page-title">📚 Student Counseling Dashboard</h2>

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
                (students.filter((s) => s.status === "Done").length / students.length) *
                100
              )
              : 0}
            %
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${students.length > 0
                  ? (students.filter((s) => s.status === "Done").length / students.length) *
                  100
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
                    <tr key={s.st_id || index}>
                      <td>{s.name || "-"}</td>
                      <td>{s.enrolment_no || "-"}</td>
                      <td>{formatDate(s.counseling_date)}</td>
                      <td>
                        <button
                          className={`status-btn single-btn status-${(s.status || "Pending").toLowerCase()}`}
                          onClick={() => cycleStatus(index)}
                        >
                          {s.status || "Pending"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="remark-btn"
                          onClick={() => openRemarkModal(s)}
                        >
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
          <div
            className="modal-overlay"
            onClick={() => setSelectedStudent(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="modal-box"
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
            >
              <h3>Remarks - {selectedStudent.name || "-"}</h3>
              <ul className="remark-history">
                {selectedStudent.remarks && selectedStudent.remarks.length > 0 ? (
                  selectedStudent.remarks.map((r, i) => (
                    <li key={i}>
                      <strong>{r.counselor || "Unknown"}</strong> ({formatDate(r.date)}):{" "}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addRemark();
                  }}
                />
                <button onClick={addRemark} disabled={!newRemark.trim()}>
                  ➕ Add
                </button>
              </div>

              <button
                className="close-btn"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close remarks modal"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
