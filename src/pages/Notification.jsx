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
  const [sendingIndex, setSendingIndex] = useState(null); // Track which student is sending email

  // New state for modal and email form inputs
  const [showModal, setShowModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    email: "",
    subject: "Counseling Alert Notification",
    message: "",
    studentIndex: null,
    studentName: "",
  });

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

  // Open modal and prefill data
  const openModal = (student, index) => {
    setEmailForm({
      email: student.guardian_contact || "",
      subject: "Counseling Alert Notification",
      message: `Hello ${student.name}, this is your counseling alert notification via email.`,
      studentIndex: index,
      studentName: student.name || "",
    });
    setShowModal(true);
    setError(null);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Handle input changes inside modal form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  // Send Email alert handler (called from modal submit)
  const sendEmailAlert = async () => {
    setSendingIndex(emailForm.studentIndex);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        email: emailForm.email,
        subject: emailForm.subject,
        message: emailForm.message,
        student_id: students[emailForm.studentIndex].st_id,
      };

      // Call your backend email send API
      const response = await axios.post(`${apiUrl}/api/send-email/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "Email sent successfully.") {
        // Update student data in the state, like date and status
        const updatedStudents = [...students];
        const idx = emailForm.studentIndex;
        updatedStudents[idx] = {
          ...updatedStudents[idx],
          date: new Date().toLocaleString(),
          status: "Email Sent",
        };
        setStudents(updatedStudents);
        setShowModal(false);
      } else {
        setError("Email sending failed. Try again.");
      }
    } catch (err) {
      setError("Error sending email.");
    } finally {
      setSendingIndex(null);
    }
  };

  if (loading) return <div style={{ padding: "20px", textAlign: "center" }}>Loading students...</div>;
  if (error) return <div style={{ padding: "20px", textAlign: "center", color: "red" }}>{error}</div>;

  return (
    <div className="notification-container">
      <h1 className="page-title">Alert Notification Dashboard</h1>

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
              <th>Guardian Email</th>
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
                  <td>{student.guardian_contact || "-"}</td>
                  <td
                    style={{
                      color:
                        student.status?.toLowerCase() === "completed" ||
                          student.status?.toLowerCase() === "email sent"
                          ? "green"
                          : "orange",
                      fontWeight: "bold",
                      textTransform: "capitalize",
                    }}
                  >
                    {student.status || "-"}
                  </td>
                  <td>
                    <button
                      onClick={() => openModal(student, index)}
                      disabled={sendingIndex === index}
                      style={{
                        backgroundColor: 'red',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 10px',
                        cursor: sendingIndex === index ? 'not-allowed' : 'pointer',
                        opacity: sendingIndex === index ? 0.6 : 1
                      }}
                    >
                      {sendingIndex === index ? "Sending Email..." : "Send Alert"}
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

      {/* Modal Popup */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Send Alert Email to {emailForm.studentName}</h2>

            <label>
              Email Address:
              <input
                type="email"
                name="email"
                value={emailForm.email}
                onChange={handleInputChange}
                required
                style={{ width: "100%" }}
              />
            </label>

            <label>
              Subject:
              <input
                type="text"
                name="subject"
                value={emailForm.subject}
                onChange={handleInputChange}
                required
                style={{ width: "100%" }}
              />
            </label>

            <label>
              Message:
              <textarea
                name="message"
                value={emailForm.message}
                onChange={handleInputChange}
                rows={6}
                required
                style={{ width: "100%" }}
              />
            </label>

            <div className="modal-actions">
              <button onClick={sendEmailAlert} disabled={sendingIndex !== null} style={{ marginRight: "10px" }}>
                {sendingIndex !== null ? "Sending..." : "Send Email"}
              </button>
              <button onClick={closeModal} disabled={sendingIndex !== null}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
