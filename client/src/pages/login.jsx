import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/itransition_logo.webp";
import "../App.css";
// Importing necessary libraries and assets
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
// Using useNavigate hook for navigation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`,
        { email, password }
      );
      localStorage.setItem("token", res.data.token);
      setStatus("✅ Login successful!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error(err);
      setStatus("❌ Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
// Handling form submission and API request for login
  return (
    <div className="login-split-bg">
      <div className="login-left">
        <div className="login-logo-large">
          <img src={logo} alt="Logo" className="login-logo-img-large" />
        </div>
        <form className="login-form-large" onSubmit={handleSubmit}>
          <h2 className="login-title-large">Sign in to The App</h2>
          {status && (
            <p className={`login-status ${status.startsWith("✅") ? "success" : "error"}`}>
              {status}
            </p>
          )}
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              autoComplete="username"
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              autoComplete="current-password"
            />
          </div>
          <div className="login-forgot">
            <a href="#">Forgot password?</a>
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div className="login-signup">
          Don&apos;t have an account? <a href="/register">Sign up</a>
          </div>
        </form>
      </div>
      <div className="login-right" />
    </div>
  );
}

export default Login;
