"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Color theme variables
const bgMain = "#f6f9fc";
const bgCard = "#fff";
const accent = "#0D1A33";
const accentLight = "#4267b2";
const accentPurple = "#7d2ae8";

export default function Login() {
  const router = useRouter();

  // Default users
  const getInitialUsers = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("users");
      if (stored) return JSON.parse(stored);
    }
    return [{ username: "rahul", password: "rahul" }];
  };

  const [users] = useState(getInitialUsers);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  

  const handleLogin = (e) => {
  e.preventDefault();
  setLoginError("");

  // Check for Super Admin
  if (username === "rahul_01" && password === "rahul_01") {
    setLoginSuccess(true);
    router.push("/super");
    return;
  }
  if (username === "rohit" && password === "rohit") {
    setLoginSuccess(true);
    router.push("/homepageE");
    return;
  }

  // Check for HR User
  if (username === "aary" && password === "aary") {
    setLoginSuccess(true);
    router.push("/homepageHR");
    return;
  }

  // Default users logic
  const found = users.find(
    (u) => u.username === username && u.password === password
  );

  if (found) {
    setLoginSuccess(true);
    router.push("/homepageM");
  } else {
    setLoginError("Invalid username or password");
  }
};



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

  const mainContainer = {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    background: bgMain,
  };

  const leftPanel = {
    flex: 1.2,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    minHeight: "100vh",
  };

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

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(120deg, rgba(13,26,51,0.55) 0%, rgba(125,42,232,0.28) 100%)",
    zIndex: 2,
  };

  const floatingTextStyle = {
    position: "relative",
    zIndex: 3,
    textAlign: "center",
    color: "#fff",
    maxWidth: 480,
    padding: "0 24px",
    userSelect: "none",
  };

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

  return (
    <div style={mainContainer}>
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
      <div style={rightPanel}>
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
        </form>
      </div>
    </div>
  );
}
