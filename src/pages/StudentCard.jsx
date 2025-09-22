import React from "react";
import "../styles/StudentCard.css";

export default function StudentCard({ student }) {
  if (!student) {
    return <div className="student-card empty">No student data provided</div>;
  }

  // Risk color mapping + icon
  const riskData = {
    "High Risk": { color: "#e74c3c", icon: "⚠️" },
    "Medium Risk": { color: "#e67e22", icon: "🟠" },
    "Low Risk": { color: "#27ae60", icon: "✅" },
  };

  // Safe fallback if student.risk is missing
  const risk = riskData[student.risk] || { color: "#999", icon: "❔" };

  // Safely access guardian info
  const guardianName = student.guardian?.name || "N/A";
  const guardianMobile = student.guardian?.mobile || "N/A";

  return (
    <div className="student-card">
      {/* Top Section: Avatar + Student Info */}
      <div className="student-top">
        {/* Avatar */}
        <div className="student-avatar" style={{ borderColor: risk.color }}>
          <img src={student.img || "https://via.placeholder.com/90"} alt={student.name || "Student"} />
        </div>

        {/* Info */}
        <div className="student-info">
          <p><strong>Name:</strong> {student.name || "N/A"}</p>
          <p><strong>Branch:</strong> {student.branch || "N/A"}</p>
          <p><strong>Batch:</strong> {student.batch || "N/A"}</p>
          <p><strong>Enrollment No.:</strong> {student.enrollment || "N/A"}</p>

          {/* Risk Badge */}
          <p>
            <strong>Risk:</strong>{" "}
            <span className="risk-badge" style={{ backgroundColor: risk.color }}>
              {risk.icon} <span className="risk-text">{student.risk || "N/A"}</span>
            </span>
          </p>
        </div>
      </div>

      {/* Guardian Info */}
      <div className="guardian-section">
        <h4>👨‍👩‍👧 Guardian Details</h4>
        <p><strong>Name:</strong> {guardianName}</p>
        <p><strong>Mobile No:</strong> {guardianMobile}</p>
      </div>
    </div>
  );
}
