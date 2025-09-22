// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentCounseling from './pages/StudentCounseling';
import StudentDataPage from './pages/StudentDataPage';
import StudentProfilePage from './pages/StudentProfilePage';
import Sidebar from './components/Sidebar';
import './App.css';

// Reusable layout wrapper that includes Sidebar
const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      {/* Routes WITHOUT sidebar */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Routes WITH sidebar */}
      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/students"
        element={
          <Layout>
            <StudentDataPage />
          </Layout>
        }
      />
      <Route
        path="/students/:st_id"
        element={
          <Layout>
            <StudentProfilePage />
          </Layout>
        }
      />
      <Route
        path="/counseling"
        element={
          <Layout>
            <StudentCounseling />
          </Layout>
        }
      />
    </Routes>
  );
};

export default App;
