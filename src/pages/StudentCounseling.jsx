// src/pages/StudentCounseling.jsx
import React, { useState } from "react";
import "../styles/StudentCounseling.css";

export default function StudentCounseling() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([
    {
      name: "Aadarsh Thakur",
      enrollment: "0105CD231001",
      date: "01/11/2023",
      status: "Done",
      remarks: [
        { text: "Good progress", date: "01/11/2023, 10:30 AM", counselor: "Prof. Sharma" },
      ],
    },
    {
      name: "Rahul Sharma",
      enrollment: "0105CD231011",
      date: "02/11/2023",
      status: "Pending",
      remarks: [
        { text: "Needs follow-up", date: "02/11/2023, 11:15 AM", counselor: "Prof. Sharma" },
      ],
    },
    {
      name: "Sneha Verma",
      enrollment: "0105CD231021",
      date: "05/11/2023",
      status: "Overdue",
      remarks: [
        { text: "Did not attend", date: "05/11/2023, 09:00 AM", counselor: "Prof. Sharma" },
      ],
    },
    {
      name: "Swati Gupta",
      enrollment: "0105CD231031",
      date: "06/11/2023",
      status: "Done",
      remarks: [
        { text: "Excellent improvement", date: "06/11/2023, 01:45 PM", counselor: "Prof. Sharma" },
      ],
    },
    {
      name: "Umesh Patel",
      enrollment: "0105CD231041",
      date: "07/11/2023",
      status: "Pending",
      remarks: [],
    },
  ]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newRemark, setNewRemark] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.enrollment.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (index) => {
    setStudents((prev) =>
      prev.map((s, i) => {
        if (i === index) {
          if (s.status === "Done") return { ...s, status: "Pending" };
          if (s.status === "Pending") return { ...s, status: "Done" };
        }
        return s;
      })
    );
  };

  const openRemarkModal = (student) => {
    setSelectedStudent(student);
    setNewRemark("");
  };

  // ✅ FIXED addRemark (selectedStudent bhi update hoga)
  const addRemark = () => {
    if (!newRemark.trim()) return;

    const remarkObj = {
      text: newRemark,
      date: new Date().toLocaleString(),
      counselor: "Prof. Sharma",
    };

    // Students array update
    const updated = students.map((s) =>
      s.enrollment === selectedStudent.enrollment
        ? { ...s, remarks: [...s.remarks, remarkObj] }
        : s
    );

    setStudents(updated);

    // ✅ Modal ke liye bhi update karo
    const updatedStudent = updated.find(
      (s) => s.enrollment === selectedStudent.enrollment
    );
    setSelectedStudent(updatedStudent);

    setNewRemark("");
  };

  return (
    <div className="counseling-page">
      <div className="counseling-main">
        <h2 className="page-title">📚 CSE SEM-5 Counseling Dashboard</h2>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-box"><h3>Total Students</h3><p>{students.length}</p></div>
          <div className="stat-box"><h3>✅ Completed</h3><p>{students.filter((s) => s.status === "Done").length}</p></div>
          <div className="stat-box"><h3>⏳ Pending</h3><p>{students.filter((s) => s.status === "Pending").length}</p></div>
          <div className="stat-box"><h3>⚠️ Overdue</h3><p>{students.filter((s) => s.status === "Overdue").length}</p></div>
        </div>

        {/* Progress */}
        <div className="progress-section">
          <p>
            Counseling Completed:{" "}
            {Math.round(
              (students.filter((s) => s.status === "Done").length / students.length) * 100
            )}
            %
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (students.filter((s) => s.status === "Done").length / students.length) * 100
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
                      <td>{s.name}</td>
                      <td>{s.enrollment}</td>
                      <td>{s.date}</td>
                      <td>
                        <span
                          className={`status ${s.status.toLowerCase()}`}
                          onClick={() => toggleStatus(index)}
                          style={{ cursor: s.status !== "Overdue" ? "pointer" : "default" }}
                        >
                          {s.status}
                        </span>
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
                    <td colSpan="5" className="no-data">❌ No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ Remark Modal */}
        {selectedStudent && (
          <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3>Remarks - {selectedStudent.name}</h3>
              <ul className="remark-history">
                {selectedStudent.remarks.length > 0 ? (
                  selectedStudent.remarks.map((r, i) => (
                    <li key={i}>
                      <strong>{r.counselor}</strong> ({r.date}): {r.text}
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
