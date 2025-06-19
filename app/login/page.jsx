"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Color theme variables
const bgMain = "#f6f9fc";
const bgCard = "#fff";
const accent = "#0D1A33";
const accentLight = "#4267b2";
const accentPurple = "#7d2ae8";
const gradient = "linear-gradient(135deg, #7d2ae8 0%, #4267b2 100%)";

export default function Login() {
  const router = useRouter();

  // Load users from localStorage or use default
  const getInitialUsers = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("users");
      if (stored) return JSON.parse(stored);
    }
    // Default user with role HR
    return [{ username: "rahul", password: "rahul", role: "HR" }];
  };

  const [users, setUsers] = useState(getInitialUsers);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // For login

  const [showSignup, setShowSignup] = useState(false);

  // Signup state
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupRole, setSignupRole] = useState(""); // For signup
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Login state
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Keep users in localStorage in sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users]);

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    if (
      username.toLowerCase() === "rahul" &&
      password === "rahul" &&
      role === "HR"
    ) {
      setLoginSuccess(true);
      router.push("/homepage");
      return;
    }
    const found = users.find(
      (u) =>
        u.username === username &&
        u.password === password &&
        u.role === role
    );
    if (found) {
      setLoginSuccess(true);
      router.push("/homepage");
    } else {
      setLoginError("Invalid username, password, or role");
    }
  };

  // Handle signup
  const handleSignup = (e) => {
    e.preventDefault();
    setSignupError("");
    if (!signupUsername || !signupPassword || !signupRole) {
      setSignupError("Please fill all fields and select a role");
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords do not match");
      return;
    }
    if (users.find((u) => u.username === signupUsername && u.role === signupRole)) {
      setSignupError("Username with this role already exists");
      return;
    }
    const newUsers = [
      ...users,
      { username: signupUsername, password: signupPassword, role: signupRole },
    ];
    setUsers(newUsers);
    setSignupSuccess(true);
    setTimeout(() => {
      setShowSignup(false);
      setSignupSuccess(false);
      setSignupUsername("");
      setSignupPassword("");
      setSignupConfirm("");
      setSignupRole("");
      router.push("/homepage");
    }, 800);
  };

  // Styles
  const inputBoxStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    border: `1px solid ${accentLight}`,
    borderRadius: "8px",
    fontSize: "15px",
    backgroundColor: "#f4f7fb",
    color: accent,
    outline: "none",
    transition: "border 0.2s",
  };

  const cardStyle = {
    background: bgCard,
    padding: "40px 32px",
    borderRadius: "18px",
    boxShadow: "0 4px 24px rgba(13,26,51,0.08)",
    width: "100%",
    maxWidth: "370px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 2,
  };

  // Main container style
  const mainContainer = {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    background: bgMain,
  };

  // Left (image) panel style
  const leftPanel = {
    flex: 1.2,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    minHeight: "100vh",
  };

  // Image as background
  const imageBgStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 1,
    filter: "brightness(0.7)",
  };

  // Overlay for gradient effect
  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(120deg, rgba(13,26,51,0.55) 0%, rgba(125,42,232,0.28) 100%)",
    zIndex: 2,
  };

  // Floating text style
  const floatingTextStyle = {
    position: "relative",
    zIndex: 3,
    textAlign: "center",
    color: "#fff",
    maxWidth: 480,
    padding: "0 24px",
    userSelect: "none",
  };

  // Right (form) panel style
  const rightPanel = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    position: "relative",
    zIndex: 2,
    minHeight: "100vh",
  };

  // Signup page
  const formContent = showSignup ? (
    <form onSubmit={handleSignup} style={cardStyle}>
      <div
        style={{
          width: "70px",
          height: "70px",
          background: accent,
          borderRadius: "50%",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        <span>📝</span>
      </div>
      <h2
        style={{
          marginBottom: "18px",
          color: accent,
          fontWeight: 700,
          fontSize: "1.3rem",
        }}
      >
        Create Account
      </h2>
      <input
        type="text"
        placeholder="Username"
        value={signupUsername}
        onChange={(e) => setSignupUsername(e.target.value)}
        style={inputBoxStyle}
        autoComplete="off"
      />
      <input
        type="password"
        placeholder="Password"
        value={signupPassword}
        onChange={(e) => setSignupPassword(e.target.value)}
        style={inputBoxStyle}
        autoComplete="new-password"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={signupConfirm}
        onChange={(e) => setSignupConfirm(e.target.value)}
        style={inputBoxStyle}
        autoComplete="new-password"
      />
      {/* Role selection */}
      <div style={{ marginBottom: "16px", width: "100%" }}>
        <label style={{ marginRight: 12, color: "#0D1A33", fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={signupRole === "HR"}
            onChange={() => setSignupRole(signupRole === "HR" ? "" : "HR")}
            style={{
              marginRight: 4,
              accentColor: "#0D1A33",
              width: 16,
              height: 16,
            }}
          />
          HR
        </label>
        <label style={{ marginRight: 12, color: "#0D1A33", fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={signupRole === "manager"}
            onChange={() => setSignupRole(signupRole === "manager" ? "" : "manager")}
            style={{
              marginRight: 4,
              accentColor: "#0D1A33",
              width: 16,
              height: 16,
            }}
          />
          Manager
        </label>
        <label style={{ color: "#0D1A33", fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={signupRole === "user"}
            onChange={() => setSignupRole(signupRole === "user" ? "" : "user")}
            style={{
              marginRight: 4,
              accentColor: "#0D1A33",
              width: 16,
              height: 16,
            }}
          />
          User
        </label>
      </div>
      {signupError && (
        <div style={{ color: "#e74c3c", marginBottom: "10px", fontSize: 13 }}>
          {signupError}
        </div>
      )}
      {signupSuccess && (
        <div style={{ color: "#27ae60", marginBottom: "10px", fontSize: 13 }}>
          Signup successful!
        </div>
      )}
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "12px",
          background: accent,
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "1rem",
          cursor: "pointer",
          marginBottom: "10px",
          marginTop: "5px",
          letterSpacing: "0.5px",
        }}
      >
        Sign Up
      </button>
      <div style={{ marginTop: "10px", fontSize: "14px" }}>
        Already have an account?{" "}
        <span
          onClick={() => setShowSignup(false)}
          style={{
            color: accentPurple,
            cursor: "pointer",
            fontWeight: 500,
            textDecoration: "underline",
          }}
        >
          Sign In
        </span>
      </div>
    </form>
  ) : (
    <form onSubmit={handleLogin} style={cardStyle}>
      <div
        style={{
          width: "70px",
          height: "70px",
          background: accent,
          borderRadius: "50%",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        <span>👤</span>
      </div>
      <h2
        style={{
          marginBottom: "18px",
          color: accent,
          fontWeight: 700,
          fontSize: "1.3rem",
        }}
      >
        Sign In
      </h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={inputBoxStyle}
        autoComplete="username"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputBoxStyle}
        autoComplete="current-password"
      />
      {/* Role selection */}
      <div style={{ marginBottom: "16px", width: "100%" }}>
        <label style={{ marginRight: 12, color: "#0D1A33", fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={role === "HR"}
            onChange={() => setRole(role === "HR" ? "" : "HR")}
            style={{
              marginRight: 4,
              accentColor: "#0D1A33",
              width: 16,
              height: 16,
            }}
          />
          HR
        </label>
        <label style={{ marginRight: 12, color: "#0D1A33", fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={role === "manager"}
            onChange={() => setRole(role === "manager" ? "" : "manager")}
            style={{
              marginRight: 4,
              accentColor: "#0D1A33",
              width: 16,
              height: 16,
            }}
          />
          Manager
        </label>
        <label style={{ color: "#0D1A33", fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={role === "user"}
            onChange={() => setRole(role === "user" ? "" : "user")}
            style={{
              marginRight: 4,
              accentColor: "#0D1A33",
              width: 16,
              height: 16,
            }}
          />
          User
        </label>
      </div>
      {loginError && (
        <div style={{ color: "#e74c3c", marginBottom: "10px", fontSize: 13 }}>
          {loginError}
        </div>
      )}
      {loginSuccess && (
        <div style={{ color: "#27ae60", marginBottom: "10px", fontSize: 13 }}>
          Login successful!
        </div>
      )}
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "12px",
          background: accent,
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "1rem",
          cursor: "pointer",
          marginBottom: "10px",
          marginTop: "5px",
          letterSpacing: "0.5px",
        }}
      >
        Sign In
      </button>
      <div style={{ marginTop: "10px", fontSize: "14px" }}>
        Not a member?{" "}
        <span
          onClick={() => setShowSignup(true)}
          style={{
            color: accentPurple,
            cursor: "pointer",
            fontWeight: 500,
            textDecoration: "underline",
          }}
        >
          Create account
        </span>
      </div>
    </form>
  );

  return (
    <div style={mainContainer}>
      {/* Left Panel: Image with floating text */}
      <div style={leftPanel}>
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
          alt="Employee Management"
          style={imageBgStyle}
        />
        <div style={overlayStyle}></div>
        <div style={floatingTextStyle}>
          <h1 style={{ fontWeight: 800, fontSize: "2.2rem", marginBottom: 12, letterSpacing: 1 }}>
            Welcome to <span style={{ color: "#ffd700" }}>HRPulse</span>
          </h1>
          <p style={{ fontSize: "1.1rem", fontWeight: 400, color: "#f4f7fb" }}>
            Streamline your HR processes, manage employees, and empower your team with our all-in-one HRM platform.
          </p>
        </div>
      </div>
      {/* Right Panel: Form */}
      <div style={rightPanel}>
        {formContent}
      </div>
    </div>
  );
}
