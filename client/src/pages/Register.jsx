import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/itransition_logo.webp";
import "../App.css";
import.meta.env.VITE_API_URL;


function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
// Resetting status and loading state before making the API request
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/register`,
        { name, email, password }
      );
      setStatus("✅ Registration successful!");
      setTimeout(() => navigate("/welcome"), 1000);
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.error || "❌ Registration failed. Please try again.";
      setStatus(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };
// Handling form submission and API request for registration
  return (
    <div className="login-split-bg">
      <div className="login-left">
        <div className="login-logo-large">
          <img src={logo} alt="Logo" className="login-logo-img-large" />
        </div>
        <form className="login-form-large" onSubmit={handleSubmit}>
          <h2 className="login-title-large">Create an Account</h2>
          {status && (
            <p
              className={`login-status ${status.startsWith("✅") ? "success" : "error"}`}
              aria-live="polite"
            >
              {status}
            </p>
          )}
          <div className="login-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="login-input"
              autoComplete="name"
            />
          </div>
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
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          <div className="login-signup">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
      <div className="login-right" />
    </div>
  );
}

export default Register;
