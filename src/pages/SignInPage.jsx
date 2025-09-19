import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SignInPage.css";

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email, // Use the email field for username
          password: password, // Use the password field
        }),
      });
      console.log("This is email",email, password);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("This is data", data);

      if (data.message === "Login successful") {
        console.log("Reached Login");
        // ✅ success → go to dashboard
        navigate("/dashboard");
      } else {
        // ❌ failure → show alert
        alert("Wrong password or username");
      }
      console.log("Login response:", data.message);

      // Example: store token if API returns it
      // localStorage.setItem("token", data.token);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2 className="signin-title">Welcome Back 👋</h2>
        <p className="signin-subtitle">
          Please login to continue to your account.
        </p>

        <form className="signin-form" onSubmit={handleUpload}>
          {/* Email */}
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Remember Me */}
          <div className="signin-remember">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Keep me logged in</label>
          </div>

          {/* Submit */}
          <button type="submit" className="signin-btn">
            Sign in
          </button>

          <div className="divider">or</div>

          {/* Google Login */}
          <button
            type="button"
            className="google-btn"
            onClick={() => navigate("/dashboard")}
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
            />
            Sign in with Google
          </button>
        </form>

        <p className="signin-footer">
          Need an account? <a href="/signup">Create one</a>
        </p>
      </div>
    </div>
  );
}
