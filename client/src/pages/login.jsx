import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/itransition_logo.webp";
import "../App.css";

function Login() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const reason = localStorage.getItem("logoutReason");
    if (reason) {
      setStatus(`❌ ${reason}`);
      localStorage.removeItem("logoutReason");
    }
  }, []);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!email.includes("@")) {
      setStatus("❌ Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      setStatus("✅ Login successful!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      setStatus(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

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
            <Link to="/forgot-password" className="login-forgot-link">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div className="login-signup">
            Don&apos;t have an account? <Link to="/register">Sign up</Link>
          </div>
        </form>
      </div>
      <div className="login-right" />
    </div>
  );
}

export default Login;

