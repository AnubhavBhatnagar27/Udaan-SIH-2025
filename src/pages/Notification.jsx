import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import "../styles/Notification.css";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export default function Notification() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingIndex, setSendingIndex] = useState(null); // Track which student is sending SMS

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${apiUrl}/api/students/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(response.data);
      } catch (err) {
        setError("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    const name = student.name?.toLowerCase() || "";
    const enrollment = (student.enrollment || student.enrolment_no || "").toLowerCase();
    return name.includes(query) || enrollment.includes(query);
  });

  const totalStudents = filteredStudents.length;
  const completedCount = filteredStudents.filter((s) => s.status?.toLowerCase() === "completed").length;
  const pendingCount = filteredStudents.filter((s) => s.status?.toLowerCase() === "pending").length;

  // Send SMS alert handler
  const sendSMSAlert = async (student, index) => {
    setSendingIndex(index);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");

      // Customize your SMS message here
      const message = `Hello ${student.name}, this is your counseling alert notification.`;

      const payload = {
        number: student.number,
        message: message,
      };

      // Call your backend SMS send API (make sure your backend supports this)
      const response = await axios.post(`${apiUrl}/api/send-sms`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Response example: { success: true, dateSent: "2025-09-23 15:30", status: "Delivered" }
      if (response.data.success) {
        // Update the student in the state with new date and status
        const updatedStudents = [...students];
        updatedStudents[index] = {
          ...student,
          date: response.data.dateSent,
          status: response.data.status || "Delivered",
        };
        setStudents(updatedStudents);
      } else {
        setError("SMS sending failed. Try again.");
      }
    } catch (err) {
      setError("Error sending SMS.");
    } finally {
      setSendingIndex(null);
    }
  };

  if (loading) return <div style={{ padding: "20px", textAlign: "center" }}>Loading students...</div>;
  if (error) return <div style={{ padding: "20px", textAlign: "center", color: "red" }}>{error}</div>;

  return (
    <div className="notification-container">
      <h1 className="page-title">CSE SEM-5 LIST</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">TOTAL STUDENT</p>
          <p className="stat-value">{totalStudents}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">COMPLETED</p>
          <p className="stat-value completed">{completedCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">PENDING</p>
          <p className="stat-value pending">{pendingCount}</p>
        </div>
      </div>

      <div className="table-header">
        <h3 className="table-title">Student Records</h3>
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by Name or Enrollment..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="student-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Enrollment No.</th>
              <th>Notification Date</th>
              <th>Recipient Number</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <tr key={index}>
                  <td>{student.name || "-"}</td>
                  <td>{student.enrollment || student.enrolment_no || "-"}</td>
                  <td>{student.date || "-"}</td>
                  <td>{student.number || "-"}</td>
                  <td
                    style={{
                      color: student.status?.toLowerCase() === "completed" ? "green" : "orange",
                      fontWeight: "bold",
                      textTransform: "capitalize",
                    }}
                  >
                    {student.status || "-"}
                  </td>
                  <td>
                    <button
                      onClick={() => sendSMSAlert(student, index)}
                      disabled={sendingIndex === index}
                      style={{ padding: "5px 10px", cursor: sendingIndex === index ? "not-allowed" : "pointer" }}
                    >
                      {sendingIndex === index ? "Sending..." : "Send Alert"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "15px" }}>
                  No records found 🔍
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
