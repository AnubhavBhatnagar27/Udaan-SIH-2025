import React from "react";
import "../styles/StudentCard.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <img src="/logo.png" alt="Logo" className="sidebar-logo" />
      <nav className="sidebar-nav">
        <button>🏠</button>
        <button>👥</button>
        <button>📊</button>
        <button>⚙️</button>
      </nav>
    </div>
  );
}
