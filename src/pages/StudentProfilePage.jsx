import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/StudentProfilePage.css";

const apiUrl = process.env.REACT_APP_API_URL;

export default function StudentProfilePage() {
  const { st_id } = useParams();
  const location = useLocation();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found. Please login.");
        setLoading(false);
        return;
      }

      try {
        // First try to get student from location state (passed from navigation)
        if (location.state) {
          setStudent(location.state);
          setLoading(false);
          return;
        }

        // If no state, fetch from API
        const response = await axios.get(`${apiUrl}/api/students/${st_id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudent(response.data);
      } catch (err) {
        setError("Failed to load student data");
        console.error("Error fetching student:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [st_id, location.state]);

  if (loading) return <div className="loading">Loading student profile...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!student) return <div className="error">Student not found</div>;

  return (
    <div className="student-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-image">
            <img 
              src={student.img || "/assets/student.png"} 
              alt={student.name}
              onError={(e) => {
                e.target.src = "/assets/student.png";
              }}
            />
          </div>
          <div className="profile-info">
            <h1>{student.name}</h1>
            <p className="enrollment">Enrollment: {student.enrolment_no}</p>
            <p className="risk-level">
              Risk Level: <span className={`risk-badge ${student.risk_level?.toLowerCase().replace(' ', '-')}`}>
                {student.risk_level || 'Unknown'}
              </span>
            </p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>Academic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Attendance:</label>
                <span>{student.attendance}%</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status ${student.status?.toLowerCase()}`}>
                  {student.status || 'Unknown'}
                </span>
              </div>
              <div className="detail-item">
                <label>Counseling Date:</label>
                <span>{student.counseling_date ? new Date(student.counseling_date).toLocaleDateString() : 'Not set'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Performance Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <h4>Attendance</h4>
                <div className="metric-value">{student.attendance}%</div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill" 
                    style={{ width: `${student.attendance || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="metric-card">
                <h4>Risk Assessment</h4>
                <div className={`risk-indicator ${student.risk_level?.toLowerCase().replace(' ', '-')}`}>
                  {student.risk_level || 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          {student.remarks && student.remarks.length > 0 && (
            <div className="detail-section">
              <h3>Counseling Remarks</h3>
              <div className="remarks-list">
                {student.remarks.map((remark, index) => (
                  <div key={index} className="remark-item">
                    <div className="remark-header">
                      <strong>{remark.counselor || 'Unknown Counselor'}</strong>
                      <span className="remark-date">
                        {remark.date ? new Date(remark.date).toLocaleDateString() : 'Unknown Date'}
                      </span>
                    </div>
                    <p className="remark-text">{remark.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
