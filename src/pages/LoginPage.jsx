import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const apiUrl = process.env.REACT_APP_API_URL;

const LoginPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupData, setSignupData] = useState({
    fullName: '',
    instituteName: '',
    employeeId: '',
    branch: '',
    email: '',
    password: '',
    confirmPassword: '',
    academicSession: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiUrl}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.access && data.refresh) {
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('username', loginUsername);

        setSuccessMsg('Login successful!');
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/login/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupData.email,
          fullName: signupData.fullName,
          instituteName: signupData.instituteName,
          employeeId: signupData.employeeId,
          branch: signupData.branch,
          password: signupData.password,
          academicSession: signupData.academicSession,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Signup failed');

      setSuccessMsg('Signup successful! You can now log in.');
      setActiveTab('login');
      setSignupData({
        fullName: '',
        employeeId: '',
        branch: '',
        email: '',
        password: '',
        confirmPassword: '',
        academicSession: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Udaan</h1>
        <p className="login-subtitle">AI-Powered Prediction Engine</p>

        <div className="tabs">
          <span
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccessMsg('');
            }}
          >
            Login
          </span>
          <span
            className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setSuccessMsg('');
            }}
          >
            Sign Up
          </span>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        {activeTab === 'login' ? (
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <label>Email ID</label>
            <input
              type="text"
              placeholder="Enter your Email ID"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />

            <label>Password</label>
            <div className="password-wrapper">
              <input
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleSignupSubmit}>
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={signupData.fullName}
              onChange={handleSignupChange}
              required
            />
            <label>Institute Name</label>
            <input
              type="text"
              name="instituteName"
              placeholder="Enter your Institute name"
              value={signupData.instituteName}
              onChange={handleSignupChange}
              required
            />

            <label>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              placeholder="Enter Your ID"
              value={signupData.employeeId}
              onChange={handleSignupChange}
              required
            />

            <label>Branch</label>
            <input
              type="text"
              name="branch"
              placeholder="Enter Your Branch"
              value={signupData.branch}
              onChange={handleSignupChange}
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={signupData.email}
              onChange={handleSignupChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={signupData.password}
              onChange={handleSignupChange}
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              required
            />

            <label>Academic Session</label>
            <input
              type="text"
              name="academicSession"
              placeholder="Enter your Academic Year"
              value={signupData.academicSession}
              onChange={handleSignupChange}
              required
            />

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
