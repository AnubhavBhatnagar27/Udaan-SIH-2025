import React from "react";
import "../styles/StudentCard.css";

export default function StudentCard({ student }) {
  console.log("Rendering StudentCard with:", student);

  if (!student || !student.name) {
    return <div className="student-card empty">Invalid student data</div>;
  }

  // Risk color mapping + icon
  const riskLevel = student?.prediction?.risk_level || "Unknown";
  const riskData = {
    "High Risk": { color: "#ef4444", icon: "⚠️" },
    "Medium Risk": { color: "#3b82f6", icon: "🟠" },
    "Low Risk": { color: "#f59e0b", icon: "✅" },
    "Unknown": { color: "#999", icon: "❔" },
  };

  const risk = riskData[riskLevel] || { color: "#999", icon: "❔" };

  // Safely access guardian info
  const guardianName = student?.guardian?.name || "N/A";
  const guardianMobile = student?.guardian?.mobile || "N/A";

  return (
    <div className="student-card">
      {/* Top Section: Avatar + Student Info */}
      <div className="student-top">
        {/* Avatar */}
        <div className="student-avatar" style={{ borderColor: risk.color }}>
          <img
            src={student?.img || "https://via.placeholder.com/90"}
            alt={student?.name || "Student"}
          />
        </div>

        {/* Info */}
        <div className="student-info">
          <p>
            <strong>Name:</strong> {student.name || "N/A"}
          </p>
          <p>
            <strong>Branch:</strong> {student.branch || "N/A"}
          </p>
          <p>
            <strong>Batch:</strong> {student.batch || "N/A"}
          </p>
          <p>
            <strong>Enrollment No.:</strong> {student.enrolment_no || "N/A"}
          </p>

          {/* Risk Badge */}
          <p>
            <strong>Risk:</strong>{" "}
            <span className="risk-badge" style={{ backgroundColor: risk.color }}>
              {risk.icon} <span className="risk-text">{riskLevel || "N/A"}</span>
            </span>
          </p>
        </div>
      </div>

      {/* Guardian Info */}
      <div className="guardian-section">
        <h4>👨‍👩‍👧 Guardian Details</h4>
        <p>
          <strong>Name:</strong> {student.guardian_name}
        </p>
        <p>
          <strong>Email ID:</strong> {student.guardian_contact}
        </p>
      </div>
    </div>
  );
}
