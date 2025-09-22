// Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, BarChart3, Info, LogOut } from "lucide-react";
import logo from "../assets/logo.jpg"; // Adjust path if needed
import "../styles/SideBar.css"; // Or move styles to Sidebar.css if modularizing further

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const menu = [
    { to: "/dashboard", icon: <Home size={20} />, label: "Dashboard" },
    { to: "/students", icon: <Users size={20} />, label: "Student Data" },
    { to: "/counseling", icon: <BarChart3 size={20} />, label: "Counseling" },
    {
      to: "/about",
      icon: <Info size={20} />,
      label: "About Us",
      download: true,
    },
  ];

  return (
    <div
      className={`sidebar ${isExpanded ? "expanded" : ""}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="logo-section">
        <img src={logo} alt="App Logo" className="sidebar-logo" />
        {isExpanded && <span className="logo-text">Udaan</span>}
      </div>

      <nav className="nav-buttons">
        {menu.map((item) =>
          item.download ? (
            <a
              key={item.to}
              href="/about.pdf"
              download="about.pdf"
              className="nav-link"
            >
              {item.icon}
              {isExpanded && <span className="nav-label">{item.label}</span>}
            </a>
          ) : (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${
                location.pathname === item.to ? "active" : ""
              }`}
            >
              {item.icon}
              {isExpanded && <span className="nav-label">{item.label}</span>}
            </Link>
          )
        )}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="logout-btn"
          onClick={() => {
            alert("Logging out...");
            navigate("/");
          }}
        >
          <LogOut size={22} />
          {isExpanded && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </div>
  );
}
