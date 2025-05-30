import { Link } from "react-router-dom";

function Welcome() {
  return (
    <div className="welcome-container">
      <h1>🎉 Registration Successful!</h1>
      <p>Your account has been created successfully.</p>
      <Link to="/login" className="welcome-btn">
        Go to Login
      </Link>
    </div>
  );
}

export default Welcome;
