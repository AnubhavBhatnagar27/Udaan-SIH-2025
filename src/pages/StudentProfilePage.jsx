import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/StudentProfilePage.css";
const apiUrl = process.env.REACT_APP_API_URL;
export default function StudentProfile() {
  const { id:st_id } = useParams(); // student ID from URL
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Fetch student data from backend
  useEffect(() => {
  fetch(`${apiUrl}/api/students/${st_id}/`)
    .then((res) => {
      if (!res.ok) throw new Error("Student not found");
      return res.json();
    })
    .then((data) => {
      setStudent(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setStudent(null);
      setLoading(false);
    });
}, [st_id]);

  if (loading) {
    return <div className="loading">Loading student data...</div>;
  }

  if (!student) {
    return (
      <div className="student-profile empty-state">
        <h2>No student data found</h2>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ⬅ Go Back
        </button>
      </div>
    );
  }

  // Risk styling
  const riskData = {
    "High Risk": { color: "#e74c3c", icon: "⚠️" },
    "Medium Risk": { color: "#e67e22", icon: "🟠" },
    "Low Risk": { color: "#27ae60", icon: "✅" },
  };
  const risk = riskData[student.prediction] || { color: "#999", icon: "❔" };

  return (
    <div className="profile-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <div className="profile-main">
        {/* Left Profile Card */}
        <div className="profile-card">
          <img
            src="https://api.dicebear.com/8.x/thumbs/svg?seed=student"
            alt={student.name}
            className="profile-avatar"
          />
          <h2 className="student-name">{student.name}</h2>
          <p className="enrollment">Enrollment: {student.st_id}</p>

          <div className="profile-details">
            <p><strong>Attendance:</strong> {student.attendance}%</p>
            <p><strong>Test Avg:</strong> {student.avg_test_score}</p>
            <p><strong>Fees Paid:</strong> ₹{student.fees_paid}</p>
            <p><strong>Backlogs:</strong> {student.backlogs}</p>
          </div>

          <div
            className={`risk-badge ${student.prediction?.toLowerCase().replace(" ", "-")}`}
            style={{ backgroundColor: risk.color }}
          >
            {risk.icon} {student.prediction}
          </div>
        </div>

        {/* Right Risk Info + Remark Section */}
        <div className="risk-card">
          <h3>Risk Status</h3>
          <p>
            {student.name} is currently flagged as{" "}
            <strong>{student.prediction}</strong>. Based on attendance,
            test scores, and other metrics, the system predicts academic risk.
          </p>
          <p>
            Mentors are alerted, and the student will be invited for a
            counseling session.
          </p>

          {/* Optional: Add a session remark section here */}
        </div>
      </div>

      {/* Optional Modal UI */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📖 Previous Session Remarks</h3>
            <p>No previous remarks available.</p>
            <button className="close-modal-btn" onClick={() => setShowModal(false)}>
              ✖ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
