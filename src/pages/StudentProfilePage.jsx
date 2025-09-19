import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/StudentProfile.css";

export default function StudentProfile() {
  const { state: student } = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

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

  // Risk color + icon mapping
  const riskData = {
    "High Risk": { color: "#e74c3c", icon: "⚠️" },
    "Medium Risk": { color: "#e67e22", icon: "🟠" },
    "Low Risk": { color: "#27ae60", icon: "✅" },
  };
  const risk = riskData[student.risk] || { color: "#999", icon: "❔" };

  return (
    <div className="profile-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <div className="profile-main">
        {/* ✅ Left Profile Card */}
        <div className="profile-card">
          <img
            src={student.img}
            alt={student.name}
            className="profile-avatar"
          />
          <h2 className="student-name">{student.name}</h2>
          <p className="enrollment">Enrollment: {student.enrollment}</p>

          <div className="profile-details">
            <p>
              <strong>Branch:</strong> {student.branch}
            </p>
            <p>
              <strong>Batch:</strong> {student.batch}
            </p>
          </div>

          <div className={`risk-badge ${student.risk?.toLowerCase().replace(" ", "-")}`}>
            {risk.icon} {student.risk}
          </div>

          {/* Guardian Info */}
          <div className="guardian-section">
            <h4>👨‍👩‍👧 Guardian Info</h4>
            <p>
              <strong>Name:</strong> {student.guardian?.name}
            </p>
            <p>
              <strong>Mobile:</strong> {student.guardian?.mobile}
            </p>
          </div>
        </div>

        {/* ✅ Right Risk Info + Remark Section */}
        <div className="risk-card">
          <h3>Risk Status</h3>
          <p>
            {student.name} is currently flagged as{" "}
            <strong>{student.risk}</strong>. Based on attendance & CGPA, ML
            system predicts possible academic risk.
          </p>
          <p>
            Counseling session will be scheduled with mentor. Alerts are sent to
            student & mentor automatically.
          </p>

          {/* 🔹 Session Remark Section */}
          <div className="remark-section">
            <h3>📝 Session Remark</h3>
            <textarea
              placeholder="Write your session remark here..."
              rows={4}
            ></textarea>

            <div className="remark-actions">
              <button
                className="previous-remark-btn"
                onClick={() => setShowModal(true)}
              >
                📂 Previous Session Remark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📖 Previous Session Remarks</h3>
            <ul>
              {(student.remarks || []).length > 0 ? (
                student.remarks.map((remark, index) => (
                  <li key={index}>{remark}</li>
                ))
              ) : (
                <p>No previous remarks available.</p>
              )}
            </ul>
            <button
              className="close-modal-btn"
              onClick={() => setShowModal(false)}
            >
              ✖ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
