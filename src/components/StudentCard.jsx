import React from "react";
import "../styles/StudentCard.css"; // css specific to student card

export default function StudentCard({ student }) {
  return (
    <div className="student-card">
      <div className="student-header">
        <img src={student.img} alt={student.name} className="student-avatar" />
        <div>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Branch:</strong> {student.branch}</p>
          <p><strong>Batch:</strong> {student.batch}</p>
          <p><strong>Enrollment No.:</strong> {student.enrolment_no}</p>
          <p>
            <strong>Risk:</strong>{" "}
            <span
              className={`risk-badge ${
                student.risk_level === "High Risk"
                  ? "risk-high"
                  : student.risk_level === "Medium Risk"
                  ? "risk-medium"
                  : "risk-low"
              }`}
            >
              {student.risk_level}
            </span>
            {/* <span className="risk-badge">{student.risk}</span> */}
          </p>
        </div>
      </div>

      <div className="guardian">
        <p><strong>Guardian Detail:</strong></p>
        <p>Name: {student.guardian.name}</p>
        <p>Mobile No: {student.guardian.mobile}</p>
      </div>
    </div>
  );
}
