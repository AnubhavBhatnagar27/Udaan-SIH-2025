import React from "react";
import "../styles/StudentCard.css";

export default function StudentCard({ student }) {
  // Risk color mapping + icon
  const riskData = {
    "High Risk": { color: "#e74c3c", icon: "⚠️" },
    "Medium Risk": { color: "#e67e22", icon: "🟠" },
    "Low Risk": { color: "#27ae60", icon: "✅" },
  };

  // Agar risk milta nahi hai to fallback
  const risk = riskData[student.risk] || { color: "#999", icon: "❔" };

  return (
    <div className="student-card">
      {/* Top Section: Avatar + Student Info */}
      <div className="student-top">
        {/* Avatar */}
        <div
          className="student-avatar"
          style={{ borderColor: risk.color }}
        >
          <img src={student.img} alt={student.name} />
        </div>

        {/* Info */}
        <div className="student-info">
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Branch:</strong> {student.branch}</p>
          <p><strong>Batch:</strong> {student.batch}</p>
          <p><strong>Enrollment No.:</strong> {student.enrollment}</p>

          {/* Risk Badge */}
          <p>
            <strong>Risk:</strong>{" "}
            <span
              className="risk-badge"
              style={{ backgroundColor: risk.color }}
            >
              {risk.icon} <span className="risk-text">{student.risk || "N/A"}</span>
            </span>
          </p>
        </div>
      </div>

      {/* Guardian Info */}
      <div className="guardian-section">
        <h4>👨‍👩‍👧 Guardian Details</h4>
        <p><strong>Name:</strong> {student.guardian.name}</p>
        <p><strong>Mobile No:</strong> {student.guardian.mobile}</p>
      </div>
    </div>
  );
}
