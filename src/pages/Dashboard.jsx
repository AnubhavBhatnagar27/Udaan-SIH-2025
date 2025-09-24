// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import uploadIcon from "../assets/upload-icon.png";
import "../styles/Dashboard.css";

const apiUrl = process.env.REACT_APP_API_URL;
// Profile Section
function ProfileSection() {
  const [mentor, setMentor] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setMentor(null);
      return;
    }

    axios
      .get(`${apiUrl}/api/mentors/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMentor(res.data);
      })
      .catch((error) => {
        console.error("Error fetching mentor:", error);
        setMentor(null);
      });
  }, []);



  if (!mentor) return <div>Loading mentor profile...</div>;

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSelectFileClick = () => {
    fileInputRef.current.click();
  };

  const handleUploadClick = async () => {
    const token = localStorage.getItem("accessToken");
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50 MB limit.");
      return;
    }

    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Unsupported file format. Please upload .csv or .xlsx files.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      console.log("Uploading file:", selectedFile);
      const response = await axios.post(`${apiUrl}/api/upload/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type manually, let Axios handle it.
      },
    });

      if (response.status === 201) {
        alert("Upload successful!");
        setSelectedFile(null);
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Backend response error:", error.response.data);
        alert("Upload failed: " + (error.response.data.error || "Unknown error"));
      } else {
        console.error("Upload error:", error);
        alert("An error occurred during upload.");
      }
    }
  };

  return (
    <div className="profile-section">
      <div className="profile-left">
        <div
          className="profile-avatar"
          style={{
            backgroundImage: `url(${mentor.image || "/assets/mentor.png"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="profile-info">
          <h2>{mentor.name}</h2>
          <p>ID.No: {mentor.id_number}</p>
          <p><strong>Institute:</strong> {mentor.institute}</p>
          <p><strong>Branch:</strong> {mentor.branch}</p>
          <p><strong>Session:</strong> {mentor.session}</p>
        </div>
      </div>

      <div className="profile-right">
        <div className="upload-box">
          <img
            src={uploadIcon}
            alt="Upload Icon"
            className="upload-icon"
            onClick={() => window.open("/student-data.xlsx", "_blank")}
          />
          <h3>Upload Student Data</h3>
          <p><strong>Select file or drag & drop</strong></p>
          <small>.csv, .xlsx files accepted (Max: 50 MB)</small>

          <input
            type="file"
            accept=".csv, .xlsx"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {selectedFile && <p>Selected file: {selectedFile.name}</p>}

          <button className="upload-btn" onClick={handleSelectFileClick}>Select File</button>
          <button className="upload-btn" onClick={handleUploadClick}>Upload</button>
        </div>
      </div>
    </div>
  );
}

// Risk Summary
function RiskAnalysis() {
  const [riskSummary, setRiskSummary] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    axios
      .get(`${apiUrl}/api/risk-analytics/`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setRiskSummary(res.data))
      .catch((err) => console.error("Error fetching risk summary:", err));
  }, []);

  if (!riskSummary) return <div>Loading risk analysis...</div>;

  const riskDistribution = riskSummary.risk_distribution;

  const colors = {
    "High Risk": "red",
    "Medium Risk": "blue",
    "Low Risk": "yellow",
  };

  return (
    <div className="risk-analysis">
      <div className="risk-title">
        <h3>Risk Analysis</h3>
        <p>Total Students: {riskSummary.total_students}</p>
      </div>

      <div className="risk-items">
        {Object.entries(riskDistribution).map(([riskLabel, count]) => (
          <div key={riskLabel} className="risk-item">
            <div className={`risk-circle ${colors[riskLabel]}`}>{count}</div>
            <div className="risk-info">
              <p className="risk-level">{riskLabel.toUpperCase()}</p>
              <p className="risk-value">{count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Student Table (✅ Fixed)
function StudentTable() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    axios
      .get(`${apiUrl}/api/students/`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("Fetched students:", res.data);
        setStudents(res.data);
      })
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  // First filter by search
  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Then sort the filtered list alphabetically by name
  const sortedFilteredStudents = [...filtered].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="student-table-container">
      <div className="student-table-header">
        <h3>📑 Student Data</h3>
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>STUDENT NAME</th>
            <th>RISK</th>
            <th>DAYS IN</th>
          </tr>
        </thead>
        <tbody>
          {sortedFilteredStudents.length > 0 ? (
            sortedFilteredStudents.map((s) => {
              const riskLevel = s.risk_level || s.prediction?.risk_level || "Unknown";
              const badgeClass = `badge-${riskLevel.toLowerCase().replace(" ", "-")}`;

              return (
                <tr key={s.st_id}>
                  <td className="student-name-cell">
                    <strong>{s.name}</strong>
                    <p>Attendance: {s.attendance}%</p>
                  </td>
                  <td>
                    <span className={`badge ${badgeClass}`}>
                      {riskLevel}
                    </span>
                  </td>
                  <td>{Math.floor(Math.random() * 30) + 1} days</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="3" className="no-data">
                ❌ No student found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


// Main Dashboard Component
export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px'
      }}>
        Loading Dashboard...
      </div>
    );
  }

  return (
    <>
      <ProfileSection />
      <RiskAnalysis />
      <StudentTable />
    </>
  );
}
